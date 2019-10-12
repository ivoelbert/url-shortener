import * as Mongo from 'mongodb';

const MongoClient = Mongo.MongoClient;

export type StoreCollection = 'short_urls';

export type Db = Mongo.Db;

// This store is a singleton
// You should first connect to mongo with connect()
// then you can get the instance with getInstance()
export class MongoDbStore {
    private db: Db;
    private static instance: MongoDbStore;

    private constructor(db: Db) {
        this.db = db;
    }

    static connect = async (): Promise<void> => {
        // First instance, connect to db!
        try {
            const connectionString: string = process.env.MONGODB_CONNECTION_STRING;
            const client: Mongo.MongoClient = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

            const db = client.db();

            MongoDbStore.instance = new MongoDbStore(db);

            return;
        } catch (err) {
            console.error('Could not connect to MongoDB! Is your ENV correctly set up?\n');
            console.error(err);
            throw err;
        }
    }

    static getInstance = (): MongoDbStore => {
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
