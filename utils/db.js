import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const database = process.env.DB_DATABASE;
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(database);
    }).catch((err) => console.error(err));
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
