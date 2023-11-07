const Endpoint = require('./endpoint');
// eslint-disable-next-line import/extensions
const ScrapeFunctions = require('../scrapeFunctions');
const logger = require('../logger').child({ file: 'ScrapeEndpoint' });

module.exports = class ScrapeEndpoint extends Endpoint {
  constructor(browserManager) {
    super('scrape', undefined, ['run']);
    this.requiredFields = ['url'];
    this.browserManager = browserManager;
  }

  async getBrowser(id) {
    const browser = await this.browserManager.getBrowser(id);
    if (browser) {
      return browser;
    }
    throw new Error('Browser not found');
  }

  async newPage(id, contextOptions) {
    const browser = await this.getBrowser(id);
    return (await browser.newContext(contextOptions)).newPage();
  }

  async run(req, res) {
    const { body } = req;
    const requestLog = logger.child({ request: this.createRequestId(req) });
    if (this.validBody(body)) {
      let page;
      try {
        requestLog.info(`Scraping ${body.url}`);
        const browserId = body.browser || 'chromium';
        page = await this.newPage(browserId, body.context || {});
        await this.gotoUrl(page, body);
        requestLog.debug('Page loaded');

        // eslint-disable-next-line new-cap
        const execution = new ScrapeFunctions.sub_steps(body.steps, requestLog);
        this.jsonRespond(res, await execution.runFirst(page, []));
      } catch (e) {
        requestLog.error(e.message);
        this.errorRespond(res, 500, { name: e.name, message: e.message });
      }

      if (page) {
        requestLog.debug('Page closed');
        await page.close();
      }
      requestLog.info('Completed');
    } else {
      this.errorRespond(res, 400, {
        error: 'Missing fields',
      });
    }
  }

  async gotoUrl(page, { url, navOptions, waitFor }) {
    await page.goto(url, navOptions || { timeout: 30000, waitUntil: 'load' });
    if (waitFor) {
      try {
        const waits = [];
        for (const selector of waitFor) {
          waits.push(page.waitForSelector(selector));
        }
        await Promise.all(waits);
      } catch (e) {
        throw new Error('Timed out waiting for selectors');
      }
    }
  }
};
