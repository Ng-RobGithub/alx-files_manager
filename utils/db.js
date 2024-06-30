import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.client = new MongoClient(`mongodb://${host}:${port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('MongoDB connected');
      this.db = this.client.db(process.env.DB_DATABASE);
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async isAlive() {
    try {
      await this.client.db().admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return false;
    }
  }

  async nbUsers() {
    try {
      const count = await this.db.collection('users').countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  async nbFiles() {
    try {
      const count = await this.db.collection('files').countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();

export default dbClient;
