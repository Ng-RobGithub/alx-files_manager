import Queue from 'bull';
import { promises as fs } from 'fs';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db.js';
import thumbnail from 'image-thumbnail';

export const fileQueue = new Queue('fileQueue');

fileQueue.process('generate-thumbnails', async (job) => {
  try {
    const { userId, fileId, localPath } = job.data;

    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
    if (!file) throw new Error('File not found');

    const thumbnailSizes = [500, 250, 100];

    // Generate thumbnails
    const thumbnailPromises = thumbnailSizes.map(async (size) => {
      try {
        const thumbnailPath = `${localPath}_${size}`;
        const thumbnailData = await thumbnail(localPath, { width: size });
        await fs.writeFile(thumbnailPath, thumbnailData);
        console.log(`Thumbnail created: ${thumbnailPath}`);
      } catch (err) {
        console.error(`Error generating thumbnail of size ${size}:`, err);
        throw err; // Ensure the error is propagated
      }
    });

    await Promise.all(thumbnailPromises);

    console.log(`All thumbnails for fileId ${fileId} have been created.`);
  } catch (err) {
    console.error('Error processing job:', err);
    // Optionally, you might want to handle failed jobs differently or notify an admin
  }
});
