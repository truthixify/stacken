import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { stacksAddress } = req.body;

    if (!stacksAddress) {
      return res.status(400).json({ message: 'Stacks address is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ stacksAddress });

    if (user) {
      // User exists, just update last active time
      user.lastActiveAt = new Date();
      await user.save();
      return res.status(200).json({ user, message: 'User already registered' });
    }

    // Create new user
    user = new User({
      stacksAddress,
      totalPoints: 0,
      achievements: [],
      participatedCampaigns: [],
      createdCampaigns: [],
      wonCampaigns: [],
      socialLinks: {},
      socialConnections: {},
      settings: {
        emailNotifications: true,
        publicProfile: true,
        showAchievements: true,
      },
      lastActiveAt: new Date(),
    });

    await user.save();

    res.status(201).json({
      user,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    console.error('Error registering user:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      // User already exists, fetch and return
      try {
        const user = await User.findOne({ stacksAddress: req.body.stacksAddress });
        return res.status(200).json({ user, message: 'User already registered' });
      } catch (fetchError) {
        return res.status(500).json({ message: 'Error fetching existing user' });
      }
    }

    res.status(500).json({ message: 'Internal server error' });
  }
}
