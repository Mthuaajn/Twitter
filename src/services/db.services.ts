import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
import User from '~/models/schemas/User.schema';
dotenv.config();
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@twitter.v7c7yrf.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(`${process.env.DB_NAME}`);
  }
  public async run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect();
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      // Insert data into the users collection
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  public get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string);
  }
}

const databaseService = new DatabaseService();
export default databaseService;
