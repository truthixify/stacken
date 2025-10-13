import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getCampaigns(req, res);
    case 'POST':
      return createCampaign(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getCampaigns(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      status, 
      category, 
      creator, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    const query: any = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (creator) query.creatorAddress = creator;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Campaign.countDocuments(query);

    res.status(200).json({
      campaigns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function createCampaign(req: NextApiRequest, res: NextApiResponse) {
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
      rewardDistribution
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

    if (!rewardDistribution || !rewardDistribution.type) {
      return res.status(400).json({ message: 'Reward distribution settings are required' });
    }

    if (rewardDistribution.type === 'TIERED') {
      if (!rewardDistribution.tiers || rewardDistribution.tiers.length === 0) {
        return res.status(400).json({ message: 'Tiered rewards require at least one tier' });
      }
      const totalPercentage = rewardDistribution.tiers.reduce((sum: number, tier: any) => sum + tier.percentage, 0);
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

    // Create campaign
    const campaign = new Campaign({
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
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      socialLinks: socialLinks || {},
      taskLinks: taskLinks || [],
      rewardDistribution: rewardDistribution || {
        type: 'LINEAR',
        maxWinners: 10,
        tiers: []
      },
      status: 'DRAFT'
    });

    await campaign.save();

    // Update user's created campaigns - handle the walletAddress index issue
    try {
      await User.findOneAndUpdate(
        { stacksAddress: creatorAddress },
        { 
          $push: { createdCampaigns: campaign._id },
          $set: { lastActiveAt: new Date() }
        },
        { upsert: true, new: true }
      );
    } catch (userUpdateError: any) {
      console.warn('Failed to update user campaigns list:', userUpdateError.message);
      // Don't fail the campaign creation if user update fails
    }

    res.status(201).json({ campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}