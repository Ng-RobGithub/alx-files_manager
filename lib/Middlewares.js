import express from 'express';

/**
 * Adds middlewares to the given express application.
 * @param {express.Express} api The express application.
 */
const injectMiddlewares = (api) => {
  // Middleware to parse JSON bodies
  api.use(express.json({ limit: '200mb' }));
  
  // Middleware to parse URL-encoded bodies
  api.use(express.urlencoded({ extended: true }));

  // Middleware to add security headers
  api.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Middleware to handle CORS if needed
  api.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
};

export default injectMiddlewares;
