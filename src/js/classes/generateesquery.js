/** class to assist in building elastic search queries */
class GenerateEsQuery {
  /**
   * Create a point.
   * @param {String} stringInput - user search string.
   * @returns {Object} json representation of search
   */
  static generate(stringInput) {
    const esQuery = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    const stringParts = stringInput.match(/("[^"]+"|[^"\s]+)/g);

    stringParts.forEach((str) => {
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
    });
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
    fieldQuery.query.constant_score.filter.term['file.filename'] = stringInput;
    return fieldQuery;
  }
}
