editor.buildCodeHighlighter = function(contentDocument, content) {

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

	var xmlEscape = {
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;'
	};

	function refreshCodeHighlighting(block) {
		/* I put everything in a div, so that when an enter is pressed it's not the <code> tag 
		 that the browser splits, but the div inside it. I also throw away all the existing style 
		 when reappling the coloring, otherwise it would get hopelessly complicated. */
		var codeText = block.innerText;
		codeText = removeUnnecessaryTabs(codeText);
		codeText = codeText.replace(/(<)|(>)|(&)/g, function(match) {
			return xmlEscape[match];
		});
		var container = contentDocument.createElement('div');
		container.setAttribute('class', 'code-edit-linebreak');
		container.innerHTML = codeText;
		block.innerHTML = '';
		block.appendChild(container);
		hljs.highlightBlock(block); // jshint ignore:line
	}

	return {
		refresh: refreshCodeHighlighting,
		refreshAll: refreshAllCodeHighlighting
	};
};