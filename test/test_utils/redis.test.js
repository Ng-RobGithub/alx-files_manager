/* eslint-disable import/no-named-as-default */
import { expect } from 'chai';
import redisClient from '../../utils/redis.js';

describe('+ RedisClient utility', () => {
  before(async function () {
    this.timeout(10000);
    // Ensure the client is connected and ready for tests
    await redisClient.ping(); // Assuming redisClient has a ping method for checking connectivity
  });

  it('+ Client is alive', () => {
    expect(redisClient.isAlive()).to.equal(true);
  });

  it('+ Setting and getting a value', async () => {
    await redisClient.set('test_key', 345, 10);
    const value = await redisClient.get('test_key');
    expect(value).to.equal('345');
  });

  it('+ Setting and getting an expired value', async () => {
    await redisClient.set('test_key', 356, 1);
    // Wait for the value to expire
    await new Promise(resolve => setTimeout(resolve, 2000));
    const value = await redisClient.get('test_key');
    expect(value).to.be.null;
  });

  it('+ Setting and getting a deleted value', async () => {
    await redisClient.set('test_key', 345, 10);
    await redisClient.del('test_key');
    // Wait to ensure deletion is processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    const value = await redisClient.get('test_key');
    expect(value).to.be.null;
  });
});
