/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db.js';
import request from 'supertest'; // Ensure you import request correctly
import { expect } from 'chai';  // Assuming you're using Chai for assertions

describe('+ AppController', () => {
  before(async function () {
    this.timeout(10000); // Set a timeout for the setup

    try {
      const [usersCollection, filesCollection] = await Promise.all([
        dbClient.usersCollection(),
        dbClient.filesCollection()
      ]);

      await Promise.all([
        usersCollection.deleteMany({}),
        filesCollection.deleteMany({})
      ]);
    } catch (error) {
      throw new Error(`Setup failed: ${error.message}`);
    }
  });

  describe('+ GET: /status', () => {
    it('+ Services are online', async function () {
      try {
        const res = await request.get('/status');
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ redis: true, db: true });
      } catch (error) {
        throw new Error(`Status check failed: ${error.message}`);
      }
    });
  });

  describe('+ GET: /stats', () => {
    it('+ Correct statistics about db collections', async function () {
      try {
        const res = await request.get('/stats');
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ users: 0, files: 0 });
      } catch (error) {
        throw new Error(`Stats check failed: ${error.message}`);
      }
    });

    it('+ Correct statistics about db collections [alt]', async function () {
      this.timeout(10000); // Set a timeout for this test

      try {
        const [usersCollection, filesCollection] = await Promise.all([
          dbClient.usersCollection(),
          dbClient.filesCollection()
        ]);

        await Promise.all([
          usersCollection.insertMany([{ email: 'john@mail.com' }]),
          filesCollection.insertMany([
            { name: 'foo.txt', type: 'file' },
            { name: 'pic.png', type: 'image' }
          ])
        ]);

        const res = await request.get('/stats');
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ users: 1, files: 2 });
      } catch (error) {
        throw new Error(`Alternate stats check failed: ${error.message}`);
      }
    });
  });
});
