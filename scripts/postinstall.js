/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

// for some reason nothing helps to ignore "browser" field from package.json of ws library;
// webpack always includes it and the exported function just throw an error
const wsPkgPath = path.resolve(__dirname, '../node_modules/ws/package.json');
const wsPkg = require(wsPkgPath);

delete wsPkg.browser;
fs.writeFileSync(wsPkgPath, JSON.stringify(wsPkg, null, '\t'));
