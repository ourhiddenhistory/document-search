import Listing from './classes/listing.js';
import GenerateEsQuery from './classes/generateesquery.js';
import OtherSearch from './classes/othersearch.js';
import * as Utils from './classes/utils.js';

const INDEX = 'docsearch';

String.prototype.lpad = Utils.lpad;

const client = new $.es.Client({
  hosts: 'https://api.ourhiddenhistory.org',
});

client.ping({
  requestTimeout: 15000,
}, (error) => {
  if (error) {
    console.log(error);
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
  let newUrl = baseurl + document[0] + '?' + currentParams;
  return newUrl;
}

/**
 * changeUrlAddCollectionLimit
 * @param string full url to adjust
 * @param array path parts
 */
var changeUrlAddCollectionLimit = function(url, collection_path) {
  let currentParams = url.split('?')[1] || '';
  let newUrl = url.split('?')[0] + '?' + currentParams + '&' + 'collection=' + collection_path;
  return newUrl;
}

/**
 * changeUrlRemoveCollectionLimit
 * @param string full url to adjust
 * @param array path parts
 */
 var changeUrlRemoveCollectionLimit = function(url) {
  let currentParams = url.split('?')[1] || '';
  currentParams = new URLSearchParams(currentParams);
  currentParams.delete('collection')
  let newUrl = url.split('?')[0] + '?' + currentParams.toString();
  return newUrl;
}

var getCurrentSearchParams = function(){
  let currentUrl = window.location.pathname + window.location.search;
  let currentParams = currentUrl.split('?')[1] || '';
  currentParams = new URLSearchParams(currentParams);
  return currentParams.get('search');
}

var getCurrentCollectionLimit = function(){
  let currentUrl = window.location.pathname + window.location.search;
  let currentParams = currentUrl.split('?')[1] || '';
  currentParams = new URLSearchParams(currentParams);
  return currentParams.get('collection');
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

// detect back/forward page press
window.addEventListener('popstate', function (event) {
  getResults(getCurrentSearchParams(), getCurrentCollectionLimit(), 100, 1, displayResults);
});

/**
 * UI Components
 */

let ajaxSearch = null;
let ajaxPage = null;

let currentListing = null;
function changePage(direction) {
  let newPage;
  if(direction == 'prev'){
    newPage = currentListing.prevPage;
  }else{
    newPage = currentListing.nextPage;
  }
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
  page = decodeURIComponent(page);

  ajaxPage = client.search({
    size: 1,
    pretty: null,
    body: GenerateEsQuery.generatePage(page),
  }).then((response) => {

    ajaxPage = null;

  
    if(response.hits.hits.length == 0) {
      $('.entry-panel__content').html(lastPageContent);
      if(currentListing)
        alert(`no more pages in this document. This is page ${currentListing.page}.`);
      return;
    }
    const listing = new Listing(response.hits.hits[0], docList);
    // set search param in url
    const curPath = window.location.pathname + window.location.search;
    const newUrl = changeUrlWithNewDocument(curPath, [listing.path]);
    history.pushState({}, null, newUrl);

    displayListingInEntryPanel(listing, setToImage);
  }, (err) => {
      console.trace(err.message);
  });
}

const path = window.location.pathname;
if (![`${baseurl}`, `${baseurl}/`, `${baseurl}/index.html`].includes(path)) {
  let findpath = path.replace('/docsearch', '');
  const pathParts = path.split('/');
  let pathPartIndex = (baseurl == '' ? 1 : 2);
  let setToImage = (pathParts[pathPartIndex+1] === 'img');
  const page = `${pathParts[pathPartIndex]}.txt`;
  getPage(findpath, null, setToImage);
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
  let newUrl = changeUrlWithNewDocument(window.location.pathname + window.location.search, [currentListing.path]);
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
  let newUrl = changeUrlWithNewDocument(window.location.pathname + window.location.search, [listing.path]);
  history.pushState({}, null, newUrl);
}

let TEXT = '';
let totalPages = 0;
let currentPage = 0;
let search = '';
const size = 100;

$("#search_btn").on('click', function(e){

  displayLoadingMessage();

  search = $("#search").val();
  if(search.length < 3){
    displayNoResultsMessage('Search must be at least three characters long.');
    return;
  }

  currentPage = 1;
  if(ajaxSearch != null) ajaxSearch.abort();

  ajaxSearch = client.search({
    size: size,
    from: 0,
    pretty: null,
    body: GenerateEsQuery.generate(search, getCurrentCollectionLimit()),
  }).then((response) => {
    ajaxSearch = null;

    // set search param in url
    let newUrl = changeUrlWithNewSearch(window.location.pathname, search);
    if(getCurrentCollectionLimit()){
      newUrl = changeUrlAddCollectionLimit(newUrl, getCurrentCollectionLimit());
    }
    history.pushState({}, null, newUrl);

    if(response.hits.total == 0){
      displayNoResultsMessage();
      return;
    }

    displayResults(response.hits.hits);

    totalPages = Math.ceil(response.hits.total / 100);
    $pagination.twbsPagination('destroy');
    $pagination.twbsPagination($.extend({}, {}, {
      startPage: currentPage,
      totalPages: totalPages,
      onPageClick: function (event, page) {
        getResults(search, getCurrentCollectionLimit(), size, page, displayResults);
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
 * @param {String} collection - collection to limit to (based on directory path)
 * @param {Int} recordCount - record count to return
 * @param {Int} page - page of records to retrieve
 * @param {Func} callback - function to run on completion
 * @returns {void}
 */
function getResults(searchParam, collection, recordCount, page, callback) {
  currentPage = page;
  const from = (recordCount * (page - 1));

  if (ajaxSearch != null) ajaxSearch.abort();

  ajaxSearch = client.search({
    size: recordCount,
    from,
    pretty: null,
    body: GenerateEsQuery.generate(searchParam, collection),
  }).then((response) => {
    ajaxSearch = null;
    callback(response.hits.hits);

    let href = '';
    href = OtherSearch.build('othersearch-govinfo', searchParam);
    $('.othersearch-govinfo').attr('href', href);
    href = OtherSearch.build('othersearch-wikileaks', searchParam);
    $('.othersearch-wikileaks').attr('href', href);
    href = OtherSearch.build('othersearch-maryferrell', searchParam);
    $('.othersearch-maryferrell').attr('href', href);

  });
}

function getResultsWithNewCollectionLimit(collection){
  getResults(getCurrentSearchParams(), collection, size, 1, displayResults);
}

function updateOtherSearchUrls(search_param){

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

function displayNoResultsMessage(override_msg){

  $('.search-panel__pagination').hide();
  $(".result").html('');

  let no_results_msg = '';
  no_results_msg = `No results for ${decodeURI(getCurrentSearchParams())}.`;
  const collection_limit = getCurrentCollectionLimit();
  if(collection_limit){
    no_results_msg = no_results_msg + ` Your search is currently limited to ${collection_limit}. <button type="button" class="btn btn-info btn-sm remove-collection-limit-js">Remove limit.</a>`
  }

  if(override_msg){
    no_results_msg = override_msg;
  }

  $(".results-container").html(no_results_msg);
  return;
}

function displayLoadingMessage(){
  $('.search-panel__pagination').hide();
  $(".result").html('');
  $(".results-container").html('LOADING...');
  return;
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
    displayNoResultsMessage();
    return;
  }

  $(".results-container").empty();
  $('.search-panel__pagination').show();
  let resultsDiv = $('<div></div>');
  resultsDiv.addClass('results');

  let collection_button_state = getCurrentCollectionLimit() ? 'btn-info' : 'btn-default';

  listings.forEach((el, i) => {
    const lis = [];
    el.searched.forEach((e) => {
      lis.push(`<li>${e}</li>`);
    });
    const mainDiv = `
    <div class="listing">
      <div class="entry-link">
        <div class="entry-link__collection">
          <span class="entry-link__collection-name">${el.collectionName}</span> 
          <button 
            type="button" 
            class="btn ${collection_button_state} btn-xs entry-link__collection-limiter" 
            data-collection-path="${el.collectionPath}" 
            data-toggle="tooltip" 
            data-placement="top"
            data-delay="750"
            title="Limit results to this collection">limit to</button>
        </div>
        <div class="entry-link__document open-entry-js" data-entry="${i}">
          ${el.docname[1]}, page: ${el.page}
        </div>
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
  setLimiters();
}

$.ajaxSetup({
  error: function(xhr, status, error) {
    // console.log(xhr);
  }
});

$.get(
  `https://api.ourhiddenhistory.org/_cat/count/${INDEX}?format=json&pretty`,
  function (response) {
    let indexed_cnt = Number(response[0].count);
    let msg = `${indexed_cnt.toLocaleString()} pages in ${INDEX}`;
    $('.docsearch__indexed-cnt').html(msg);
    let index_progress = $('.index-progress-js');
    if(index_progress.length){
      let index_size = index_progress.data('index-size');
      let indexed_pct = (indexed_cnt / index_size) * 100;
      index_progress.attr('style', `width:${indexed_pct}%`);
    }
});

var $pagination = $('.search-panel__pagination');

$('[data-toggle="tooltip"]').tooltip();

/**
 * pan/zoom
 */
$('.entry-panel__content--entry').zoom({ on: 'click' });

/**
 * Raw entry data modal
 */
$('.toolbar-entry__modal-entry-data').on('click', function(){
  const cloneListing = Object.assign({}, currentListing);
  delete cloneListing.entry;
  delete cloneListing.searched;
  var prettyPrint = JSON.stringify(cloneListing, null, 2);
  $('.modal-entry-data .modal-body').html(`<pre>${prettyPrint}</pre>`);
  $('.modal-entry-data').modal('toggle');
});

/**
 * Limit to single collection
 */
const setLimiters = function(){

  const limiter_buttons = $('button.entry-link__collection-limiter');

  limiter_buttons.on('click', function(){

    if(limiter_buttons.hasClass('btn-default')){ // add limit

      $(".results-container").html('Loading...');
      limiter_buttons.removeClass('btn-default').addClass('btn-info');
      let collection_path = $(this).data('collection-path');
      let newUrl = changeUrlAddCollectionLimit(window.location.pathname + window.location.search, [collection_path]);
      history.pushState({}, null, newUrl);
      getResultsWithNewCollectionLimit(getCurrentCollectionLimit());
      checkForLimit();

    }else{ // remove limit
      limiter_buttons.removeClass('btn-info').addClass('btn-default');
      removeCollectionLimit();
    }
  });
  $('[data-toggle="tooltip"]').tooltip();
}

$('#alert-limit').on('click', '.remove-collection-limit-js', function(e){
  removeCollectionLimit();
});

$('.results-container').on('click', '.remove-collection-limit-js', function(e){
  removeCollectionLimit();
});

function findGetParameter(parameterName) {
  var result = null,
      tmp = [];
  var items = location.search.substr(1).split("&");
  for (var index = 0; index < items.length; index++) {
      tmp = items[index].split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
  }
  return result;
}

const checkForLimit = function(){
  if(findGetParameter('collection')){
    $('#alert-limit').show();
    $('#alert-limit .limited-to').html(findGetParameter('collection'));
  }else{
    $('#alert-limit').hide();
  }
}

checkForLimit();

const removeCollectionLimit = function(){
  $(".results-container").html('Loading...');
  let newUrl = changeUrlRemoveCollectionLimit(window.location.pathname + window.location.search);
  history.pushState({}, null, newUrl);
  getResultsWithNewCollectionLimit(null);
  checkForLimit();
}