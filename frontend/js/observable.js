// callbacks can be unbound by calling the object returned by the "bind" functions

// value van be a primitive value or any object (including list), in that case only the reference to it becomes observable
function observableVariable(initValue) {

	var value = initValue; // default is undefined
	var handlers = [];

	return {
		get: function() {
			return value;
		},
		set: function(newValue, caller) {
			var oldValue = value;
			value = newValue;

			handlers.forEach(function(handler) {
				handler.call(null, newValue, oldValue, caller);
			});
		},
		bind: function(handler) {
			handlers.push(handler);

			return function() {
				handlers.splice(handlers.indexOf(handler), 1);
			};
		},
		$type: "observableVariable"
	};
}

// TODO rename to observableDict?

function observableObject(initValue) {

	var object = initValue || {};
	var handlersByKey = {};

	function getHandlers(key) {
		if (typeof handlersByKey[key] === 'undefined') {
			handlersByKey[key] = [];
		}
		return handlersByKey[key];
	}

	return {
		get: function(key) {
			return object[key];
		},
		set: function(key, newValue, caller) {
			var oldValue = object[key];
			object[key] = newValue;

			getHandlers(key).forEach(function(handler) {
				handler.call(null, oldValue, newValue, caller);
			});	
		},
		bind: function(key, handler) {
			if (key.constructor === Array) {
				key.forEach(function(singleKey) {
					getHandlers(singleKey).push(handler);
				});

				return function() {
					key.forEach(function(singleKey) {
						handlersByKey[singleKey].splice(handlersByKey[singleKey].indexOf(handler));
					});
				};
			} else {
				getHandlers(key).push(handler);

				return function() {
					handlersByKey[key].splice(handlersByKey[key].indexOf(handler));
				};
			}
		},

		// helper function for component bind declarations
		path: function(key) {
			// TODO: multi-level path
			return {
				dict: this,
				key: key
			};
		},

		// dictionary utils:

		has: function(key) {
			return typeof object[key] !== 'undefined';
		},
		forEach: function(callback) {
			for (var key in object) {
				if (object.hasOwnProperty(key)) {
					callback.call(null, key, object[key]);
				}
			}
		},
		size: function() {
			return Object.keys(object).length; // O(n)
		},
		$type: "observableObject"
	};
}

// not the same terrible functions that the JS array has
// bind with 3 types of events: update, add, remove
function observableList(initValue) {

	var list = initValue || [];
	var changeHandlers = [];

	return {
		get: function(index) {
			return list[index];
		},
		bind: function(handler) {
			changeHandlers.push(handler);

			return function() {
				changeHandlers.splice(changeHandlers.indexOf(handler), 1);
			};
		},

		// list manipulation: 

		set: function(index, newValue, caller) {
			var oldValue = list[index];
			list[index] = newValue;

			changeHandlers.forEach(function(handler) {
				handler.call(null, newValue, oldValue, caller, index, 'update');
			});
		},
		add: function(item, caller) {
			list.push(item);

			changeHandlers.forEach(function(handler) {
				handler.call(null, item, undefined, caller, list.length - 1, 'add');
			});
		},
		insert: function(index, item, caller) {
			list.splice(index, 0, item);

			changeHandlers.forEach(function(handler) {
				handler.call(null, item, undefined, caller, list.length - 1, 'add');
			});	
		},
		remove: function(item, caller) {
			var index = list.indexOf(item);
			if (index !== -1) {
				list.splice(index, 1);

				changeHandlers.forEach(function(handler) {
					handler.call(null, undefined, item, caller, index, 'remove');
				});
				return true;
			} else {
				return false;
			}
		},
		removeIndex: function(index, caller) {
			if (index >= list.size || index < 0)
				throw "list index out of bounds: index " + index + " size: " + list.length;

			var oldValue = list[index];
			list.splice(index, 1);

			changeHandlers.forEach(function(handler) {
				handler.call(null, undefined, oldValue, caller, index, 'remove');
			});
		},
		// TODO: clear method? with repeated remove calls?

		// list utils:

		contains: function(item) {
			return list.indexOf(item) !== -1;
		},
		indexOf: function(item) {
			return list.indexOf(item);
		},
		forEach: function(callback) {
			list.forEach(function(item, index) {
				callback.call(null, item, index);
			});
		},
		size: function() {
			return list.length;
		},
		length: function() {
			return list.length;
		},
		$type: "observableList"
	};
}

