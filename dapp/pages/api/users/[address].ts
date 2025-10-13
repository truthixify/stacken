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
        let user = await User.findOne({ stacksAddress: address })
            .populate('participatedCampaigns', 'title status createdAt')
            .populate('createdCampaigns', 'title status totalParticipants createdAt')
            .lean();

        if (!user) {
            // Create user if doesn't exist
            const newUser = new User({
                stacksAddress: address,
                lastActiveAt: new Date()
            });
            await newUser.save();

            user = await User.findById(newUser._id)
                .populate('participatedCampaigns', 'title status createdAt')
                .populate('createdCampaigns', 'title status totalParticipants createdAt')
                .lean();
        }

        if (!user) {
            return res.status(500).json({ message: 'Failed to create or fetch user' });
        }

        // Get user recent submissions instead of activities
        const recentSubmissions = await Submission.find({ userAddress: address })
            .populate('campaignId', 'title')
            .sort({ submittedAt: -1 })
            .limit(10)
            .lean();

        // Get user statistics
        const stats = {
            totalCampaignsCreated: (user as any).createdCampaigns?.length || 0,
            totalCampaignsParticipated: (user as any).participatedCampaigns?.length || 0,
            totalPoints: (user as any).totalPoints || 0,
            totalSubmissions: recentSubmissions.length,
            achievements: (user as any).achievements || []
        };

        res.status(200).json({
            user: {
                ...user,
                stats
            },
            recentSubmissions
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
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
                lastActiveAt: new Date()
            },
            {
                new: true,
                upsert: true,
                runValidators: true
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