const { performance } = require('perf_hooks');
const Endpoint = require('./endpoint');
// eslint-disable-next-line import/extensions
const ScrapeFunctions = require('../scrapeFunctions');
const logger = require('../logger').child({ file: 'ScrapeEndpoint' });

module.exports = class ScrapeEndpoint extends Endpoint {
  constructor(browserManager, presetManager) {
    super('scrape', undefined, ['run']);
    this.requiredFields = ['url'];
    this.browserManager = browserManager;
    this.presetManager = presetManager;
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
    const stats = {};
    const requestId = this.createRequestId(req);
    const requestStart = performance.now();
    const requestLog = logger.child({ request: requestId });
    if (this.validBody(body)) {
      let page;
      try {
        const { preset, url, browser, navOptions, waitFor, context, steps } = body;
        requestLog.info(`Scraping ${url}`);
        const browserId = browser || 'chromium';
        requestLog.debug(`Using ${browser || 'chromium'} browser`);
        if (context) requestLog.debug(`Custom context: ${context}`);
        page = await (await (await this.getBrowser(browserId)).newContext(context || {})).newPage();
        const options = navOptions || { timeout: 30000, waitUntil: 'load' };
        requestLog.debug(`Navigation options: ${JSON.stringify(options)}`);
        const navigationStart = performance.now();
        await page.goto(url, options);
        stats.navigation = this.calcTime(navigationStart);
        requestLog.debug(`Navigated ${stats.navigation}ms`);
        if (waitFor) {
          try {
            const waits = [];
            for (const selector of waitFor) {
              waits.push(page.waitForSelector(selector));
              requestLog.debug(`Waiting for: ${selector}`);
            }
            await Promise.all(waits);
          } catch (e) {
            throw new Error('Timed out waiting for selectors');
          }
          stats.pageLoad = this.calcTime(navigationStart);
          requestLog.debug(`Page loaded: ${stats.pageLoad}ms`);
        }

        // eslint-disable-next-line new-cap
        const execution = new ScrapeFunctions.sub_steps(steps, requestLog, true);
        this.jsonRespond(res, {
          id: requestId,
          stats: {
            request: this.calcTime(requestStart),
            ...stats,
          },
          results: await execution.runFirst(page, []),
        });
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

  calcTime(start) {
    return Math.floor(performance.now() - start);
  }
};
