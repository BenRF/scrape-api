/* eslint-disable no-unused-vars */
module.exports = class ScrapeFunction {
  constructor(name, args, logger) {
    this.args = args;
    this.setName(name, logger);
  }

  outputList(next) {
    return next.map((n) => n.name);
  }

  setName(newName, logger) {
    this.name = (this.name) ? `${newName} > ${this.name}` : newName;
    this.logger = logger.child({ scrapeFunction: this.name });
  }

  log(message) {
    this.logger.info(message);
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
