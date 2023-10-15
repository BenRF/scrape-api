const ScrapeFunction = require('./function');
const Get_regex = require('./get_regex');
const Get_text = require('./get_text');

module.exports = class get_price extends ScrapeFunction {
  constructor(args, logger) {
    super('get_price', args, logger);
    this.get_regex = new Get_regex('/\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{2})/g', logger);
    this.get_regex.setName('get_price', logger);
    this.get_text = new Get_text(this.args, this.logger);
    this.get_text.setName('get_price', logger);
  }

  async extractPrice(text) {
    const num = parseFloat(text.replace(',', '.'));
    this.log(`Extracted ${num}`);
    return num;
  }

  async runFirst(page, next) {
    return this.get_text.runFirst(page, [this.get_text, this.get_regex, ...next]);
  }

  async runFromElement(elem, next) {
    return this.get_regex.runFromElement(elem, [...next]);
  }

  async runFromText(txt, next) {
    return this.runNext(await this.extractPrice(txt), next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result;
  }
};
