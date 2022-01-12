/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
const { TSDocParser } = require('@microsoft/tsdoc');
const glob = require('glob')
const fs = require('fs/promises');
const path = require('path');
const extract = require('extract-comments');

async function isApiInternal() {
  const tsdocParser = new TSDocParser();

  const file = await fs.readFile(path.resolve(__dirname, '../app/api/futuresREST.ts'), { encoding: 'utf-8' });

  const docComment = `/*${extract(file)[0].raw}*/`;

  // console.log(docComment)

  // Analyze the input doc comment
  const parserContext = tsdocParser.parseString(docComment);

  // Check for any syntax errors
  if (parserContext.log.messages.length > 0) {
    throw new Error(`Syntax error: ${parserContext.log.messages[0].text}`);
  }

  // Since "@internal" is a standardized tag and a "modifier", it is automatically
  // added to the modifierTagSet:
  // console.dir(parserContext.docComment);
}

// Prints "false" because the two "@internal" usages in our example are embedded
// in other constructs, and thus should not be interpreted as tags.
void isApiInternal();
