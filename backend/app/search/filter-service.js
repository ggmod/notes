var fs = require('fs');
var config = require('../../config.json');
var html2text = require('./html2text.js');
var osenv = require('osenv');


var NOTES_FOLDER = osenv.home() + '/' + config.NOTES_PATH;

function filterNotesByContent(fileNames, filterConfig) {
	if (filterConfig.isRegex) {
		var regex = new RegExp(filterConfig.filter, 'gm' + (filterConfig.ignoreCase ? 'i' : ''));
	} else {
		var filter = filterConfig.ignoreCase ? filterConfig.filter.toUpperCase() : filterConfig.filter;
	}
	
	return fileNames.filter(function(fileName) {
		var html = fs.readFileSync(NOTES_FOLDER + '/' + fileName, 'utf8');
		var text = html2text(html);

		if (filterConfig.isRegex) {
			return text.search(regex) >= 0;
		} else {
			if (filterConfig.ignoreCase) {
				text = text.toUpperCase();
			}

			return text.indexOf(filter) >= 0;
		}
	});
}

module.exports = {
	filterNotesByContent: filterNotesByContent
};