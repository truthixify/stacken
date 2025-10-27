import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { missionId, userAddress } = req.query;

    if (!missionId || !userAddress) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Check if user has any submissions for this mission
    const submission = await Submission.findOne({
      missionId,
      userAddress,
    }).select('_id status submittedAt');

    res.status(200).json({
      hasSubmitted: !!submission,
      submission: submission
        ? {
            id: submission._id,
            status: submission.status,
            submittedAt: submission.submittedAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
