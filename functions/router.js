const express = require('express');

module.exports = class Router {
  constructor() {
    this.router = express.Router();
  }

  getRouter() {
    return this.router;
  }

  createGet(path, endpoint) {
    this.router.get(path, this.createRun(endpoint));
  }

  createPost(path, endpoint) {
    this.router.post(path, this.createRun(endpoint));
  }

  createRun(endpoint) {
    return endpoint.run.bind(endpoint);
  }
};
