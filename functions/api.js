const express = require('express');
const bodyParser = require('body-parser');

process.env.DEBUG = process.argv.includes('-debug') ? '1' : '0';

const logger = require('./logger').child({ file: 'Api' });

const BrowserManager = require('./browserManager');
const PresetManager = require('./presetManager');
const {
  StatusEndpoint, ScrapeEndpoint,
  BrowserEndpoint, PresetEndpoint,
} = require('./endpoints');
const Router = require('./router');

const router = new Router();
const browserManager = new BrowserManager();
const presetManager = new PresetManager();

const endpoints = [
  new StatusEndpoint(), new ScrapeEndpoint(browserManager, presetManager),
  new BrowserEndpoint(browserManager), new PresetEndpoint(presetManager),
];
for (const endpoint of endpoints) {
  router.createEndpoints(endpoint);
}

const app = express();
app.use(require('express-status-monitor')());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', router.getRouter());

app.listen(3000, () => {
  logger.info(`Server Started at ${3000}`);
});

process.on('exit', () => {
  browserManager.stopAll();
});
