import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'stacken', // Organize uploads in a folder
      resource_type: 'auto', // Automatically detect file type
      transformation: [
        { width: 1200, height: 630, crop: 'limit' }, // Optimize for Open Graph
        { quality: 'auto' }, // Auto quality optimization
        { format: 'auto' }, // Auto format optimization (WebP when supported)
      ],
    });

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    // Return Cloudinary URL
    res.status(200).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}
