var config = require('../config.json');
var fs = require('fs');
var utils = require('./utils.js');
var filterService = require('./search/filter-service.js');

// I use Sync versions intentionally everywhere: It's a single user app and the code is much cleaner this way.


// paths -> metadata

function getFileMetadata(folder, file_name) {
	var stat = fs.statSync(folder + '/' + file_name);
	return { 
		name: file_name.substr(0, file_name.length - 5),
		size: stat.size,
		mtime: stat.mtime.getTime()
	};
}

function fileNames2Metadata(fileNames, folder) {
	return fileNames.map(function(file_name) {
			return getFileMetadata(folder, file_name);
		}).sort(function(note1, note2) {
			return note2.mtime - note1.mtime;
		});
}

// file path converters:

function getBackupFilePath(note_id, index) {
	return config.NOTES_BACKUP_PATH + '/' + note_id + '__' + index + '.html';
}

function getFilePathFromNoteId(note_id) {
	return config.NOTES_PATH + '/' + note_id + '.html';
}

function getIndexFromBackupFileName(file_name) {
	return file_name.substr(file_name.lastIndexOf('__') + 2);
}

// API for metadata / paths

exports.get = function(node_id) {
	return getFileMetadata(config.NOTES_PATH, node_id + '.html');
};

exports.getPath = function(note_id) {
	return getFilePathFromNoteId(note_id);
};

exports.getBackupPath = function(note_id, backup_index) {
	return getBackupFilePath(note_id, backup_index);
};

exports.queryAll = function() {
	var fileNames = fs.readdirSync(config.NOTES_PATH)
		.filter(function(file_name) {
			return utils.endsWith(file_name, '.html');
		});
	return fileNames2Metadata(fileNames, config.NOTES_PATH);
};

exports.queryByFilter = function(filterConfig) {
	var fileNames = fs.readdirSync(config.NOTES_PATH);

	fileNames = fileNames.filter(function(file_name) {
			return utils.endsWith(file_name, '.html');
		});

	if (filterConfig.titleFilter) {
		var titleFilter = filterConfig.titleFilter.trim().toUpperCase();

		fileNames = fileNames.filter(function(file_name) {
			return file_name.toUpperCase().indexOf(titleFilter) >= 0;
		});
	}

	if (filterConfig.filter) {
		fileNames = filterService.filterNotesByContent(fileNames, filterConfig);
	}
	return fileNames2Metadata(fileNames, config.NOTES_PATH);
};

exports.queryBackups = function(note_id) {
	var fileNames = fs.readdirSync(config.NOTES_BACKUP_PATH)
		.filter(function(file_name) {
			return utils.endsWith(file_name, '.html') && utils.startsWith(file_name, note_id + '__');
		});
	return fileNames2Metadata(fileNames, config.NOTES_BACKUP_PATH);
};

// handling note content:

// a note has NOTES_BACKUP_FILE_COUNT number of backups, the oldest one is overwritten with every save
function getBackupOfNoteToOverwrite(note_id) {
	var backupFilesMetadata = exports.queryBackups(note_id); // sorted by mtime reversed
	if (backupFilesMetadata.length === 0) {
		return getBackupFilePath(note_id, 1);
	} else if (backupFilesMetadata.length < config.NOTES_BACKUP_FILE_COUNT) {
		return getBackupFilePath(note_id, backupFilesMetadata.length + 1);
	} else {
		var backup_index = getIndexFromBackupFileName(backupFilesMetadata[backupFilesMetadata.length - 1].name);
		return getBackupFilePath(note_id, backup_index);
	}
}

exports.saveContent = function(note_id, content) {
	fs.writeFileSync(getFilePathFromNoteId(note_id), content);
	var backupPath = getBackupOfNoteToOverwrite(note_id);
	fs.writeFileSync(backupPath, content);
};