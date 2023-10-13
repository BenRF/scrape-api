module.exports = class Endpoint {
  constructor() {
    this.requiredFields = [];
  }

  // eslint-disable-next-line no-unused-vars
  run(req, res) {
    throw new Error('Endpoint.run() not implemented');
  }

  validBody(body) {
    for (const field of this.requiredFields) {
      if (!body[field]) {
        return false;
      }
    }
    return true;
  }

  jsonRespond(res, obj) {
    res.json(obj);
  }

  errorRespond(res, code, msg) {
    res.statusCode = code;
    res.json(msg);
  }
};
