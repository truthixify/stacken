import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getCampaign(req, res, id as string);
    case 'PUT':
      return updateCampaign(req, res, id as string);
    case 'DELETE':
      return deleteCampaign(req, res, id as string);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getCampaign(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID format' });
    }

    // Use aggregation to include creator info
    const campaigns = await Campaign.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
          // Include all campaign fields
          title: 1,
          summary: 1,
          description: 1,
          details: 1,
          category: 1,
          status: 1,
          totalParticipants: 1,
          totalPoints: 1,
          startTime: 1,
          endTime: 1,
          creatorAddress: 1,
          imageUrl: 1,
          tags: 1,
          taskLinks: 1,
          socialLinks: 1,
          tokenAddress: 1,
          tokenAmount: 1,
          createdAt: 1,
          updatedAt: 1,
          // Include only necessary creator fields
          'creator.username': 1,
          'creator.displayName': 1,
          'creator.avatar': 1,
        },
      },
    ]);

    const campaign = campaigns[0];

    if (!campaign) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    res.status(200).json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateCampaign(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { userAddress, ...updateData } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Check if user is the creator
    if (campaign.creatorAddress !== userAddress) {
      return res.status(403).json({ message: 'Not authorized to update this mission' });
    }

    // Don't allow updates to active campaigns for certain fields
    if (campaign.status === 'ACTIVE') {
      const restrictedFields = ['startTime', 'endTime', 'totalPoints', 'tokenAmount'];
      const hasRestrictedUpdates = restrictedFields.some(field => field in updateData);

      if (hasRestrictedUpdates) {
        return res.status(400).json({
          message: 'Cannot update time or reward settings for active missions',
        });
      }
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteCampaign(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { userAddress } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Check if user is the creator
    if (campaign.creatorAddress !== userAddress) {
      return res.status(403).json({ message: 'Not authorized to delete this mission' });
    }

    // Don't allow deletion of active campaigns
    if (campaign.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Cannot delete active campaigns' });
    }

    await Campaign.findByIdAndDelete(id);

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
