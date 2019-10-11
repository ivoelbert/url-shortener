import * as Mongo from 'mongodb';

const MongoClient = Mongo.MongoClient;

export type StoreCollection = 'short_urls';

export type Db = Mongo.Db;

export type Query<T> = Mongo.FilterQuery<T>;

export type Projection<T> = { [key in keyof T]?: boolean };

// This store is a singleton, you can asynchronously get an instance with getInstance()
export class MongoDbStore {
    private db: Db;
    private static instance: MongoDbStore;

    private constructor(client: Mongo.MongoClient) {
        this.db = client.db();
    }

    static connect = async (): Promise<void> => {
        // First instance, connect to db!
        try {
            const connectionString: string = process.env.MONGODB_CONNECTION_STRING;
            const client: Mongo.MongoClient = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

            MongoDbStore.instance = new MongoDbStore(client);
            return;
        } catch (err) {
            console.error('Could not connect to MongoDB! Is your ENV correctly set up?\n');
            console.error(err);
            throw err;
        }
    }

    static getInstance = async (): Promise<MongoDbStore> => {
        // Return the instance created by connect
        if(MongoDbStore.instance) {
            return MongoDbStore.instance;
        } else {
            throw new Error(`Cannot get instance from disconnected DB! Please await MongoDbStore.connect() first.`);
        }
    };

    public collection = <T>(name: StoreCollection): Mongo.Collection<T> => {
        return this.db.collection<T>(name);
    };
}
