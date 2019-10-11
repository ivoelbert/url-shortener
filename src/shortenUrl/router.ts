import { Router } from 'express';
import { decodeShortUrl, encodeShortUrl } from './controller'

const shortenUrl = Router();

shortenUrl.get('/:shortUrl', decodeShortUrl);

shortenUrl.post('/', encodeShortUrl);

export default shortenUrl;