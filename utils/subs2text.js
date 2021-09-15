#!/usr/bin/env node

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const padStart = require('string.prototype.padstart');
const slugify = require('slugify')
const glob = require("glob");
const { exec } = require("child_process");
var markdownpdf = require("markdown-pdf")

padStart.shim();

const INPUT = process.argv[2].replace(/\/$/, '');

const OUTPUT_MD_DIR = INPUT.replace('input/', 'md/');
if(!fs.existsSync(OUTPUT_MD_DIR)){
	fs.mkdirSync(OUTPUT_MD_DIR);
}

const OUTPUT_PDF_DIR = INPUT.replace('input/', 'pdf/');
if(!fs.existsSync(OUTPUT_PDF_DIR)){
	fs.mkdirSync(OUTPUT_PDF_DIR);
}

/**
 * WORK
 */
const makePdfFromVtt = function(vttFilepath){

	const descriptionPath = vttFilepath.replace(/\.en\.vtt$/, '.description');
	const info_jsonPath = vttFilepath.replace(/\.en\.vtt$/, '.info.json');

	let vttData = fs.readFileSync(vttFilepath, 'utf8');

	let description = '';
	if(fs.existsSync(descriptionPath)){
		description = fs.readFileSync(descriptionPath, 'utf8');
	}

	let info_json = null;
	if(fs.existsSync(info_jsonPath)){
		info_json = fs.readFileSync(info_jsonPath, 'utf8');
		info_json = JSON.parse(info_json);
	}

	let d = info_json.upload_date.split('');
	let date_for_file = d[0]+d[1]+d[2]+d[3]+'-'+d[4]+d[5]+'-'+d[6]+d[7];
	let date_for_display = new Date(d[0]+d[1]+d[2]+d[3], d[4]+d[5], d[6]+d[7]).toDateString();

	let info = {
		upload_date: info_json.upload_date,
		date_for_display: date_for_display,
		fulltitle: info_json.fulltitle,
		tags: info_json.tags,
		id: info_json.id,
		uploader: info_json.uploader,
		channel_url: info_json.channel_url,
		description: info_json.description,
		webpage_url: info_json.webpage_url,
		date: date_for_file
	}

	const storeArr = [];
	let last_minutes = false;

	const lines = vttData.split('\n');
	lines.forEach((el, i) => {
		// remove first 3 lines
		if(i <= 2) return;
		if(el.includes('-->')){
				let matches = el.match(/([0-9]{2}\:[0-9]{2}\:[0-9]{2}\.[0-9]{3}) --> ([0-9]{2}\:[0-9]{2}\:[0-9]{2}\.[0-9]{3})/);
				let minutes = matches[1].match(/([0-9]{2})\:([0-9]{2})\:([0-9]{2})\.[0-9]{3}/);

				if(minutes[2] % 2 == 0 && minutes[2] != last_minutes){
					let timestamp = minutes[1]+':'+minutes[2]+':'+minutes[3];
					let seconds = (parseInt(minutes[1]) * 3600) + (parseInt(minutes[2]) * 60) + parseInt(minutes[3]);
				  storeArr.push(`\n\n<a href="${info.webpage_url}&t=${seconds}s">${timestamp}</a>\n\n`);
					last_minutes = minutes[2];
				}
				return;
		}
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

	let parsedOutput = finalArr.join(" ");

	let mdOutput = `

# ${info.fulltitle}

[${info.webpage_url}](${info.webpage_url})

Uploaded by [${info.uploader}](${info.channel_url}) on ${info.date_for_display}.

${info.description.replace(/[ ]*\n/g, "<br />\n")}

---

[00:00:00](${info.webpage_url})

${parsedOutput}

---

**END**

`;

	const slugify_conf = {
	  replacement: '-',
	  remove: '"\'',
	  lower: true,
	  strict: true,
	  locale: 'en'
	};

	let mdFilepath = `${OUTPUT_MD_DIR}/${date_for_file}-${slugify(info.fulltitle, slugify_conf)}.md`;

	fs.writeFile(`${OUTPUT_MD_DIR}/${date_for_file}-${slugify(info.fulltitle, slugify_conf)}.md`, mdOutput.trim(), (err) => {
	  if (err) {
	    return console.log(err);
	  }
	  return err;
	});


	var options = {
	    remarkable: {
	        html: true,
	        breaks: false,
	        plugins: [ require('remarkable-classy') ]
	    }
	}

	console.log(mdFilepath);
	if(fs.existsSync(mdFilepath)){
		let pdfFilepath = `${OUTPUT_PDF_DIR}/${date_for_file}-${slugify(info.fulltitle, slugify_conf)}.pdf`;

		console.log('+ '+pdfFilepath);

		markdownpdf(options).from.path(mdFilepath).to.path(pdfFilepath, function () {
		  console.log("Created", pdfFilepath)
		});
	}

}

/**
 * MAIN
 */

 let vttFiles = glob.sync(`${INPUT}/*.en.vtt`);

 vttFiles.forEach((vttFilepath, i) => {
 	makePdfFromVtt(vttFilepath);
 });
