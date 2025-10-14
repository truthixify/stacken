import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Like from '../../../models/Like';
import { getSession } from '../../../common/session-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    return handleToggleLike(req, res);
  } else if (req.method === 'GET') {
    return handleGetLikes(req, res);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

async function handleToggleLike(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req);
    const userAddress = session?.stxAddress;

    if (!userAddress) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ message: 'targetType and targetId are required' });
    }

    if (!['CAMPAIGN', 'SUBMISSION'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
      userAddress,
      targetType,
      targetId,
    });

    if (existingLike) {
      // Unlike - remove the like
      await Like.deleteOne({ _id: existingLike._id });

      // Get updated count
      const likeCount = await Like.countDocuments({ targetType, targetId });

      return res.status(200).json({
        liked: false,
        likeCount,
        message: 'Like removed',
      });
    } else {
      // Like - create new like
      await Like.create({
        userAddress,
        targetType,
        targetId,
      });

      // Get updated count
      const likeCount = await Like.countDocuments({ targetType, targetId });

      return res.status(200).json({
        liked: true,
        likeCount,
        message: 'Like added',
      });
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);

    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Like already exists' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetLikes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { targetType, targetId, userAddress } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({ message: 'targetType and targetId are required' });
    }

    // Get like count
    const likeCount = await Like.countDocuments({ targetType, targetId });

    // Check if user has liked (if userAddress provided)
    let userHasLiked = false;
    if (userAddress) {
      const userLike = await Like.findOne({
        userAddress,
        targetType,
        targetId,
      });
      userHasLiked = !!userLike;
    }

    return res.status(200).json({
      likeCount,
      userHasLiked,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
