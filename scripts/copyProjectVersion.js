/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const { omit } = require('lodash');
const packageJson = require('../package.json');
const typesPackageJson = require('../biduul-types/package.json');

fs.writeFileSync(
  path.resolve(__dirname, '../biduul-types/package.json'),
  JSON.stringify({
    version: packageJson.version,
    ...omit(typesPackageJson, ['version']),
  }, null, '\t'),
);
