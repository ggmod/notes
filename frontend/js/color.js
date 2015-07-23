var RUN_COLOR_TESTS = false;

function color(input) {

	var r = 0, g = 0, b = 0, a = 1;

	parse(input);

	function parse(input) {
		
		function copyValues(values) {
			r = values.r;
			g = values.g;
			b = values.b;
			a = values.a;
		}

		if (input.type && input.type() === 'color') {
			r = input.r();
			g = input.g();
			b = input.b();
			a = input.a();
		} else if (typeof input === 'string') {
			if (input.lastIndexOf('rgb(') === 0) {
				copyValues(rgb2color(input));
			} else if (input.lastIndexOf('rgba(') === 0) {
				copyValues(rgba2color(input));
			} else if (input.charAt(0) === '#') {
				if (input.length === 4) {
					copyValues(shortHex2color(input));
				} else if (input.length === 7) {
					copyValues(hex2color(input));
				}
			} else {
				copyValues(name2color(input));
			}
		}

	}

	function rgb2color(input) {
		var numbers = input.substring(4, input.length - 1)
			.split(',')
			.map(function(number) { return parseFloat(number); });
		return {
			r: numbers[0],
			g: numbers[1],
			b: numbers[2],
			a: 1
		};
	}

	function rgba2color(input) {
		var numbers = input.substring(5, input.length - 1)
			.split(',')
			.map(function(number) { return parseFloat(number); });
		return {
			r: numbers[0],
			g: numbers[1],
			b: numbers[2],
			a: numbers[3]
		};
	}

	function shortHex2color(input) {
		return {
		 	r: parseInt(input.substr(1,1) + input.substr(1,1), 16),
			g: parseInt(input.substr(2,1) + input.substr(2,1), 16),
			b: parseInt(input.substr(3,1) + input.substr(3,1), 16),
			a: 1
		};
	}

	function hex2color(input) {
		return {
			r: parseInt(input.substr(1,2), 16),
			g: parseInt(input.substr(3,2), 16),
			b: parseInt(input.substr(5,2), 16),
			a: 1
		};
	}

	function name2color(input) {
		var span = document.createElement('span');
		span.style.color = input;
		span.style.display = 'none';
		document.body.appendChild(span);
		var rgb = window.getComputedStyle(span).color;
		if (rgb.lastIndexOf('rgb(') === 0) {
			return rgb2color(rgb);
		} else if (rgb.lastIndexOf('rgba(') === 0) {
			return rgba2color(rgb);
		} else {
			throw "error converting color: " + input;
		}
	}

	function colorvalue2hex(value) {
		if (value < 16) {
			return '0' + value.toString(16);
		} else {
			return value.toString(16);
		}
	}

	function color2hex(r,g,b,a) {
		if (a !== 1) {
			throw "colors with opacity other than 1 have no hex representation";
		}

		return '#' + colorvalue2hex(r) +  colorvalue2hex(g) + colorvalue2hex(b);
	}

	function color2rgba(r,g,b,a) {
		return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	}

	return {
		type: function() { return "color"; },
		
		hex: function() {
			return color2hex(r,g,b,a);
		},
		rgba: function() {
			return color2rgba(r,g,b,a);
		},
		toString: function() {
			return color2rgba(r,g,b,a);
		},

		r: function() {
			return r;
		},
		g: function() {
			return g;
		},
		b: function() {
			return b;
		},
		a: function() {
			return a;
		}
	};
}

if (RUN_COLOR_TESTS) {
	window.onload = function() { // for name2color
		console.log(color("red").toString());
		console.log(color("#f00").toString());
		console.log(color("#ff7f3f").toString());
		console.log(color("rgb(255,127,63)").toString());
		console.log(color("rgba(255,127,63,0.5)").toString());
		console.log(color("rgba(255,127,63,0.5)").rgba());
		console.log(color("red").hex());
		console.log(color("#f00").hex());
		console.log(color("#ff7f3f").hex());
		console.log(color("rgb(255,127,63)").hex());
		var c = color("rgba(255,127,63,0.5)");
		var c2 = color(c);
		console.log(c2.rgba());

		// TODO check input string structure, like rgb(...) with fours values
	}
}