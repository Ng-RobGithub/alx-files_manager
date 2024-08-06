/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

/**
 * Represents an error in this API.
 */
export class APIError extends Error {
  public code: number;

  constructor(code: number = 500, message: string) {
    super(message);
    this.code = code;
    this.name = 'APIError';
  }
}

/**
 * Error handling middleware for the API.
 * @param {Error | APIError} err The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const errorResponse = (err: Error | APIError, req: Request, res: Response, next: NextFunction) => {
  const defaultMsg = `Failed to process ${req.url}`;

  if (err instanceof APIError) {
    console.error(`APIError [${err.code}]: ${err.message}`);
    res.status(err.code).json({ error: err.message || defaultMsg });
    return;
  }

  console.error(`Error: ${err.message}`);
  res.status(500).json({
    error: err.message || defaultMsg,
  });
};
