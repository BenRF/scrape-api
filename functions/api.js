const express = require('express');
const bodyParser = require('body-parser');

const StatusEndpoint = require('./endpoints/status');
const ScrapeEndpoint = require('./endpoints/scrape');
const Router = require('./router');

const router = new Router();

router.createGet('/status', new StatusEndpoint());
const Scraper = new ScrapeEndpoint();
router.createPost('/scrape', Scraper);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', router.getRouter());

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`);
});

process.on('exit', () => {
  Scraper.stop();
});
