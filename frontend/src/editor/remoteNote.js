editor.buildRemoteNote = function(contentDocument, editedNoteName, noteConverter) {
	
	return {
		save: function(successCallback, errorCallback) {

			var data = noteConverter.getHtmlContent();

			$.ajax({
				type: 'PUT',
				url: '/notes/' + editedNoteName + '/content',
				data: data,
				success: successCallback,
				error: function (xhr, status, error) {
					console.log(status + ', ' + xhr);
					errorCallback.call();
					throw error;
				},
				contentType: 'text/plain; charset=UTF-8'
			});
		}
	};
};