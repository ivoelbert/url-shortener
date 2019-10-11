import { encodeLongUrl } from '../shortenUrl/controller';
import { MongoDbStore } from '../MongoDbStore';
import * as dotenv from 'dotenv';

dotenv.config();

/*
 *   I was going to scrape this from https://en.wikipedia.org/wiki/List_of_most_popular_websites
 *   But there are lots of NSFW sites there!
 */
const URLs: string[] = [
    'facebook.com',
    'google.com',
    'twitter.com',
    'instagram.com',
    'tumblr.com',
    'linkedin.com',
    'stackoverflow.com',
    'developer.mozilla.org',
    'bitstamp.net',
    'amazon.com',
    'ebay.com',
    'youtube.com',
    'netflix.com',
    'reddit.com',
];

const mockDB = async (): Promise<void> => {
    try {
        await MongoDbStore.connect();

        await Promise.all(URLs.map(encodeLongUrl));
        console.info('Successfully mocked DB!');

        process.exit(0);
    } catch (err) {
        console.info('Something went wrong :(');
        console.error(err);
        process.exit(1);
    }
};

mockDB();