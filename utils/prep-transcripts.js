var fs = require('fs');
var path = require('path');
var Autolinker = require( 'autolinker' );

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

// read file
const inPath = path.dirname(process.argv[2]);
const inFilename = path.basename(process.argv[2], '.txt');
const outFullpath = `${inPath}/${inFilename}.html`;

var contents = fs.readFileSync(process.argv[2], 'utf8');

// do stuff

// bold speaker names
contents = contents.replace(/^([a-zA-Z\s.]*):\s/mg, '<b>$1:</b> ');
// trim lines
lines = contents.split('\n');
lines.forEach(function (elem, i){
   lines[i] = elem.trim();
})
contents = lines.join('\n');
// make paragraphs
contents = contents.replace(/^(.*)$/mg, '<p>$1</p> ');

// italicize common titles
contents = contents.replace(/(The New York Times)/ig, '<i>The New York Times</i>');
contents = contents.replace(/(The Washington Post)/ig, '<i>The Washington Post</i>');
contents = contents.replace(/(The Boston Globe)/ig, '<i>The Boston Globe</i>');
contents = contents.replace(/(The St. Louis Post-Dispatch)/ig, '<i>The St. Louis Post-Dispatch</i>');
contents = contents.replace(/(Newsweek)/ig, '<i>Newsweek</i>');

// autolinking
contents = Autolinker.link(contents);

// write file
fs.writeFile(outFullpath, contents, function(err) {
    if(err) {
      return console.log(err);
    }

    console.log(contents);
    console.log('-- DONE --');
});
