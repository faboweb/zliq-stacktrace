import deepEqual from 'deep-equal';

/*
* stream constructor
* constructor returns a stream
* get the current value of stream like: stream.value
*/
export const stream = function(init_value) {
	let s = function(value) {
		if (value === undefined) {
			return s.value;
		}
		update(s, value);
		return s;
	}

	s.IS_STREAM = true;
	s.value = init_value;
	s.listeners = [];

	s.map = (fn) => map(s, fn);
	s.is = (value) => map(s, (cur) => cur === value);
	s.flatMap = (fn) => flatMap(s, fn);
	s.filter = (fn) => filter(s, fn);
	s.deepSelect = (fn) => deepSelect(s, fn);
	s.distinct = (fn) => distinct(s, fn);
	s.$ = (selectorArr) => query(s, selectorArr);
	s.until = (stopEmit$) => until(s, stopEmit$);
	s.patch = (partialChange) => patch(s, partialChange);
	s.reduce = (fn, startValue) => reduce(s, fn, startValue);

	return s;
};

/*
* wrapper for the diffing of stream values
*/
function valuesChanged(oldValue, newValue) {
	return !deepEqual(oldValue, newValue);
}

/*
* update the stream value and notify listeners on the stream
*/
function update(parent$, newValue) {
	parent$.value = newValue;
	notifyListeners(parent$.listeners, newValue);
};

/*
* provide a new value to all listeners registered for a stream
*/
function notifyListeners(listeners, value) {
	listeners.forEach(function notifyListener(listener) {
		listener(value);
	});
}

/*
* Do not pipe the value undefined. This allows to wait for an external initialization.
* It also saves you from checking for an initial null on every map function.
*/
function fork$(parent$, mapFunction) {
	let initValue = parent$.value !== undefined ? mapFunction(parent$.value) : undefined
	return stream(initValue);
}

/*
* provides a new stream applying a transformation function to the value of a parent stream
*/
function map(parent$, fn) {
	let newStream = fork$(parent$, fn);
	parent$.listeners.push(function mapValue(value) {
		newStream(fn(value));
	});
	return newStream;
}

/*
* provides a new stream applying a transformation function to the value of a parent stream
*/
function flatMap(parent$, fn) {
	let newStream = fork$(parent$, function getChildStreamValue(value) { return fn(value).value; });
	parent$.listeners.push(function flatMapValue(value) {
		fn(value).map(function updateOuterStream(result) {
			newStream(result);
		});
	});
	return newStream;
}

/*
* provides a new stream that only serves the values that a filter function returns true for
* still a stream ALWAYS has a value -> so it starts at least with NULL
*/
function filter(parent$, fn) {
	let newStream = fork$(parent$, (value) => fn(value) ? value : undefined);
	parent$.listeners.push(function filterValue(value) {
		if (fn(value)) {
			newStream(value);
		}
	});
	return newStream;
}

/*
* provides a new stream that has a selected sub property of the object value of the parent stream
* the selector has the format [{propertyName}.]*
*/
function deepSelect(parent$, selector) {
	let selectors = selector.split('.');

	function select(parent, selectors) {
		return selectors.reduce((input, selector) => {
			return input[selector];
		}, parent);
	}

	let newStream = fork$(parent$, (value) => select(value, selectors));
	parent$.listeners.push(function deepSelectValue(newValue) {
		newStream(select(newValue, selectors));
	});
	return newStream;
};

function query(parent$, selectorArr) {
	if(!Array.isArray(selectorArr)) {
		return deepSelect(parent$, selectorArr);
	}
	return merge$(selectorArr.map(selector => deepSelect(parent$, selector)));
}

// TODO: maybe refactor with filter
/*
* provide a new stream that only notifys its children if the containing value actualy changes
*/
function distinct(parent$, fn = (a, b) => valuesChanged(a, b)) {
	let newStream = fork$(parent$, (value) => value);
	parent$.listeners.push(function deepSelectValue(value) {
		if (fn(newStream.value, value)) {
			newStream(value);
		}
	});
	return newStream;
}

/*
* update only the properties of an object passed
* i.e. {name: 'Fabian', lastname: 'Weber} patched with {name: 'Fabo'} produces {name: 'Fabo', lastname: 'Weber}
*/
function patch(parent$, partialChange) {
	if (parent$.value == null) {
		parent$(partialChange);
		return;
	}
	return parent$(Object.assign({}, parent$.value, partialChange));
}

function until(parent$, stopEmitValues$) {
	let newStream = stream(stopEmitValues$.value ? undefined : parent$.value);
	let subscribeTo = (stream) => {
		newStream(parent$.value);
		stream.listeners.push(newStream);
	}
	let unsubscribeFrom = (stream) => {
		var index = stream.listeners.indexOf(newStream);
		if (index !== -1) {
			stream.listeners.splice(index, 1);
		}
	};
	stopEmitValues$.map(stopEmitValues => {
		if(stopEmitValues) {
			unsubscribeFrom(parent$);
		} else {
			subscribeTo(parent$);
		}
	});
	return newStream;
}

/*
* reduce a stream over time
* this will pass the last output value to the calculation function
* reads like the array reduce function
*/
function reduce(parent$, fn, startValue) {
	let aggregate = parent$.value !== undefined ? fn(startValue, parent$.value) : undefined;
	let newStream = stream(aggregate);
	parent$.listeners.push(function reduceValue(value) {
		aggregate = fn(aggregate, parent$.value);
		newStream(aggregate);
	});
	return newStream;
}

/*
* merge several streams into one stream providing the values of all streams as an array
* the merge will only have a value if every stream for the merge has a value
*/
export function merge$(streamArr) {
	let values = streamArr.map(parent$ => parent$.value);
	let newStream = stream(values.indexOf(undefined) === -1 ? values : undefined);
	streamArr.forEach(function triggerMergedStreamUpdate(parent$, index) {
		parent$.listeners.push(function updateMergedStream(value) {
			values[index] = value;
			newStream(values.indexOf(undefined) === -1 ? values : undefined);
		});
	});
	return newStream;
}

export function isStream(parent$) {
	return parent$ != null && !!parent$.IS_STREAM;
}
