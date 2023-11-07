const ScrapeFunction = require('./function');

/* get_attribute:

Collects a specified attribute from an element
*/
module.exports = class Get_attribute extends ScrapeFunction {
  constructor(args, logger) {
    super('get_attribute', args, logger);
  }

  async runFromElement(elem, next) {
    const result = await elem.getAttribute(this.args);
    this.log(`Found ${result}`);
    return this.runNext(result, next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result;
  }
};
