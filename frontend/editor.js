var editedNoteName = null;

(function processQueryParams() {
	var params = {};
	window.location.search.substr(1).split("&")
		.forEach(function(item) {
			var param = item.split("=");
			params[param[0]] = param[1];
		});

	if (params['note']) {
		editedNoteName = params['note'];
	}
})();

$(function() {

	var editableToggle = $("#editable-toggle");
	var saveButton = $("#save-button");

	var insertList1Button = $("#insert-list1");
	var insertList2Button = $("#insert-list2");
	var insertImageButton = $("#insert-image");
	var insertTableButton = $("#insert-table");
	var insertButtons = $("#insert-buttons");
	var insertButtonsCover = $("#insert-buttons-cover");

	var contextMenu = $("#editor-contextmenu");
	var fontSizeInput = $("#font-size-input");
	var colorInput = $("#color-input");
	var highlightInput = $("#highlight-input");
	var headingInput = $("#heading-input");
	var clearFormatButton = $("#clearformat-button");

	var dialogContainer = $("#editor-dialog-container");
	var dialogCover = $("#editor-dialog-cover");
	var dialogElement = $("#editor-dialog");
	var dialogTitle = $("#editor-dialog-header-text");
	var dialogSubmit = $("#editor-dialog-submit");
	var dialogCancel = $("#editor-dialog-cancel");
	var imageDialog = $("#editor-dialog-image");
	var tableDialog = $("#editor-dialog-table");
	var dialogClose = $("#editor-dialog-header-x");
	var imageSrc = $("#editor-dialog-image-src");
	var imageWidth = $("#editor-dialog-image-width");
	var imageHeight = $("#editor-dialog-image-height");
	var imageAlign = $("#editor-dialog-image-align");
	var tableCol = $("#editor-dialog-table-columns");
	var tableRow = $("#editor-dialog-table-rows");
	var tableHeader = $("#editor-dialog-table-header");
	var titleDialog = $("#editor-dialog-notetitle");
	var titleInput = $("#editor-dialog-notetitle-title");

	var editorInfobox = $("#editor-message");

	var content = null;	// body
	var contentDocument = null;

	editableToggle.click(function(event) {
		if (content.attr("contenteditable") === 'true') {
			content.attr("contenteditable", "false");
			editableToggle.removeClass('on');
			editableToggle.addClass('off');
		} else {
			content.attr("contenteditable", "true");
			editableToggle.removeClass('off');
			editableToggle.addClass('on');
			content.focus();
		}
	});

	function performSaveAction() {
		saveNoteOnServer(function() {
			saveButton.hide();
			markIfContentModified();
			infobox.info("Successfully saved the note");
		}, function() {
			infobox.error("Couldn't save the note on the server.");
		});
	}

	saveButton.click(function(event) {
		if (editedNoteName) {
			performSaveAction();
		} else {
			dialog.open("title");
		}
	});

	var currentSelection = null;

	function initializeContextMenuFields() {
		currentSelection = contentDocument.getSelection();
		var fontSize = parseFloat(currentSelection.anchorNode.parentElement.getAttribute("size"));
		fontSizeInput.val(fontSize || "none"); // computed style at the beginning of the selection
		var header = contentDocument.getSelection().anchorNode.parentElement.nodeName;
		headingInput.val(!isNaN(header[1]) ? header.toLowerCase() : "div");
		var foreColor = currentSelection.anchorNode.parentElement.getAttribute("color");
		colorInput.val(foreColor || color(content.css('color')).hex());
		var highlight = $(currentSelection.anchorNode.parentElement).css('background-color');
		highlightInput.val(highlight ? color(highlight).rgba() : 'rgba(0,0,0,0)');
	}

	var contentMouseDownHandler = function (event) { // click only works for left mouse button

		linkCreatedByTyping = false;

		if (event.which === 3 && content.attr("contenteditable") === 'true') {

			initializeContextMenuFields();

			contextMenu.css('left', event.clientX);
			if (contextMenu.height() > window.innerHeight - event.clientY) {
				contextMenu.css('top', event.clientY - contextMenu.height());
			} else {
				contextMenu.css('top', event.clientY);
			}
			contextMenu.show();

			fontSizeInput.focus();

			//event.preventDefault();
			return false;
		} else {
			if (contextMenu.is(":visible")) {
				contextMenu.hide();
			}
		}
	};

	fontSizeInput.append($('<option value="none">-</option>'));
	for (var i = 1; i <= 7; i++) {
		fontSizeInput.append($('<option value="' + i + '">' + i + '</option>'));
	}

	fontSizeInput.on('change', function() {
		if ($(this).val() === 'none') {
			var ancestor = $(currentSelection.anchorNode).parents().has($(currentSelection.focusNode)).first();
			ancestor.parent().find("font").removeAttr("size"); // FIXME only a subset of these has to be removed. but it won't be part of the Ctrl+Z stack
		} else {
			commands.fontSize($(this).val());
		}
		fontSizeInput.focus();
	});

	headingInput.append($('<option value="div">-</option>'));
	for (var i = 6; i >= 1; i--) {
		headingInput.append($('<option value="h' + i + '">' + i + '</option>'));
	}

	headingInput.on('change', function() {
		commands.transformToBlock($(this).val());
		headingInput.focus();
	});

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

	clearFormatButton.click(function() {
		commands.clearFormatting();
		contextMenu.hide();
	});

	var dashCounter = 0;
	var menuFocusItems = contextMenu.find(".contextmenu-focus");
	var previousChar = null;

	// helpers for the keyhandler:

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

	var contentKeydownHandler = function(event) {
		
		var insertedChar = String.fromCharCode(event.which);

		if (insertedChar === '\n' || insertedChar === '\t' || insertedChar === ' ') {
			var lastWord = getLastTypedWord();
			if (lastWord.length > 6 && isURL(lastWord)) {
				var href = (lastWord.lastIndexOf("http://") === 0 || lastWord.lastIndexOf("https://") === 0) ? lastWord : "http://" + lastWord;
				/*
				 * I want it to work like in Word, where ctr + z removes the link but keeps the last whitespace the user typed. 
				 * This is impossible to achieve perfectly without having access to the undo stack, so I had to resort to this.
				 */
				setTimeout(function() { // insert the whitespace first and link it then
					selection.move(-1);
					selection.extend("backward", "character", lastWord.length);
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
					saveButton.triggerHandler('click');
					return false;
				}
				break;
			case 69: // e for edit mode
				if (event.ctrlKey) {
					editableToggle.triggerHandler('click');
					event.preventDefault();
					return false;
				}
				break;
			case 81: // q
				if (event.ctrlKey) {
					var codeBlock = $(contentDocument.getSelection().anchorNode).parents("code")[0];
					if (codeBlock) {
						refreshCodeHighlighting(codeBlock);
						selection.move(1);
						selection.move(-1); // this is needed to put the cursor in the div inside the codeblock
					} else {
						refreshAllCodeHighlighting();
					}
				}
				break;
			case 9: // tab
				if (!contextMenu.is(":visible")) {
					var parentTags = {};
					$(contentDocument.getSelection().anchorNode).parents().each(function(i, element) {
						parentTags[element.nodeName] = true;
					});
					if ("CODE" in parentTags) {
						commands.insertText('\t');
					} else if ("LI" in parentTags) {
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
								selection.extend("backward", "character", lastWord.length);
								commands.insertCodeBlock(lastWord.substr(1));
							} else if (lastWord in shortcuts) {
								triggeredByShortcut = true;
								shortcutCallback = function() {
									selection.extend("backward", "character", lastWord.length);
									commands.delete();
								}
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
						selection.extend("backward", "character", 3);
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
		}

		previousChar = event.which;
	};

	$(document).keydown(function(event) {
		switch(event.which) {
			case 38: // up
				if (contextMenu.is(":visible")) {
					var index = menuFocusItems.index(document.activeElement);
					menuFocusItems[index === 0 ? menuFocusItems.length - 1 : index - 1].focus();
					return false;
				}
				break;
			case 40: // down
				if (contextMenu.is(":visible")) {
					var index = menuFocusItems.index(document.activeElement);
					menuFocusItems[index === menuFocusItems.length - 1 ?  0 : index + 1].focus();
					return false;
				}
				break;
			case 27: // esc
				if (contextMenu.is(":visible")) {
					contextMenu.hide();
					content.focus();
				}
				break;
			case 13: // enter
				if (contextMenu.is(":visible")) {
					contextMenu.hide();
					content.focus();
				}
				break;
		}
	});

	$("#editor-overlays").mouseenter(function(event) {
		insertButtons.fadeIn(100);
	}).mouseleave(function(event) {
		insertButtons.hide();
	});

	insertList1Button.click(function(event) {
		if (triggeredByShortcut) {
			triggeredByShortcut = false;
			shortcutCallback.call();
		}
		commands.insertOrderedList();
		content.focus();
	});
	insertList2Button.click(function(event) {
		if (triggeredByShortcut) {
			triggeredByShortcut = false;
			shortcutCallback.call();
		}
		commands.insertUnorderedList();
		content.focus();
	});

	// Dialog:

	function createDialog(dialogTypes) {

		var currentType = null;

		for (key in dialogTypes) {
			var focusable = dialogTypes[key].panel.find('input,select,button');
			dialogTypes[key].initialFocus = focusable[0];
		}

		function centerDialog() {
			dialogElement.css('left', (window.innerWidth - dialogElement.width())/2 );
			dialogElement.css('top', (window.innerHeight - dialogElement.height())/2 );
		}

		$(window).resize(centerDialog);

		function closeDialog() {
			triggeredByShortcut = false;
			dialogContainer.hide();
			content.focus();
		}

		dialogCover.click(function(event) {
			closeDialog();
		});
		dialogClose.click(function(event) {
			closeDialog();
		});
		dialogCancel.click(function(event) {
			closeDialog();
		});

		dialogElement.keydown(function(event) {
			switch(event.which) {
				case 13:
					dialogSubmit.click();
					break;
				case 27:
					closeDialog();
					break;
				case 9: // tab for focus loop inside the dialog
					if (!event.shiftKey && dialogCancel.is(":focus")) {
						dialogTypes[currentType].initialFocus.focus();
						return false;
					} else if (event.shiftKey && dialogTypes[currentType].initialFocus.is(":focus"))  {
						dialogCancel.focus();
						return false;
					}
					break;
			}
		});

		dialogSubmit.click(function(event) {
			if (triggeredByShortcut) {
				shortcutCallback.call();
				triggeredByShortcut = false;
			}

			var valid = dialogTypes[currentType].submit.call();
			if (valid === true || typeof valid === 'undefined') {
				dialogContainer.hide();
				content.focus();
			}
		});

		return {
			open: function(type) {
				currentType = type;
				for (key in dialogTypes) {
					if (key === currentType) {
						dialogTypes[key].panel.show();
					} else {
						dialogTypes[key].panel.hide();
					}
				}
				centerDialog();
				dialogTitle.text(dialogTypes[currentType].title);
				dialogElement.find('input').val('');
				dialogElement.find('select').val('');
				dialogContainer.fadeIn(200);
				dialogTypes[currentType].initialFocus.focus();
			},
		};
	}

	var dialog = createDialog({ 
		"image": {
			panel: imageDialog,
			title: "Insert Image",
			submit: function() {
				commands.insertImage(imageSrc.val(), imageWidth.val(), imageHeight.val(), imageAlign.val());
			}
		},
		"table": {
			panel: tableDialog,
			title: "Insert Table",
			submit: function() {
				commands.insertTable(tableCol.val(), tableRow.val(), tableHeader.is(":checked"));
			}
		},
		"title": {
			panel: titleDialog,
			title: "Note properties",
			submit: function() {
				if (!titleInput.val() || titleInput.val().trim().length === 1) {
					infobox.error("The name of the note cannot be empty.");
					return false;
				} else {
					editedNoteName = titleInput.val();
					contentDocument.title = editedNoteName;
					performSaveAction();
					return true;
				}
			}
		}
	});

	insertImageButton.click(function(event) {
		dialog.open("image");
	});
	insertTableButton.click(function(event) {
		dialog.open("table");
	});

	// infobox:

	var infobox = function createInfobox() {

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
	}();

	// shortcuts: 

	var shortcutCallback = null;
	var triggeredByShortcut = false;

	function createHeader(level) {
		shortcutCallback.call();
		triggeredByShortcut = false;
		commands.transformToBlock('h' + level);
	}

	var shortcuts = {
		"img": function() { insertImageButton.click(); },
		"ol": function() { insertList1Button.click(); },
		"ul": function() { insertList2Button.click(); },
		"table": function() { insertTableButton.click(); },
		"h1": function() { createHeader(1); },
		"h2": function() { createHeader(2); },
		"h3": function() { createHeader(3); },
		"h4": function() { createHeader(4); },
		"h5": function() { createHeader(5); },
		"h6": function() { createHeader(6); }
	};

	function markIfContentModified() {
		content.keydown(function(event) {
			if (content.attr("contenteditable") === 'true') {
				if (!event.ctrlKey && !(
					(event.which >= 14 && event.which <= 31)
					|| (event.which >= 33 && event.which <= 45)
					|| (event.which >= 91 && event.which <= 93) 
					|| (event.which >= 112 && event.which <= 145))) {

					saveButton.show();
					$(this).unbind(event);
				}
			}
		});	
	}

	window.onbeforeunload = function(e) {
		if (saveButton.is(':visible')) {
			e = e || window.event;
			var message = 'You have unsaved changes.';
			if (e) {
				e.returnValue = message;
			}
			return message;
		}
	};

	document.addEventListener('contextmenu', function(e) {
			if (content.attr("contenteditable") === 'true') {
		    	e.preventDefault();
		    }
		}, false);

	// this is very useful when inserting code fragments from editors:
	function removeUnnecessaryTabs(codeText) {
		var lines = codeText.split('\n');
		var tabCounts = lines.map(function(line) {
			var i = 0;
			while(line[i] === '\t') {
				i++;
			}
			return i;
		});
		var tabsToRemove = Math.min.apply(null, tabCounts.filter(
			function(count) {
				return count > 0;
			})
		);
		if (tabsToRemove > 1 && isFinite(tabsToRemove)) {
			for (var i = 0; i < lines.length; i++) {
				if (tabCounts[i] >= tabsToRemove) {
					lines[i] = lines[i].substr(tabsToRemove);
				}
			}
		}
		return lines.join('\n');
	}

	function refreshAllCodeHighlighting() {
		content.find('pre code').each(function(i, block) {
			refreshCodeHighlighting(block);
		});
	}

	function refreshCodeHighlighting(block) {
		/* I put everything in a div, so that when an enter is pressed it's not the <code> tag 
		 that the browser splits, but the div inside it. I also throw away all the existing style 
		 when reappling the coloring, otherwise it would get hopelessly complicated. */
		var codeText = block.innerText;
		codeText = removeUnnecessaryTabs(codeText);
		var container = contentDocument.createElement('div');
		container.setAttribute("class", "code-edit-linebreak");
		container.innerHTML = codeText;
		block.innerHTML = '';
		block.appendChild(container);
		hljs.highlightBlock(block);
	}

	function documentLoadedHandler() {
		contentDocument = document.getElementById('main-content-iframe').contentDocument;
		content = $(contentDocument.body);
		content.hide();

		// initialize the new content:

		commands.setDocument(contentDocument);
		selection.setDocument(contentDocument);

		//contentDocument.execCommand('enableObjectResizing', false, true);
		//contentDocument.execCommand('enableInlineTableEditing', false, true);

		editableToggle.triggerHandler('click');

		markIfContentModified();
		
		content.mousedown(contentMouseDownHandler);
		content.keydown(contentKeydownHandler);

		// hide the context menu on right click in edit mode:
		contentDocument.addEventListener('contextmenu', function(e) {
			if (content.attr("contenteditable") === 'true') {
		    	e.preventDefault();
		    }
		}, false);
	}

	function initDefaultStylesheets() {
		var meta1 = contentDocument.createElement('meta');
		meta1.setAttribute('name', 'viewport');
		meta1.setAttribute('content', 'initial-scale=1.0, user-scalable=no');
		var meta2 = contentDocument.createElement('meta');
		meta2.setAttribute('charset', 'utf-8');

		var stylesheet = contentDocument.createElement('link');
		stylesheet.onload = function() {
			defaultColorOption.attr('value', content.css('color'));
			content.show();
			content.focus();
		};
		stylesheet.type = 'text/css';
		stylesheet.rel = 'stylesheet';
		stylesheet.href = '/stylesheets/default.css';
		contentDocument.head.appendChild(stylesheet);

		var code_style = contentDocument.createElement('link');
		code_style.onload = function() { };
		code_style.type = 'text/css';
		code_style.rel = 'stylesheet';
		code_style.href = '/stylesheets/default_code.css';
		contentDocument.head.appendChild(code_style);
	}

	if (editedNoteName) {
		$("#main-content-iframe").attr('src', "notes/" + editedNoteName).load(function() {
			documentLoadedHandler();
			defaultColorOption.attr('value', content.css('color'));
			content.show();
			refreshAllCodeHighlighting(); // this has to run after .show(), because innerText interprets a </div> as a newline only if it was rendered as one
			content.focus();
		});
	} else { // new note
		documentLoadedHandler();
		initDefaultStylesheets();
	}
});

var commands = function createRichtextDocumentCommands() {

	var documentElement = null;

	var imgAlignStyle = {
		left: 'float: left;',
		right: 'float: right;',
		inline: 'display: inline;',
		block: 'display: block;'
	};

	return {
		// inserts:

		insertTable: function(colCount, rowCount, header) {
			rowCount = rowCount || 1;
			colCount = colCount || 1;

			var table = '<table>';
			if (header) {
				table += '<tr>';
				for (var j = 0; j < colCount; j++) {
					table += '<th></th>';
				}
				table += '</tr>';
			}
			for (var i = 0; i < rowCount; i++) {
				table += '<tr>';
				for (var j = 0; j < colCount; j++) {
					table += '<td></td>';
				}
				table += '</tr>';
			}
			table += '</table>';

			documentElement.execCommand('insertHTML', false, table);
		},
		insertImage: function(src, width, height, align) {

			var img = '<img src="' + src + '" style="' 
				+ (width ? ('width:' + width + ';') : '') 
				+ (height ? ('height:' + height + ';') : '') 
				+ imgAlignStyle[align] 
				+ '"/>';

			documentElement.execCommand('insertHTML', false, img);
		},
		insertOrderedList: function() {
			documentElement.execCommand('insertOrderedList', false, null);
		},
		insertUnorderedList: function() {
			documentElement.execCommand('insertUnorderedList', false, null);
		},
		insertTab: function() {
			/* This might not be a very elegant solution, but I've wasted way too many hours on this already... */
			documentElement.execCommand('insertHTML', false, '<span class="tab">_</span>');
			documentElement.getSelection().anchorNode.parentElement.innerHTML = '&#09;'
			documentElement.getSelection().modify("move", "forward", "character");
		},
		insertHorizontalRule: function() {
			documentElement.execCommand("insertHorizontalRule", false);
		},
		insertCodeBlock: function(language) {
			documentElement.execCommand('insertHTML', false, 
				'<pre><code class="hljs ' + language + '"><div class="code-edit-linebreak"> '
				+ '</div></code></pre><br/>');
			/* the cursor moves after the code block. I can't just check the anchorNode etc. 
			   there, because it might have moved into a next code block. After moving back 
			   now the cursor doesn't enter the div inside the code block... I tried forcing it in there
			   with a Range object but it was hopeless. Alternatively I could capture the
			   enter events and change them to shift+enter, but I wasn't succcessfull with that and I tried 
			   fifty different ways. So now I use an illegal div inside the code block with a temporary ' ' in it... 
			   I also create a newline after the code block, otherwise the user coulnd't "escape from it" if 
			   its the last element in the document. (but if a second code block is created on the inserted <br>, then
			   the only way to insert a pharagraph between them is the browser's code editor.) */

			documentElement.getSelection().modify("move", "backward", "character");
			documentElement.getSelection().modify("move", "backward", "character");
			documentElement.execCommand("forwardDelete", false, null);
		},
		insertText: function(text) {
			documentElement.execCommand('insertText', false, text);
		},

		// other:

		indent: function() {
			documentElement.execCommand('indent', false, null);
		},
		outdent: function() {
			documentElement.execCommand('outdent', false, null);	
		},
		textColor: function(colorString) {
			documentElement.execCommand('foreColor', false, colorString);
		},
		highlightColor: function(colorString) {
			documentElement.execCommand('hiliteColor', false, colorString);
		},
		fontSize: function(size) {
			documentElement.execCommand('fontSize', false, size);	
		},
		transformToBlock: function(tagName) {
			documentElement.execCommand('formatblock', false, tagName);	
		},
		clearFormatting: function() {
			documentElement.execCommand('removeFormat', false, null);
		},
		delete: function() {
			documentElement.execCommand('delete', false, null);	
		},
		toLink: function(url) {
			documentElement.execCommand('createLink', false, url);
		},
		unlink: function() {
			documentElement.execCommand('unlink', false, null);
		},
		undo: function() {
			documentElement.execCommand('undo', false, null);	
		},
		// setters:

		setDocument: function(document) {
			documentElement = document;
		}
	};
}();

var selection = function createRichtextDocumentSelection() {
	
	var documentElement = null;

	return {
		extend: function(direction, unit, count) {
			for (var i = 0; i < count; i++) {
				documentElement.getSelection().modify("extend", direction, unit);
			}
		},
		move: function(count) {
			for (var i = 0; i < Math.abs(count); i++) {
				documentElement.getSelection().modify("move", count > 0 ? "forward" : "backward", "character");
			}
		},
		collapseToStart: function() {
			documentElement.getSelection().collapseToStart();
		},
		collapseToEnd: function() {
			documentElement.getSelection().collapseToEnd();
		},

		// setters:

		setDocument: function(document) {
			documentElement = document;
		}
	};
}();

var isWhitespace = function() {
	var whitespace = new RegExp("\\s");
	return function(char) {
		return whitespace.test(char);
	};
}();

var isURL = function() {

	var tlds = [ "edu", "gov", "mil", "arpa", "aero", "asia", "biz", "cat", "com", "coop", 
				"info", "int", "jobs", "mobi", "museum", "name", "net", "org", "post",
				"pro", "tel", "travel", "xxx" ].join("|");
	var regex_hostname = "([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.){1,5}([a-zA-Z]{2}|(" + tlds + "))";
	var regex_ipv4 = "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}";
	var regex_string = "(http(s)?://)?(?:(" + regex_hostname + ")|(" + regex_ipv4 + "))(/.*?)?";

	var re = new RegExp("^" + regex_string + "$");
	var re_exception = new RegExp("^[a-zA-Z0-9]+\\.[a-zA-Z0-9]+$");

	return function(input) {
		return re.test(input) && !re_exception.test(input);
	};
}();

function saveNoteOnServer(successCallback, errorCallback) {

	var outputName = editedNoteName;

	function success(msg) {
		successCallback.call();
	}
	function failure(xhr, status, error) {
		console.log(status + ", " + xhr);
		errorCallback.call();
		throw error;
	}

	var mydocument = document.getElementById('main-content-iframe').contentDocument;
	var originalEditable = mydocument.body.getAttribute("contenteditable");
	mydocument.body.setAttribute("contenteditable", "false");
	var data = '<!DOCTYPE html>' + mydocument.documentElement.outerHTML;
	mydocument.body.setAttribute("contenteditable", originalEditable);

	$.ajax({
	  type: "PUT",
	  url: '/notes/' + outputName,
	  data: data,
	  success: success,
	  error: failure,
	  contentType: "text/plain; charset=UTF-8"
	});
}