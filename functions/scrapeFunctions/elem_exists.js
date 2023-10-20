const Get_elem = require('./get_elem');

/* elem_exists:
- Must be passed an argument of a css selector

This function will search for any element matching the selector and return true if it can be found on the page
*/
module.exports = class elem_exists extends Get_elem {
  constructor(args, logger) {
    super(args, logger);
    this.setName('elem_exists', logger);
    this.selector = args;
  }

  async run(handle, next) {
    return this.runNext((await this.getElem(handle)) !== null, next);
  }

  async runFirst(page, next) {
    return this.run(page, next);
  }

  async runFromElement(elem, next) {
    return this.run(elem, next);
  }

  async runNext(result, next) {
    this.log(`Element ${(!result) ? 'does not ' : ''}exists`);
    next.shift();
    return (next.length > 0) ? next[0].runFromElement(result, next) : result;
  }
};
