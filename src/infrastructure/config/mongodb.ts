import { MongoClient, Db, Collection, Document } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'mydatabase';
const username = process.env.MONGODB_USERNAME || 'yourUsername';
const password = process.env.MONGODB_PASSWORD || 'yourPassword';

let client: MongoClient;
let db: Db;

export async function getCollection(collection: string): Promise<Collection<Document>> {
    if (db) return db.collection(collection);
    client = new MongoClient(uri,{ auth: { username, password} });
    await client.connect();
    db = client.db(dbName);
    return db.collection(collection) as Collection<Document>;
}

export async function disconnectFromDatabase() {
    if (client) {
        await client.close();
        db = undefined as unknown as Db;
        client = undefined as unknown as MongoClient;
    }
}


export class DatabaseConfig {
  private static client: MongoClient;

  static async connect(): Promise<MongoClient> {
    if (!this.client) {
      this.client = new MongoClient(uri, { auth: { username, password } });
      await this.client.connect();
      console.log('Connected to MongoDB');
    }
    return this.client;
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}