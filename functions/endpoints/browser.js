const Endpoint = require('./endpoint');

module.exports = class BrowserEndpoint extends Endpoint {
  constructor(browserManager) {
    super('browser', ['list'], ['create']);
    this.browserManager = browserManager;
  }

  list(req, res) {
    const browsers = this.browserManager.list();
    this.jsonRespond(res, { total: browsers.length, browsers });
  }

  async create(req, res) {
    const { body } = req;
    try {
      const id = await this.browserManager.createCustomBrowser(body.name, body.args);
      this.jsonRespond(res, {
        id,
        type: body.name,
        message: (!body.args) ? 'You have made a default browser' : undefined,
      });
    } catch (e) {
      this.errorRespond(res, e.message);
    }
  }
};
