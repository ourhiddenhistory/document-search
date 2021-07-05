#!/usr/bin/env node

/**
 recursively loop through each folder of pdfs
 for each pdf, generate a page count
 for each pdf, check that the number of text files match the page count
 if fails, print the pdf path
 */

const fs = require('fs');
const path = require('path');
const glob = require("glob");
const pdf = require('pdf-page-counter');

const originalsFolder = '/Volumes/MAIN/our-hidden-history/document-search/docs_originals/09*';
const ocrsFolder = '/Volumes/MAIN/our-hidden-history/document-search/es';

let pdfDirectories = glob.sync(originalsFolder);
pdfDirectories.forEach(dir => {

  // console.log('----DOING----- '+dir);
  // console.log(process.memoryUsage().heapUsed / 1024 / 1024);

  let pdfFiles = glob.sync(dir+'/*.pdf');

  doNext(pdfFiles);

  global.gc();
});

// console.log('---DONE---');
// console.log(process.memoryUsage().heapUsed / 1024 / 1024);

function doNext(pdfFiles){

  if(pdfFiles.length == 0) return;

  let file = pdfFiles.shift();

  let dataBuffer = fs.readFileSync(file);

  let pdfCnt = pdf(dataBuffer);
  pdfCnt.then(function(data) {

    let ocrCount = countRelatedOCRPages(file);
    if(ocrCount != data.numpages){
      console.log(file);
      console.log('# '+data.numpages+' != '+ocrCount);
    }

    doNext(pdfFiles);

  }).catch(e => console.log("Caught: " + e.message));
}

function countRelatedOCRPages(pdfFilename){
  const ocrIdentifier = pdfFilename.replace('docs_originals', 'es').replace(/.pdf$/, '');
  let files = glob.sync(ocrIdentifier+"_*.txt");
  return files.length;
}
