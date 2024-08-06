import envLoader from '../utils/env_loader.js';

/**
 * Starts the server and begins listening on the specified port.
 * @param {Express} api The Express application instance.
 */
const startServer = (api) => {
  envLoader();
  const port = process.env.PORT || 5000;
  const env = process.env.npm_lifecycle_event || 'dev';

  try {
    api.listen(port, () => {
      console.log(`[${env}] API is listening on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); // Exit the process with failure code
  }
};

export default startServer;
