editor.buildSelection = function(documentElement) {

	return {
		extend: function(direction, unit, count) {
			for (var i = 0; i < count; i++) {
				documentElement.getSelection().modify('extend', direction, unit);
			}
		},
		move: function(count) {
			for (var i = 0; i < Math.abs(count); i++) {
				documentElement.getSelection().modify('move', count > 0 ? 'forward' : 'backward', 'character');
			}
		},
		collapseToStart: function() {
			documentElement.getSelection().collapseToStart();
		},
		collapseToEnd: function() {
			documentElement.getSelection().collapseToEnd();
		},
		selectElement: function(element) {
			var range = documentElement.createRange();
			range.selectNodeContents(element);
			var sel = documentElement.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},
		moveToElement: function(element) {
			var range = documentElement.createRange();
			range.selectNodeContents(element);
			//range.collapse(false);
			var sel = documentElement.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
			sel.collapseToEnd();
		},
		getWordBeforeCursor: function() {
			var range = documentElement.getSelection().getRangeAt(0);
			if (range.collapsed) {
				var text = range.startContainer.textContent.substring(0, range.startOffset);
				return text.split(/\s/g).pop(); // not technically a word, currently only used for url detection
			}
		}
	};
};