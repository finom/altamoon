/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const { omit } = require('lodash');
const packageJson = require('../package.json');
const typesPackageJson = require('../packages/altamoon-types/package.json');
const apiPackageJson = require('../packages/altamoon-binance-api/package.json');

fs.writeFileSync(
  path.resolve(__dirname, '../packages/altamoon-types/package.json'),
  JSON.stringify({
    version: packageJson.version,
    ...omit(typesPackageJson, ['version']),
  }, null, '\t'),
);

fs.writeFileSync(
  path.resolve(__dirname, '../packages/altamoon-binance-api/package.json'),
  JSON.stringify({
    version: packageJson.version,
    ...omit(apiPackageJson, ['version']),
  }, null, '\t'),
);
