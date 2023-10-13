/* eslint-disable no-unused-vars */
module.exports = class ScrapeFunction {
  constructor(name, args) {
    this.name = name;
    this.args = args;
  }

  async runFirst(page, args, steps) {
    throw new Error(`${this.name} should not be run first`);
  }

  async runFromElement(elem, arg) {
    throw new Error(`${this.name} doesn't accept an element`);
  }

  async runFromText(txt, arg) {
    throw new Error(`${this.name} doesn't accept string`);
  }

  async runNext(result, next) {
    throw new Error(`runNext() not set for ${this.name}`);
  }
};
