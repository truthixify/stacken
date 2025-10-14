import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Submission from '../../../models/Submission';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { address } = req.query;

  switch (req.method) {
    case 'GET':
      return getUser(req, res, address as string);
    case 'PUT':
      return updateUser(req, res, address as string);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getUser(req: NextApiRequest, res: NextApiResponse, address: string) {
  try {
    if (!address) {
      return res.status(400).json({ message: 'Missing address parameter' });
    }

    console.log('Fetching user for address:', address);

    let user = await User.findOne({ stacksAddress: address }).lean();

    // Create user if not found
    if (!user) {
      console.log('User not found, creating new one...');
      const newUser = new User({
        stacksAddress: address,
        lastActiveAt: new Date(),
      });
      await newUser.save();
      user = newUser.toObject();
    }

    // Get recent submissions (safe — no population issues)
    const recentSubmissions = await Submission.find({ userAddress: address })
      .select('missionId submittedAt')
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean();

    // Compute stats safely
    const stats = {
      totalMissionsCreated: Array.isArray((user as any).createdMissions)
        ? (user as any).createdMissions.length
        : 0,
      totalMissionsParticipated: Array.isArray((user as any).participatedMissions)
        ? (user as any).participatedMissions.length
        : 0,
      totalPoints: (user as any).totalPoints || 0,
      totalSubmissions: recentSubmissions.length,
      achievements: (user as any).achievements || [],
    };

    return res.status(200).json({
      user: { ...user, stats },
      recentSubmissions,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error?.message || error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse, address: string) {
  try {
    const { userAddress, ...updateData } = req.body;

    // Check if user is updating their own profile
    if (address !== userAddress && address !== updateData.stacksAddress) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Validate required fields
    if (!updateData.stacksAddress) {
      updateData.stacksAddress = address;
    }

    // Handle social links properly
    if (updateData.socialLinks) {
      // Ensure socialLinks is an object
      if (typeof updateData.socialLinks !== 'object') {
        return res.status(400).json({ message: 'Invalid social links format' });
      }
    }

    const user = await User.findOneAndUpdate(
      { stacksAddress: address },
      {
        ...updateData,
        lastActiveAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(500).json({ message: 'Failed to update user' });
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error('Error updating user:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: 'Validation error', errors: validationErrors });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
}
