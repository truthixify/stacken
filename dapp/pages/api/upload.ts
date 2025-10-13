import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB limit
        });

        const [fields, files] = await form.parse(req);
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.originalFilename || 'upload';
        const extension = path.extname(originalName);
        const filename = `${timestamp}${extension}`;
        const newPath = path.join(uploadDir, filename);

        // Move file to final location
        fs.renameSync(file.filepath, newPath);

        // Return public URL
        const publicUrl = `/uploads/${filename}`;

        res.status(200).json({
            message: 'File uploaded successfully',
            url: publicUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
}