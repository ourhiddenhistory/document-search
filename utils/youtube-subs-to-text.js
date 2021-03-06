#!/usr/bin/env node

/**
 * Generate json from list of links and can also provide list of doc names
 * @param {Filepath} source - file containing newline separated list of source links
 * @param {Integer} startAt - number to start json ids at
 * @param {Filepath} names - file containing newline separated list of doc_names
 * @throws {Error} throws error if link count doesn't match name count (if name list provided)
 */

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const padStart = require('string.prototype.padstart');
const slugify = require('slugify')

const exts = {
	info: ".info.json",
	vtt: ".en.vtt"
};

padStart.shim();

const INPUT = process.argv[2];
const INPUT_VTT = process.argv[2].replace('.info.json', '.en.vtt');
const OUTPUT = `${path.dirname(INPUT)}/${path.basename(INPUT, '.info.json')}.md`;

const info_json = fs.readFileSync(INPUT, 'utf8');
let fileContents;
if(fs.existsSync(INPUT_VTT)){
	fileContents = fs.readFileSync(INPUT_VTT, 'utf8');
}else{
	fileContents = '';
}
const lines = fileContents.split('\n');

const info = JSON.parse(info_json);

// get date for file
let d = info.upload_date.split('');
let date_for_file = d[0]+d[1]+d[2]+d[3]+'-'+d[4]+d[5]+'-'+d[6]+d[7];

final_info = {
	upload_date: info.upload_date,
	fulltitle: info.fulltitle,
	tags: info.tags,
	id: info.id,
	uploader: info.uploader,
	channel_url: info.channel_url,
	description: info.description.replace(/\n\n/g, "\n"),
	webpage_url: info.webpage_url,
	date: date_for_file
}

const storeArr = [];
lines.forEach((el, i) => {
	// remove first 3 lines
	if(i <= 2) return;
	if(el.includes('-->')) return;
	if(el.trim() == '') return;

	let line = el.replace(/(<([^>]+)>)/gi, "");

	storeArr.push(line.trim());
});

const finalArr = [];
let last_line = false;
storeArr.forEach((el, i) => {
	// remove duplicate lines which are next to each other
	if(el === last_line) return;
	finalArr.push(el);
	last_line = el;
});

outArr = [];
outArr.push('---');
outArr.push(yaml.dump(final_info));
outArr.push('---');
outArr.push(finalArr.join(" "));

const slugify_conf = {
  replacement: '-',
  remove: '"\'',
  lower: true,
  strict: true,
  locale: 'en'
};

const text = outArr.join("\n");
fs.writeFile(`_videos/${date_for_file}-${slugify(final_info.fulltitle, slugify_conf)}.md`, text, (err) => {
  if (err) {
    return console.log(err);
  }
  return err;
});
