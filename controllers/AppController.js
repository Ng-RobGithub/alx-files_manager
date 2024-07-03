import dbClient from '../utils/db.js';
import RedisClient from '../utils/redis.js';

const AppController = {
  async getStatus(req, res) {
    try {
      const redisAlive = await RedisClient.isAlive();
      const dbAlive = await dbClient.isAlive();

      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (error) {
      console.error('Error retrieving status:', error);
      res.status(500).json({ error: 'Unable to retrieve status' });
    }
  },

  async getStats(req, res) {
    try {
      const numUsers = await dbClient.nbUsers();
      const numFiles = await dbClient.nbFiles();

      res.status(200).json({ users: numUsers, files: numFiles });
    } catch (error) {
      console.error('Error retrieving stats:', error);
      res.status(500).json({ error: 'Unable to retrieve stats' });
    }
  },
};

export default AppController;
