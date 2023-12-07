const crypto = require('crypto');

module.exports = class Endpoint {
  constructor(path, getMethods = [], postMethods = []) {
    this.path = path;
    this.endpoints = {
      GET: getMethods,
      POST: postMethods,
    };
    this.totalPoints = getMethods.length + postMethods.length;
    this.requiredFields = [];
  }

  createRequestId(req) {
    const hash = crypto.createHash('md5').update(`${req.ip}:${new Date().toLocaleString()}`).digest('hex');
    return hash.substring(0, 8);
  }

  objHasFields(obj, fields) {
    for (const field of fields) {
      if (obj[field] === undefined) {
        return false;
      }
    }
    return true;
  }

  validateReq(req, compulsoryFields, types) {
    const { body } = req;
    return this.objHasFields(body, Object.keys(compulsoryFields));
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
    res.statusCode = code.toString();
    res.json(msg);
  }
};
