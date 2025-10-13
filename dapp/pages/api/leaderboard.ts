import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongodb';
import User from '../../models/User';
import Campaign from '../../models/Campaign';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { timeframe = 'all', limit = 100 } = req.query;

    // Build match conditions based on timeframe
    let matchConditions: any = {
      totalPoints: { $gt: 0 } // Only users with points
    };

    if (timeframe === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      matchConditions.lastActiveAt = { $gte: oneMonthAgo };
    } else if (timeframe === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchConditions.lastActiveAt = { $gte: oneWeekAgo };
    }

    // Execute aggregation with better projection
    const users = await User.aggregate([
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'participatedCampaigns',
          foreignField: '_id',
          as: 'participatedCampaignDetails'
        }
      },
      {
        $addFields: {
          campaignsWon: {
            $size: {
              $filter: {
                input: '$participatedCampaignDetails',
                cond: { $eq: ['$$this.status', 'COMPLETED'] }
              }
            }
          }
        }
      },
      {
        $project: {
          stacksAddress: 1,
          username: 1,
          displayName: 1,
          avatar: 1,
          bio: 1,
          totalPoints: 1,
          campaignsParticipated: { $size: { $ifNull: ['$participatedCampaigns', []] } },
          campaignsWon: 1,
          lastActiveAt: 1,
          createdAt: 1
        }
      },
      {
        $sort: { totalPoints: -1, lastActiveAt: -1 }
      },
      {
        $limit: Number(limit)
      }
    ]);

    // Add rank manually since MongoDB aggregation for ranking is complex
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Get additional stats
    const totalUsersCount = await User.countDocuments({ totalPoints: { $gt: 0 } });
    const activeCampaignsCount = await Campaign.countDocuments({ status: 'ACTIVE' });
    const totalPointsDistributed = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPoints' } } }
    ]);

    res.status(200).json({
      users: usersWithRank,
      timeframe,
      total: usersWithRank.length,
      stats: {
        totalUsers: totalUsersCount,
        activeCampaigns: activeCampaignsCount,
        totalPointsDistributed: totalPointsDistributed[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}