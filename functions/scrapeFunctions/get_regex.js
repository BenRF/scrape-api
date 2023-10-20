const ScrapeFunction = require('./function');
const Get_text = require('./get_text');

/* get_regex:
- Must be passed a regex pattern to match against

Will search an elements text for the first match against the pattern
- This cannot be run as a first step, it must be passed an element or text
- If run after a get_elem(s), will automatically run get_text first before regex matching
*/
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
