const ScrapeFunction = require('./function');

/* page_url:
- Collects the current url of the page tab
*/
module.exports = class page_url extends ScrapeFunction {
  constructor(args, logger) {
    super('page_url', args, logger);
    this.selector = args;
  }

  async runFirst(page, next) {
    return this.runNext(await page.url(), next);
  }

  async runNext(result, next) {
    this.log(`Found "${result}"`);
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result.toString().trim();
  }
};
