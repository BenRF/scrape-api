const ScrapeFunction = require('./function');

/* get_elems:
- Must be passed an argument of a css selector

Will find and return all occurrences of a selector
- Any steps after this will be run against all found occurrences of the element
- If this is the final step, all the elements innerHtml will be returned instead
- If no versions of the element can be found on the page, an error is returned instead
*/
module.exports = class get_elems extends ScrapeFunction {
  constructor(args, logger) {
    super('get_elems', args, logger);
    this.selector = args;
  }

  async getElems(handle) {
    const elems = await handle.$$(this.selector);
    this.log(`Found ${elems.length} elements`);
    return elems;
  }

  async runFirst(page, next) {
    const elems = await this.getElems(page);
    if (elems.length > 0) {
      return this.runNext(elems, next);
    }
    throw new Error(`${this.selector} not found`);
  }

  async runFromElement(elem, next) {
    return this.runNext(await this.getElems(elem), next);
  }

  async runNext(results, next) {
    next.shift();
    if (next.length > 0) {
      const output = [];
      for (const elem of results) {
        this.log(`Using: ${(elem !== null) ? `<${await elem.evaluate((e) => e.tagName.toLowerCase())}> element` : null}`);
        output.push(await next[0].runFromElement(elem, [...next]));
      }
      return output;
    }
    const elements = [results.length];
    for (const result of results) {
      elements.push((await result.innerHTML()).toString().trim());
    }
    return elements;
  }
};
