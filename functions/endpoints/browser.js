const Endpoint = require('./endpoint');

module.exports = class BrowserEndpoint extends Endpoint {
  constructor(browserManager) {
    super();
    this.browserManager = browserManager;
  }

  run(req, res) {
    const now = new Date();
    const diff = this.start.getTime() - now.getTime();
    const seconds = diff / 1000;

    this.jsonRespond(res, {
      started: this.start.toLocaleString(),
      running: Math.abs(seconds),
    });
  }

  list(req, res) {
    const browsers = this.browserManager.list();
    this.jsonRespond(res, { total: browsers.length, browsers });
  }
};
