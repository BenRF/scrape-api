const ScrapeFunction = require('./function');
// eslint-disable-next-line import/extensions
const ScrapeFunctions = require('./index');

/* sub_steps:

Allows for creating sub_objects in results, e.g. iterating through a list of elements and pulling multiple fields
*/
module.exports = class Sub_steps extends ScrapeFunction {
  constructor(args, logger) {
    super('sub_steps', args, logger);
  }

  async runSteps(callAs, result, next) {
    const output = {};
    next.shift();
    for (const [field, instructions] of Object.entries(this.args)) {
      const fieldLog = this.logger.child({ scrapeField: field });
      fieldLog.debug(`Starting on ${field}`);
      try {
        const steps = [];
        for (const { step, args } of instructions) {
          if (ScrapeFunctions[step]) {
            steps.push(new ScrapeFunctions[step](args, fieldLog));
          } else {
            const message = `${step} is not a valid function`;
            fieldLog.error(message);
            throw new Error(message);
          }
        }
        output[field] = await steps[0][callAs](result, [...steps, ...next]);
        fieldLog.debug('Done');
      } catch (e) {
        fieldLog.error(e.message);
        output[field] = { error: e.message };
      }
    }
    return output;
  }

  async runFirst(page, next) {
    return this.runSteps('runFirst', page, next);
  }

  async runFromElement(elem, next) {
    return this.runSteps('runFirst', elem, next);
  }

  async runFromText(txt, next) {
    return this.runSteps('runFromText', txt, next);
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result;
  }
};
