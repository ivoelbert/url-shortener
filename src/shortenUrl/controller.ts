import { Request, Response } from 'express-serve-static-core';
import * as validUrl from 'valid-url';
import * as normalizeUrl from 'normalize-url';

import shortUniqueId from '../services/shortIds';
import { MongoDbStore } from '../MongoDbStore';
import { ShortUrl } from '../models/shortUrls';
import { getTitle } from './scrapeTitle';

class ExposedError extends Error {
    status: number;

    constructor(status: number, msg: string) {
        super(msg);

        this.status = status;
        this.name = 'ExposedError';
    }
}

// Weird validation, but it does the job. isWebUri accepts http://asd and that's no way a good URL.
const isValidUrl = (url: string): boolean => {
    return validUrl.isWebUri(url) && url.includes('.');
};

// We export this function so we can mock stuff.
export const encodeLongUrl = async (longUrl: string): Promise<ShortUrl> => {
    // This normalizer is really nice!
    const normalizedLongUrl = normalizeUrl(longUrl);

    // If it's not a valid URL return a bad request
    if (!isValidUrl(normalizedLongUrl)) {
        throw new ExposedError(400, `BAD REQUEST. Probably malformed URL: '${normalizedLongUrl}'`);
    }

    const title: string = await getTitle(normalizedLongUrl);

    const store = MongoDbStore.getInstance();
    const collection = store.collection<ShortUrl>('short_urls');

    // If it was already stored, return it.
    const entry: ShortUrl = await collection.findOne({ originalUrl: normalizedLongUrl });
    if (entry) {
        return entry;
    }

    // Get a new short slug for it
    // We assume this slugs are unique. We could add some collition checks, and even some retries, but let's keep it simple.
    const shortSlug: string = await shortUniqueId();
    const newEntry: ShortUrl = {
        originalUrl: normalizedLongUrl,
        shortUrl: shortSlug,
        accessCount: 0,
        title,
    };

    await collection.insertOne(newEntry);

    return newEntry;
};

// Express handler for POST /url
export const encodeLongUrlHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { url } = req.body;

        // It's valid, encode it, store it, return it!
        const response: ShortUrl = await encodeLongUrl(url);
        res.status(200).send(response);

        return;
    } catch (err) {
        console.error(err);

        if (err.name === 'ExposedError') {
            res.status(err.status).send(err.message);
        } else {
            res.status(500).send(`Something went wrong in our server, please try again later :(`);
        }
    }
};

// Express handler for GET /:shortUrl
export const decodeShortUrlHandler = async (req: Request, res: Response): Promise<void> => {
    const { shortUrl } = req.params;

    const store = MongoDbStore.getInstance();
    const collection = store.collection<ShortUrl>('short_urls');

    const entry = await collection.findOneAndUpdate(
        {
            shortUrl,
        },
        {
            $inc: { accessCount: 1 },
        }
    );

    const { value } = entry;

    if (value) {
        const { originalUrl } = value;
        res.redirect(301, originalUrl);
    } else {
        res.status(404).send('Not found!');
    }

    return;
};
