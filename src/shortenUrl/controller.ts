import { Request, Response } from 'express-serve-static-core';
import * as validUrl from 'valid-url';
import * as cheerio from 'cheerio';
import * as request from 'request-promise';

import shortUniqueId from '../services/shortIds';
import { MongoDbStore } from '../MongoDbStore';
import { ShortUrl } from '../models/shortUrls';

class ExposedError extends Error {
    status: number;

    constructor(status: number, msg: string) {
        super(msg);

        this.status = status;
        this.name = 'ExposedError';
    }
}
/*
 *   To be fair this is not optimal.
 *
 *   We are fetching the whole HTML to get just the title (which also happens to be way up the document)
 *   A better way to do this would be:
 *
 *   - get the stream from that request
 *   - pipe it through an HTML parser (htmlparser2 is good)
 *   - wait for 'onopentag' for <title>
 *   - consume the stream appending each chunk to the title being built.
 *   - when we find a 'onclosetag' for </title> close the stream and return the built title.
 *
 *   This is much better, but it's also more complex.
 *   Let's keep it simple and we can improve this later if there's time :)
 */
const getTitle = async (url: string): Promise<string> => {
    try {
        const html = await request(url);
        const title: string = cheerio('title', html).html();

        return title;
    } catch (err) {
        console.warn(`Could not get title from '${url}'`);
        return null;
    }
};

// We export this function so we can mock stuff.
export const encodeLongUrl = async (longUrl: string): Promise<string> => {
    // Normalize the input, for now we'll just trim the url and add http:// at the front if it's not specified
    // We can do a much better job with this, keeping it simple.
    const trimmedUrl = longUrl.trim();
    const normalizedLongUrl = /(http:\/\/|https:\/\/)/i.test(trimmedUrl) ? trimmedUrl : `http://${trimmedUrl}`;

    // If it's not a valid URL return a bad request
    if (!validUrl.isWebUri(normalizedLongUrl)) {
        throw new ExposedError(400, `BAD REQUEST. Probably malformed URL: '${normalizedLongUrl}'`);
    }

    const title: string = await getTitle(normalizedLongUrl);

    const store = MongoDbStore.getInstance();
    const collection = store.collection<ShortUrl>('short_urls');

    // If it was already stored, return it.
    const entry: ShortUrl = await collection.findOne({ originalUrl: normalizedLongUrl });
    if (entry) {
        return entry.shortUrl;
    }

    // Get a new short slug for it
    // We assume this slugs are unique. We could add some collition checks, and even some retries, but let's keep it simple.
    const shortSlug: string = await shortUniqueId();
    await collection.insertOne({
        originalUrl: normalizedLongUrl,
        shortUrl: shortSlug,
        accessCount: 0,
        title,
    });

    return shortSlug;
};

// Express handler for POST /url
export const encodeLongUrlHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { url } = req.body;

        // It's valid, encode it, store it, return it!
        const shortUrlSlug: string = await encodeLongUrl(url);
        res.status(200).send(`${process.env.HOST_NAME}/${shortUrlSlug}`);

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
    res.status(501).send('Not implemented... Yet!');

    return;
};
