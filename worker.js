import { writeFile } from 'fs';
import { promisify } from 'util';
import Queue from 'bull';
import imgThumbnail from 'image-thumbnail';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './utils/db.js';
import Mailer from './utils/mailer.js';

const writeFileAsync = promisify(writeFile);
const fileQueue = new Queue('thumbnail generation');
const userQueue = new Queue('email sending');

/**
 * Generates the thumbnail of an image with a given width size.
 * @param {String} filePath The location of the original file.
 * @param {number} size The width of the thumbnail.
 * @returns {Promise<void>}
 */
const generateThumbnail = async (filePath, size) => {
  const buffer = await imgThumbnail(filePath, { width: size });
  console.log(`Generating file: ${filePath}, size: ${size}`);
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

fileQueue.process(async (job, done) => {
  try {
    const { fileId, userId } = job.data;

    if (!fileId || !userId) {
      throw new Error('Missing fileId or userId');
    }

    console.log('Processing', job.data.name || '');
    const file = await (await dbClient.filesCollection())
      .findOne({
        _id: new mongoDBCore.BSON.ObjectId(fileId),
        userId: new mongoDBCore.BSON.ObjectId(userId),
      });

    if (!file) {
      throw new Error('File not found');
    }

    const sizes = [500, 250, 100];
    await Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)));
    done();
  } catch (err) {
    console.error('Error processing file queue job:', err);
    done(err);
  }
});

userQueue.process(async (job, done) => {
  try {
    const { userId } = job.data;

    if (!userId) {
      throw new Error('Missing userId');
    }

    const user = await (await dbClient.usersCollection())
      .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Welcome ${user.email}!`);

    const mailSubject = 'Welcome to ALX-Files_Manager by B3zaleel';
    const mailContent = [
      '<div>',
      '<h3>Hello {{user.name}},</h3>',
      'Welcome to <a href="https://github.com/Ng-RobGithub/alx-files_manager">',
      'ALX-Files_Manager</a>, ',
      'a simple file management API built with Node.js by ',
      '<a href="https://github.com/Ng-RobGithub/alx-files_manager">Ngozi Rob Agomuonso</a>. ',
      'We hope it meets your needs.',
      '</div>',
    ].join('');

    await Mailer.sendMail(Mailer.buildMessage(user.email, mailSubject, mailContent));
    done();
  } catch (err) {
    console.error('Error processing user queue job:', err);
    done(err);
  }
});
