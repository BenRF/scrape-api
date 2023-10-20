const ScrapeFunction = require('./function');

/* xpath:
- Finds a xpath value from the page and returns it
- Must be run as the only step
*/

module.exports = class xpath extends ScrapeFunction {
  constructor(args, logger) {
    super('xpath', args, logger);
  }

  async runFirst(page, next) {
    return this.runNext(page.locator(this.args), next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length === 0) ? result : { warning: 'xpath cannot have any following steps', result };
  }
};
