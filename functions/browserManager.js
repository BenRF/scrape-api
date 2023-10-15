const playwright = require('playwright');

module.exports = class BrowserManager {
  constructor() {
    this.browserNames = ['chromium', 'firefox', 'webkit'];
    this.browsers = {};
    for (const name of this.browserNames) {
      this.browsers[name] = null;
    }
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
      console.log(`Started ${name} browser instance`);
      return playwright[name].launch(options);
    }
    return null;
  }

  updateBrowserUsed(id) {
    this.browsers[id].last_used = new Date();
  }

  async getBrowser(id) {
    if (this.browserNames.includes(id)) {
      if (this.browsers[id] === null) {
        this.browsers[id] = {
          browser: await this.createBrowser(id),
          last_used: new Date(),
        };
      } else {
        this.updateBrowserUsed(id);
      }
      return this.browsers[id].browser;
    }
    if (this.browsers[id]) {
      this.updateBrowserUsed(id);
      return this.browsers[id].browser;
    }
    return null;
  }
};
