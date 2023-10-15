const Endpoint = require('./endpoint');
const ScrapeFunctions = require('../scrapeFunctions');

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
    if (this.validBody(body)) {
      let page;
      try {
        console.log(`Scraping ${body.url} for ${req.ip}`);
        const browserId = body.browser || 'chromium';
        page = await this.newPage(browserId);
        await this.gotoUrl(page, body);

        const result = {};
        for (const [field, instructions] of Object.entries(body.steps)) {
          try {
            const steps = [];
            for (const { step, args } of instructions) {
              if (ScrapeFunctions[step]) {
                steps.push(new ScrapeFunctions[step](args));
              } else {
                throw new Error(`${step} is not a valid function`);
              }
            }
            result[field] = await steps[0].runFirst(page, steps);
          } catch (e) {
            result[field] = { error: e.message };
          }
        }
        this.jsonRespond(res, result);
      } catch (e) {
        this.errorRespond(res, 500, { name: e.name, message: e.message });
      }

      if (page) {
        await page.close();
      }
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
