import * as express from 'express';
import * as crypto from 'crypto';

export default abstract class Endpoint {
  public readonly path: string;

  private readonly requiredFields: string[];

  protected constructor(path: string) {
    this.path = path;
    this.requiredFields = [];
  }

  createRequestId(req: express.Request) {
    const hash = crypto.createHash('md5').update(`${req.ip}:${new Date().toLocaleString()}`).digest('hex');
    return hash.substring(0, 8);
  }

  abstract run(req: express.Request, res: express.Response): Promise<void>;

  validBody(body: { string: any }): boolean {
    const foundFields = Object.keys(body);
    for (const field of this.requiredFields) {
      if (!foundFields.includes(field)) {
        return false;
      }
    }
    return true;
  }

  jsonRespond(res: express.Response, obj: object) {
    res.json(obj);
  }

  errorRespond(res: express.Response, msg: string, code: number = 500) {
    res.statusCode = code;
    res.json(msg);
  }
}
