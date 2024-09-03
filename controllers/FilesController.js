/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import { tmpdir } from 'os';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile, stat, existsSync, realpath } from 'fs';
import { join as joinPath } from 'path';
import { Request, Response } from 'express';
import { contentType } from 'mime-types';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from '../utils/db.js';
import { getUserFromXToken } from '../utils/auth.js';

const VALID_FILE_TYPES = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};
const ROOT_FOLDER_ID = 0;
const DEFAULT_ROOT_FOLDER = 'files_manager';
const mkDirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);
const statAsync = promisify(stat);
const realpathAsync = promisify(realpath);
const MAX_FILES_PER_PAGE = 20;
const fileQueue = new Queue('thumbnail generation');
const NULL_ID = Buffer.alloc(24, '0').toString('utf-8');
const isValidId = (id) => {
  const size = 24;
  if (typeof id !== 'string' || id.length !== size) return false;

  return /^[0-9a-fA-F]{24}$/.test(id);
};

export default class FilesController {
  /**
   * Uploads a file.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async postUpload(req, res) {
    try {
      const { user } = req;
      const name = req.body?.name || null;
      const type = req.body?.type || null;
      const parentId = req.body?.parentId || ROOT_FOLDER_ID;
      const isPublic = req.body?.isPublic || false;
      const base64Data = req.body?.data || '';

      if (!name) return res.status(400).json({ error: 'Missing name' });
      if (!type || !Object.values(VALID_FILE_TYPES).includes(type)) return res.status(400).json({ error: 'Invalid type' });
      if (!base64Data && type !== VALID_FILE_TYPES.folder) return res.status(400).json({ error: 'Missing data' });

      if (parentId !== ROOT_FOLDER_ID) {
        const file = await dbClient.filesCollection().findOne({
          _id: new mongoDBCore.BSON.ObjectId(isValidId(parentId) ? parentId : NULL_ID),
        });

        if (!file) return res.status(400).json({ error: 'Parent not found' });
        if (file.type !== VALID_FILE_TYPES.folder) return res.status(400).json({ error: 'Parent is not a folder' });
      }

      const userId = user._id.toString();
      const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
        ? process.env.FOLDER_PATH.trim()
        : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);

      const newFile = {
        userId: new mongoDBCore.BSON.ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === ROOT_FOLDER_ID
          ? '0'
          : new mongoDBCore.BSON.ObjectId(parentId),
      };

      await mkDirAsync(baseDir, { recursive: true });

      if (type !== VALID_FILE_TYPES.folder) {
        const localPath = joinPath(baseDir, uuidv4());
        await writeFileAsync(localPath, Buffer.from(base64Data, 'base64'));
        newFile.localPath = localPath;
      }

      const insertionInfo = await dbClient.filesCollection().insertOne(newFile);
      const fileId = insertionInfo.insertedId.toString();

      if (type === VALID_FILE_TYPES.image) {
        fileQueue.add({ userId, fileId, name: `Image thumbnail [${userId}-${fileId}]` });
      }

      res.status(201).json({
        id: fileId,
        userId,
        name,
        type,
        isPublic,
        parentId: parentId === ROOT_FOLDER_ID ? 0 : parentId,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }

  static async getShow(req, res) {
    try {
      const { user } = req;
      const id = req.params?.id || NULL_ID;
      const userId = user._id.toString();

      const file = await dbClient.filesCollection().findOne({
        _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
        userId: new mongoDBCore.BSON.ObjectId(isValidId(userId) ? userId : NULL_ID),
      });

      if (!file) return res.status(404).json({ error: 'Not found' });

      res.status(200).json({
        id,
        userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId === ROOT_FOLDER_ID.toString() ? 0 : file.parentId.toString(),
      });
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ error: 'Failed to retrieve file' });
    }
  }

  /**
   * Retrieves files associated with a specific user.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async getIndex(req, res) {
    try {
      const { user } = req;
      const parentId = req.query.parentId || ROOT_FOLDER_ID.toString();
      const page = Number.parseInt(req.query.page || '0', 10);

      const filesFilter = {
        userId: user._id,
        parentId: parentId === ROOT_FOLDER_ID.toString()
          ? parentId
          : new mongoDBCore.BSON.ObjectId(isValidId(parentId) ? parentId : NULL_ID),
      };

      const files = await dbClient.filesCollection().aggregate([
        { $match: filesFilter },
        { $sort: { _id: -1 } },
        { $skip: page * MAX_FILES_PER_PAGE },
        { $limit: MAX_FILES_PER_PAGE },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: '$userId',
            name: '$name',
            type: '$type',
            isPublic: '$isPublic',
            parentId: {
              $cond: { if: { $eq: ['$parentId', '0'] }, then: 0, else: '$parentId' },
            },
          },
        },
      ]).toArray();

      res.status(200).json(files);
    } catch (error) {
      console.error('Error retrieving files list:', error);
      res.status(500).json({ error: 'Failed to retrieve files list' });
    }
  }

  static async putPublish(req, res) {
    try {
      const { user } = req;
      const { id } = req.params;
      const userId = user._id.toString();

      const fileFilter = {
        _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
        userId: new mongoDBCore.BSON.ObjectId(isValidId(userId) ? userId : NULL_ID),
      };

      const file = await dbClient.filesCollection().findOne(fileFilter);

      if (!file) return res.status(404).json({ error: 'Not found' });

      await dbClient.filesCollection().updateOne(fileFilter, { $set: { isPublic: true } });

      res.status(200).json({
        id,
        userId,
        name: file.name,
        type: file.type,
        isPublic: true,
        parentId: file.parentId === ROOT_FOLDER_ID.toString() ? 0 : file.parentId.toString(),
      });
    } catch (error) {
      console.error('Error publishing file:', error);
      res.status(500).json({ error: 'Failed to publish file' });
    }
  }

  static async putUnpublish(req, res) {
    try {
      const { user } = req;
      const { id } = req.params;
      const userId = user._id.toString();

      const fileFilter = {
        _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
        userId: new mongoDBCore.BSON.ObjectId(isValidId(userId) ? userId : NULL_ID),
      };

      const file = await dbClient.filesCollection().findOne(fileFilter);

      if (!file) return res.status(404).json({ error: 'Not found' });

      await dbClient.filesCollection().updateOne(fileFilter, { $set: { isPublic: false } });

      res.status(200).json({
        id,
        userId,
        name: file.name,
        type: file.type,
        isPublic: false,
        parentId: file.parentId === ROOT_FOLDER_ID.toString() ? 0 : file.parentId.toString(),
      });
    } catch (error) {
      console.error('Error unpublishing file:', error);
      res.status(500).json({ error: 'Failed to unpublish file' });
    }
  }
}
