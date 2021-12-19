import * as Utils from './utils.js';
import ExtractSentences from './extractsentences.js';

/**
 * Class representing a single search result.
 */
 export default class Listing {
  /**
   * @param {Object} hit - single elasticsearch hit
   * @param {Object} doclist - document list
   */
  constructor(hit, doclist) {
    this.indexId = hit._id;
    this.path = hit._source.path.virtual;
    this.file = hit._source.file.filename;
    this.id = this.file.replace('.txt', '');
    this.searched = [];
    this.parentGroupId = this.getParentGroupId();
    this.groupId = this.getGroupId();
    this.docId = this.getDocId();
    this.page = this.getPage();
    this.nextPage = this.path.replace(`_${this.page}.txt`, `_${parseFloat(this.page) + 1}.txt`);
    this.prevPage = this.path.replace(`_${this.page}.txt`, `_${this.page - 1}.txt`);
    let regexp = new RegExp('_'+this.page+'$');
    this.filenopage = this.id.replace(regexp, '');
    this.collection = this.getParentGroupId();
    this.collectionName = this.getCollectionName(doclist);
    this.collectionPath = this.getCollectionPath();
    this.sourceName = this.getSourceName(doclist);
    this.docname = this.getDocName(doclist);
    this.sourceType = this.getSourceType(doclist);
    this.sourceHref = this.getSourceUrl(doclist);
    this.entry = hit._source.content;
  }

  /**
   * @returns {String} group id
   */
  getParentGroupId() {
    let path = this.path.split('/');
    path.splice(0,1);
    return path[0];
  }

  /**
   * @returns {String} group id
   */
  getGroupId() {
    let path = this.path.split('/');
    path.splice(0,1);
    path.splice(-1,1);
    return path.join('/');
  }
  /**
   * @returns {String} document id
   */
  getDocId() {
    const groupRegex = new RegExp('^('+this.groupId+'-)');
    const pageRegex = new RegExp('(_[0-9]{1,5})$');
    let doc = this.id.replace(groupRegex, '');
    doc = doc.replace(pageRegex, '');
    return doc;
  }
  /**
   * @returns {String} document page
   */
  getPage() {
    let page = this.id.match(/([0-9]{1,5})$/g);
    return page
  }
  /**
   * @param {Object} doclist full site document list
   * @returns {String} type indicator (used to generate source url)
   */
  getSourceType(doclist) {
    let type = false;
    let file = {};
    const collection = Utils.filterValue(doclist, 'id', this.parentGroupId);
    if (collection) {
      if (collection.type) {
        type = collection.type;
      }
      if(collection.files){
        file = Utils.filterValue(collection.files, 'id', this.docId);
        if (file && file.type) {
          type = file.type;
        }
      }
    }
    return type;
  }

  getCollection(doclist){
    let collection = Utils.filterValue(doclist, 'id', this.parentGroupId);
    if (collection && collection.collection) {
      return collection.collection;
    }
    return this.parentGroupId;
  }

  getCollectionName(doclist){
    let collection = Utils.filterValue(doclist, 'id', this.parentGroupId);
    if (collection && collection.collection) {
      return collection.collection;
    }
    return this.parentGroupId;
  }

  getCollectionPath(){
    return '/'+this.path.split('/')[1];
  }

  /**
   * @param {Object} doclist full site document list
   * @returns {String} source name if it exists, or else docId
   */
  getSourceName(doclist) {
    let source_name = false;
    let file = {};
    let collection = Utils.filterValue(doclist, 'id', this.parentGroupId);
    if (collection && collection.files) {
      file = Utils.filterValue(collection.files, 'id', this.docId);
      if (file && file.doc_name) {
        source_name = file.doc_name;
      }
    }
     return (source_name ? source_name : this.docId);
  }

  /**
   * @param {Object} doclist full site document list
   * @returns {String} source url (if any, else FALSE)
   */
  getSourceUrl(doclist) {
    let source = null;
    let file = {};
    let collection = Utils.filterValue(doclist, 'id', this.parentGroupId);
    if (collection) {
      if (collection.source) {
        source = collection.source;
      }
      if(collection.files){
        file = Utils.filterValue(collection.files, 'id', this.docId);
        if (file && file.source) {
          source = file.source;
        }
      }
    }

    switch (this.sourceType) {
      case 'ohh':
        source = `https://doc-search.nyc3.digitaloceanspaces.com/documents/${this.groupId}/${this.filenopage}.pdf#page=${this.page}`;
        break;
      case 'archive':
        source = `${source}#page/n${this.page - 1}/mode/1up`;
        break;
      case 'archive-b':
        source = `https://archive.org/stream/${source}#page/n${this.page - 1}/mode/1up`;
        break;
      case 'archiveorg':
        source = this.groupId.replace(`${this.parentGroupId}/`, '');
        source = `${source}/${this.docId}`;
        source = `https://archive.org/stream/${source}#page/n${this.page - 1}/mode/1up`;
        break;
      case 'reagan':
        source = `https://www.reaganlibrary.gov/${source}.pdf#page=${this.page}`;
        break;
      case 'cam':
        source = `https://covertactionmagazine.com/${source}.pdf#page=${this.page}`;
        break;
      case 'carter':
        source = `https://www.jimmycarterlibrary.gov/${source}.pdf#page=${this.page}`;
        break;
      case 'ford':
        source = `https://www.fordlibrarymuseum.gov/${source}.pdf#page=${this.page}`;
        break;
      case 'nixon':
        source = `https://www.nixonlibrary.gov/${source}.pdf#page=${this.page}`;
        break;
      case 'intel':
        source = `https://www.intelligence.senate.gov/${source}.pdf#page=${this.page}`;
        break;
      case 'pdf':
        source = `${source}#page=${this.page}`;
        break;
      case 'pdf-b': // appends pdf ext
        source = `${source}.pdf#page=${this.page}`;
        break;
      case 'custom-rcfp':
        source = `https://archive.org/stream/RockCreekFreePress/Rock%20Creek%20Free%20Press%20-%20${this.docId}#page/n${this.page - 1}`;
        break;
      case 'custom-jfkdpd':
        source = `https://archive.org/stream/${this.docId}_dpd-jfk/${this.docId}#page/n${this.page - 1}`;
        break;
      case 'nara-jfk':
        source = `https://www.archives.gov/files/research/jfk/releases/${this.docId}.pdf#page=${this.page}`;
        break;
      case 'nara-jfk-2018':
        source = `https://www.archives.gov/files/research/jfk/releases/2018/${this.docId}.pdf#page=${this.page}`;
        break;
      case 'nara-jg':
        source = `https://catalog.archives.gov/OpaAPI/media/7564912/content/arcmedia/dc-metro/jfkco/641323/${this.docId}/${this.docId}.pdf#page=${this.page}`;
        break;
      case 'militant':
        source = `https://www.marxists.org/history/etol/newspape/themilitant/${this.docId.match(/.*-([0-9]{4})-mil/)[1]}/${this.docId}.pdf#page=${this.page}`;
        break;
      case 'bpp':
        source = `https://www.marxists.org/history/usa/pubs/black-panther/${this.docId}.pdf#page=${this.page}`;
        break;
      case 'fbi-jones':
        source = `https://vault.fbi.gov/jonestown/${this.docId}#page=${this.page}`;
        break;
      case 'adst':
        if(source.includes("OH TOCs/")){
          source = `https://adst.org/${source}#page=${this.page}`;
        }else{
          source = `https://adst.org/wp-content/uploads/${source}#page=${this.page}`;
        }
        break;
      default:
        source = false;
    }
    this.source = source;
    return source;
  }

  /**
   * @param {Object} doclist full site document list
   * @returns {String} document name
   */
  getDocName() {
    let docname = [];
    docname.push(this.collection);
    docname.push(this.sourceName);
    return docname;
  }
  /**
   * @param {String} search entry text
   * @returns {undefined}
   */
  extractSearch(search) {
    this.searched = ExtractSentences.extract(this.entry, search);
  }
}
