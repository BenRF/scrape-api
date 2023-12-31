const gitRootDir = require('git-root-dir');
const fs = require('fs');
const logger = require('./logger').child({ file: 'CreateIndex' });

(async () => {
  const root = process.env.ROOT || await gitRootDir('.');
  const files = fs.readdirSync(`${root}/functions/scrapeFunctions`);

  let output = '';
  let count = 0;
  const ignore = ['function.js', 'index.js'];
  for (const file of files) {
    if (!ignore.includes(file)) {
      const name = file.split('.')[0];
      output += `exports.${name} = require('./${name}');\n`;
      count += 1;
    }
  }
  fs.writeFileSync(`${root}/functions/scrapeFunctions/index.js`, output);
  logger.info(`Created index file for ${count} functions`);
})();
