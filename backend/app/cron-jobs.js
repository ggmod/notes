var cron = require('cron');
var config = require('../config.json');
var osenv = require('osenv');
var exec = require('child_process').exec;


var cronJob = cron.job('0 0 16 * * 0', function() { // every Sunday at 4:00 PM
	zipAndBackupNotes();
}); 

function zipAndBackupNotes() {
	console.log(new Date().toISOString(), 'Backup process started');

	var folderName = osenv.home() + '/' + config.NOTES_PATH;
	var outputFileName = osenv.home() + '/' + config.NOTES_BACKUP_ZIPPED_PATH +
		'/notes-backup-' + new Date().toISOString().replace('T', '_').slice(0, -1) + '.zip';

	exec('cd ' + folderName + '; zip -r ' + outputFileName + ' . ; cd -', function(error, stdout, stderr) {
		if (error) {
			console.log(new Date().toISOString(), 'Failed to back up notes.', stderr);
		} else {
			console.log(new Date().toISOString(), 'Successfully backed up all the notes.');
		}
	});
}

exports.start = function() {
	cronJob.start();
};