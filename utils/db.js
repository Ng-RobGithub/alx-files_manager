import pkg from 'mongodb';
const { MongoClient } = pkg;
import envLoader from './env_loader.js';

/**
 * Represents a MongoDB client.
 */
class DBClient {
  /**
   * Creates a new DBClient instance.
   */
  constructor() {
    envLoader();
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(dbURL, { useUnifiedTopology: true });

    // Connect to the MongoDB server
    this.client.connect().catch(error => {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1); // Exit the process with failure code
    });
  }

  /**
   * Checks if this client's connection to the MongoDB server is active.
   * @returns {boolean}
   */
  isAlive() {
    return this.client.isConnected && this.client.isConnected();
  }

  /**
   * Retrieves the number of users in the database.
   * @returns {Promise<Number>}
   */
  async nbUsers() {
    try {
      return await this.client.db().collection('users').countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      throw new Error('Failed to count users');
    }
  }

  /**
   * Retrieves the number of files in the database.
   * @returns {Promise<Number>}
   */
  async nbFiles() {
    try {
      return await this.client.db().collection('files').countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      throw new Error('Failed to count files');
    }
  }

  /**
   * Retrieves a reference to the `users` collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection() {
    try {
      return this.client.db().collection('users');
    } catch (error) {
      console.error('Error retrieving users collection:', error);
      throw new Error('Failed to retrieve users collection');
    }
  }

  /**
   * Retrieves a reference to the `files` collection.
   * @returns {Promise<Collection>}
   */
  async filesCollection() {
    try {
      return this.client.db().collection('files');
    } catch (error) {
      console.error('Error retrieving files collection:', error);
      throw new Error('Failed to retrieve files collection');
    }
  }
}

export const dbClient = new DBClient();
export default dbClient;
