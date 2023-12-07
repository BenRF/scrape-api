const fs = require('fs');
const logger = require('./logger').child({ file: 'PresetManager' });

module.exports = class PresetManager {
  constructor() {
    this.presetDir = './presets';
    if (!fs.existsSync(this.presetDir)) {
      fs.mkdirSync(this.presetDir);
      logger.info(`Created ${this.presetDir} to store presets`);
    }
  }

  list() {
    const files = fs.readdirSync(this.presetDir);
    const output = [];
    for (const file of files.filter((f) => f.includes('.json'))) {
      output.push({
        name: file.replace('.json', ''),
        preset: JSON.parse(fs.readFileSync(`${this.presetDir}/${file}`, { encoding: 'utf-8' })),
      });
    }
    return output;
  }

  getFileName(name) {
    return `${this.presetDir}/${name}.json`;
  }

  create(name, preset, overwrite = false) {
    const fileName = this.getFileName(name);
    if (fs.existsSync(fileName) && !overwrite) {
      throw new Error('Preset already exists, pick a new name or pass in overwrite: true');
    } else {
      fs.writeFileSync(fileName, JSON.stringify(preset, null, 2));
    }
  }

  get(name) {
    const fileName = this.getFileName(name);
    if (!fs.existsSync(fileName)) {
      throw new Error(`Preset ${name} not found`);
    }
    return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
  }
};
