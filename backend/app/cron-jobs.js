var cron = require('cron');
var EasyZip = require('easy-zip').EasyZip;
var config = require('../config.json');


var cronJob = cron.job('0 0 5 * * 0', function() { // every Sunday 5:00 AM
	zipAndBackupNotes();
}); 

function zipAndBackupNotes() {

	var zipper = new EasyZip();
	zipper.zipFolder(config.NOTES_PATH, function() {
		zipper.writeToFile(config.NOTES_BACKUP_ZIPPED_PATH +
			'/notes-backup-' + new Date().toLocaleString('hu').replace(/\W+/g, '-') + '.zip');

		console.log('Successfully backed up all the notes. ' + new Date());
	});
}

exports.start = function() {
	cronJob.start();
};