import { createClient } from 'redis';

/**
 * Represents a Redis client.
 */
class RedisClient {
  /**
   * Creates a new RedisClient instance.
   */
  constructor() {
    // Create a Redis client with default or custom configuration
    this.client = createClient({
      url: 'redis://localhost:6379'  // Adjust if needed
    });

    // Flag to track client connection status
    this.isClientConnected = false;

    // Event listeners for connection and errors
    this.client.on('error', (err) => {
      console.error('Redis client error:', err.message || err.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isClientConnected = true;
    });

    this.client.on('end', () => {
      console.log('Redis client connection ended');
      this.isClientConnected = false;
    });
  }

  /**
   * Checks if this client's connection to the Redis server is active.
   * @returns {boolean}
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value of a given key.
   * @param {String} key The key of the item to retrieve.
   * @returns {Promise<String | Object>}
   */
  async get(key) {
    return this.client.get(key);
  }

  /**
   * Stores a key and its value along with an expiration time.
   * @param {String} key The key of the item to store.
   * @param {String | Number | Boolean} value The item to store.
   * @param {Number} duration The expiration time of the item in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    await this.client.setEx(key, duration, value);
  }

  /**
   * Removes the value of a given key.
   * @param {String} key The key of the item to remove.
   * @returns {Promise<void>}
   */
  async del(key) {
    await this.client.del(key);
  }
}

// Create and export an instance of RedisClient
export const redisClient = new RedisClient();
export default redisClient;
