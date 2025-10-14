import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';

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
    const campaign = await Campaign.findById(id).lean();

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
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
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user is the creator
    if (campaign.creatorAddress !== userAddress) {
      return res.status(403).json({ message: 'Not authorized to update this campaign' });
    }

    // Don't allow updates to active campaigns for certain fields
    if (campaign.status === 'ACTIVE') {
      const restrictedFields = ['startTime', 'endTime', 'totalPoints', 'tokenAmount'];
      const hasRestrictedUpdates = restrictedFields.some(field => field in updateData);

      if (hasRestrictedUpdates) {
        return res.status(400).json({
          message: 'Cannot update time or reward settings for active campaigns',
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
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user is the creator
    if (campaign.creatorAddress !== userAddress) {
      return res.status(403).json({ message: 'Not authorized to delete this campaign' });
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
