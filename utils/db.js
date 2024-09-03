import pkg from 'mongodb';
const { MongoClient } = pkg;

// Fetch environment variables with default values
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

// Define the DBClient class
class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.database = null;
    this.isConnected = false;

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.isConnected = true;
      this.database = this.client.db(DB_DATABASE);
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      this.isConnected = false;
    }
  }

  // Check if connection to MongoDB is alive
  isAlive() {
    return this.isConnected;
  }

  // Get number of documents in the 'users' collection
  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('Not connected to MongoDB');
    }
    const collection = this.database.collection('users');
    return collection.countDocuments();
  }

  // Get number of documents in the 'files' collection
  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('Not connected to MongoDB');
    }
    const collection = this.database.collection('files');
    return collection.countDocuments();
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
