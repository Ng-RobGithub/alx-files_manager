import { MongoClient } from 'mongodb';

const { DB_HOST, DB_PORT, DB_DATABASE } = process.env;

class DBClient {
    constructor() {
        const host = DB_HOST || 'localhost';
        const port = DB_PORT || 27017;
        const database = DB_DATABASE || 'files_manager';
        const url = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        this.client.connect((err) => {
            if (err) console.error(err);
            else console.log('MongoDB connected');
        });
        this.db = this.client.db(database);
    }

    isAlive() {
        return !!this.client && this.client.isConnected();
    }

    async nbUsers() {
        const usersCollection = this.db.collection('users');
        const count = await usersCollection.countDocuments();
        return count;
    }

    async nbFiles() {
        const filesCollection = this.db.collection('files');
        const count = await filesCollection.countDocuments();
        return count;
    }
}

const dbClient = new DBClient();
export default dbClient;
