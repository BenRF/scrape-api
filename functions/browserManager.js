const playwright = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const crypto = require('crypto');
const logger = require('./logger').child({ file: 'BrowserManager' });

const TIDY_SCHEDULE = 5; // minutes
const MAX_BROWSER_AGE = 5; // minutes since browser was last used before closing it

module.exports = class BrowserManager {
  constructor() {
    this.browserNames = ['chromium', 'firefox', 'webkit'];
    this.browsers = {};
    for (const name of this.browserNames) {
      this.browsers[name] = {
        browser: null,
        type: name,
        used: 0,
        last_used: null,
      };
    }
    const bM = this;
    setInterval(async () => {
      logger.info('Tidying browsers');
      const now = Date.parse(new Date());
      for (const [id, browser] of Object.entries(bM.browsers)) {
        if (browser.last_used && browser.browser !== null) {
          const age = now - Date.parse(browser.last_used);
          if (age > (MAX_BROWSER_AGE / 60) / 1000) {
            logger.info(`${id} has not been used for a while, closing it`);
            await browser.browser.close();
            browser.browser = null;
          }
        }
      }
    }, TIDY_SCHEDULE * 60000);
  }

  list() {
    const output = [];
    for (const [id, obj] of Object.entries(this.browsers)) {
      output.push({
        id,
        status: (obj.browser !== null) ? 'open' : 'closed',
        type: obj.type,
        used: obj.used,
        last_used: obj.last_used,
        args: obj.args,
      });
    }
    return output;
  }

  async stopAll() {
    for (const browser of Object.values(this.browsers)) {
      if (browser !== null) {
        await browser.close();
      }
    }
  }

  async createCustomBrowser(name, args) {
    const browser = await this.createBrowserInstance(name, args);
    if (browser) {
      const hash = crypto.createHash('md5').update(`${name}:${new Date().toLocaleString()}`).digest('hex');
      const id = hash.substring(0, 6);
      logger.info(`Started custom ${name} browser instance: ${id}`);
      this.browsers[id] = {
        browser,
        type: name,
        used: 0,
        last_used: null,
        args,
      };
      return id;
    }
    return null;
  }

  async createBrowserInstance(name, options) {
    if (this.browserNames.includes(name)) {
      playwright[name].use(stealth);
      return playwright[name].launch({
        ...options,
      });
    }
    return null;
  }

  updateBrowserUsed(id) {
    this.browsers[id] = {
      ...this.browsers[id],
      last_used: new Date(),
      used: this.browsers[id].used += 1,
    };
  }

  async getBrowser(id) {
    let browser = null;
    if (this.browsers[id]) {
      this.updateBrowserUsed(id);
      browser = this.browsers[id];
    }
    if (browser) {
      if (browser.browser === null) {
        logger.info(`Started ${id} browser instance`);
        browser.browser = await this.createBrowserInstance(browser.type, browser.args);
      }
      return browser.browser;
    }
    return null;
  }
};
