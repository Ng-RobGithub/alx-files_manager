/* eslint-disable import/no-named-as-default */
import { expect } from 'chai';
import redisClient from '../../utils/redis.js';

describe('+ RedisClient utility', () => {
  before(async function () {
    this.timeout(10000);
    // Ensure the client is connected and ready for tests
    await new Promise((resolve, reject) => {
      redisClient.on('ready', resolve);
      redisClient.on('error', reject);
    });
  });

  it('+ Client is alive', async () => {
    expect(redisClient.connected).to.be.true;
  });

  it('+ Setting and getting a value', async () => {
    await redisClient.set('test_key', 345, 'EX', 10);
    const value = await redisClient.get('test_key');
    expect(value).to.equal('345');
  });

  it('+ Setting and getting an expired value', async () => {
    await redisClient.set('test_key', 356, 'EX', 1);
    // Wait for the value to expire
    await new Promise(resolve => setTimeout(resolve, 2000));
    const value = await redisClient.get('test_key');
    expect(value).to.be.null;
  });

  it('+ Setting and getting a deleted value', async () => {
    await redisClient.set('test_key', 345, 'EX', 10);
    await redisClient.del('test_key');
    // Wait to ensure deletion is processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    const value = await redisClient.get('test_key');
    expect(value).to.be.null;
  });
});
