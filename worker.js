// worker.js
import Queue from 'bull';
import { promises as fs } from 'fs';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db.js';
import thumbnail from 'image-thumbnail';

export const fileQueue = new Queue('fileQueue');

fileQueue.process('generate-thumbnails', async (job) => {
  const { userId, fileId, localPath } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });
  if (!file) throw new Error('File not found');

  const thumbnailSizes = [500, 250, 100];

  const thumbnailPromises = thumbnailSizes.map(async size => {
    const thumbnailPath = `${localPath}_${size}`;
    const thumbnailData = await thumbnail(localPath, { width: size });
    await fs.writeFile(thumbnailPath, thumbnailData);
  });

  await Promise.all(thumbnailPromises);
});
