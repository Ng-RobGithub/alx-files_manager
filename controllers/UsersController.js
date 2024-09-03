/* eslint-disable import/no-named-as-default */
import bcrypt from 'bcrypt';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db.js';

const userQueue = new Queue('email sending');
const SALT_ROUNDS = 10;

export default class UsersController {
  /**
   * Registers a new user.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) return res.status(400).json({ error: 'Missing email' });
      if (!password) return res.status(400).json({ error: 'Missing password' });

      const existingUser = await dbClient.usersCollection().findOne({ email });

      if (existingUser) return res.status(400).json({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const insertionInfo = await dbClient.usersCollection().insertOne({ email, password: hashedPassword });
      const userId = insertionInfo.insertedId.toString();

      userQueue.add({ userId });

      res.status(201).json({ email, id: userId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  /**
   * Gets the current user information.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async getMe(req, res) {
    try {
      const { user } = req;
      res.status(200).json({ email: user.email, id: user._id.toString() });
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ error: 'Failed to fetch user information' });
    }
  }
}
