/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const scalePackagePath = path.resolve(__dirname, '../node_modules/d3-scale/package.json');

const scalePackageJson = JSON.parse(fs.readFileSync(scalePackagePath).toString());

// allow to import internal modules of d3-scale to create own scales
scalePackageJson.exports = {
  '.': './src/index.js',
  './src/*': './src/*.js',
};

fs.writeFileSync(
  scalePackagePath,
  JSON.stringify(scalePackageJson, null, '\t'),
);
