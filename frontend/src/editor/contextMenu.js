editor.buildContextMenu = function (contentDocument, content, commands) {

	var contextMenu = $('#editor-contextmenu');
	var fontSizeInput = $('#font-size-input');
	var colorInput = $('#color-input');
	var highlightInput = $('#highlight-input');
	var headingInput = $('#heading-input');
	var clearFormatButton = $('#clearformat-button');


	// font size:

	fontSizeInput.append($('<option value="none">-</option>'));
	for (var i = 1; i <= 7; i++) {
		fontSizeInput.append($('<option value="' + i + '">' + i + '</option>'));
	}

	fontSizeInput.on('change', function() {
		if ($(this).val() === 'none') {
			var currentSelection = contentDocument.getSelection();
			var ancestor = $(currentSelection.anchorNode).parents().has($(currentSelection.focusNode)).first();
			// FIXME only a subset of these has to be removed. but it won't be part of the Ctrl+Z stack
			ancestor.parent().find('font').removeAttr('size'); 
		} else {
			commands.fontSize($(this).val());
		}
		fontSizeInput.focus();
	});

	// heading:

	headingInput.append($('<option value="div">-</option>'));
	for (var j = 6; j >= 1; j--) {
		headingInput.append($('<option value="h' + j + '">' + j + '</option>'));
	}

	headingInput.on('change', function() {
		commands.transformToBlock($(this).val());
		headingInput.focus();
	});

	// colors:

	var defaultColorOption = $('<option value="">-</option>');
	colorInput.append(defaultColorOption);
	colorInput.append($('<option value="#b6b6b6">gray</option>'));
	colorInput.append($('<option value="#ff0000">red</option>'));
	colorInput.append($('<option value="#0000ff">blue</option>'));
	colorInput.append($('<option value="#00ff00">green</option>'));
	colorInput.append($('<option value="#ffffff">white</option>'));
	colorInput.append($('<option value="#000000">black</option>'));

	colorInput.on('change', function() {
		commands.textColor($(this).val());
		colorInput.focus();
	});

	// highlight:

	highlightInput.append($('<option value="rgba(0,0,0,0)">-</option>'));
	highlightInput.append($('<option value="rgba(255,255,0,1)">yellow</option>'));
	highlightInput.append($('<option value="rgba(255,0,0,1)">red</option>'));
	highlightInput.append($('<option value="rgba(0,255,0,1)">green</option>'));
	highlightInput.append($('<option value="rgba(166,166,166,1)">gray</option>'));
	highlightInput.append($('<option value="rgba(169,203,255,1)">blue</option>'));

	highlightInput.on('change', function() {
		commands.highlightColor($(this).val());
		highlightInput.focus();
	});

	// clear formatting:

	clearFormatButton.click(function() {
		commands.clearFormatting();
		contextMenu.hide();
	});

	// init: 

	defaultColorOption.attr('value', content.css('color'));

	function init() {
		var currentSelection = contentDocument.getSelection();
		var fontSize = parseFloat(currentSelection.anchorNode.parentElement.getAttribute('size'));
		fontSizeInput.val(fontSize || 'none'); // computed style at the beginning of the selection
		var header = contentDocument.getSelection().anchorNode.parentElement.nodeName;
		headingInput.val(!isNaN(header[1]) ? header.toLowerCase() : 'div');
		var foreColor = currentSelection.anchorNode.parentElement.getAttribute('color');
		colorInput.val(foreColor);
		var highlight = $(currentSelection.anchorNode.parentElement).css('background-color');
		highlightInput.val(highlight);
	}

	function focus() {
		fontSizeInput.focus();
	}

	return {
		init: init,
		focus: focus,
		element: contextMenu
	};
};