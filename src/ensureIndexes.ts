import { MongoDbStore } from './MongoDbStore';
import { ShortUrl } from './models/shortUrls';

export const ensureIndexes = async (): Promise<void> => {
    const store = MongoDbStore.getInstance();
    const collection = store.collection<ShortUrl>('short_urls');

    // We need the following indexes:
    await Promise.all([
        // To quickly find the associated originalUrl
        collection.createIndex({ shortUrl: 1 }),

        // To quickly check if the originalUrl was already stored
        collection.createIndex({ originalUrl: 1 }),

        // To quickly sort by accessCount and return top 100
        collection.createIndex({ accessCount: 1 }),
    ]);
};
