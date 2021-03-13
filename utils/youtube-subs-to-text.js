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
const OUTPUT = `${path.dirname(INPUT)}/${path.basename(INPUT, '.vtt')}.txt`;

const fileContents = fs.readFileSync(INPUT, 'utf8');
const lines = fileContents.split('\n');

const storeArr = [];
lines.forEach((el, i) => {
	// remove first 3 lines
	if(i <= 2) return;
	if(el.includes('-->')) return;
	if(el.trim() == '') return;

	let line = el.replace(/(<([^>]+)>)/gi, "");

	storeArr.push(line);
});

const finalArr = [];
let last_line = false;
storeArr.forEach((el, i) => {
	// remove duplicate lines which are next to each other
	if(el === last_line) return;
	finalArr.push(el);
	last_line = el;
});

const text = finalArr.join("\n");
fs.writeFile(OUTPUT, text, (err) => {
  if (err) {
    return console.log(err);
  }
  return err;
});
