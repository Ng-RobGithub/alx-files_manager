/* eslint-disable import/no-named-as-default */
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';

/**
 * Controller for handling authentication-related actions.
 */
export default class AuthController {
  /**
   * Handles user connection and generates a new authentication token.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async getConnect(req, res) {
    try {
      const { user } = req;
      const token = uuidv4();

      await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 24 * 60 * 60);
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error generating token:', error);
      res.status(500).json({ error: 'Failed to generate token' });
    }
  }

  /**
   * Handles user disconnection and invalidates the authentication token.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const result = await redisClient.del(`auth_${token}`);

      if (result === 0) {
        return res.status(404).json({ error: 'Token not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error invalidating token:', error);
      res.status(500).json({ error: 'Failed to invalidate token' });
    }
  }
}
