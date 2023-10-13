const ScrapeFunction = require('./function');
const Get_elem = require('./get_elem');

module.exports = class elem_exists extends Get_elem {
  constructor(args) {
    super(args);
    this.name = 'elem_exists';
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
    next.shift();
    return (next.length > 0) ? next[0].runFromElement(result, next) : result;
  }
};
