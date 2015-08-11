editor.isURL = (function() {

	var tlds = [ "edu", "gov", "mil", "arpa", "aero", "asia", "biz", "cat", "com", "coop", 
				"info", "int", "jobs", "mobi", "museum", "name", "net", "org", "post",
				"pro", "tel", "travel", "xxx" ].join("|");
	var regex_hostname = "([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.){1,5}([a-zA-Z]{2}|(" + tlds + "))";
	var regex_ipv4 = "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}";
	var regex_string = "(http(s)?://)?(?:(" + regex_hostname + ")|(" + regex_ipv4 + "))(/.*?)?";

	var re = new RegExp("^" + regex_string + "$");
	var re_exception = new RegExp("^[a-zA-Z0-9]+\\.[a-zA-Z0-9]+$");

	return function(input) {
		return re.test(input) && !re_exception.test(input);
	};
})();