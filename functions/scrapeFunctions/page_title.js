const ScrapeFunction = require('./function');

module.exports = class page_title extends ScrapeFunction {
  constructor(args, logger) {
    super('page_title', args, logger);
    this.selector = args;
  }

  async runFirst(page, next) {
    return this.runNext(await page.title(), next);
  }

  async runNext(result, next) {
    this.log(`Found "${result}"`);
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result.toString().trim();
  }
};
