import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import AllowedToken from '../../../models/AllowedToken';
import { DEPLOYER_ADDRESS, isDeployerAddress } from '../../../lib/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getAllowedTokens(req, res);
    case 'POST':
      return addAllowedToken(req, res);
    case 'DELETE':
      return removeAllowedToken(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getAllowedTokens(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tokens = await AllowedToken.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('contractAddress name symbol decimals description logoUrl');

    res.status(200).json({ tokens });
  } catch (error) {
    console.error('Error fetching allowed tokens:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function addAllowedToken(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userAddress, contractAddress, name, symbol, decimals, description, logoUrl } = req.body;

    // Only deployer can add tokens
    if (!isDeployerAddress(userAddress)) {
      return res.status(403).json({ message: 'Only the contract deployer can add allowed tokens' });
    }

    // Validation
    if (!contractAddress || !name || !symbol) {
      return res.status(400).json({ message: 'Contract address, name, and symbol are required' });
    }

    // Check if token already exists
    const existingToken = await AllowedToken.findOne({ contractAddress });
    if (existingToken) {
      return res.status(409).json({ message: 'Token already exists in allowlist' });
    }

    const token = new AllowedToken({
      contractAddress,
      name,
      symbol,
      decimals: decimals || 6,
      description,
      logoUrl,
      addedBy: userAddress,
    });

    await token.save();

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error adding allowed token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function removeAllowedToken(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userAddress, contractAddress } = req.body;

    // Only deployer can remove tokens
    if (!isDeployerAddress(userAddress)) {
      return res
        .status(403)
        .json({ message: 'Only the contract deployer can remove allowed tokens' });
    }

    if (!contractAddress) {
      return res.status(400).json({ message: 'Contract address is required' });
    }

    const token = await AllowedToken.findOneAndUpdate(
      { contractAddress },
      { isActive: false },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    res.status(200).json({ message: 'Token removed from allowlist', token });
  } catch (error) {
    console.error('Error removing allowed token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
