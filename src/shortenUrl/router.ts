import { Router } from 'express';
import { decodeShortUrlHandler, encodeLongUrlHandler, getTopUrls } from './controller';

const shortenUrl = Router();

shortenUrl.get('/top', getTopUrls);

shortenUrl.get('/:shortUrl', decodeShortUrlHandler);

shortenUrl.post('/url', encodeLongUrlHandler);

export default shortenUrl;
