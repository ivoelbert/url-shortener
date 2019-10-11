import { MongoDbStore } from './MongoDbStore';
import { ShortUrl } from './models/shortUrls';
import * as dotenv from 'dotenv';

dotenv.config();

const start = async (): Promise<void> => {
    const store = await MongoDbStore.connect();
    const collection = store.collection<ShortUrl>('short_urls');

    const oneDoc: ShortUrl = await collection.findOne({});

    console.log(oneDoc);

    await store.closeConnection();
};

start();
