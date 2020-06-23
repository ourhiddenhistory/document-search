const client = new $.es.Client({
  hosts: 'https://api.ourhiddenhistory.org',
});

client.ping({
  requestTimeout: 30000,
}, (error) => {
  if (error) {
    alert('elasticsearch cluster is down!');
  }
});

/**
 * changeUrlWithNewSearch
 * @param string full url to adjust
 * @param string search term
 */
var changeUrlWithNewSearch = function(url, searchterm) {
  let currentPath = url.split('?')[0];
  let newUrl = currentPath + '?search='+searchterm;
  return newUrl;
}

/**
 * changeUrlWithNewDocument
 * @param string full url to adjust
 * @param array path parts
 */
var changeUrlWithNewDocument = function(url, document) {
  let currentParams = url.split('?')[1] || '';
  document.push((isImg ? 'img' : 'txt'));
  let newUrl = baseurl + '/' + document.join('/') + '?' + currentParams;
  return newUrl;
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * UI Components
 */

let ajaxSearch = null;
let ajaxPage = null;

let currentListing = null;
function changePage(direction) {
  let newPage = 0;
  if(direction == 'prev'){
    newPage = Number(currentListing.page) - 1;
  }else{
    newPage = Number(currentListing.page) + 1;
  }
  newPage = currentListing.groupId+'-'+currentListing.docId+'_'+newPage+'.txt';
  let lastPageContent = $('.entry-panel__content').html();
  getPage(newPage, lastPageContent);
  $('.entry-panel__content').html('LOADING...');
}

/**
 * @param {String} page - page id to retrieve
 * @param {String} lastPageContent - original page content in case of failure
 * @returns {void}
 */
function getPage(page, lastPageContent, setToImage) {

  if (ajaxPage != null){
    ajaxPage.abort();
  }

  setToImage = setToImage || false;

  ajaxPage = client.search({
    size: 1,
    pretty: null,
    body: GenerateEsQuery.generatePage(page),
  }).then((response) => {

    ajaxPage = null;

    if(response.hits.hits.length == 0) {
      $('.entry-panel__content').html(lastPageContent);
      alert(`no more pages in this document. This is page ${currentListing.page}.`);
      return;
    }
    const listing = new Listing(response.hits.hits[0], docList);
    // set search param in url
    const curPath = window.location.pathname + window.location.search;
    const newUrl = changeUrlWithNewDocument(curPath, [listing.id]);
    history.pushState({}, null, newUrl);

    displayListingInEntryPanel(listing, setToImage);
  }, (err) => {
      console.trace(err.message);
  });
}

const path = window.location.pathname;
if (![`${baseurl}`, `${baseurl}/`, `${baseurl}/index.html`].includes(path)) {
  const pathParts = path.split('/');
  let pathPartIndex = (baseurl == '' ? 1 : 2);
  let setToImage = (pathParts[pathPartIndex+1] === 'img');
  const page = `${pathParts[pathPartIndex]}.txt`;
  getPage(page, null, setToImage);
}

/**
 * Controller
 */
let listings = [];
let isImg = false;
let imgLock = false;

$('.toolbar-entry__disp-img-lock').on('click', function() {
  let setTo = !imgLock;
  let removeClass = (setTo ? 'btn-secondary' : 'btn-info');
  let addClass = (setTo ? 'btn-info' : 'btn-secondary');
  $(this).removeClass(removeClass).addClass(addClass);
  $('.toolbar-entry__disp-img').removeClass(removeClass).addClass(addClass);
  imgLock = setTo;
  if(setTo) $('.toolbar-entry__disp-img').trigger('click');
});

$('.toolbar-entry__disp-img').on('click', function(){
  $(this).removeClass('btn-secondary').addClass('btn-info');
  $('.toolbar-entry__disp-txt').removeClass('btn-info').addClass('btn-secondary');
  isImg = true;
  let img = $('<img class="display-img" />');
  img.attr('src', entryImg);
  $('.entry-panel__content').html(img[0].outerHTML);
  $('.entry-panel__content--entry img')
    .wrap('<span style="display:inline-block"></span>')
    .css('display', 'block')
    .parent()
    .zoom({ on: 'click' });
  let newUrl = changeUrlWithNewDocument(window.location.pathname + window.location.search, [currentListing.id]);
  history.pushState({}, null, newUrl);
});

$('.toolbar-entry__disp-txt').on('click', function(){
  $(this).removeClass('btn-secondary').addClass('btn-info');
  $('.toolbar-entry__disp-img, .toolbar-entry__disp-img-lock')
    .removeClass('btn-info').addClass('btn-secondary');
  isImg = imgLock = false;
  displayListingInEntryPanel(currentListing);
});

$('.toolbar-entry__page-next').on('click', function(){
  changePage('next');
});

$('.toolbar-entry__page-prev').on('click', function(){
  changePage('prev');
});

function setPdfLink(href){
  if(!href){
    $('.toolbar-entry__open-pdf')
      .addClass('disabled')
      .removeAttr('href');
  }else{
    $('.toolbar-entry__open-pdf')
      .removeClass('disabled')
      .attr('href', href);
  }
}

$(document).keypress(function(e) {
  if(e.which == 13) {
    $("#search_btn").trigger('click');
  }
});

$('.results-container').on('click', '.open-entry-js', function(e){
  entryIndex = $(this).data('entry');
  if(listings.length == 0) return;
  displayListingInEntryPanel(listings[entryIndex]);
});

let entryImg = null;
let entryIndex = null;
function displayListingInEntryPanel(listing, setToImage) {
  let searchTrimmed = $("#search").val().replace(/['"]+/g, '');
  $('.entry-panel__content').closest('.scrolling-pane').scrollTop(0);
  if(imgLock || setToImage){
    $('.toolbar-entry__disp-img').removeClass('btn-secondary').addClass('btn-info');
    $('.toolbar-entry__disp-txt').removeClass('btn-info').addClass('btn-secondary');
    isImg = true;
    let img = $('<img class="display-img" />');
    img.attr('src', listing.img);
    $('.entry-panel__content').html(img[0].outerHTML);
    $('.entry-panel__content--entry img')
      .wrap('<span style="display:inline-block"></span>')
      .css('display', 'block')
      .parent()
      .zoom({ on: 'click' });
  }else{
    $('.toolbar-entry__disp-txt').removeClass('btn-secondary').addClass('btn-info');
    $('.toolbar-entry__disp-img, .toolbar-entry__disp-img-lock')
      .removeClass('btn-info').addClass('btn-secondary');
    $('.entry-panel__content').html(listing.entry);
    $('.entry-panel__meta').html(displayMeta(listing));
    let instance = new Mark($('.entry-panel__content')[0]);
    instance.mark(searchTrimmed);
  }
  setPdfLink(listing.sourceHref);
  entryImg = listing.img;
  currentListing = listing;
  // updateSocialMediaDisplay(listing.img, listing.docname); // won't work dynamically
  // set search param in url
  let newUrl = changeUrlWithNewDocument(window.location.pathname + window.location.search, [listing.id]);
  history.pushState({}, null, newUrl);
}

let TEXT = '';
let totalPages = 0;
let currentPage = 0;
let search = '';
const size = 100;

$("#search_btn").on('click', function(e){

  $(".results-container").html('Loading...');

  search = $("#search").val();
  if(search.length <= 2){
    alert('search must be at least 2 characters long');
    $(".result").html('');
    return;
  }

  currentPage = 1;
  if(ajaxSearch != null) ajaxSearch.abort();

  ajaxSearch = client.search({
    size: size,
    from: 0,
    pretty: null,
    body: GenerateEsQuery.generate(search),
  }).then((response) => {
    ajaxSearch = null;

    // set search param in url
    let newUrl = changeUrlWithNewSearch(window.location.pathname, search);
    history.pushState({}, null, newUrl);

    if(response.hits.total == 0){
      $(".results-container").html(`<strong>No results found for: '${search}'.</strong>`);
      return;
    }
    totalPages = Math.ceil(response.hits.total / 100);
    $pagination.twbsPagination('destroy');
    $pagination.twbsPagination($.extend({}, {}, {
      startPage: currentPage,
      totalPages: totalPages,
      onPageClick: function (event, page) {
        getResults(search, size, page, displayResults);
        $('.search-panel').closest('.scrolling-pane').scrollTop(0);
      }
    }));
  }, (err) => {
      console.trace(err.message);
  });
});

// automatically trigger for search param
search = getParameterByName('search');
if(search){
  $("#search").val(search);
  $("#search_btn").trigger('click');
}

/**
 * @param {String} searchParam - search parameter
 * @param {Int} recordCount - record count to return
 * @param {Int} page - page of records to retrieve
 * @param {Func} callback - function to run on completion
 * @returns {void}
 */
function getResults(searchParam, recordCount, page, callback) {
  currentPage = page;
  const from = (recordCount * (page - 1));

  if (ajaxSearch != null) ajaxSearch.abort();

  ajaxSearch = client.search({
    size: recordCount,
    from,
    pretty: null,
    body: GenerateEsQuery.generate(searchParam),
  }).then((response) => {
    ajaxSearch = null;
    callback(response.hits.hits);
  });
}

/**
 * @return {void}
 */
function updateSocialMediaDisplay(imgSrc, desc){
  $("meta[property='og\\:image']").attr("content", imgSrc);
  $("meta[property='og\\:description']").attr("content", desc);
}

/**
 * @return {void}
 */
 const displayMeta = function(listing){
   const html = `
    <div class="meta">
      <div class="meta__docname">
        <strong>${listing.docname[0]}</strong> <i>${listing.docname[1]}</i>
      </div>
      <div class="meta__idpage">
        Id: <strong>${listing.id}</strong> Page: <strong>${listing.page}</strong>
      </div>
    </div>
   `
   return html;
 }


/**
 * @return {void}
 */
function displayResults(response) {
  listings = [];
  const container = [];
  response.forEach((el) => {
    const listing = new Listing(el, docList);
    listing.extractSearch(search);
    container.push(listing);
  });
  listings = container;

  if(!listings.length){
    $(".results-container").html('No Results');
    return;
  }

  $(".results-container").empty();
  let resultsDiv = $('<div></div>');
  resultsDiv.addClass('results');
  listings.forEach((el, i) => {
    const lis = [];
    el.searched.forEach((e) => {
      lis.push(`<li>${e}</li>`);
    });
    const mainDiv = `
    <div class="listing">
      <div class="entry-link open-entry-js" data-entry="${i}">
        <div class="entry-link__collection">${el.docname[0]}</div>
        <div class="entry-link__document">${el.docname[1]}, page: ${el.page}</div>
      </div>
      <ul class="entry-link__text-found">
        ${lis.join('\n')}
      </ul>
    </div>`;
    resultsDiv.append(mainDiv);
  });
  var instance = new Mark(resultsDiv[0]);
  let searchTrimmed = search.replace(/['"]+/g, '');
  instance.mark(searchTrimmed);
  $(".results-container").append(resultsDiv[0].outerHTML);
}

$.ajaxSetup({
  error: function(xhr, status, error) {
    console.log(xhr);
  }
});

$.get(
  'https://api.ourhiddenhistory.org/_cat/count?format=json&pretty',
  function (response) {
    let msg = `${Number(response[0].count).toLocaleString()} pages indexed`;
    $('.docsearch__indexed-cnt').html(msg);
});

var $pagination = $('.search-panel__pagination');

$('[data-toggle="tooltip"]').tooltip();

/**
 * pan/zoom
 */
$('.entry-panel__content--entry').zoom({ on: 'click' });
