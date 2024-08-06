// eslint-disable-next-line no-unused-vars
import { Express } from 'express';
import AppController from '../controllers/AppController.js';
import AuthController from '../controllers/AuthController.js';
import UsersController from '../controllers/UsersController.js';
import FilesController from '../controllers/FilesController.js';
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/auth.js';
import { APIError, errorResponse } from '../middlewares/error';

/**
 * Injects routes with their handlers into the given Express application.
 * @param {Express} api - The Express application instance.
 */
const injectRoutes = (api) => {
  // Status and stats routes
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

  // Authentication routes
  api.get('/connect', basicAuthenticate, AuthController.getConnect);
  api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

  // User routes
  api.post('/users', UsersController.postNew);
  api.get('/users/me', xTokenAuthenticate, UsersController.getMe);

  // File routes
  api.post('/files', xTokenAuthenticate, FilesController.postUpload);
  api.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
  api.get('/files', xTokenAuthenticate, FilesController.getIndex);
  api.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
  api.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
  api.get('/files/:id/data', FilesController.getFile);

  // 404 handler for undefined routes
  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });

  // Error handling middleware
  api.use(errorResponse);
};

export default injectRoutes;
