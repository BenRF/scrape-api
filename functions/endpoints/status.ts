import { Request, Response } from 'express';
import Endpoint from './endpoint';

// eslint-disable-next-line import/prefer-default-export
export class StatusEndpoint extends Endpoint {
  private startTime: Date;

  constructor() {
    super('status');
    this.startTime = new Date();
  }

  async run(req: Request, res: Response) {
    const now = new Date();
    const diff = this.startTime.getTime() - now.getTime();
    const seconds = diff / 1000;

    this.jsonRespond(res, {
      started: this.startTime.toLocaleString(),
      running: Math.abs(seconds),
    });
  }
}
