/* eslint-disable import/no-named-as-default */
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import { existsSync, readdirSync, unlinkSync, statSync } from 'fs';
import dbClient from '../../utils/db.js';
import request from 'supertest'; // Ensure supertest is required
import app from '../../app'; // Ensure you import your app for request testing

const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
  ? process.env.FOLDER_PATH.trim()
  : joinPath(tmpdir(), 'DEFAULT_ROOT_FOLDER');

const mockUser = {
  email: 'katakuri@bigmom.com',
  password: 'mochi_mochi_whole_cake',
};

const mockFiles = [
  {
    name: 'manga_titles.txt',
    type: 'file',
    data: [
      '+ Darwin\'s Game',
      '+ One Piece',
      '+ My Hero Academia',
      '',
    ].join('\n'),
    b64Data() { return Buffer.from(this.data, 'utf-8').toString('base64'); },
  },
  {
    name: 'One_Piece',
    type: 'folder',
    data: '',
    b64Data() { return ''; },
  },
  {
    name: 'chapter_titles.md',
    type: 'file',
    data: [
      '+ Chapter 47: The skies above the capital',
      '+ Chapter 48: 20 years',
      '+ Chapter 49: The world you wish for',
      '+ Chapter 50: Honor',
      '+ Chapter 51: The shogun of Wano - Kozuki Momonosuke',
      '+ Chapter 52: New morning',
      '',
    ].join('\n'),
    b64Data() { return Buffer.from(this.data, 'utf-8').toString('base64'); },
  },
];

let token = '';

const emptyFolder = (name) => {
  if (!existsSync(name)) return;
  readdirSync(name).forEach((fileName) => {
    const filePath = joinPath(name, fileName);
    statSync(filePath).isFile() ? unlinkSync(filePath) : emptyFolder(filePath);
  });
};

const emptyDatabaseCollections = async () => {
  try {
    const [usersCollection, filesCollection] = await Promise.all([
      dbClient.usersCollection(),
      dbClient.filesCollection(),
    ]);
    await Promise.all([
      usersCollection.deleteMany({}),
      filesCollection.deleteMany({}),
    ]);
  } catch (err) {
    throw err;
  }
};

const signUp = async (user) => {
  try {
    const res = await request(app)
      .post('/users')
      .send({ email: user.email, password: user.password })
      .expect(201);
    expect(res.body.email).to.eql(user.email);
    expect(res.body.id.length).to.be.greaterThan(0);
    return res.body.id;
  } catch (err) {
    throw err;
  }
};

const signIn = async (user) => {
  try {
    const res = await request(app)
      .get('/connect')
      .auth(user.email, user.password, { type: 'basic' })
      .expect(200);
    expect(res.body.token).to.exist;
    expect(res.body.token.length).to.be.greaterThan(0);
    token = res.body.token;
  } catch (err) {
    throw err;
  }
};

before(async () => {
  this.timeout(10000);
  await emptyDatabaseCollections();
  await signUp(mockUser);
  await signIn(mockUser);
  emptyFolder(baseDir);
});

after(async () => {
  this.timeout(10000);
  await emptyDatabaseCollections();
  emptyFolder(baseDir);
});

describe('+ POST: /files', () => {
  it('+ Fails with no "X-Token" header field', async () => {
    const res = await request(app)
      .post('/files')
      .expect(401);
    expect(res.body).to.deep.eql({ error: 'Unauthorized' });
  });

  // Continue updating the remaining tests similarly
});
