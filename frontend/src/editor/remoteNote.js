editor.buildRemoteNote = function(contentDocument, editedNote, noteConverter) {
	
	return {
		save: function(successCallback, errorCallback) {

			var data = noteConverter.getHtmlContent();

			$.ajax({
				type: 'PUT',
				url: '/notes/' + editedNote.name + '/content',
				data: data,
				success: successCallback,
				error: function (xhr, status, error) {
					console.log(status + ', ' + xhr);
					errorCallback.call();
					throw error;
				},
				contentType: 'text/plain; charset=UTF-8'
			});
		},
		getMetadata: function(name, successCallback, errorCallback) {
			$.get('/notes/' + name)
				.done(successCallback)
				.fail(errorCallback);
		}
	};
};