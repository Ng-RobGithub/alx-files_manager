// error.js

/**
 * Represents an error in this API.
 */
class APIError extends Error {
  /**
   * @param {number} [code=500] - The HTTP status code.
   * @param {string} message - The error message.
   */
  constructor(code = 500, message) {
    super(message);
    this.code = code;
    this.name = 'APIError';
  }
}

/**
 * Error handling middleware for the API.
 * @param {Error | APIError} err - The error object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 */
const errorResponse = (err, req, res, next) => {
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

export { APIError, errorResponse };
