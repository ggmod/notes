var editor = {};

editor.utils = {
	getQueryParams: function() {
		var params = {};
		window.location.search.substr(1).split('&')
			.forEach(function(item) {
				var param = item.split('=');
				params[param[0]] = param[1];
			});
		return params;
	}
};

editor.contentDocument = null;
editor.content = null; // body
editor.editedNoteName = editor.utils.getQueryParams().note;

editor.globals = {
	triggeredByShortcut: false,
	shortcutCallback: function() {}
};

editor.init = function() {
	
	editor.infobox = editor.buildInfobox();
	editor.selection = editor.buildSelection(editor.contentDocument);
	editor.commands = editor.buildCommands(editor.contentDocument, editor.selection);
	editor.noteConverter = editor.buildNoteConverter(editor.contentDocument);
	editor.remoteNote = editor.buildRemoteNote(editor.contentDocument, editor.editedNoteName, editor.noteConverter);
	editor.codeHighlighter = editor.buildCodeHighlighter(editor.contentDocument, editor.content);

	editor.contextMenu = editor.buildContextMenu(editor.contentDocument, editor.content, editor.commands);
	editor.registerContextMenu(editor.content, editor.contextMenu);
	
	editor.components = {};
	editor.service = editor.buildEditorService(editor.contentDocument, editor.content, editor.remoteNote, editor.infobox, editor.components);
	var dialogTypes = editor.buildDialogTypes(editor.contentDocument, editor.editedNoteName, editor.commands, editor.infobox, editor.service);
	editor.components.dialogs = editor.buildDialogs(dialogTypes, editor.globals, editor.content);
	editor.components.menu = editor.buildMenu(editor.content, editor.editedNoteName, editor.service, editor.components);
	
	editor.shortcuts = editor.buildShortcuts(editor.content, editor.globals, editor.commands, editor.components);
	editor.buildContentKeyHandler(editor.contentDocument, editor.content, editor.globals, editor.commands, editor.selection, 
		editor.codeHighlighter, editor.isURL, editor.shortcuts, editor.contextMenu, editor.components);

	editor.service.init();
};

$(function() {
	if (editor.editedNoteName) {
		$('#main-content-iframe').attr('src', 'notes/' + editor.editedNoteName + '/content').load(function() {
			editor.contentDocument = $('#main-content-iframe')[0].contentDocument;
			editor.content = $(editor.contentDocument.body);
			editor.init();
			//codeHighlighter.refreshAll(); // this has to run after .show(), because innerText interprets a </div> as a newline only if it was rendered as one
			editor.content.focus();
		});
	} else { // new note
		editor.contentDocument = $('#main-content-iframe')[0].contentDocument;
		editor.content = $(editor.contentDocument.body);
		editor.init();
		editor.content.focus();
		
		editor.noteConverter.addHtmlHeaders(function() {
			// content.focus(); FIXME why was this needed?
		});
	}
});