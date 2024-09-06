import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';  // This should match the export in db.js

export default class AppController {
  static getStatus(req, res) {
    try {
      res.status(200).json({
        redis: redisClient.isAlive(),
        db: dbClient.isAlive(),
      });
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  }

  static async getStats(req, res) {
    try {
      const [usersCount, filesCount] = await Promise.all([dbClient.nbUsers(), dbClient.nbFiles()]);
      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }
}
