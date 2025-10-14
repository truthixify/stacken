import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Campaign from '../../../models/Campaign';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const campaigns = await Campaign.find({}, { _id: 1, title: 1, creatorAddress: 1 }).limit(10);

    res.status(200).json({
      campaigns: campaigns.map(c => ({
        id: c._id.toString(),
        title: c.title,
        creatorAddress: c.creatorAddress,
      })),
      message: 'Debug info for campaigns',
    });
  } catch (error) {
    console.error('Error fetching debug campaigns:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
