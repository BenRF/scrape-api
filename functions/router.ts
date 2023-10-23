import * as express from 'express';
import Endpoint from './endpoints/endpoint';

export default class Router {
  private readonly router: express.IRouter;

  constructor() {
    this.router = express.Router();
  }

  getRouter() {
    return this.router;
  }

  public createGet(endpoint: Endpoint) {
    this.router.get(`/${endpoint.path}`, this.createRun(endpoint));
  }

  public createPost(endpoint: Endpoint) {
    this.router.post(`/${endpoint.path}`, this.createRun(endpoint));
  }

  private createRun(endpoint: Endpoint) {
    return endpoint.run.bind(endpoint);
  }
}
