const playwright = require('playwright');

const Endpoint = require('./endpoint');
// eslint-disable-next-line import/extensions
const ScrapeFunctions = require('../scrapeFunctions');

module.exports = class ScrapeEndpoint extends Endpoint {
  constructor() {
    super();
    this.requiredFields = ['url'];
  }

  async getBrowser() {
    if (this.browser === undefined) {
      this.browser = await playwright.chromium.launch();
    }
    return this.browser;
  }

  async stop() {
    await (await this.getBrowser()).close();
  }

  async newPage() {
    return (await this.getBrowser()).newPage();
  }

  async run(req, res) {
    const { body } = req;
    if (this.validBody(body)) {
      console.log(`Scraping ${body.url} for ${req.ip}`);
      const page = await this.newPage();
      try {
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

      await page.close();
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
