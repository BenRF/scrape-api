import { chromium, firefox, webkit } from 'playwright-extra';
import * as crypto from 'crypto';
import * as playwright from 'playwright-core';
import logger from './logger';

const log = logger.child({ file: 'BrowserManager' });

interface Browser {
  browser: playwright.Browser | null,
  type: string,
  requestCount: number,
  lastUsed: Date | null,
}

export default class BrowserManager {
  private readonly browserNames: string[];

  private readonly browsers: { [key: string]: Browser };

  constructor() {
    this.browserNames = ['chromium', 'firefox', 'webkit'];
    this.browsers = {};
    for (const name of this.browserNames) {
      this.browsers[name] = {
        browser: null,
        type: name,
        requestCount: 0,
        lastUsed: null,
      };
    }
  }

  public listBrowsers(): object[] {
    const output: object[] = [];
    for (const [id, { browser, type, requestCount, lastUsed }] of Object.entries(this.browsers)) {
      output.push({ id, status: (browser !== null) ? 'open' : 'closed', type, requestCount, lastUsed });
    }
    return output;
  }

  public async stopAll(): Promise<void> {
    for (const { browser } of Object.values(this.browsers)) {
      if (browser !== null) {
        await browser.close();
      }
    }
  }

  public async createCustomBrowser(name: string, args: playwright.LaunchOptions): Promise<string | null> {
    const browser = await this.createBrowserInstance(name, args);
    if (browser) {
      const hash = crypto.createHash('md5').update(`${name}:${new Date().toLocaleString()}`).digest('hex');
      const id = hash.substring(0, 6);
      log.info(`Started custom ${name} browser instance: ${id}`);
      this.browsers[id] = {
        browser,
        type: name,
        requestCount: 0,
        lastUsed: null,
      };
      return id;
    }
    return null;
  }

  private getBrowserType(name: string):playwright.BrowserType {
    let result: playwright.BrowserType | null;
    if (name === 'firefox') {
      result = firefox;
    } else if (name === 'webkit') {
      result = webkit;
    } else {
      result = chromium;
    }
    // result.use();
    return result;
  }

  private async createBrowserInstance(name: string, args?: playwright.LaunchOptions) {
    if (this.browserNames.includes(name)) {
      // playwright[name].use(stealth);
      return this.getBrowserType(name).launch({
        ...args,
        headless: false,
      });
    }
    return null;
  }

  private updateBrowserUsed(id: string) {
    this.browsers[id] = {
      ...this.browsers[id],
      lastUsed: new Date(),
      requestCount: this.browsers[id].requestCount += 1,
    };
  }

  public async getBrowser(id: string): Promise<playwright.Browser | null> {
    if (this.browserNames.includes(id)) {
      if (this.browsers[id].browser === null) {
        this.browsers[id].browser = await this.createBrowserInstance(id);
        log.info(`Started ${id} browser instance`);
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
}
