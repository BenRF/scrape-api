const ScrapeFunction = require('./function');

module.exports = class get_elems extends ScrapeFunction {
  constructor(args) {
    super('get_elems', args);
    this.selector = args;
  }

  async getElems(handle) {
    return handle.$$(this.selector);
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
      for (const result of results) {
        output.push(await next[0].runFromElement(result, [...next]));
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
