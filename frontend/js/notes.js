$(function() {
	var notelistPage = $("#notelist-page");
	var previewIframe = $("#note-preview-iframe");
	var newNoteButton = $("#new-note-button");
	var editNoteButton = $("#edit-note-button");
	var filterInput = $("#note-filter-input");
	var filterCounter = $("#note-filter-counter");
	var noteList = $("#notelist-list");

	var previewContainer = $("#note-preview-container");
	var sidebarContainer = $("#notelist-container");
	var topbarContainer = $("#notelist-toppanel");

	var notes = [];
	var selectedNoteLi = null;

	newNoteButton.click(function(event) {
		window.open('editor.html', '_blank');
	});

	editNoteButton.hide();
	
	editNoteButton.click(function(event) {
		var noteName = selectedNoteLi.attr("data-note-id");
		var href = 'editor.html?note=' + noteName;
		window.open(href, '_blank');
	});

	noteList.on('click', 'li', function(event) {
		selectedNoteLi.removeClass('selected');
		selectedNoteLi = $(this);
		selectedNoteLi.addClass('selected');

		var name = selectedNoteLi.attr("data-note-id");
		if (previewIframe.attr('src') !== "notes/" + name + "/content") { // avoid unnecessary reload flickering
			previewIframe.attr('src', "notes/" + name + "/content");
		}

		editNoteButton.show();
	});

	var filterTimeout = null;

	filterInput.on('input', function(event) {
		var filtered = notes;
		if ($(this).val()) {
			var filterText = $(this).val().trim();

			// filtered = notes.filter(function(note) {
			// 	return note.name.toUpperCase().indexOf(filterText) !== -1;
			// });
			$.ajax({
				url: '/notes?textFilter=' + filterText,
				type: 'GET',
				success: noteListLoaded,
				error: noteListLoadError,
				dataType: "json"
			});
		}

		clearTimeout(filterTimeout);
		filterTimeout = setTimeout(function() {
			applyFilter(filtered);
		}, 250);

	});

	function applyFilter(filtered) {

		noteList.html('');
		filtered.forEach(function(note) {
			noteList.append(noteToListItem(note));
		});

		if (filtered.length > 0) {
			selectedNoteLi = noteList.find('li:nth-child(1)');
			selectedNoteLi.click();
		} else {
			selectedNoteLi = null;
			editNoteButton.hide();
			previewIframe.attr('src', "");
		}

		filterCounter.text("Notes: " + filtered.length + "/" + notes.length);
	}

	filterInput.on('keydown', function(event) {
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
	});

	$(document).keydown(function(event) {
		if (event.keyCode === 69 && event.ctrlKey) { // ctrl + e
			if (editNoteButton.is(':visible')) {
				editNoteButton.click();
			}
		}
		if (event.keyCode === 81 && event.ctrlKey) { // ctrl + q
			newNoteButton.click();
		}
	});

	function noteListLoaded(loaded_notes) {
		notes = loaded_notes;

		notes.forEach(function(note) {
			noteList.append(noteToListItem(note));
		});

		if (notes.length > 0) {
			selectedNoteLi = noteList.find('li:nth-child(1)');
			selectedNoteLi.click();
		} else {
			selectedNoteLi = null;
		}

		filterCounter.text("Notes: " + notes.length);
	}

	function noteListLoadError(xhr, status, error) {
		console.log(status + ", " + xhr);
		throw error;
	}

	$.ajax({
		url: '/notes',
		type: 'GET',
		success: noteListLoaded,
		error: noteListLoadError,
		dataType: "json"
	});


	function recalculateSizes() {
		previewContainer.width(window.innerWidth - sidebarContainer.width());
		previewContainer.height(window.innerHeight - topbarContainer.height());

		sidebarContainer.height(window.innerHeight - topbarContainer.height());
	}

	recalculateSizes();
	$(window).resize(recalculateSizes);

	filterInput.focus();
});

function noteToListItem(note) {
	var li = '<li data-note-id="' + note.name + '">'
		+ '<span class="note-title">' + note.name.replace(/_/g, ' ') + '</span>'
		+ '<span class="note-size">' + Math.floor(note.size/1024) + ' kB</span>'
		+ '<span class="note-mtime">' + formatDate(note.mtime) + '</span>'
		+ '</li>'
	return $(li);
}

function formatDate(timestamp) {

	function withOptionalZero(number) {
		return number < 10 ? '0' + number : number;
	}

	var d = new Date(timestamp);
	return d.getFullYear()  + "." + withOptionalZero(d.getMonth() + 1) + "." + withOptionalZero(d.getDate()) + ". "
		+ withOptionalZero(d.getHours()) + ":" + withOptionalZero(d.getMinutes());
}