var fs = require('fs');
var config = require('../../config.json');
var utils = require('../utils.js');
var html2text = require('./html2text.js');

function filterNotes(textFilterFunc) {
	
	return fs.readdirSync(config.NOTES_PATH)
		.filter(function(file_name) {
			if (!utils.endsWith(file_name, '.html')) {
				return false;
			} else {
				var html = fs.readFileSync(config.NOTES_PATH + '/' + file_name, 'utf8');
				var text = html2text(html);
				return textFilterFunc(text);
			}
		});

}

function filterNotesByText(textFilter, ignoreCase) {
	if (ignoreCase) {
		textFilter = textFilter.toUpperCase();
	}

	return filterNotes(function(textContent) {
		if (ignoreCase) {
			textContent = textContent.toUpperCase();
		}
		return textContent.indexOf(textFilter) >= 0;
	});
}

function filterNotesByRegex(regexFilter, ignoreCase) {
	var regex = new RegExp(regexFilter, 'gm' + (ignoreCase ? 'i' : ''));

	return filterNotes(function(textContent) {
		return textContent.search(regex) >= 0;
	});
}

module.exports = {
	filterNotesByText: filterNotesByText,
	filterNotesByRegex: filterNotesByRegex
};