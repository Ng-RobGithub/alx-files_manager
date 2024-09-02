import express from 'express';
import startServer from './lib/boot.js';
import injectRoutes from './routes';
import injectMiddlewares from './lib/middlewares.js';

const server = express();

// Inject middlewares
injectMiddlewares(server);

// Inject routes
injectRoutes(server);

// Add health check route
server.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start server and handle graceful shutdown
const start = async () => {
  await startServer(server);

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
};

start();

export default server;
