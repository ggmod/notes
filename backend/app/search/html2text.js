// TODO optimize, use C?
// https://www.npmjs.com/package/html-to-text is not what I need, and I couln't find any alternatives
// this is far from a comprehensive solution, and it's not even obvious how some things should be handled, like when to merge multiple newlines.

// from http://www.w3.org/TR/html5/syntax.html#named-character-references
var html5namedCharacters = require('./named_refs.json'); 

// https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements incomplete list:
var newLineTags = [ 'br', 'div', 'p', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'form', 'table', 'ul', 'ol', 'pre', 'video', 'audio', 'canvas', 'blockquote'];

isNewLineTag = {};
newLineTags.forEach(function(tag) {
	isNewLineTag[tag] = true;
});


function getTextOfHTML(html) {
	var text = '';
	var buffer = '';
	
	var currentTag = null;
	var currentAttributeName = null;

	var is_in_pre = false;

	var state = 'text'; // "enum"

	for (var i = 0; i < html.length; i++) {
		var c = html[i];

		if (state === 'text') {
			if (c === '<') {
				state = 'tag_start';
				currentTag = null;
			} else if (c === '&') {
				state = 'escaped_char';
				buffer = c;
			} else if (!is_in_pre && /\s/.test(c)) {
				if (text.length > 0 && !/\s/.test(text[text.length - 1])) {
					text += ' ';
				}
			} else {
				text += c;
			}
		} else if (state === 'escaped_char') {
			if (c === ';') {
				state = 'text';
				buffer += ';';
				processEscapedCharacter(buffer);
			} else {
				buffer += c;
			}
		} else if (state === 'tag_start') {
			if (c === '/') {
				state = 'end_tag_name';
				buffer = '';
			} else {
				state = 'start_tag_name';
				buffer = c;
			}
		} else if (state === 'end_tag_name') {
			if (c === '>') {
				state = 'text';
				processEndTag(buffer);
			} else {
				buffer += c;
			}
		} else if (state === 'start_tag_name') {
			if (c === ' ') {
				state = 'start_tag_attributes';
				currentTag = buffer;
			} else if (c === '>') {
				state = 'text';
				currentTag = buffer;

				if (html[i-1] === '/') {
					processSingleTag();
				} else {
					processStartTag();
					if (currentTag === 'script') {
						state = 'script';
					}
				}
			} else if (c !== '/') {
				buffer += c;
			}
		} else if (state === 'start_tag_attributes') {
			if (c === '>') {
				state = 'text';

				if (html[i-1] === '/') {
					processSingleTag();
				} else {
					processStartTag();
					if (currentTag === 'script') {
						state = 'script';
					}
				}
			} else if (html[i-1] === ' ' && /[a-zA-Z0-9]/.test(c)) {
				state = 'tag_attribute_name';
				buffer = c;
			}
		} else if (state === 'tag_attribute_name') {
			if (c === ' ') {
				state = 'start_tag_attributes';
			} else if (c === '"' && html[i-1] === '=') {
				state = 'tag_attribute_value';
				buffer = '';
			} else if (c === '=') {
				currentAttributeName = buffer;
			} else if (c === '>') {
				state = 'text';
				if (currentTag === 'script') {
					state = 'script';
				}
			} else {
				buffer += c;
			}
		} else if (state === 'tag_attribute_value') {
			if (c === '"') {
				state = 'start_tag_attributes';
				processAttribute();
			} else {
				buffer += c;
			}
		} else if (state === 'script') {
			if (c === '>' && html.substr(i-8, 9) === '</script>') {
				state = 'text';
			}
		}
	}

	function processEndTag(tagName) {
		if (tagName === 'pre') {
			is_in_pre = false;
		}
		currentTag = tagName;
	}

	function processSingleTag() {
		if (isNewLineTag[currentTag]) {
			text += '\n';
		}
	}

	function processStartTag() {
		if (currentTag === 'pre') {
			is_in_pre = true;
		}

		if (isNewLineTag[currentTag]) {
			text += '\n';
		}
	}

	function processAttribute() {
		if (currentTag === 'img' && currentAttributeName === 'src' ||
			currentTag === 'a' && currentAttributeName === 'href') {
			text += '[' + buffer + ']';
		}
		currentAttributeName = null;
	}

	function processEscapedCharacter(ref) {
		if (ref[1] === '#') {
			if (ref[2] === 'x') {
				var hexa = ref.substring(2, ref.length - 1);
				text += String.fromCharCode('0' + hexa);
			} else {
				var decimal = ref.substring(2, ref.length - 1);
				text += String.fromCharCode(decimal);
			}
		} else {
			text += html5namedCharacters[ref].characters;
		}
	}

	return text;
}


module.exports = getTextOfHTML;