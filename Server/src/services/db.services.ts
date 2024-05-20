import { BookMark } from './../models/schemas/BookMark.schema';
import { HashTag } from './../models/schemas/HashTag.schema';
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
import User from '~/models/schemas/User.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import Follower from '~/models/schemas/Follower.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import { Like } from '~/models/schemas/Like.schema';
dotenv.config();

class DatabaseService {
  private client: MongoClient;
  private db: Db;
  private static instance: DatabaseService;
  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@twitter.v7c7yrf.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`;
    this.client = new MongoClient(uri);
    this.db = this.client.db(`${process.env.DB_NAME}`);
  }
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
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
  public async getIndex() {
    await this.getUserIndex();
    await this.getFollowersIndex();
    await this.getRefreshTokenIndex();
  }
  public async getUserIndex() {
    const exists = await this.users.indexExists(['email_1', 'email_1_password_1', 'username_1']);
    if (!exists) {
      this.users.createIndex({ email: 1 }, { unique: true });
      this.users.createIndex({ username: 1 }, { unique: true });
      this.users.createIndex({ email: 1, password: 1 });
    }
  }
  public async getFollowersIndex() {
    const exists = await this.users.indexExists(['user_id_1_followed_user_id_1']);
    if (!exists) {
      this.follower.createIndex({ user_id: 1, followed_user_id: 1 }, { unique: true });
    }
  }
  public async getRefreshTokenIndex() {
    const exists = await this.users.indexExists(['token_1']);
    if (!exists) {
      this.refreshToken.createIndex({ token: 1 });
      this.refreshToken.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
    }
  }
  public get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string);
  }
  public get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEET_COLLECTION as string);
  }
  public get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string);
  }
  public get follower(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWER_COLLECTION as string);
  }
  public get hashTags(): Collection<HashTag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string);
  }
  public get bookmark(): Collection<BookMark> {
    return this.db.collection(process.env.DB_BOOKMARK_COLLECTION as string);
  }
  public get like(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKE_COLLECTION as string);
  }
}

const databaseService = DatabaseService.getInstance();
export default databaseService;
