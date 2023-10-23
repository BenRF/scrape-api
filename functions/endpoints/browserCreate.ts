import { Request, Response } from 'express';
import Endpoint from './endpoint';
import BrowserManager from '../browserManager';

// eslint-disable-next-line import/prefer-default-export
export class BrowserCreateEndpoint extends Endpoint {
  private browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    super('browser/create');
    this.browserManager = browserManager;
  }

  async run(req: Request, res: Response) {
    const { body } = req;
    try {
      const id = await this.browserManager.createCustomBrowser(body.name, body.args);
      this.jsonRespond(res, {
        id,
        type: body.name,
        message: (!body.args) ? 'You have made a default browser, ' : undefined,
      });
    } catch (e) {
      if (e instanceof Error) {
        this.errorRespond(res, e.message, 400);
      }
    }
  }
}
