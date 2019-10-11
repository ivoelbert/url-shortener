import { Request, Response } from 'express-serve-static-core';

export const encodeShortUrl = async (req: Request, res: Response): Promise<void> => {
    res.status(501).send('Not implemented... Yet!');

    return;
};

export const decodeShortUrl = async (req: Request, res: Response): Promise<void> => {
    res.status(501).send('Not implemented... Yet!');

    return;
};
