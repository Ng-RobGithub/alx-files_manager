import { getUserFromXToken, getUserFromAuthorization } from '../utils/auth.js';

/**
 * Applies Basic authentication to a route.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const basicAuthenticate = async (req, res, next) => {
  try {
    const user = await getUserFromAuthorization(req);

    if (!user) {
      console.warn(`Unauthorized access attempt with Basic authentication from ${req.ip}`);
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(`Error during Basic authentication: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Applies X-Token authentication to a route.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const xTokenAuthenticate = async (req, res, next) => {
  try {
    const user = await getUserFromXToken(req);

    if (!user) {
      console.warn(`Unauthorized access attempt with X-Token authentication from ${req.ip}`);
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(`Error during X-Token authentication: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
