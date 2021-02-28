/** class to assist with alternate search options */
export default class OtherSearch {

  static build(search_class, search_string) {

    let href = '';
    switch(search_class){
      case 'othersearch-govinfo':
        href = OtherSearch.buildGovinfo(search_string);
        break;
      case 'othersearch-wikileaks':
        href = OtherSearch.buildWikileaks(search_string);
        break;
      case 'othersearch-maryferrell':
        href = OtherSearch.buildMaryFerrell(search_string);
        break;
      default:
        throw 'Other search class not recognized.';
    }
    return href;
  }

  static buildGovinfo(search_string){

    let query_obj = {
      query: search_string,
      collection: '(CHRG OR CREC OR CRECB OR GAOREPORTS OR USCOURTS)',
      offset: 0
    }
    console.log(query_obj);
    return `https://www.govinfo.gov/app/search/${encodeURIComponent(JSON.stringify(query_obj))}`;
  }

  static buildWikileaks(search_string){
    return `https://search.wikileaks.org/?query=${encodeURIComponent(search_string)}#results`
  }

  static buildMaryFerrell(search_string){
    return `https://www.maryferrell.org/search.html?q=${encodeURIComponent(search_string)}`
  }

}
