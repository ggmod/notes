exports.endsWith = function(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

exports.startsWith = function(str, prefix) {
	return str.indexOf(prefix) === 0;
};