import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Campaign from '../../../../models/Campaign';
import Submission from '../../../../models/Submission';
import User from '../../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { userAddress, page = 1, limit = 20, status } = req.query;

    // Check if campaign exists
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Build query
    const query: any = { campaignId: id };
    if (status) query.status = status;

    // Check if user is the campaign creator
    const isCreator = userAddress && campaign.creatorAddress === userAddress;

    // Only creators can see all submissions
    // Regular users can only see their own submissions
    if (!isCreator) {
      if (userAddress) {
        query.userAddress = userAddress; // Only show user's own submissions
      } else {
        // Anonymous users can't see any submissions
        return res
          .status(403)
          .json({ message: 'Access denied. Only campaign creators can view all submissions.' });
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Get submissions with user info
    const submissions = await Submission.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userAddress',
          foreignField: 'stacksAddress',
          as: 'user',
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] },
        },
      },
      {
        $project: {
          campaignId: 1,
          userAddress: 1,
          submissionType: 1,
          content: 1,
          status: 1,
          pointsAwarded: 1,
          reviewNotes: 1,
          submittedAt: 1,
          'user.username': 1,
          'user.displayName': 1,
          'user.avatar': 1,
        },
      },
      { $sort: { submittedAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      submissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      isCreator,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
