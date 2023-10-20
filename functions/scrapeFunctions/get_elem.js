const ScrapeFunction = require('./function');

/* get_elem:
- Must be passed an argument of a css selector

Will find and return the first occurrence matching the selector, this can be passed to other steps to extract data
- If this is the final step, the elements innerHtml will be returned instead
- If the element can't be found on the page, an error is returned instead and no following steps are executed
*/

module.exports = class Get_elem extends ScrapeFunction {
  constructor(args, logger) {
    super('get_elem', args, logger);
    this.selector = args;
  }

  async getElem(handle) {
    const elem = await handle.$(this.selector);
    this.log(`Found: ${(elem !== null) ? `<${await elem.evaluate((e) => e.tagName.toLowerCase())}> element` : null}`);
    return elem;
  }

  async runFirst(page, next) {
    const elem = await this.getElem(page);
    if (elem !== null) {
      return this.runNext(elem, next);
    }
    throw new Error(`${this.selector} not found`);
  }

  async runFromElement(elem, next) {
    return this.runNext(await this.getElem(elem), next);
  }

  async runNext(result, next) {
    const elem = (await result.innerHTML()).toString().trim();
    next.shift();
    return (next.length > 0) ? next[0].runFromElement(result, next) : elem;
  }
};
