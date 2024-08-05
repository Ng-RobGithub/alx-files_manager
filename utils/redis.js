import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error(`Redis client not connected to the server: ${err}`);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });

    this.get = promisify(this.client.get).bind(this);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return this.get(key);
  }

  async set(key, value, duration) {
    this.client.set(key, value);
    this.client.expire(key, duration);
  }
}

const redisClient = new RedisClient();
export default redisClient;
