// routes/index.js
import express from 'express';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// Existing endpoints
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);

// New endpoints
router.get('/files/:id', FilesController.getShow);      // GET /files/:id
router.get('/files', FilesController.getIndex);         // GET /files
router.get('/files/:id/data', FilesController.getFile); // GET /files/:id/data

export default router;
