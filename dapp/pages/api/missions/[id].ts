import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Mission from '../../../models/Mission';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getMission(req, res, id as string);
    case 'PUT':
      return updateMission(req, res, id as string);
    case 'DELETE':
      return deleteMission(req, res, id as string);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getMission(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid mission ID format' });
    }

    // Use aggregation to include creator info
    const missions = await Mission.aggregate([
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
          // Include all Mission fields
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

    const mission = missions[0];

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    res.status(200).json({ mission });
  } catch (error) {
    console.error('Error fetching Mission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateMission(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { userAddress, ...updateData } = req.body;

    const mission = await Mission.findById(id);

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Check if user is the creator
    if (mission.creatorAddress !== userAddress) {
      return res.status(403).json({ message: 'Not authorized to update this mission' });
    }

    // Don't allow updates to active Missions for certain fields
    if (mission.status === 'ACTIVE') {
      const restrictedFields = ['startTime', 'endTime', 'totalPoints', 'tokenAmount'];
      const hasRestrictedUpdates = restrictedFields.some(field => field in updateData);

      if (hasRestrictedUpdates) {
        return res.status(400).json({
          message: 'Cannot update time or reward settings for active missions',
        });
      }
    }

    const updatedMission = await Mission.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({ mission: updatedMission });
  } catch (error) {
    console.error('Error updating Mission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteMission(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { userAddress } = req.body;

    const mission = await Mission.findById(id);

    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Check if user is the creator
    if (mission.creatorAddress !== userAddress) {
      return res.status(403).json({ message: 'Not authorized to delete this mission' });
    }

    // Don't allow deletion of active Missions
    if (mission.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Cannot delete active Missions' });
    }

    await Mission.findByIdAndDelete(id);

    res.status(200).json({ message: 'Mission deleted successfully' });
  } catch (error) {
    console.error('Error deleting Mission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
