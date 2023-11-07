/* eslint-disable no-unused-vars */
module.exports = class ScrapeFunction {
  constructor(name, args, logger) {
    this.args = args;
    if (name) {
      this.setName(name, logger);
    } else {
      this.name = '';
      this.logger = logger;
    }
  }

  outputList(next) {
    return next.map((n) => n.name);
  }

  setName(newName, logger) {
    this.name = (this.name) ? `${newName} > ${this.name}` : newName;
    this.logger = logger.child({ scrapeFunction: this.name });
  }

  log(message) {
    this.logger.debug(message);
  }

  throwError(message) {
    this.logger.error(message);
    throw new Error(message);
  }

  async runFirst(page, args, steps) {
    this.throwError(`${this.name} should not be run first`);
  }

  async runFromElement(elem, arg) {
    this.throwError(`${this.name} doesn't accept an element`);
  }

  async runFromText(txt, arg) {
    this.throwError(`${this.name} doesn't accept string`);
  }

  async runNext(result, next) {
    this.throwError(`runNext() not set for ${this.name}`);
  }
};
