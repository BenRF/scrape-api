const ScrapeFunction = require('./function');
const Get_text = require('./get_text');

module.exports = class get_regex extends ScrapeFunction {
  constructor(args, logger) {
    super('get_regex', args, logger);
    this.get_text = new Get_text('', logger);
    this.get_text.setName('get_regex', logger);
    const arg = args.split('/');
    this.regex = new RegExp(arg[1], arg[2]);
  }

  async runFromElement(elem, next) {
    return this.get_text.runFromElement(elem, [this.get_text, this, ...next]);
  }

  async runFromText(txt, next) {
    this.log(`Matching against: ${this.regex}`);
    const matches = txt.match(this.regex);
    if (matches) {
      const matchCount = matches.length;
      this.log(`Found ${matchCount} match${(matchCount > 1) ? 'es' : ''}, picking the first: ${matches[0]}`);
      return this.runNext(matches[0], next);
    }
    throw new Error('No Regex matches found');
  }

  async runNext(result, next) {
    next.shift();
    return (next.length > 0) ? next[0].runFromText(result, next) : result;
  }
};
