import express from 'express';
import startServer from './lib/boot.js';
import injectRoutes from './routes/index.js';
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
  const PORT = process.env.PORT || 5000;

  // Ensure the server binds to 0.0.0.0 to listen on all network interfaces
  await startServer(server, PORT, '0.0.0.0');

  console.log(`Server running on http://0.0.0.0:${PORT}`);

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
};

start();

export default server;
