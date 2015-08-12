editor.buildMenu = function(content, editedNoteName, editorService, components) {

	var editableToggle = $('#editable-toggle');
	var saveButton = $('#save-button');
	var helpButton = $('#help-button');

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
			components.dialogs.open('title');
		}
	});

	helpButton.click(function() {
		$('.editor-help').toggle();
	});

	return {
		helpButton: helpButton,
		editableToggle: editableToggle,
		saveButton: saveButton
	};
};