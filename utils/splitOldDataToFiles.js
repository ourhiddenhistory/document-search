#!/usr/bin/env node

/**
 * split original _data/documents.json file into individual files
 */

const fs = require('fs');
const padStart = require('string.prototype.padstart');

padStart.shim();

const INPUT = '../_data/documents.json~';
const OUTPUT = '../docsData/';

const fileContents = fs.readFileSync(INPUT, 'utf8');
const data = JSON.parse(fileContents);

data.forEach((el) => {
  if (!el.shortname) {
    throw new Error(`No SHORTNAME on ${el.id}`);
  }
  const filename = `${el.shortname}.json`;
  fs.writeFileSync(`${OUTPUT}/${filename}`, JSON.stringify(el, null, 2));
});
