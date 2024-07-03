// controllers/FilesController.js
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { promises as fs } from 'fs';
import mime from 'mime-types';

class FilesController {
  static async postUpload(req, res) {
    // Existing postUpload method implementation
  }

  static async getShow(req, res) {
    // Existing getShow method implementation
  }

  static async getIndex(req, res) {
    // Existing getIndex method implementation
  }

  static async putPublish(req, res) {
    // Existing putPublish method implementation
  }

  static async putUnpublish(req, res) {
    // Existing putUnpublish method implementation
  }

  static async getFile(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { size } = req.query;

    try {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id) });
      if (!file) return res.status(404).json({ error: 'Not found' });

      // Check if file is public or user is authenticated and authorized
      if (!file.isPublic && file.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file type is folder
      if (file.type === 'folder') {
        return res.status(400).json({ error: 'A folder doesn\'t have content' });
      }

      // Determine file path based on size
      let filePath = file.localPath;

      if (size) {
        const sizePath = `${file.localPath}_${size}`;
        const exists = await fs.access(sizePath).then(() => true).catch(() => false);
        if (!exists) return res.status(404).json({ error: 'Not found' });
        filePath = sizePath;
      }

      // Get MIME type based on the file name
      const mimeType = mime.lookup(file.name);

      // Read the file content and send it with correct MIME type
      const fileContent = await fs.readFile(filePath);
      res.setHeader('Content-Type', mimeType);
      return res.send(fileContent);
    } catch (error) {
      console.error('Error retrieving file content:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;
