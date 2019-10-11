import * as Mongo from 'mongodb';

const MongoClient = Mongo.MongoClient;

export type StoreCollection = 'short_urls';

export type Db = Mongo.Db;

export type Query<T> = Mongo.FilterQuery<T>;

export type Projection<T> = { [key in keyof T]?: boolean };

export class MongoDbStore {
    private client: Mongo.MongoClient;
    private db: Db;

    private constructor(client: Mongo.MongoClient) {
        this.client = client;
        this.db = client.db();
    }

    static connect = async (): Promise<MongoDbStore> => {
        try {
            const connectionString: string = process.env.MONGODB_CONNECTION_STRING;
            const client: Mongo.MongoClient = await MongoClient.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

            return new MongoDbStore(client);
        } catch (err) {
            console.error('Could not connect to MongoDB! Is your ENV correctly set up?\n');
            console.error(err);
            throw err;
        }
    };

    public closeConnection = async (): Promise<void> => {
        await this.client.close();
    };

    public collection = <T>(name: StoreCollection): Mongo.Collection<T> => {
        return this.db.collection<T>(name);
    };
}
