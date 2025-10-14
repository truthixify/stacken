import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Campaign from '../../../../models/Campaign';
import Submission from '../../../../models/Submission';
import User from '../../../../models/User';
import { getSession } from '../../../../common/session-helpers';

// Admin addresses - in production, this should be in environment variables
const ADMIN_ADDRESSES = process.env.ADMIN_ADDRESSES?.split(',') || [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { userAddress, page = 1, limit = 20, status } = req.query;

    // Get session for authentication
    const session = await getSession(req);
    const authenticatedAddress = session?.stxAddress;

    // Check if campaign exists
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Build query
    const query: any = { campaignId: id };
    if (status) query.status = status;

    // Determine user permissions
    const isAdmin = authenticatedAddress && ADMIN_ADDRESSES.includes(authenticatedAddress);
    const isCreator = authenticatedAddress && campaign.creatorAddress === authenticatedAddress;
    const isRegularUser = authenticatedAddress && !isAdmin && !isCreator;

    // Authorization logic:
    // - Admin: Can view all submissions across the platform
    // - Creator: Can view all submissions for their own campaigns
    // - Regular User: Can only view their own submissions
    // - Anonymous: Cannot view any submissions

    if (!authenticatedAddress) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (isRegularUser) {
      // Regular users can only see their own submissions
      query.userAddress = authenticatedAddress;
    }
    // Admins and creators can see all submissions (no additional query filter needed)

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
      permissions: {
        isAdmin,
        isCreator,
        canViewAll: isAdmin || isCreator,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
