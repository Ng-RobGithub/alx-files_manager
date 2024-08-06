/* eslint-disable import/no-named-as-default */
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

export default class AppController {
  /**
   * Gets the status of Redis and Database connections.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
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

  /**
   * Gets statistics about users and files.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
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
