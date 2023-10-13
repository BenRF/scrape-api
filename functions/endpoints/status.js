const Endpoint = require('./endpoint');

module.exports = class StatusEndpoint extends Endpoint {
  constructor() {
    super();
    this.start = new Date();
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
};
