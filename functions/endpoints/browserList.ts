import { Request, Response } from 'express';
import Endpoint from './endpoint';
import BrowserManager from '../browserManager';

// eslint-disable-next-line import/prefer-default-export
export class BrowserListEndpoint extends Endpoint {
  private browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    super('browser/list');
    this.browserManager = browserManager;
  }

  async run(req: Request, res: Response) {
    const browsers = this.browserManager.listBrowsers();
    this.jsonRespond(res, { total: browsers.length, browsers });
  }
}
