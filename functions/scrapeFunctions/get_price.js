const get_regex = require('./get_regex');

module.exports = class get_price extends get_regex {
  constructor(args) {
    super(args);
    this.name = 'get_price';
    this.regex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})/g;
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result) : parseFloat(result.replace(',', '.'));
  }
};
