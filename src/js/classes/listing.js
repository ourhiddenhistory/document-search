/** Class representing a single elasticsearch hit. */
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
    this.pageNext = null;
    this.pagePrev = null;

    this.docname = this.getDocName(doclist) || this.getDocId();
    this.sourceType = this.getSourceType(doclist);
    this.sourceHref = this.getSourceUrl(doclist);
    this.img = this.getImgPath();
    this.txt = this.getTxtPath();

    this.entry = hit._source.content;
  }

  getGroupId() {
    return this.id.slice(0, 3);
  }

  getDocId() {
    let regex = new RegExp('(_[0-9]{1,4})$');
    let doc = this.id.replace(regex, '');
    doc = doc.slice(4);
    return doc;
  }

  getPage() {
    let groupId = this.getGroupId();
    let docId = this.getDocId();
    return this.id.replace(groupId+'-'+docId+'_', '');
  }

  getSourceType(doclist) {
    let type = false;
    let file = {};
    let collection = filterValue(doclist, 'id', this.groupId);
    if(collection && collection.files){
      if(collection.type)
        type = collection.type;
      file = filterValue(collection.files, 'id', this.docId);
      if(file && file.type){
        type = file.type;
      }
    }
    return type;
  }

  getSourceUrl(doclist) {
    let source = false;
    let file = {};
    let collection = filterValue(doclist, 'id', this.groupId);
    if(collection && collection.files){
      if(collection.source)
        source = true;
      file = filterValue(collection.files, 'id', this.docId);
      this.file = file;
      if(file && file.source){
        source = file.source;
      }
    }
    this.source = source;
    this.type = this.getSourceType(doclist);
    switch(this.type) {
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
        let year = this.docId.match(/.*\-([0-9]{4})\-mil/)[1];
        source = `https://www.marxists.org/history/etol/newspape/themilitant/${year}/${this.docId}.pdf#page=${this.page}`;
        break;
      default:
        source = `${source}#page=${this.page}`;
    }
    return source;
  }

  getTxtPath() {

  }

  getImgPath() {
    let page = this.page.padStart(4, 0);
    let host = 'https://doc-search.nyc3.digitaloceanspaces.com/docs_images/';
    let src = this.groupId+'/'+this.groupId+'-'+this.docId+'_'+page+'.png';
    return host+src;
  }

  // get doc name from collection, file, or else use id
  getDocName(doclist){
    let docname = [];
    let collection = filterValue(doclist, 'id', this.groupId);
    if(collection && collection.collection){
      docname.push(collection.collection);
      if(collection.files){
        let file = filterValue(collection.files, 'id', this.docId);
        if(file && file.doc_name){
          docname.push(file.doc_name);
        }
      }
    }
    if(!this.docId.match(/^[0-9]{3}$/))
    docname.push(this.docId);
    return docname;
  }

  extractSearch(search) {
    this.searched = ExtractSentences.extract(this.entry, search);
  }
}
