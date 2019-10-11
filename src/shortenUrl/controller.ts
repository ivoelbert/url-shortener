import { Request, Response } from 'express-serve-static-core';
import * as validUrl from 'valid-url';
import { MongoDbStore } from '../MongoDbStore';
import { ShortUrl } from '../models/shortUrls';
import shortUniqueId from '../services/shortIds';

// Takes the long URL, returns the short URL slug (creating and storing it if necessary)
// Error handling and input validation are left for the handler
export const encodeLongUrl = async (longUrl: string): Promise<string> => {
    const store = MongoDbStore.getInstance();
    const collection = store.collection<ShortUrl>('short_urls');

    // If it was already stored, return it.
    const entry: ShortUrl = await collection.findOne({ originalUrl: longUrl });
    if (entry) {
        return entry.shortUrl;
    }

    // Get a new short slug for it
    // We assume this slugs are unique. We could add some collition checks, and even some retries, but let's keep it simple.
    const shortSlug: string = await shortUniqueId();
    await collection.insertOne({
        originalUrl: longUrl,
        shortUrl: shortSlug,
        accessCount: 0,
    });

    return shortSlug;
};

export const encodeLongUrlHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { url } = req.body;

        // Normalize the input, for now we'll just trim the url.
        const normalizedLongUrl = url.trim();

        // If it's not a valid URL return a bad request
        if (!validUrl.isUri(normalizedLongUrl)) {
            res.status(400).send(`BAD REQUEST. Probably malformed URL: '${normalizedLongUrl}'`);

            return;
        }

        // It's valid, encode it, store it, return it!
        const shortUrlSlug: string = await encodeLongUrl(normalizedLongUrl);
        res.status(200).send(`${process.env.HOST_NAME}/${shortUrlSlug}`);

        return;
    } catch (err) {
        res.status(500).send(`Something went wrong in our server, please try again later :(`);
    }
};

export const decodeShortUrlHandler = async (req: Request, res: Response): Promise<void> => {
    res.status(501).send('Not implemented... Yet!');

    return;
};
