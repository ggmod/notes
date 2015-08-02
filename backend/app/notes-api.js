var noteService = require('./notes-service.js');

module.exports = function (router) {
	
	router.route('/notes')
		.get(function(req, res) {
			if (req.query.textFilter) {
				res.send(noteService.queryByText(req.query.textFilter, req.query.ignoreCase === 'true'));
			} else if (req.query.regexFilter) {
				res.send(noteService.queryByRegex(req.query.regexFilter, req.query.ignoreCase === 'true'));
			} else if (req.query.titleFilter) {
				res.send(noteService.queryByTitle(req.query.titleFilter));
			} else {
				res.send(noteService.queryAll());
			}
		});

	router.route('/notes/:id')
		.get(function(req, res) {
			res.send(noteService.get(req.params.id));
		});

	router.route('/notes/:id/content')
		.get(function(req, res) {
			res.sendfile(noteService.getPath(req.params.id));
		})
		.put(function(req, res) { // expects text/plain (not text/html)
			noteService.saveContent(req.params.id, req.body);
			res.send(200);
		});

	router.route('/notes/:id/backups')
		.get(function(req, res) {
			res.send(noteService.queryBackups(req.params.id));
		});

	router.route('/notes/:note_id/backups/:backup_index')
		.get(function(req, res) {
			res.sendfile(noteService.getBackupPath(req.params.note_id, req.params.backup_index));
		});
};