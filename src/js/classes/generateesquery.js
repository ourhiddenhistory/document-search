/** class to assist in building elastic search queries */
export default class GenerateEsQuery {
  /**
   * Create a point.
   * @param {String} stringInput - user search string.
   * @returns {Object} json representation of search
   */
  static generate(stringInput, collection) {

    const esQuery = {
      query: {
        bool: {
          must: []
        },
      },
    };
    const stringParts = stringInput.match(/("[^"]+"|[^"\s]+)/g);

    const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];

    stringParts.forEach((str) => {

      if(stopwords.includes(str)){
        return false;
      }

      const searchObj = {};
      const cleanStr = str.replace(/^"([^"]+)"$/, '$1').replace(/\s+/, ' ');
      if (GenerateEsQuery.isPhrase(cleanStr)) {
        searchObj.match_phrase = {
          content: cleanStr,
        };
      } else {
        searchObj.match = {
          content: cleanStr,
        };
      }

      esQuery.query.bool.must.push(searchObj);
      
      // add collection limit
      if(collection){
        const pathObj = { "prefix": { "path.virtual": collection }}
        esQuery.query.bool.must.push(pathObj);
      }

    });

    // console.log(JSON.stringify(esQuery, null, 4));
    return esQuery;
  }
  /**
   * Check if string is a phrase by looking for a space
   * @param {String} str - string to check.
   * @returns {Boolean} is phrase?
   */
  static isPhrase(str) {
    return str.indexOf(' ') >= 0;
  }
  /**
   * Create a point for a page.
   * @param {String} stringInput - user search string.
   * @returns {Object} json representation of search
   */
  static generatePage(stringInput) {
    const fieldQuery = {
      query: {
        constant_score: {
          filter: {
            term: {},
          },
        },
      },
    };
    fieldQuery.query.constant_score.filter.term['path.virtual'] = stringInput;
    return fieldQuery;
  }
}
