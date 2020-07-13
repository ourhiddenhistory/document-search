/**
 * Class representing a single search result.
 */
class Listing {
  /**
   * @param {Object} hit - single elasticsearch hit
   * @param {Object} doclist - document list
   */
  constructor(hit, doclist) {
    this.file = hit._source.file.filename;
    this.id = this.file.replace('.txt', '');
    this.searched = [];
    this.groupId = this.getGroupId();
    this.docId = this.getDocId();
    this.page = this.getPage();
    this.collection = this.getCollection(doclist);
    this.docname = this.getDocName(doclist);
    this.sourceType = this.getSourceType(doclist);
    this.sourceHref = this.getSourceUrl(doclist);
    this.entry = hit._source.content;
    console.log(this);
  }
  /**
   * @returns {String} group id
   */
  getGroupId() {
    const regex = '([0-9a-zA-Z.]+)-(.*)';
    const match = this.id.match(regex);
    try {
      const groupId = match[1];
      return groupId;
    } catch (e) {
      return '000';
    }
  }
  /**
   * @returns {String} document id
   */
  getDocId() {
    const groupRegex = new RegExp('^('+this.groupId+'-)');
    const pageRegex = new RegExp('(_[0-9]{1,4})$');
    let doc = this.id.replace(groupRegex, '');
    doc = doc.replace(pageRegex, '');
    return doc;
  }
  /**
   * @returns {String} document page
   */
  getPage() {
    const groupId = this.getGroupId();
    const docId = this.getDocId();
    return this.id.replace(`${groupId}-${docId}_`, '');
  }
  /**
   * @param {Object} doclist full site document list
   * @returns {String} type indicator (used to generate source url)
   */
  getSourceType(doclist) {
    let type = false;
    let file = {};
    const collection = filterValue(doclist, 'id', this.groupId);
    if (collection && collection.files) {
      if (collection.type) {
        type = collection.type;
      }
      file = filterValue(collection.files, 'id', this.docId);
      if (file && file.type) {
        type = file.type;
      }
    }
    return type;
  }

  getCollection(doclist){
    let collection = filterValue(doclist, 'id', this.groupId);
    console.log(collection);
    if (collection && collection.collection) {
      return collection.collection;
    }
    return this.groupId;
  }

  /**
   * @param {Object} doclist full site document list
   * @returns {String} source url (if any, else FALSE)
   */
  getSourceUrl(doclist) {
    let source = false;
    let file = {};
    let collection = filterValue(doclist, 'id', this.groupId);
    if (collection && collection.files) {
      if (collection.source) {
        source = true;
      }
      file = filterValue(collection.files, 'id', this.docId);
      if (file && file.source) {
        source = file.source;
      }
    }
    this.source = source;
    this.type = this.getSourceType(doclist);
    switch (this.type) {
      case 'archive':
        source = `${source}#page/n${this.page}`;
        break;
      case 'archive-b':
        source = `https://archive.org/stream/${source}#page/n${this.page}`;
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
        source = `https://archive.org/stream/RockCreekFreePress/Rock%20Creek%20Free%20Press%20-%20${this.docId}#page/n${this.page}`;
        break;
      case 'custom-jfkdpd':
        source = `https://archive.org/stream/${this.docId}_dpd-jfk/${this.docId}#page/n${this.page}`;
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
      case 'adst':
        source = `https://adst.org/wp-content/uploads/${this.source}#page=${this.page}`;
        break;
      default:
        source = `${source}#page=${this.page}`;
    }
    return source;
  }

  /**
   * @param {Object} doclist full site document list
   * @returns {String} document name
   */
  getDocName() {
    let docname = [];
    docname.push(this.collection);
    docname.push(this.docId);
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
