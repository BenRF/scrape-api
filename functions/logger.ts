import { pino } from 'pino';

function createIf(name: string, value: string): string {
  return [`{if ${name}}`, value, '{end}'].join('');
}

const logger = pino({
  level: 'debug',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: ('1' === '1') ? 'debug' : 'info',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'request,hostname,file,pid,scrapeField,scrapeFunction',
          messageFormat: [
            createIf('file', '({file}) '),
            createIf('request', '\x1b[33m{request}: '),
            createIf('scrapeField', '[{scrapeField}] '),
            createIf('scrapeFunction', '[{scrapeFunction}] '),
            '\x1B[37m{msg}',
          ].join(''),
        },
      },
    ],
  },
});
export default logger;
