var fs = require('fs');
var path = require('path');
var html2text = require('../app/search/html2text.js');

describe('Html 2 text conversion', function () {
	it('works for the common pitfalls', function() {
		var html = fs.readFileSync(path.join(__dirname, 'test01.html'), 'utf8');
		var expectedResult = fs.readFileSync(path.join(__dirname, 'test01_result.txt'), 'utf8');
		var text = html2text(html);
		expect(expectedResult).toEqual(text);
	});
});