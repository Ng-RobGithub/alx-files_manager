import pkg from 'mongodb';
const { MongoClient } = pkg;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

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

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('Not connected to MongoDB');
    }
    const collection = this.database.collection('users');
    return collection.countDocuments();
  }

  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('Not connected to MongoDB');
    }
    const collection = this.database.collection('files');
    return collection.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
