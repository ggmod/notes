$(function() {
	
	var previewIframe = $('#note-preview-iframe');
	var newNoteButton = $('#new-note-button');
	var editNoteButton = $('#edit-note-button');
	var titleFilterInput = $('#title-filter-input');
	var contentFilterInput = $('#content-filter-input');
	var matchCaseInput = $('#match-case-input');
	var filterCounter = $('#note-filter-counter');
	var noteList = $('#notelist-list');
	var filterButton = $('#filter-search-button');

	var previewContainer = $('#note-preview-container');
	var sidebarContainer = $('#notelist-container');
	var topbarContainer = $('#notelist-toppanel');

	var notes = [];
	var selectedNoteLi = null;

	newNoteButton.click(function() {
		window.open('editor.html', '_blank');
	});

	editNoteButton.hide();
	
	editNoteButton.click(function() {
		var noteName = selectedNoteLi.attr('data-note-id');
		var href = 'editor.html?note=' + noteName;
		window.open(href, '_blank');
	});

	noteList.on('click', 'li', function() {
		selectedNoteLi.removeClass('selected');
		selectedNoteLi = $(this);
		selectedNoteLi.addClass('selected');

		var name = selectedNoteLi.attr('data-note-id');
		if (previewIframe.attr('src') !== 'notes/' + name + '/content') { // avoid unnecessary reload flickering
			previewIframe.attr('src', 'notes/' + name + '/content');
		}

		editNoteButton.show();
	});

	filterButton
		.on('click', function(event) {
			loadNoteList();
			event.preventDefault();
		}).on('keydown', function(event) {
			if (event.keyCode === 9 && !event.shiftKey) {
				titleFilterInput.focus();		
				event.preventDefault();		
			}
		});

	titleFilterInput.on('keydown', function(event) {
		if (event.keyCode === 40) { // down
			if (selectedNoteLi) {
				selectedNoteLi.next().click();
			} else {
				noteList.find('li:nth-child(1)').click();
			}
			event.preventDefault();
			return false;
		}
		if (event.keyCode === 38) { // up
			if (selectedNoteLi) {
				selectedNoteLi.prev().click();
			} else {
				noteList.find('li:nth-child(1)').click();
			}
			event.preventDefault();
			return false;
		}
		if (event.keyCode === 9 && event.shiftKey) {
			filterButton.focus();
			event.preventDefault();		
		}
	});

	$(document).keydown(function(event) {
		if (event.keyCode === 69 && event.ctrlKey) { // ctrl + e
			if (editNoteButton.is(':visible')) {
				editNoteButton.click();
				event.preventDefault();
				return false;
			}
		}
		if (event.keyCode === 81 && event.ctrlKey) { // ctrl + q
			newNoteButton.click();
		}
	});

	function noteListLoaded(loaded_notes) {
		notes = loaded_notes;

		noteList.html('');
		notes.forEach(function(note) {
			noteList.append(noteToListItem(note));
		});

		if (notes.length > 0) {
			selectedNoteLi = noteList.find('li:nth-child(1)');
			selectedNoteLi.click();
		} else {
			selectedNoteLi = null;
			editNoteButton.hide();
			previewIframe.attr('src', '');
		}

		filterCounter.text('Notes: ' + loaded_notes.length);
	}

	function noteListLoadError(xhr, status, error) {
		console.log(status + ', ' + xhr);
		throw error;
	}

	function recalculateSizes() {
		previewContainer.width(window.innerWidth - sidebarContainer.width());
		previewContainer.height(window.innerHeight - topbarContainer.height());

		sidebarContainer.height(window.innerHeight - topbarContainer.height());
	}

	function getQueryParams() {

		var titleFilter = titleFilterInput.val().trim();
		var contentFilter = contentFilterInput.val().trim();
		var ignoreCase = !matchCaseInput.is(':checked');
		var regex = false; // TODO use regex (backend already supports it)

		var queryParams = {};
		if (titleFilter) {
			queryParams.titleFilter = titleFilter;
		}
		if (contentFilter) {
			queryParams.filter = contentFilter;
			queryParams.ignoreCase = ignoreCase;
			queryParams.regex = regex;
		}
		return queryParams;
	}

	function loadNoteList() {
		var queryParams = getQueryParams();
		var queryString = '?' + Object.keys(queryParams).map(function(filterName) {
			 return filterName + '=' + queryParams[filterName];
		}).join('&');

		$.ajax({
			url: '/notes' + queryString,
			type: 'GET',
			success: noteListLoaded,
			error: noteListLoadError,
			dataType: 'json'
		});
	}

	function noteToListItem(note) {
		var li = '<li data-note-id="' + note.name + '">' +
			'<span class="note-title">' + note.name + '</span>' +
			'<span class="note-size">' + Math.floor(note.size/1024) + ' kB</span>' +
			'<span class="note-mtime">' + formatDate(note.mtime) + '</span>' +
			'</li>';
		return $(li);
	}

	function formatDate(timestamp) {

		function withOptionalZero(number) {
			return number < 10 ? '0' + number : number;
		}

		var d = new Date(timestamp);
		return d.getFullYear()  + '.' + withOptionalZero(d.getMonth() + 1) + '.' + withOptionalZero(d.getDate()) + '. ' +
			withOptionalZero(d.getHours()) + ':' + withOptionalZero(d.getMinutes());
	}

	recalculateSizes();
	$(window).resize(recalculateSizes);

	titleFilterInput.focus();
	loadNoteList();
});
