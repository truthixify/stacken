import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Like from '../../../models/Like';
import mongoose from 'mongoose';

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
    const { targetType, targetId, userAddress } = req.body;

    if (!userAddress) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!targetType || !targetId) {
      return res.status(400).json({ message: 'targetType and targetId are required' });
    }

    if (!['MISSION', 'SUBMISSION'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid targetId format' });
    }

    // Convert targetId to ObjectId
    const objectId = new mongoose.Types.ObjectId(targetId);

    // Check if like already exists
    const existingLike = await Like.findOne({
      userAddress,
      targetType,
      targetId: objectId,
    });

    if (existingLike) {
      // Unlike - remove the like
      await Like.deleteOne({ _id: existingLike._id });

      // Get updated count
      const likeCount = await Like.countDocuments({ targetType, targetId: objectId });

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
        targetId: objectId,
      });

      // Get updated count
      const likeCount = await Like.countDocuments({ targetType, targetId: objectId });

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

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(targetId as string)) {
      return res.status(400).json({ message: 'Invalid targetId format' });
    }

    // Convert targetId to ObjectId
    const objectId = new mongoose.Types.ObjectId(targetId as string);

    // Get like count
    const likeCount = await Like.countDocuments({ targetType, targetId: objectId });

    // Check if user has liked (if userAddress provided)
    let userHasLiked = false;
    if (userAddress) {
      const userLike = await Like.findOne({
        userAddress,
        targetType,
        targetId: objectId,
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
