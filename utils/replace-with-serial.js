#!/usr/bin/env node

/**
 * Generate json from list of links and can also provide list of doc names
 * @param {Filepath} source - file containing newline separated list of source links
 * @param {Integer} startAt - number to start json ids at
 * @param {Filepath} names - file containing newline separated list of doc_names
 * @throws {Error} throws error if link count doesn't match name count (if name list provided)
 */

const fs = require('fs');
const path = require('path');
const padStart = require('string.prototype.padstart');

padStart.shim();

const INPUT = process.argv[2];
const START_CNT = Number(process.argv[3]) || 1;

const fileContents = fs.readFileSync(INPUT, 'utf8');
const lines = fileContents.split('\n');

lines.forEach((el, i) => {
  console.log(`wget ${el.replace(/XXX/g, padStart(i + START_CNT, 3, '0'))} ; sleep 5;`);
});
