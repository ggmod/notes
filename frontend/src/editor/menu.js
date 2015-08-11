editor.buildMenu = function(content, editedNoteName, dialogs, commands, globals, editorService) {

	var editableToggle = $('#editable-toggle');
	var saveButton = $('#save-button');


	editableToggle.click(function() {
		if (content.attr('contenteditable') === 'true') {
			content.attr('contenteditable', 'false');
			editableToggle.removeClass('on');
			editableToggle.addClass('off');
		} else {
			content.attr('contenteditable', 'true');
			editableToggle.removeClass('off');
			editableToggle.addClass('on');
			content.focus();
		}
	});

	saveButton.click(function() {
		if (editedNoteName) {
			editorService.saveNote();
		} else {
			dialogs.open('title');
		}
	});

	return {
		editableToggle: editableToggle,
		saveButton: saveButton
	};
};