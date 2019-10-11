import { MongoDbStore } from './MongoDbStore';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as cors from 'cors';

import routes from './shortenUrl/router';

dotenv.config();

const buildApp = (): express.Express => {
    // Our Express APP config
    const app: express.Express = express();
    app.set('port', process.env.PORT || 3000);
    app.set('trust proxy', '127.0.0.1');

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '20mb' }));

    app.use(cors());

    app.use('/', routes);

    return app;
};

const start = async (): Promise<void> => {
    // Connect to Mongo!
    await MongoDbStore.connect();

    const app: express.Express = buildApp();

    const port: number = app.get('port');

    app.listen(port, () => {
        console.info(`API is listening on port ${port}`);
    });
};

start();
