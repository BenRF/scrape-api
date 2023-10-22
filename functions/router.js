const express = require('express');

module.exports = class Router {
  constructor() {
    this.router = express.Router();
  }

  getRouter() {
    return this.router;
  }

  createEndpoints(endpoint) {
    const singlePoint = endpoint.totalPoints === 1;
    const calcPath = (name) => `/${endpoint.path}${(singlePoint) ? '' : `/${name}`}`;
    for (const getFunct of endpoint.endpoints.GET) {
      this.createGet(calcPath(getFunct), endpoint, getFunct);
    }
    for (const postFunct of endpoint.endpoints.POST) {
      this.createPost(calcPath(postFunct), endpoint, postFunct);
    }
  }

  createGet(path, endpoint, func) {
    this.router.get(path, this.createRun(endpoint, func));
  }

  createPost(path, endpoint, func) {
    this.router.post(path, this.createRun(endpoint, func));
  }

  createRun(endpoint, func = 'run') {
    return endpoint[func].bind(endpoint);
  }
};
