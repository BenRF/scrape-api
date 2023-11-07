const ScrapeFunction = require('./function');
const Get_regex = require('./get_regex');
const Get_text = require('./get_text');

/* get_price:

This function will run a regex match to look for any prices inside an elements text
- Can be run as the first step if provided with the css selector of which element to extract a price from
- If no prices can be found in the text, "No Regex matches found" will be returned
*/
module.exports = class get_price extends ScrapeFunction {
  constructor(args, logger) {
    super('get_price', args, logger);
    this.get_regex = new Get_regex('/\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{2})?/g', logger);
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
    if (this.args) {
      return this.get_text.runFirst(page, [this.get_text, this.get_regex, ...next]);
    }
    return this.runFromElement(page, next);
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
