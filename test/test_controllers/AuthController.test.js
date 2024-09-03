/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db.js';
import request from 'supertest'; // Ensure you import request correctly
import { expect } from 'chai';  // Assuming you're using Chai for assertions

describe('+ AuthController', () => {
  const mockUser = {
    email: 'kaido@beast.com',
    password: 'hyakuju_no_kaido_wano',
  };
  let token = '';

  before(async function () {
    this.timeout(10000);

    try {
      const usersCollection = await dbClient.usersCollection();
      await usersCollection.deleteMany({ email: mockUser.email });

      const res = await request.post('/users')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        })
        .expect(201);

      expect(res.body.email).to.eql(mockUser.email);
      expect(res.body.id.length).to.be.greaterThan(0);
    } catch (error) {
      throw new Error(`Setup failed: ${error.message}`);
    }
  });

  describe('+ GET: /connect', () => {
    it('+ Fails with no "Authorization" header field', async function () {
      this.timeout(5000);

      try {
        const res = await request.get('/connect')
          .expect(401);

        expect(res.body).to.deep.eql({ error: 'Unauthorized' });
      } catch (error) {
        throw new Error(`Connect with no header failed: ${error.message}`);
      }
    });

    it('+ Fails for a non-existent user', async function () {
      this.timeout(5000);

      try {
        const res = await request.get('/connect')
          .auth('foo@bar.com', 'raboof', { type: 'basic' })
          .expect(401);

        expect(res.body).to.deep.eql({ error: 'Unauthorized' });
      } catch (error) {
        throw new Error(`Connect with non-existent user failed: ${error.message}`);
      }
    });

    it('+ Fails with a valid email and wrong password', async function () {
      this.timeout(5000);

      try {
        const res = await request.get('/connect')
          .auth(mockUser.email, 'raboof', { type: 'basic' })
          .expect(401);

        expect(res.body).to.deep.eql({ error: 'Unauthorized' });
      } catch (error) {
        throw new Error(`Connect with wrong password failed: ${error.message}`);
      }
    });

    it('+ Fails with an invalid email and valid password', async function () {
      this.timeout(5000);

      try {
        const res = await request.get('/connect')
          .auth('zoro@strawhat.com', mockUser.password, { type: 'basic' })
          .expect(401);

        expect(res.body).to.deep.eql({ error: 'Unauthorized' });
      } catch (error) {
        throw new Error(`Connect with invalid email failed: ${error.message}`);
      }
    });

    it('+ Succeeds for an existing user', async function () {
      this.timeout(5000);

      try {
        const res = await request.get('/connect')
          .auth(mockUser.email, mockUser.password, { type: 'basic' })
          .expect(200);

        expect(res.body.token).to.exist;
        expect(res.body.token.length).to.be.greaterThan(0);
        token = res.body.token;
      } catch (error) {
        throw new Error(`Connect with existing user failed: ${error.message}`);
      }
    });
  });

  describe('+ GET: /disconnect', () => {
    it('+ Fails with no "X-Token" header field', async function () {
      this.timeout(5000);

      try {
        const res = await request.get('/disconnect')
          .expect(401);

        expect(res.body).to.deep.eql({ error: 'Unauthorized' });
      } catch (error) {
        throw new Error(`Disconnect with no token failed: ${error.message}`);
      }
    });

    it('+ Fails for a non-existent user', async function () {
      this.timeout(5000);

      try {
        const res = await request.get('/disconnect')
          .set('X-Token', 'raboof')
          .expect(401);

        expect(res.body).to.deep.eql({ error: 'Unauthorized' });
      } catch (error) {
        throw new Error(`Disconnect with non-existent user failed: ${error.message}`);
      }
    });

    it('+ Succeeds with a valid "X-Token" field', async function () {
      try {
        const res = await request.get('/disconnect')
          .set('X-Token', token)
          .expect(204);

        expect(res.body).to.deep.eql({});
        expect(res.text).to.eql('');
        expect(res.headers['content-type']).to.not.exist;
        expect(res.headers['content-length']).to.not.exist;
      } catch (error) {
        throw new Error(`Disconnect with valid token failed: ${error.message}`);
      }
    });
  });
});
