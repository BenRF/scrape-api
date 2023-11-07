const ScrapeFunction = require('./function');
const Get_elem = require('./get_elem');

/* get_text:

When given a page element, extracts the innerText and returns it
- Can be run as a first step if passed a selector, will run get_elem with the input and extract the text from that
*/
module.exports = class Get_text extends ScrapeFunction {
  constructor(args, logger) {
    super('get_text', args, logger);
  }

  async getText(elem) {
    const txt = (await elem.innerText()).toString().trim();
    this.log(`Collected text: "${txt}"`);
    return txt;
  }

  async runFirst(page, next) {
    if (this.args) {
      const step = new Get_elem(this.args, this.logger);
      step.setName(this.name, this.logger);
      return step.runFirst(page, [this, ...next]);
    }
    return this.runFromElement(page, next);
  }

  async runFromElement(elem, next) {
    return this.runNext(await this.getText(elem), next);
  }

  async runFromText(txt, next) {
    return this.runNext(txt.toString(), next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result;
  }
};
