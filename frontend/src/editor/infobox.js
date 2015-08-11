editor.buildInfobox = function () {
	
	var editorInfobox = $('#editor-message');

	function show(msg) {
		editorInfobox.text(msg);
		editorInfobox.fadeIn(500);
		setTimeout(function() {
			editorInfobox.fadeOut(500);
		}, 5000);
	}

	return {
		info: function(msg) {
			editorInfobox.removeClass('error');
			editorInfobox.addClass('info');
			show(msg);
		},
		error: function(msg) {
			editorInfobox.removeClass('info');
			editorInfobox.addClass('error');
			show(msg);
		}
	};
};