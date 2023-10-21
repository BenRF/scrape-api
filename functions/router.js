const express = require('express');

module.exports = class Router {
  constructor() {
    this.router = express.Router();
  }

  getRouter() {
    return this.router;
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
