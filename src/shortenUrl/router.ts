import { Router } from 'express';
import { decodeShortUrlHandler, encodeLongUrlHandler } from './controller';

const shortenUrl = Router();

shortenUrl.get('/:shortUrl', decodeShortUrlHandler);

shortenUrl.post('/', encodeLongUrlHandler);

export default shortenUrl;
