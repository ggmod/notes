editor.buildDialogs = function(dialogTypes, globals, content) {

	var dialogContainer = $('#editor-dialog-container');
	var dialogCover = $('#editor-dialog-cover');
	var dialogElement = $('#editor-dialog');
	var dialogTitle = $('#editor-dialog-header-text');
	var dialogSubmit = $('#editor-dialog-submit');
	var dialogCancel = $('#editor-dialog-cancel');
	var dialogClose = $('#editor-dialog-header-x');
	var currentType = null;

	Object.keys(dialogTypes).forEach(function (key) {
		var focusable = dialogTypes[key].panel.find('input,select,button');
		dialogTypes[key].initialFocus = focusable[0];
	});

	function centerDialog() {
		dialogElement.css('left', (window.innerWidth - dialogElement.width())/2 );
		dialogElement.css('top', (window.innerHeight - dialogElement.height())/2 );
	}

	$(window).resize(centerDialog);

	function closeDialog() {
		globals.triggeredByShortcut = false;
		dialogContainer.hide();
		content.focus();
	}

	dialogCover.click(function() {
		closeDialog();
	});
	dialogClose.click(function() {
		closeDialog();
	});
	dialogCancel.click(function() {
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
				if (!event.shiftKey && dialogCancel.is(':focus')) {
					dialogTypes[currentType].initialFocus.focus();
					return false;
				} else if (event.shiftKey && $(dialogTypes[currentType].initialFocus).is(':focus'))  {
					dialogCancel.focus();
					return false;
				}
				break;
		}
	});

	dialogSubmit.click(function() {
		if (globals.triggeredByShortcut) {
			globals.shortcutCallback.call();
			globals.triggeredByShortcut = false;
		}

		var valid = dialogTypes[currentType].submit.call();
		if (valid === true || typeof valid === 'undefined') {
			dialogContainer.hide();
			content.focus();
		}
	});

	function hideOtherDialogs(currentType) {
		Object.keys(dialogTypes).forEach(function (key) {
			if (key === currentType) {
				dialogTypes[key].panel.show();
			} else {
				dialogTypes[key].panel.hide();
			}
		});
	}

	return {
		open: function(type) {
			currentType = type;
			hideOtherDialogs(currentType);
			centerDialog();
			dialogTitle.text(dialogTypes[currentType].title);
			dialogElement.find('input').val('');
			dialogElement.find('select').val('');
			dialogContainer.fadeIn(200);
			dialogTypes[currentType].initialFocus.focus();
		},
	};
};