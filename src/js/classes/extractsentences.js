/**
 * For block of text, extract sentences containing any part
 * of the search phrase and highlight it
 *
 * Sentence Splitter:
 * https://stackoverflow.com/a/34784856/399696
 * - Added allowance for Mr., Mrs., Dr. etc... ([A-Z][a-z]{1,2}\.)
 *
 * RegEx Escape Str:
 * https://stackoverflow.com/a/6969486/399696
 *
 * Highligher:
 * https://markjs.io/
 *
 * Text files:
 * http://www.textfiles.com/etext/AUTHORS/SHAKESPEARE/
 */
class ExtractSentences {
  /**
   * @param {String} text - block of text
   * @param {String} search - extract sentences containing this text
   * @return {Array} array of extracted sentences
   */
  static extract(text, search) {
    const abbrRegex = /\b(\w\.\w\.|[A-Z][a-z]{1,2}\.)|([.?!]|\n+)\s+(?=[A-Za-z])/g;
    const result = text.replace(abbrRegex, (m, g1, g2) => g1 || `${g2}\r`);
    const textSplit = result.replace(/\n/g, ' ')
      .split('\r')
      .map(str => str.trim());

    const searchParts = search.match(/("[^"]+"|[^"\s]+)/g);
    const cleanedParts = searchParts.map(x => x.replace(/^"([^"]+)"$/, '$1').replace(/\s+/, ' '));
    const searchFormatted = cleanedParts.join('|');
    const find = new RegExp(ExtractSentences.escapeRegExp(searchFormatted), 'i');
    const textFiltered = textSplit.map((el) => {
      // can use the following to add preceeding and following lines
      // let pre = (typeof arr[i-1] !== "undefined" ? arr[i-1] : null);
      // let post = (typeof arr[i+1] !== "undefined" ? arr[i+1] : null);
      const pre = null;
      const post = null;
      const string = [pre, el, post].filter(x => x).join(' ');
      return (find.test(string) ? string : null);
    }).filter(e => e);

    return textFiltered;
  }
  /**
   * @param {String} str search string to use as regex
   * @return {String} str escaped for regex
   */
  static escapeRegExp(str) {
    // /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g with pipe
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$]/g, '\\$&'); // eslint-disable-line no-useless-escape
  }
}
