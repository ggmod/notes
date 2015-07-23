var fs = require('fs');
var html2text = require('../app/search/html2text.js');

// TODO
var html = fs.readFileSync('test01.html', 'utf8');
console.log(html);
var text = html2text(html);
console.log(text);