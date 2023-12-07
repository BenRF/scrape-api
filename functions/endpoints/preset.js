const Endpoint = require('./endpoint');

module.exports = class BrowserEndpoint extends Endpoint {
  constructor(presetManager) {
    super('preset', ['list'], ['create']);
    this.presetManager = presetManager;
  }

  list(req, res) {
    const presets = this.presetManager.list();
    this.jsonRespond(res, presets);
  }

  async create(req, res) {
    const { body } = req;
    try {
      const name = body.name || 'test';
      this.presetManager.create(name, body.preset, body.overwrite || false);
      this.jsonRespond(res, { Status: `Created preset: ${name}` });
    } catch (e) {
      this.errorRespond(res, 500, e.message);
    }
  }

  validatecreate(req, res, next) {
    const compulsory = { name: 'string', preset: 'object' };
    if (!this.validateReq(req, compulsory)) {
      this.errorRespond(res, 400, 'Missing fields, "name" & "preset" must be in the request');
    } else {
      next();
    }
  }
};
