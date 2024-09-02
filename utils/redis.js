import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.error('Redis client error:', err.message || err.toString());
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected');
    });
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (err) {
      console.error('Error connecting to Redis:', err.message || err.toString());
      throw err;
    }
  }

  isAlive() {
    return this.client.isOpen || this.client.connected;
  }

  async get(key) {
    if (!this.isAlive()) {
      throw new Error('Redis client is not connected');
    }
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error('Error retrieving value from Redis:', err.message || err.toString());
      throw err;
    }
  }

  async set(key, value, duration) {
    if (!this.isAlive()) {
      throw new Error('Redis client is not connected');
    }
    try {
      await this.client.setEx(key, duration, value.toString());
    } catch (err) {
      console.error('Error setting value in Redis:', err.message || err.toString());
      throw err;
    }
  }

  async del(key) {
    if (!this.isAlive()) {
      throw new Error('Redis client is not connected');
    }
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Error deleting value from Redis:', err.message || err.toString());
      throw err;
    }
  }
}

const redisClient = new RedisClient();
await redisClient.connect();  // Ensure the client connects before using it

export default redisClient;
