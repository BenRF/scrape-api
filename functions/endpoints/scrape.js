const Endpoint = require('./endpoint');
// eslint-disable-next-line import/extensions
const ScrapeFunctions = require('../scrapeFunctions');
const logger = require('../logger').child({ file: 'ScrapeEndpoint' });

module.exports = class ScrapeEndpoint extends Endpoint {
  constructor(browserManager) {
    super();
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

  async newPage(id) {
    return (await this.getBrowser(id)).newPage();
  }

  async run(req, res) {
    const { body } = req;
    const requestLog = logger.child({ request: this.createRequestId(req) });
    if (this.validBody(body)) {
      let page;
      try {
        requestLog.info(`Scraping ${body.url}`);
        const browserId = body.browser || 'chromium';
        page = await this.newPage(browserId);
        await this.gotoUrl(page, body);
        requestLog.debug('Page loaded');

        const result = {};
        for (const [field, instructions] of Object.entries(body.steps)) {
          const fieldLog = requestLog.child({ scrapeField: field });
          fieldLog.debug('Starting');
          try {
            const steps = [];
            for (const { step, args } of instructions) {
              if (ScrapeFunctions[step]) {
                steps.push(new ScrapeFunctions[step](args, fieldLog));
              } else {
                const message = `${step} is not a valid function`;
                fieldLog.error(message);
                throw new Error(message);
              }
            }
            result[field] = await steps[0].runFirst(page, steps);
            fieldLog.debug('Done');
          } catch (e) {
            fieldLog.error(e.message);
            result[field] = { error: e.message };
          }
        }
        this.jsonRespond(res, result);
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

  async gotoUrl(page, { url, navOptions }) {
    await page.goto(url, navOptions || { timeout: 30000, waitUntil: 'load' });
  }
};
