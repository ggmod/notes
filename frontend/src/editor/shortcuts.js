editor.buildShortcuts = function (content, globals, commands, components) {

	function handleShortcutTrigger() {
		if (globals.triggeredByShortcut) {
			globals.triggeredByShortcut = false;
			globals.shortcutCallback.call();
		}
	}

	function createHeader(level) {
		handleShortcutTrigger();
		commands.transformToBlock('h' + level);
	}

	function insertOrderedList() {
		handleShortcutTrigger();
		commands.insertOrderedList();
		content.focus();
	}

	function insertUnorderedList() {
		handleShortcutTrigger();
		commands.insertUnorderedList();
		content.focus();
	}

	function insertImage() {
		components.dialogs.open('image');
	}
	
	function insertTable() {
		components.dialogs.open('table');
	}

	return {
		img: insertImage,
		ol: insertOrderedList,
		ul: insertUnorderedList,
		table: insertTable,
		h1: function() { createHeader(1); },
		h2: function() { createHeader(2); },
		h3: function() { createHeader(3); },
		h4: function() { createHeader(4); },
		h5: function() { createHeader(5); },
		h6: function() { createHeader(6); }
	};
};