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
		}
	};
};