const ScrapeFunction = require('./function');
const Get_attribute = require('./get_attribute');
const Get_elem = require('./get_elem');

/* get_elem:

Collects the href value of an element, can be run first if passed the selector of the element
- Takes no input otherwise
*/
module.exports = class Get_link extends ScrapeFunction {
  constructor(args, logger) {
    super('get_link', args, logger);
  }

  async runFirst(page, next) {
    if (this.args) {
      const get_elem = new Get_elem(this.args, this.logger);
      get_elem.setName(this.name, this.logger);
      return get_elem.runFirst(page, [this, ...next]);
    }
    return this.runFromElement(page, next);
  }

  async runFromElement(elem, next) {
    const step = new Get_attribute('href', this.logger);
    step.setName(this.name, this.logger);
    return step.runFromElement(elem, next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result;
  }
};
