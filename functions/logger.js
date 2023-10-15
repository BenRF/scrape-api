const pino = require('pino');
const pretty = require('pino-pretty');

const createIf = (name, value) => [`{if ${name}}`, value, '{end}'].join('');

module.exports = pino(pretty({
  minimumLevel: 'debug',
  colorize: true,
  translateTime: 'HH:MM:ss',
  customPrettifiers: {
    time: (timestamp) => `[${timestamp.split('.')[0]}]`,
  },
  ignore: 'request,hostname,file,pid,scrapeField,scrapeFunction',
  messageFormat: [
    createIf('file', '({file}) '),
    createIf('request', '\x1b[33m{request}: '),
    createIf('scrapeField', '[{scrapeField}] '),
    createIf('scrapeFunction', '[{scrapeFunction}] '),
    '\x1B[37m{msg}',
  ].join(''),
}));
