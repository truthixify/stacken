import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongodb';
import Campaign from '../../../../models/Campaign';
import Submission from '../../../../models/Submission';
import User from '../../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { userAddress, submissionType, content } = req.body;

    // Validation
    if (!userAddress || !submissionType || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Campaign is not active' });
    }

    // Check if campaign is still running
    const now = new Date();
    if (now < campaign.startTime) {
      return res.status(400).json({ message: 'Campaign has not started yet' });
    }
    if (now > campaign.endTime) {
      return res.status(400).json({ message: 'Campaign has ended' });
    }

    // Validate content based on submission type
    if (submissionType === 'LINK' && !content.url) {
      return res.status(400).json({ message: 'URL is required for link submissions' });
    }
    if (submissionType === 'TEXT' && !content.text) {
      return res.status(400).json({ message: 'Text is required for text submissions' });
    }
    if (submissionType === 'FILE' && !content.fileUrl) {
      return res.status(400).json({ message: 'File URL is required for file submissions' });
    }
    if (submissionType === 'SOCIAL_PROOF' && !content.socialHandle) {
      return res
        .status(400)
        .json({ message: 'Social handle is required for social proof submissions' });
    }

    // Validate URL if provided
    if (content.url) {
      try {
        new URL(content.url);
      } catch {
        return res.status(400).json({ message: 'Invalid URL format' });
      }
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({
      campaignId: id,
      userAddress,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted to this campaign' });
    }

    // Create submission
    const submission = new Submission({
      campaignId: id,
      userAddress,
      submissionType,
      content,
      status: 'PENDING',
    });

    await submission.save();

    // Update user's participated campaigns
    try {
      await User.findOneAndUpdate(
        { stacksAddress: userAddress },
        {
          $addToSet: { participatedCampaigns: id },
          $set: { lastActiveAt: new Date() },
        },
        { upsert: true, new: true }
      );
    } catch (userUpdateError: any) {
      console.warn('Failed to update user participation:', userUpdateError.message);
      // Don't fail the submission if user update fails
    }

    // Update campaign participant count
    try {
      await Campaign.findByIdAndUpdate(id, {
        $inc: { totalParticipants: 1 },
      });
    } catch (campaignUpdateError: any) {
      console.warn('Failed to update campaign participant count:', campaignUpdateError.message);
    }

    res.status(201).json({
      submission,
      message: 'Submission created successfully! It will be reviewed by the campaign creator.',
    });
  } catch (error: any) {
    console.error('Error creating submission:', error);

    // Handle duplicate submission error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted to this campaign' });
    }

    res.status(500).json({ message: 'Failed to create submission. Please try again.' });
  }
}
