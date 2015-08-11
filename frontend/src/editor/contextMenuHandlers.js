editor.registerContextMenu = function(content, contextMenu) {

	function contentMouseDownHandler (event) {

		if (event.which === 3 && content.attr('contenteditable') === 'true') {

			contextMenu.init();

			contextMenu.element.css('left', event.clientX);
			if (contextMenu.element.height() > window.innerHeight - event.clientY) {
				contextMenu.element.css('top', event.clientY - contextMenu.element.height());
			} else {
				contextMenu.element.css('top', event.clientY);
			}
			contextMenu.element.show();

			contextMenu.focus();

			//event.preventDefault();
			return false;
		} else {
			if (contextMenu.element.is(':visible')) {
				contextMenu.element.hide();
			}
		}
	}

	var menuFocusItems = contextMenu.element.find('.contextmenu-focus');

	function editorKeydownHandler (event) {
		var contextMenuElement = contextMenu.element;

		switch(event.which) {
			case 38: // up
				if (contextMenuElement.is(':visible')) {
					var index = menuFocusItems.index(document.activeElement);
					menuFocusItems[index === 0 ? menuFocusItems.length - 1 : index - 1].focus();
					return false;
				}
				break;
			case 40: // down
				if (contextMenuElement.is(':visible')) {
					var focusIndex = menuFocusItems.index(document.activeElement);
					menuFocusItems[focusIndex === menuFocusItems.length - 1 ?  0 : focusIndex + 1].focus();
					return false;
				}
				break;
			case 27: // esc
				if (contextMenuElement.is(':visible')) {
					contextMenuElement.hide();
					content.focus();
				}
				break;
			case 13: // enter
				if (contextMenuElement.is(':visible')) {
					contextMenuElement.hide();
					content.focus();
				}
				break;
		}
	}

	content.mousedown(contentMouseDownHandler); // click only works for left mouse button
	$(document).keydown(editorKeydownHandler);
};