editor.buildContentKeyHandler = function(contentDocument, content, globals, commands, selection, codeHighlighter, isURL, shortcuts, 
	contextMenu, components) {

	var dashCounter = 0;
	var previousChar = null;
	var lastWord = '';

	var isWhitespace = function() {
		var whitespace = new RegExp('\\s');
		return function(char) {
			return whitespace.test(char);
		};
	}();

	function getLastTypedWord() {
		// if the word is divided by <span>-s for example, then text will only contain the last part, but this is not a problem for my use-cases
		var text = contentDocument.getSelection().anchorNode.textContent
			.substr(0, contentDocument.getSelection().anchorNode.anchorOffset);
		var i = text.length - 1;
		
		while (i >= 0 && !isWhitespace(text.charAt(i))) {
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
							if (lastWord[0] === '\\' && lastWord.length > 1) {
								selection.extend('backward', 'character', lastWord.length);
								commands.insertCodeBlock(lastWord.substr(1));
							} else if (shortcuts[lastWord]) {
								globals.triggeredByShortcut = true;
								globals.shortcutCallback = function() {
									selection.extend('backward', 'character', lastWord.length);
									commands.delete();
								};
								shortcuts[lastWord]();
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
		}

		previousChar = event.which;
	}

	content.keydown(contentKeydownHandler);
};