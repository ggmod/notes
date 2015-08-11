editor.buildEditorService = function(contentDocument, content, remoteNote, infobox, components) {

	function saveNote() {
		remoteNote.save(function() {
			components.menu.saveButton.hide();
			markIfContentModified();
			infobox.info('Successfully saved the note');
		}, function() {
			infobox.error('Couldn\'t save the note on the server.');
		});
	}

	function markIfContentModified() {
		content.keydown(function(event) {
			if (content.attr('contenteditable') === 'true') {
				if (!event.ctrlKey && !(
					(event.which >= 14 && event.which <= 31) ||
					(event.which >= 33 && event.which <= 45) ||
					(event.which >= 91 && event.which <= 93)  ||
					(event.which >= 112 && event.which <= 145))) {

					components.menu.saveButton.show();
					$(this).unbind(event);
				}
			}
		});	
	}

	window.onbeforeunload = function(e) {
		if (components.menu.saveButton.is(':visible')) {
			e = e || window.event;
			var message = 'You have unsaved changes.';
			if (e) {
				e.returnValue = message;
			}
			return message;
		}
	};

	document.addEventListener('contextmenu', function(e) {
			if (content.attr('contenteditable') === 'true') {
		    	e.preventDefault();
		    }
		}, false);

	function init() {
		//contentDocument.execCommand('enableObjectResizing', false, true);
		//contentDocument.execCommand('enableInlineTableEditing', false, true);

		components.menu.editableToggle.triggerHandler('click');

		markIfContentModified();
		
		// hide the context menu on right click in edit mode:
		contentDocument.addEventListener('contextmenu', function(e) {
			if (content.attr('contenteditable') === 'true') {
		    	e.preventDefault();
		    }
		}, false);
	}

	return {
		saveNote: saveNote,
		init: init
	};
};