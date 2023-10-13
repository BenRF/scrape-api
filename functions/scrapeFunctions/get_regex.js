const get_text = require('./get_text');

module.exports = class get_regex extends get_text {
  constructor(args) {
    super(args);
    this.name = 'get_regex';
    this.regex = args;
  }

  async runFromElement(elem, next) {
    const text = await this.getText(elem);
    return this.runNext(text.match(this.regex)[0], next);
  }
};
