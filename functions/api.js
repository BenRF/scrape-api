const express = require('express');
const bodyParser = require('body-parser');

process.env.DEBUG = process.argv.includes('-debug') ? '1' : '0';

const logger = require('./logger').child({ file: 'Api' });

const StatusEndpoint = require('./endpoints/status');
const ScrapeEndpoint = require('./endpoints/scrape');
const BrowserManager = require('./browserManager');
const BrowserEndpoint = require('./endpoints/browser');
const Router = require('./router');

const router = new Router();
const browserManager = new BrowserManager();

router.createGet('/status', new StatusEndpoint());
const Scraper = new ScrapeEndpoint(browserManager);
router.createPost('/scrape', Scraper);

const browserEndpoint = new BrowserEndpoint(browserManager);
for (const endpoint of ['list']) {
  router.createGet(`/browser/${endpoint}`, browserEndpoint, endpoint);
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', router.getRouter());

app.listen(3000, () => {
  logger.info(`Server Started at ${3000}`);
});

process.on('exit', () => {
  browserManager.stop();
});
