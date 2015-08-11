editor.buildDialogTypes = function (contentDocument, editedNoteName, commands, infobox, editorService) {
	
	var imageDialog = $('#editor-dialog-image');
	var tableDialog = $('#editor-dialog-table');
	var imageSrc = $('#editor-dialog-image-src');
	var imageWidth = $('#editor-dialog-image-width');
	var imageHeight = $('#editor-dialog-image-height');
	var imageAlign = $('#editor-dialog-image-align');
	var tableCol = $('#editor-dialog-table-columns');
	var tableRow = $('#editor-dialog-table-rows');
	var tableHeader = $('#editor-dialog-table-header');
	var titleDialog = $('#editor-dialog-notetitle');
	var titleInput = $('#editor-dialog-notetitle-title');

	return { 
		image: {
			panel: imageDialog,
			title: 'Insert Image',
			submit: function() {
				commands.insertImage(imageSrc.val(), imageWidth.val(), imageHeight.val(), imageAlign.val());
			}
		},
		table: {
			panel: tableDialog,
			title: 'Insert Table',
			submit: function() {
				commands.insertTable(tableCol.val(), tableRow.val(), tableHeader.is(':checked'));
			}
		},
		title: {
			panel: titleDialog,
			title: 'Note properties',
			submit: function() {
				if (!titleInput.val() || titleInput.val().trim().length === 1) {
					infobox.error('The name of the note cannot be empty.');
					return false;
				} else {
					editor.editedNoteName = titleInput.val();
					contentDocument.title = editedNoteName;
					editorService.saveNote();
					return true;
				}
			}
		}
	};
};