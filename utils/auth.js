/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { Request } from 'express';
import { ObjectId } from 'mongodb'; // Importing ObjectId directly from 'mongodb'
import dbClient from './db.js';
import redisClient from './redis.js';

/**
 * Fetches the user from the Authorization header in the given request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string} | null>}
 */
export const getUserFromAuthorization = async (req) => {
  const authorization = req.headers.authorization || null;

  if (!authorization) {
    return null;
  }

  const [type, credentials] = authorization.split(' ');

  if (type !== 'Basic' || !credentials) {
    return null;
  }

  const decodedCredentials = Buffer.from(credentials, 'base64').toString();
  const [email, password] = decodedCredentials.split(':');

  if (!email || !password) {
    return null;
  }

  try {
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (!user || sha1(password) !== user.password) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user from Authorization:', error);
    return null;
  }
};

/**
 * Fetches the user from the X-Token header in the given request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string} | null>}
 */
export const getUserFromXToken = async (req) => {
  const token = req.headers['x-token'];

  if (!token) {
    return null;
  }

  try {
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return null;
    }

    const user = await (await dbClient.usersCollection())
      .findOne({ _id: new ObjectId(userId) });

    return user || null;
  } catch (error) {
    console.error('Error fetching user from X-Token:', error);
    return null;
  }
};

export default {
  getUserFromAuthorization,
  getUserFromXToken,
};
