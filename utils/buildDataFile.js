#!/usr/bin/env node

/**
 * combine individual json files in docsData dir into single array and write to NOWRITE.json
 */

const fs = require('fs');
const glob = require('glob-fs')({ gitignore: true });
const jsonlint = require("jsonlint");

const compare = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

const INPUT = 'docsData/';
const OUTPUT_FULL = '_data/DOCS_NOWRITE.json';
const OUTPUT_REFERENCE = '_data/DOCS_REFERENCE.json';
const files = glob.readdirSync(`${INPUT}*.json`, { cwd: '.' });
let data = [];

// Write full file
data = [];
files.forEach((el) => {
  const fileContents = fs.readFileSync(el, 'utf8');
  data.push(JSON.parse(fileContents));
});

data.sort(compare);

fs.writeFileSync(OUTPUT_FULL, JSON.stringify(data, null, 2));

// Write top level only, for reference
data = [];
files.forEach((el) => {
  const fileContents = fs.readFileSync(el, 'utf8');
  jsonlint.parse(fileContents);
  const collection = JSON.parse(fileContents);
  delete collection.files;
  data.push(collection);
});

data.sort(compare);

fs.writeFileSync(OUTPUT_REFERENCE, JSON.stringify(data, null, 2));
