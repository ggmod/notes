editor.buildNoteConverter = function(contentDocument) {

	function getHtmlContent() {
		var originalEditable = contentDocument.body.getAttribute('contenteditable');
		contentDocument.body.setAttribute('contenteditable', 'false');
		var data = '<!DOCTYPE html>' + contentDocument.documentElement.outerHTML;
		contentDocument.body.setAttribute('contenteditable', originalEditable);
		return data;
	}

	function addHtmlHeaders(defaultStylesheetLoaded) {
		var meta1 = contentDocument.createElement('meta');
		meta1.setAttribute('name', 'viewport');
		meta1.setAttribute('content', 'initial-scale=1.0, user-scalable=no');
		contentDocument.head.appendChild(meta1);
		
		var meta2 = contentDocument.createElement('meta');
		meta2.setAttribute('charset', 'utf-8');
		contentDocument.head.appendChild(meta2);

    	var faviconLink = contentDocument.createElement('link');
    	faviconLink.setAttribute('rel', 'shortcut icon');
    	faviconLink.setAttribute('href', 'data:image/x-icon;,');
    	faviconLink.setAttribute('type', 'image/x-icon');
    	contentDocument.head.appendChild(faviconLink);
    	
		var stylesheet = contentDocument.createElement('link');
		stylesheet.onload = defaultStylesheetLoaded;
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

	return {
		addHtmlHeaders: addHtmlHeaders,
		getHtmlContent: getHtmlContent
	};	
};