const playwright = require('playwright');
const logger = require('./logger').child({ file: 'BrowserManager' });

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
      });
    }
    return output;
  }

  async stop() {
    for (const browser of Object.values(this.browsers)) {
      if (browser !== null) {
        await browser.close();
      }
    }
  }

  async createBrowser(name, options) {
    if (this.browserNames.includes(name)) {
      logger.info(`Started ${name} browser instance`);
      return playwright[name].launch(options);
    }
    return null;
  }

  updateBrowserUsed(id) {
    this.browsers[id] = {
      ...this.browsers[id],
      last_used: new Date(),
      used: this.browsers[id].used += 1,
    };
    this.browsers[id].last_used = new Date();
  }

  async getBrowser(id) {
    if (this.browserNames.includes(id)) {
      if (this.browsers[id].browser === null) {
        this.browsers[id].browser = await this.createBrowser(id);
      }
      this.updateBrowserUsed(id);
      return this.browsers[id].browser;
    }
    if (this.browsers[id]) {
      this.updateBrowserUsed(id);
      return this.browsers[id].browser;
    }
    return null;
  }
};
