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

    if (!stacksAddress || typeof stacksAddress !== 'string' || stacksAddress.trim() === '') {
      return res.status(400).json({ message: 'Valid Stacks address is required' });
    }

    // Normalize the address
    const normalizedAddress = stacksAddress.trim();

    // Check if user already exists
    let user = await User.findOne({ stacksAddress: normalizedAddress });

    if (user) {
      // User exists, just update last active time
      user.lastActiveAt = new Date();
      await user.save();
      return res.status(200).json({ user, message: 'User already registered' });
    }

    // Create new user
    user = new User({
      stacksAddress: normalizedAddress,
      totalPoints: 0,
      achievements: [],
      participatedMissionss: [],
      createdMissions: [],
      wonMissions: [],
      socialLinks: {},
      socialConnections: {},
      role: 'USER',
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
      // Check which field caused the duplicate
      if (error.keyPattern?.stacksAddress) {
        // Stacks address duplicate - fetch and return existing user
        try {
          const user = await User.findOne({ stacksAddress: req.body.stacksAddress });
          if (user) {
            return res.status(200).json({ user, message: 'User already registered' });
          }
        } catch (fetchError) {
          console.error('Error fetching existing user:', fetchError);
        }
      }

      // For other duplicate key errors or if fetch failed
      return res.status(409).json({
        message: 'User with this information already exists',
        error: 'DUPLICATE_USER',
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
}
