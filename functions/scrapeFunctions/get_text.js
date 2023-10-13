const ScrapeFunction = require('./function');
const Get_elem = require('./get_elem');

module.exports = class Get_text extends ScrapeFunction {
  constructor(args) {
    super('get_text', args);
  }

  async getText(elem) {
    return (await elem.innerText()).toString().trim();
  }

  async runFirst(page, next) {
    const step = new Get_elem(this.args);
    return step.runFirst(page, [this, ...next]);
  }

  async runFromElement(elem, next) {
    return this.runNext(await this.getText(elem), next);
  }

  async runFromText(txt, next) {
    return this.runNext(txt.toString(), next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result) : result;
  }
};
