import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Mission from '../../../models/Mission';
import User from '../../../models/User';
import { DEPLOYER_ADDRESS, isDeployerAddress } from '../../../lib/contracts';
import AllowedToken from '../../../models/AllowedToken';

// Helper function to update mission status based on current time
async function updateMissionStatus(mission: any) {
  const now = new Date();
  let shouldUpdate = false;
  let newStatus = mission.status;

  // Check if mission should transition from DRAFT to ACTIVE
  if (mission.status === 'DRAFT' && mission.startTime <= now && mission.endTime > now) {
    newStatus = 'ACTIVE';
    shouldUpdate = true;
  }

  // Check if mission should transition from ACTIVE to COMPLETED
  else if (mission.status === 'ACTIVE' && mission.endTime <= now) {
    newStatus = 'COMPLETED';
    shouldUpdate = true;
  }

  // Update in database if status changed
  if (shouldUpdate) {
    try {
      await Mission.findByIdAndUpdate(mission._id, { status: newStatus });
      mission.status = newStatus; // Update the in-memory object
    } catch (error) {
      console.error('Error updating mission status:', error);
    }
  }

  return mission;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getmissions(req, res);
    case 'POST':
      return createmission(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getmissions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status, category, creator, page = 1, limit = 10, search } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (creator) query.creatorAddress = creator;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Use aggregation to include creator info
    const missions = await Mission.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorAddress',
          foreignField: 'stacksAddress',
          as: 'creator',
        },
      },
      {
        $addFields: {
          creator: { $arrayElemAt: ['$creator', 0] },
        },
      },
      {
        $project: {
          // Include all mission fields
          title: 1,
          summary: 1,
          description: 1,
          category: 1,
          status: 1,
          totalParticipants: 1,
          totalPoints: 1,
          startTime: 1,
          endTime: 1,
          creatorAddress: 1,
          imageUrl: 1,
          tags: 1,
          createdAt: 1,
          // Include only necessary creator fields
          'creator.username': 1,
          'creator.displayName': 1,
          'creator.avatar': 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    // Update mission statuses based on current time
    const updatedMissions = await Promise.all(
      missions.map(mission => updateMissionStatus(mission))
    );

    const total = await Mission.countDocuments(query);

    res.status(200).json({
      missions: updatedMissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function createmission(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      creatorAddress,
      title,
      summary,
      description,
      details,
      imageUrl,
      category,
      tags,
      tokenAddress,
      tokenAmount,
      totalPoints,
      startTime,
      endTime,
      socialLinks,
      taskLinks,
      rewardDistribution,
    } = req.body;

    // Validation
    if (!creatorAddress || !title || !summary || !details || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'Invalid time range' });
    }

    if (!totalPoints || totalPoints <= 0) {
      return res.status(400).json({ message: 'Total points must be greater than 0' });
    }

    // Validate token address if provided
    // TODO: Re-enable when AllowedToken schema is fixed
    // if (tokenAddress) {
    //   const allowedToken = await AllowedToken.findOne({
    //     contractAddress: tokenAddress,
    //     isActive: true
    //   });
    //   if (!allowedToken) {
    //     return res.status(400).json({
    //       message: 'Selected token is not in the allowed tokens list'
    //     });
    //   }
    // }

    // Validate deployer vs regular user permissions
    const isDeployer = isDeployerAddress(creatorAddress);

    if (!isDeployer) {
      // Regular users must have token amount > 0 and points must equal token amount
      if (!tokenAmount || tokenAmount <= 0) {
        return res.status(400).json({
          message:
            'Token amount is required. Only the contract deployer can create point-only missions.',
        });
      }
      if (totalPoints !== tokenAmount) {
        return res.status(400).json({
          message: 'Points must equal token amount for token-based missions.',
        });
      }
    } else {
      // Deployer can create point-only missions or token missions
      if ((!tokenAmount || tokenAmount <= 0) && (!totalPoints || totalPoints <= 0)) {
        return res.status(400).json({
          message: 'You must specify either token amount or points.',
        });
      }
      // If deployer has both token amount and points, they must be equal
      if (tokenAmount && tokenAmount > 0 && totalPoints !== tokenAmount) {
        return res.status(400).json({
          message: 'For token missions, points must equal token amount.',
        });
      }
    }

    if (!rewardDistribution || !rewardDistribution.type) {
      return res.status(400).json({ message: 'Reward distribution settings are required' });
    }

    if (rewardDistribution.type === 'TIERED') {
      if (!rewardDistribution.tiers || rewardDistribution.tiers.length === 0) {
        return res.status(400).json({ message: 'Tiered rewards require at least one tier' });
      }
      const totalPercentage = rewardDistribution.tiers.reduce(
        (sum: number, tier: any) => sum + tier.percentage,
        0
      );
      if (totalPercentage !== 100) {
        return res.status(400).json({ message: 'Tier percentages must add up to 100%' });
      }
    }

    // Validate task links
    if (taskLinks && taskLinks.length > 0) {
      for (const link of taskLinks) {
        if (!link.title || !link.url || !link.type) {
          return res.status(400).json({ message: 'Task links must have title, url, and type' });
        }
        // Basic URL validation
        try {
          new URL(link.url);
        } catch {
          return res.status(400).json({ message: `Invalid URL: ${link.url}` });
        }
      }
    }

    // Determine initial status based on start time
    const now = new Date();
    const missionStartTime = new Date(startTime);
    const missionEndTime = new Date(endTime);

    let initialStatus = 'DRAFT';
    if (missionStartTime <= now && missionEndTime > now) {
      initialStatus = 'ACTIVE';
    } else if (missionEndTime <= now) {
      initialStatus = 'COMPLETED';
    }

    // Create mission
    const mission = new Mission({
      creatorAddress,
      title,
      summary,
      description: description || details, // Use description if provided, otherwise use details
      details,
      imageUrl,
      category,
      tags: tags || [],
      tokenAddress,
      tokenAmount: tokenAmount || 0,
      totalPoints,
      startTime: missionStartTime,
      endTime: missionEndTime,
      socialLinks: socialLinks || {},
      taskLinks: taskLinks || [],
      rewardDistribution: rewardDistribution || {
        type: 'LINEAR',
        maxWinners: 10,
        tiers: [],
      },
      status: initialStatus,
    });

    await mission.save();

    // Update user's created missions - handle the walletAddress index issue
    try {
      await User.findOneAndUpdate(
        { stacksAddress: creatorAddress },
        {
          $push: { createdmissions: mission._id },
          $set: { lastActiveAt: new Date() },
        },
        { upsert: true, new: true }
      );
    } catch (userUpdateError: any) {
      console.warn('Failed to update user missions list:', userUpdateError.message);
      // Don't fail the mission creation if user update fails
    }

    res.status(201).json({ mission });
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
