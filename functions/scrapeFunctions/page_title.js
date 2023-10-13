const ScrapeFunction = require('./function');

module.exports = class page_title extends ScrapeFunction {
  constructor(args) {
    super('page_title', args);
    this.selector = args;
  }

  async runFirst(page, next) {
    return this.runNext(await page.title(), next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result.toString().trim();
  }
};
