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
    this.log(`Running xpath: ${this.args}`);
    return this.runNext(await page.evaluate((path) => {
      const results = document.evaluate(path, document);
      const allData = [];
      let data = results.iterateNext();
      if (data) {
        allData.push(data.data);
        while (data) {
          data = results.iterateNext();
          if (data) {
            allData.push(data.data);
          }
        }
      }
      return (allData.length !== 1) ? allData : allData[0];
    }, this.args), next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length === 0) ? result : { warning: 'xpath cannot have any following steps', result };
  }
};
