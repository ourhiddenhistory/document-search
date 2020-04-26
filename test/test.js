var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});


const listing = require('./../src/js/classes/listing');
const fs = require('fs');

let doclist = fs.readFileSync('./../_data/DOCS_NOWRITE.json');
let hit = fs.readFileSync('student.json');
