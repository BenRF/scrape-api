import * as Express from 'express';
import * as bodyParser from 'body-parser';

import logger from './logger';

import Router from './router';
import BrowserManager from './browserManager';
import { StatusEndpoint, BrowserListEndpoint, BrowserCreateEndpoint } from './endpoints';

// [TODO] Reintroduce env variables
const logs = logger.child({ file: 'Api' });

const router = new Router();
const browserManager = new BrowserManager();

// Get methods
for (const endpoint of [new StatusEndpoint(), new BrowserListEndpoint(browserManager)]) {
  router.createGet(endpoint);
}

// Post methods
for (const endpoint of [new BrowserCreateEndpoint(browserManager)]) {
  router.createPost(endpoint);
}

const app = Express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', router.getRouter());

app.listen(3000, () => {
  logs.info(`Server Started at ${3000}`);
});
