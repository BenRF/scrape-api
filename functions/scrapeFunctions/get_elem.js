const ScrapeFunction = require('./function');

module.exports = class Get_elem extends ScrapeFunction {
  constructor(args) {
    super('get_elem', args);
    this.selector = args;
  }

  async getElem(handle) {
    return handle.$(this.selector);
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
    next.shift();
    return (next.length > 0) ? next[0].runFromElement(result, next) : (await result.innerHTML()).toString().trim();
  }
};
