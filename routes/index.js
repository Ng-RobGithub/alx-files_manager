// routes/index.js
import express from 'express';
import db from '../utils/db.js';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController.js';
import FilesController from '../controllers/FilesController.js';

const router = express.Router();

// Add status endpoint
router.get('/status', (req, res) => {
    res.status(200).send('OK');
  });

// Existing endpoints
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);

// Existing routes...
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

// New endpoints
router.get('/files/:id', FilesController.getShow);      // GET /files/:id
router.get('/files', FilesController.getIndex);         // GET /files
router.get('/files/:id/data', FilesController.getFile); // GET /files/:id/data

export default router;
