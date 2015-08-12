editor.buildContentKeyHandler = function(contentDocument, content, globals, commands, selection, codeHighlighter, isURL, shortcuts, 
	contextMenu, components) {

	var dashCounter = 0;
	var previousChar = null;
	var lastWord = '';

	var whitespace = new RegExp('\\s');

	function getLastTypedWord() {
		// if the word is divided by <span>-s for example, then text will only contain the last part, but this is not a problem for my use-cases
		var text = contentDocument.getSelection().anchorNode.textContent
			.substr(0, contentDocument.getSelection().anchorNode.anchorOffset);
		var i = text.length - 1;
		
		while (i >= 0 && !whitespace.test(text.charAt(i))) {
			i--;
		}
		return i === -1 ? text : text.substr(i + 1);
	}

	var linkCreatedByTyping = false;

	function contentKeydownHandler(event) {
		
		var insertedChar = String.fromCharCode(event.which);

		if (event.which === 13 || insertedChar === '\n' || insertedChar === '\t' || insertedChar === ' ') {
			lastWord = getLastTypedWord();
			if (lastWord.length > 6 && isURL(lastWord)) {
				var href = (lastWord.lastIndexOf('http://') === 0 || lastWord.lastIndexOf('https://') === 0) ? lastWord : 'http://' + lastWord;
				/*
				 * I want it to work like in Word, where ctr + z removes the link but keeps the last whitespace the user typed. 
				 * This is impossible to achieve perfectly without having access to the undo stack, so I had to resort to this.
				 */
				setTimeout(function() { // insert the whitespace first and link it then
					selection.move(-1);
					selection.extend('backward', 'character', lastWord.length);
					commands.toLink(href);
					selection.collapseToEnd();
					selection.move(1);
					
					linkCreatedByTyping = true;
				}, 0);
			}
		}

		if (!event.ctrlKey) {
			linkCreatedByTyping = false;
		}

		switch (event.which) {
			
			case 90: // z
				if (event.ctrlKey) {
					if (linkCreatedByTyping) {	// have to fix the selection manually in this case
						commands.undo();
						selection.collapseToEnd();
						selection.move(1);
						linkCreatedByTyping = false;
						return false;
					}
				}
				break;
			case 83: // s for saving 
				if (event.ctrlKey) {
					components.menu.saveButton.triggerHandler('click');
					return false;
				}
				break;
			case 69: // e for edit mode
				if (event.ctrlKey) {
					components.menu.editableToggle.triggerHandler('click');
					event.preventDefault();
					return false;
				}
				break;
			case 81: // q
				if (event.ctrlKey) {
					var codeBlock = $(contentDocument.getSelection().anchorNode).parents('code')[0];
					if (codeBlock) {
						codeHighlighter.refresh(codeBlock);
						selection.move(1);
						selection.move(-1); // this is needed to put the cursor in the div inside the codeblock
					} else {
						//codeHighlighter.refreshAll(); // TODO this is too dangerous, you can't undo if it fails
					}
				}
				break;
			case 9: // tab
				if (!contextMenu.element.is(':visible')) {
					var parentTags = {};
					$(contentDocument.getSelection().anchorNode).parents().each(function(i, element) {
						parentTags[element.nodeName] = true;
					});
					if ('CODE' in parentTags) {
						commands.insertText('\t');
					} else if ('LI' in parentTags) {
						if (event.shiftKey) {
							commands.outdent();
						} else {
							commands.indent();
						}
					} else {
						var range = contentDocument.getSelection().type === 'Range';
						if (range) {
							/* indenting doesn't work perfectly in Chrome: it uses a blockquote element and 
								brakes it in two if any kind of html is inserted into it */
							if (event.shiftKey) {
								commands.outdent();
							} else {
								commands.indent();
							}
						} else {
							// lastWord already calculated for the URL detection
							if (lastWord[0] === '|' && lastWord.length > 1) {
								selection.extend('backward', 'character', lastWord.length);
								commands.insertCodeBlock(lastWord.substr(1));
							} else if (lastWord[0] === '\\' && lastWord.length > 1 && shortcuts[lastWord.substr(1)]) {
								globals.triggeredByShortcut = true;
								globals.shortcutCallback = function() {
									selection.extend('backward', 'character', lastWord.length);
									commands.delete();
								};
								shortcuts[lastWord.substr(1)]();
							} else {
								commands.insertTab();
							}
						}
					}
					return false;
				}
				break;
			case 189: // dash for horizontal line
				if (previousChar === 189) {
					if (dashCounter === 3) {
						selection.extend('backward', 'character', 3);
						commands.insertHorizontalRule();
						dashCounter = 0;
						return false;
					} else {
						dashCounter++;
					}
				} else {
					dashCounter = 1;
				}
				break;
			case 68: // d
				if (event.ctrlKey && contentDocument.getSelection().isCollapsed) {
					commands.removeCurrentBlock();
					event.preventDefault();
					return false;
				}
				break;
			case 112: // F1
				components.menu.helpButton.triggerHandler('click');
				event.preventDefault();
				return false;
			case 38: // up
				if (moveTableCursorVertically(true)) {
					event.preventDefault();
					return false;
				}
				break;
			case 40: // down
				if (moveTableCursorVertically(false)) {
					event.preventDefault();
					return false;
				}
				break;
		}

		if (event.which >= 49 && event.which <= 54) { // numbers 1-6
			if (event.ctrlKey && event.altKey) {
				commands.transformToBlock('h' + parseInt(String.fromCharCode(event.which)));
				event.preventDefault();
				return false;
			}
		}

		previousChar = event.which;
	}

	function moveTableCursorVertically(up) {
		if (!contextMenu.element.is(':visible')) {
			var parent = contentDocument.getSelection().anchorNode;
			while (!parent.style) { // TODO instanceof Element didn't work
				parent = parent.parentElement;
			}
			if (parent.tagName === 'TD') {
				var cell = parent;
				var row = cell;
				while (row.tagName !== 'TR') {
					row = row.parentElement;
				}
				var table = row;
				while (table.tagName !== 'TBODY') {
					table = table.parentElement;
				}
				var rowIndex = $(row).index();
				var columnIndex = $(cell).index();
				var rows = $(table).children('tr');
				var columnCount = $(row).children('td').length;
				if (up && rowIndex > 0 || !up && rowIndex < rows.length - 1) {
					
					// FIXME this is unbelievable, but sometimes by selecting a td the selection jumps to the previous td instead
					// if (columnIndex === columnCount - 1) {
					// 	columnIndex = 0;
					// 	rowIndex = rowIndex + 1;
					// } else {
					// 	columnIndex = columnIndex + 1;
					// }

					var targetRow = rows[rowIndex + (up ? -1 : 1)];
					var targetCell = $(targetRow).children('td')[columnIndex];
					selection.moveToElement(targetCell);
					return true;
				}
			}
		}
	}

	content.keydown(contentKeydownHandler);
};