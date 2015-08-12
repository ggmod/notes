editor.buildCommands = function(documentElement, selection) {

	var imgAlignStyle = {
		left: 'float: left;',
		right: 'float: right;',
		inline: 'display: inline;',
		block: 'display: block;'
	};

	function buildImage(src, width, height, align) {
		var img = 
			'<img src="' + src + '" style="' +
			(width ? ('width:' + width + ';') : '')  +
			(height ? ('height:' + height + ';') : '') + 
			imgAlignStyle[align] +
			'"/>';
		return img;
	}

	function buildTable(colCount, rowCount, header) {
		rowCount = rowCount || 1;
		colCount = colCount || 1;

		var table = '<table>';

		if (header) {
			table += '<thead><tr>';
			for (var i = 0; i < colCount; i++) {
				table += '<th></th>';
			}
			table += '</tr></thead>';
		}

		table += '<tbody>';
		for (var j = 0; j < rowCount; j++) {
			table += '<tr>';
			for (var k = 0; k < colCount; k++) {
				table += '<td></td>';
			}
			table += '</tr>';
		}
		table += '</tbody>';

		table += '</table>';
		return table;
	}

	function getCurrentBlock() {
		var block = documentElement.getSelection().anchorNode;
		while (!(block.style && window.getComputedStyle(block).display === 'block')) {
			block = block.parentNode;
		}
		return block;
	}

	return {
		// inserts:

		insertTable: function(colCount, rowCount, header) {
			var table = buildTable(colCount, rowCount, header);
			documentElement.execCommand('insertHTML', false, table);
		},
		insertImage: function(src, width, height, align) {
			var img = buildImage(src, width, height, align);
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
			documentElement.getSelection().anchorNode.parentElement.innerHTML = '&#09;';
			documentElement.getSelection().modify('move', 'forward', 'character');
		},
		insertHorizontalRule: function() {
			documentElement.execCommand('insertHorizontalRule', false);
		},
		insertCodeBlock: function(language) {
			documentElement.execCommand('insertHTML', false,
				'<pre><code class="hljs ' + language + '"><div class="code-edit-linebreak"> ' +
				'</div></code></pre><br/>');
			// TODO find a more elegant solution
			documentElement.getSelection().modify('move', 'backward', 'character');
			documentElement.getSelection().modify('move', 'backward', 'character');
			documentElement.execCommand('forwardDelete', false, null);
		},
		insertText: function(text) {
			documentElement.execCommand('insertText', false, text);
		},

		// delete:
		removeCurrentBlock: function() { // current line or pharagraph
			var block = getCurrentBlock();
			selection.selectElement(block);
			documentElement.execCommand('delete', false, null);
			 // delete only removes the innerHTML and then inserts a <br>. Seriously
			documentElement.execCommand('forwardDelete', false, null);
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
		}
	};
};