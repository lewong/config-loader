var ConfigLoader = (function() {
	"use strict";
	// jshint unused:false
	var _ = (function() {
		//     Underscore.js 1.6.0
		//     http://underscorejs.org
		//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
		//     Underscore may be freely distributed under the MIT license.
		
		(function() {
		
		  // Baseline setup
		  // --------------
		
		  // Establish the root object, `window` in the browser, or `exports` on the server.
		  var root = this;
		
		  // Save the previous value of the `_` variable.
		  var previousUnderscore = root._;
		
		  // Establish the object that gets returned to break out of a loop iteration.
		  var breaker = {};
		
		  // Save bytes in the minified (but not gzipped) version:
		  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
		
		  // Create quick reference variables for speed access to core prototypes.
		  var
		    push             = ArrayProto.push,
		    slice            = ArrayProto.slice,
		    concat           = ArrayProto.concat,
		    toString         = ObjProto.toString,
		    hasOwnProperty   = ObjProto.hasOwnProperty;
		
		  // All **ECMAScript 5** native function implementations that we hope to use
		  // are declared here.
		  var
		    nativeForEach      = ArrayProto.forEach,
		    nativeMap          = ArrayProto.map,
		    nativeReduce       = ArrayProto.reduce,
		    nativeReduceRight  = ArrayProto.reduceRight,
		    nativeFilter       = ArrayProto.filter,
		    nativeEvery        = ArrayProto.every,
		    nativeSome         = ArrayProto.some,
		    nativeIndexOf      = ArrayProto.indexOf,
		    nativeLastIndexOf  = ArrayProto.lastIndexOf,
		    nativeIsArray      = Array.isArray,
		    nativeKeys         = Object.keys,
		    nativeBind         = FuncProto.bind;
		
		  // Create a safe reference to the Underscore object for use below.
		  var _ = function(obj) {
		    if (obj instanceof _) return obj;
		    if (!(this instanceof _)) return new _(obj);
		    this._wrapped = obj;
		  };
		
		  // Export the Underscore object for **Node.js**, with
		  // backwards-compatibility for the old `require()` API. If we're in
		  // the browser, add `_` as a global object via a string identifier,
		  // for Closure Compiler "advanced" mode.
		  if (typeof exports !== 'undefined') {
		    if (typeof module !== 'undefined' && module.exports) {
		      exports = module.exports = _;
		    }
		    exports._ = _;
		  } else {
		    root._ = _;
		  }
		
		  // Current version.
		  _.VERSION = '1.6.0';
		
		  // Collection Functions
		  // --------------------
		
		  // The cornerstone, an `each` implementation, aka `forEach`.
		  // Handles objects with the built-in `forEach`, arrays, and raw objects.
		  // Delegates to **ECMAScript 5**'s native `forEach` if available.
		  var each = _.each = _.forEach = function(obj, iterator, context) {
		    if (obj == null) return obj;
		    if (nativeForEach && obj.forEach === nativeForEach) {
		      obj.forEach(iterator, context);
		    } else if (obj.length === +obj.length) {
		      for (var i = 0, length = obj.length; i < length; i++) {
		        if (iterator.call(context, obj[i], i, obj) === breaker) return;
		      }
		    } else {
		      var keys = _.keys(obj);
		      for (var i = 0, length = keys.length; i < length; i++) {
		        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
		      }
		    }
		    return obj;
		  };
		
		  // Return the results of applying the iterator to each element.
		  // Delegates to **ECMAScript 5**'s native `map` if available.
		  _.map = _.collect = function(obj, iterator, context) {
		    var results = [];
		    if (obj == null) return results;
		    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
		    each(obj, function(value, index, list) {
		      results.push(iterator.call(context, value, index, list));
		    });
		    return results;
		  };
		
		  var reduceError = 'Reduce of empty array with no initial value';
		
		  // **Reduce** builds up a single result from a list of values, aka `inject`,
		  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
		  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
		    var initial = arguments.length > 2;
		    if (obj == null) obj = [];
		    if (nativeReduce && obj.reduce === nativeReduce) {
		      if (context) iterator = _.bind(iterator, context);
		      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
		    }
		    each(obj, function(value, index, list) {
		      if (!initial) {
		        memo = value;
		        initial = true;
		      } else {
		        memo = iterator.call(context, memo, value, index, list);
		      }
		    });
		    if (!initial) throw new TypeError(reduceError);
		    return memo;
		  };
		
		  // The right-associative version of reduce, also known as `foldr`.
		  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
		  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
		    var initial = arguments.length > 2;
		    if (obj == null) obj = [];
		    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
		      if (context) iterator = _.bind(iterator, context);
		      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
		    }
		    var length = obj.length;
		    if (length !== +length) {
		      var keys = _.keys(obj);
		      length = keys.length;
		    }
		    each(obj, function(value, index, list) {
		      index = keys ? keys[--length] : --length;
		      if (!initial) {
		        memo = obj[index];
		        initial = true;
		      } else {
		        memo = iterator.call(context, memo, obj[index], index, list);
		      }
		    });
		    if (!initial) throw new TypeError(reduceError);
		    return memo;
		  };
		
		  // Return the first value which passes a truth test. Aliased as `detect`.
		  _.find = _.detect = function(obj, predicate, context) {
		    var result;
		    any(obj, function(value, index, list) {
		      if (predicate.call(context, value, index, list)) {
		        result = value;
		        return true;
		      }
		    });
		    return result;
		  };
		
		  // Return all the elements that pass a truth test.
		  // Delegates to **ECMAScript 5**'s native `filter` if available.
		  // Aliased as `select`.
		  _.filter = _.select = function(obj, predicate, context) {
		    var results = [];
		    if (obj == null) return results;
		    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
		    each(obj, function(value, index, list) {
		      if (predicate.call(context, value, index, list)) results.push(value);
		    });
		    return results;
		  };
		
		  // Return all the elements for which a truth test fails.
		  _.reject = function(obj, predicate, context) {
		    return _.filter(obj, function(value, index, list) {
		      return !predicate.call(context, value, index, list);
		    }, context);
		  };
		
		  // Determine whether all of the elements match a truth test.
		  // Delegates to **ECMAScript 5**'s native `every` if available.
		  // Aliased as `all`.
		  _.every = _.all = function(obj, predicate, context) {
		    predicate || (predicate = _.identity);
		    var result = true;
		    if (obj == null) return result;
		    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
		    each(obj, function(value, index, list) {
		      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
		    });
		    return !!result;
		  };
		
		  // Determine if at least one element in the object matches a truth test.
		  // Delegates to **ECMAScript 5**'s native `some` if available.
		  // Aliased as `any`.
		  var any = _.some = _.any = function(obj, predicate, context) {
		    predicate || (predicate = _.identity);
		    var result = false;
		    if (obj == null) return result;
		    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
		    each(obj, function(value, index, list) {
		      if (result || (result = predicate.call(context, value, index, list))) return breaker;
		    });
		    return !!result;
		  };
		
		  // Determine if the array or object contains a given value (using `===`).
		  // Aliased as `include`.
		  _.contains = _.include = function(obj, target) {
		    if (obj == null) return false;
		    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
		    return any(obj, function(value) {
		      return value === target;
		    });
		  };
		
		  // Invoke a method (with arguments) on every item in a collection.
		  _.invoke = function(obj, method) {
		    var args = slice.call(arguments, 2);
		    var isFunc = _.isFunction(method);
		    return _.map(obj, function(value) {
		      return (isFunc ? method : value[method]).apply(value, args);
		    });
		  };
		
		  // Convenience version of a common use case of `map`: fetching a property.
		  _.pluck = function(obj, key) {
		    return _.map(obj, _.property(key));
		  };
		
		  // Convenience version of a common use case of `filter`: selecting only objects
		  // containing specific `key:value` pairs.
		  _.where = function(obj, attrs) {
		    return _.filter(obj, _.matches(attrs));
		  };
		
		  // Convenience version of a common use case of `find`: getting the first object
		  // containing specific `key:value` pairs.
		  _.findWhere = function(obj, attrs) {
		    return _.find(obj, _.matches(attrs));
		  };
		
		  // Return the maximum element or (element-based computation).
		  // Can't optimize arrays of integers longer than 65,535 elements.
		  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
		  _.max = function(obj, iterator, context) {
		    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
		      return Math.max.apply(Math, obj);
		    }
		    var result = -Infinity, lastComputed = -Infinity;
		    each(obj, function(value, index, list) {
		      var computed = iterator ? iterator.call(context, value, index, list) : value;
		      if (computed > lastComputed) {
		        result = value;
		        lastComputed = computed;
		      }
		    });
		    return result;
		  };
		
		  // Return the minimum element (or element-based computation).
		  _.min = function(obj, iterator, context) {
		    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
		      return Math.min.apply(Math, obj);
		    }
		    var result = Infinity, lastComputed = Infinity;
		    each(obj, function(value, index, list) {
		      var computed = iterator ? iterator.call(context, value, index, list) : value;
		      if (computed < lastComputed) {
		        result = value;
		        lastComputed = computed;
		      }
		    });
		    return result;
		  };
		
		  // Shuffle an array, using the modern version of the
		  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
		  _.shuffle = function(obj) {
		    var rand;
		    var index = 0;
		    var shuffled = [];
		    each(obj, function(value) {
		      rand = _.random(index++);
		      shuffled[index - 1] = shuffled[rand];
		      shuffled[rand] = value;
		    });
		    return shuffled;
		  };
		
		  // Sample **n** random values from a collection.
		  // If **n** is not specified, returns a single random element.
		  // The internal `guard` argument allows it to work with `map`.
		  _.sample = function(obj, n, guard) {
		    if (n == null || guard) {
		      if (obj.length !== +obj.length) obj = _.values(obj);
		      return obj[_.random(obj.length - 1)];
		    }
		    return _.shuffle(obj).slice(0, Math.max(0, n));
		  };
		
		  // An internal function to generate lookup iterators.
		  var lookupIterator = function(value) {
		    if (value == null) return _.identity;
		    if (_.isFunction(value)) return value;
		    return _.property(value);
		  };
		
		  // Sort the object's values by a criterion produced by an iterator.
		  _.sortBy = function(obj, iterator, context) {
		    iterator = lookupIterator(iterator);
		    return _.pluck(_.map(obj, function(value, index, list) {
		      return {
		        value: value,
		        index: index,
		        criteria: iterator.call(context, value, index, list)
		      };
		    }).sort(function(left, right) {
		      var a = left.criteria;
		      var b = right.criteria;
		      if (a !== b) {
		        if (a > b || a === void 0) return 1;
		        if (a < b || b === void 0) return -1;
		      }
		      return left.index - right.index;
		    }), 'value');
		  };
		
		  // An internal function used for aggregate "group by" operations.
		  var group = function(behavior) {
		    return function(obj, iterator, context) {
		      var result = {};
		      iterator = lookupIterator(iterator);
		      each(obj, function(value, index) {
		        var key = iterator.call(context, value, index, obj);
		        behavior(result, key, value);
		      });
		      return result;
		    };
		  };
		
		  // Groups the object's values by a criterion. Pass either a string attribute
		  // to group by, or a function that returns the criterion.
		  _.groupBy = group(function(result, key, value) {
		    _.has(result, key) ? result[key].push(value) : result[key] = [value];
		  });
		
		  // Indexes the object's values by a criterion, similar to `groupBy`, but for
		  // when you know that your index values will be unique.
		  _.indexBy = group(function(result, key, value) {
		    result[key] = value;
		  });
		
		  // Counts instances of an object that group by a certain criterion. Pass
		  // either a string attribute to count by, or a function that returns the
		  // criterion.
		  _.countBy = group(function(result, key) {
		    _.has(result, key) ? result[key]++ : result[key] = 1;
		  });
		
		  // Use a comparator function to figure out the smallest index at which
		  // an object should be inserted so as to maintain order. Uses binary search.
		  _.sortedIndex = function(array, obj, iterator, context) {
		    iterator = lookupIterator(iterator);
		    var value = iterator.call(context, obj);
		    var low = 0, high = array.length;
		    while (low < high) {
		      var mid = (low + high) >>> 1;
		      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
		    }
		    return low;
		  };
		
		  // Safely create a real, live array from anything iterable.
		  _.toArray = function(obj) {
		    if (!obj) return [];
		    if (_.isArray(obj)) return slice.call(obj);
		    if (obj.length === +obj.length) return _.map(obj, _.identity);
		    return _.values(obj);
		  };
		
		  // Return the number of elements in an object.
		  _.size = function(obj) {
		    if (obj == null) return 0;
		    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
		  };
		
		  // Array Functions
		  // ---------------
		
		  // Get the first element of an array. Passing **n** will return the first N
		  // values in the array. Aliased as `head` and `take`. The **guard** check
		  // allows it to work with `_.map`.
		  _.first = _.head = _.take = function(array, n, guard) {
		    if (array == null) return void 0;
		    if ((n == null) || guard) return array[0];
		    if (n < 0) return [];
		    return slice.call(array, 0, n);
		  };
		
		  // Returns everything but the last entry of the array. Especially useful on
		  // the arguments object. Passing **n** will return all the values in
		  // the array, excluding the last N. The **guard** check allows it to work with
		  // `_.map`.
		  _.initial = function(array, n, guard) {
		    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
		  };
		
		  // Get the last element of an array. Passing **n** will return the last N
		  // values in the array. The **guard** check allows it to work with `_.map`.
		  _.last = function(array, n, guard) {
		    if (array == null) return void 0;
		    if ((n == null) || guard) return array[array.length - 1];
		    return slice.call(array, Math.max(array.length - n, 0));
		  };
		
		  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
		  // Especially useful on the arguments object. Passing an **n** will return
		  // the rest N values in the array. The **guard**
		  // check allows it to work with `_.map`.
		  _.rest = _.tail = _.drop = function(array, n, guard) {
		    return slice.call(array, (n == null) || guard ? 1 : n);
		  };
		
		  // Trim out all falsy values from an array.
		  _.compact = function(array) {
		    return _.filter(array, _.identity);
		  };
		
		  // Internal implementation of a recursive `flatten` function.
		  var flatten = function(input, shallow, output) {
		    if (shallow && _.every(input, _.isArray)) {
		      return concat.apply(output, input);
		    }
		    each(input, function(value) {
		      if (_.isArray(value) || _.isArguments(value)) {
		        shallow ? push.apply(output, value) : flatten(value, shallow, output);
		      } else {
		        output.push(value);
		      }
		    });
		    return output;
		  };
		
		  // Flatten out an array, either recursively (by default), or just one level.
		  _.flatten = function(array, shallow) {
		    return flatten(array, shallow, []);
		  };
		
		  // Return a version of the array that does not contain the specified value(s).
		  _.without = function(array) {
		    return _.difference(array, slice.call(arguments, 1));
		  };
		
		  // Split an array into two arrays: one whose elements all satisfy the given
		  // predicate, and one whose elements all do not satisfy the predicate.
		  _.partition = function(array, predicate) {
		    var pass = [], fail = [];
		    each(array, function(elem) {
		      (predicate(elem) ? pass : fail).push(elem);
		    });
		    return [pass, fail];
		  };
		
		  // Produce a duplicate-free version of the array. If the array has already
		  // been sorted, you have the option of using a faster algorithm.
		  // Aliased as `unique`.
		  _.uniq = _.unique = function(array, isSorted, iterator, context) {
		    if (_.isFunction(isSorted)) {
		      context = iterator;
		      iterator = isSorted;
		      isSorted = false;
		    }
		    var initial = iterator ? _.map(array, iterator, context) : array;
		    var results = [];
		    var seen = [];
		    each(initial, function(value, index) {
		      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
		        seen.push(value);
		        results.push(array[index]);
		      }
		    });
		    return results;
		  };
		
		  // Produce an array that contains the union: each distinct element from all of
		  // the passed-in arrays.
		  _.union = function() {
		    return _.uniq(_.flatten(arguments, true));
		  };
		
		  // Produce an array that contains every item shared between all the
		  // passed-in arrays.
		  _.intersection = function(array) {
		    var rest = slice.call(arguments, 1);
		    return _.filter(_.uniq(array), function(item) {
		      return _.every(rest, function(other) {
		        return _.contains(other, item);
		      });
		    });
		  };
		
		  // Take the difference between one array and a number of other arrays.
		  // Only the elements present in just the first array will remain.
		  _.difference = function(array) {
		    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
		    return _.filter(array, function(value){ return !_.contains(rest, value); });
		  };
		
		  // Zip together multiple lists into a single array -- elements that share
		  // an index go together.
		  _.zip = function() {
		    var length = _.max(_.pluck(arguments, 'length').concat(0));
		    var results = new Array(length);
		    for (var i = 0; i < length; i++) {
		      results[i] = _.pluck(arguments, '' + i);
		    }
		    return results;
		  };
		
		  // Converts lists into objects. Pass either a single array of `[key, value]`
		  // pairs, or two parallel arrays of the same length -- one of keys, and one of
		  // the corresponding values.
		  _.object = function(list, values) {
		    if (list == null) return {};
		    var result = {};
		    for (var i = 0, length = list.length; i < length; i++) {
		      if (values) {
		        result[list[i]] = values[i];
		      } else {
		        result[list[i][0]] = list[i][1];
		      }
		    }
		    return result;
		  };
		
		  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
		  // we need this function. Return the position of the first occurrence of an
		  // item in an array, or -1 if the item is not included in the array.
		  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
		  // If the array is large and already in sort order, pass `true`
		  // for **isSorted** to use binary search.
		  _.indexOf = function(array, item, isSorted) {
		    if (array == null) return -1;
		    var i = 0, length = array.length;
		    if (isSorted) {
		      if (typeof isSorted == 'number') {
		        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
		      } else {
		        i = _.sortedIndex(array, item);
		        return array[i] === item ? i : -1;
		      }
		    }
		    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
		    for (; i < length; i++) if (array[i] === item) return i;
		    return -1;
		  };
		
		  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
		  _.lastIndexOf = function(array, item, from) {
		    if (array == null) return -1;
		    var hasIndex = from != null;
		    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
		      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
		    }
		    var i = (hasIndex ? from : array.length);
		    while (i--) if (array[i] === item) return i;
		    return -1;
		  };
		
		  // Generate an integer Array containing an arithmetic progression. A port of
		  // the native Python `range()` function. See
		  // [the Python documentation](http://docs.python.org/library/functions.html#range).
		  _.range = function(start, stop, step) {
		    if (arguments.length <= 1) {
		      stop = start || 0;
		      start = 0;
		    }
		    step = arguments[2] || 1;
		
		    var length = Math.max(Math.ceil((stop - start) / step), 0);
		    var idx = 0;
		    var range = new Array(length);
		
		    while(idx < length) {
		      range[idx++] = start;
		      start += step;
		    }
		
		    return range;
		  };
		
		  // Function (ahem) Functions
		  // ------------------
		
		  // Reusable constructor function for prototype setting.
		  var ctor = function(){};
		
		  // Create a function bound to a given object (assigning `this`, and arguments,
		  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
		  // available.
		  _.bind = function(func, context) {
		    var args, bound;
		    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		    if (!_.isFunction(func)) throw new TypeError;
		    args = slice.call(arguments, 2);
		    return bound = function() {
		      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
		      ctor.prototype = func.prototype;
		      var self = new ctor;
		      ctor.prototype = null;
		      var result = func.apply(self, args.concat(slice.call(arguments)));
		      if (Object(result) === result) return result;
		      return self;
		    };
		  };
		
		  // Partially apply a function by creating a version that has had some of its
		  // arguments pre-filled, without changing its dynamic `this` context. _ acts
		  // as a placeholder, allowing any combination of arguments to be pre-filled.
		  _.partial = function(func) {
		    var boundArgs = slice.call(arguments, 1);
		    return function() {
		      var position = 0;
		      var args = boundArgs.slice();
		      for (var i = 0, length = args.length; i < length; i++) {
		        if (args[i] === _) args[i] = arguments[position++];
		      }
		      while (position < arguments.length) args.push(arguments[position++]);
		      return func.apply(this, args);
		    };
		  };
		
		  // Bind a number of an object's methods to that object. Remaining arguments
		  // are the method names to be bound. Useful for ensuring that all callbacks
		  // defined on an object belong to it.
		  _.bindAll = function(obj) {
		    var funcs = slice.call(arguments, 1);
		    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
		    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
		    return obj;
		  };
		
		  // Memoize an expensive function by storing its results.
		  _.memoize = function(func, hasher) {
		    var memo = {};
		    hasher || (hasher = _.identity);
		    return function() {
		      var key = hasher.apply(this, arguments);
		      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
		    };
		  };
		
		  // Delays a function for the given number of milliseconds, and then calls
		  // it with the arguments supplied.
		  _.delay = function(func, wait) {
		    var args = slice.call(arguments, 2);
		    return setTimeout(function(){ return func.apply(null, args); }, wait);
		  };
		
		  // Defers a function, scheduling it to run after the current call stack has
		  // cleared.
		  _.defer = function(func) {
		    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
		  };
		
		  // Returns a function, that, when invoked, will only be triggered at most once
		  // during a given window of time. Normally, the throttled function will run
		  // as much as it can, without ever going more than once per `wait` duration;
		  // but if you'd like to disable the execution on the leading edge, pass
		  // `{leading: false}`. To disable execution on the trailing edge, ditto.
		  _.throttle = function(func, wait, options) {
		    var context, args, result;
		    var timeout = null;
		    var previous = 0;
		    options || (options = {});
		    var later = function() {
		      previous = options.leading === false ? 0 : _.now();
		      timeout = null;
		      result = func.apply(context, args);
		      context = args = null;
		    };
		    return function() {
		      var now = _.now();
		      if (!previous && options.leading === false) previous = now;
		      var remaining = wait - (now - previous);
		      context = this;
		      args = arguments;
		      if (remaining <= 0) {
		        clearTimeout(timeout);
		        timeout = null;
		        previous = now;
		        result = func.apply(context, args);
		        context = args = null;
		      } else if (!timeout && options.trailing !== false) {
		        timeout = setTimeout(later, remaining);
		      }
		      return result;
		    };
		  };
		
		  // Returns a function, that, as long as it continues to be invoked, will not
		  // be triggered. The function will be called after it stops being called for
		  // N milliseconds. If `immediate` is passed, trigger the function on the
		  // leading edge, instead of the trailing.
		  _.debounce = function(func, wait, immediate) {
		    var timeout, args, context, timestamp, result;
		
		    var later = function() {
		      var last = _.now() - timestamp;
		      if (last < wait) {
		        timeout = setTimeout(later, wait - last);
		      } else {
		        timeout = null;
		        if (!immediate) {
		          result = func.apply(context, args);
		          context = args = null;
		        }
		      }
		    };
		
		    return function() {
		      context = this;
		      args = arguments;
		      timestamp = _.now();
		      var callNow = immediate && !timeout;
		      if (!timeout) {
		        timeout = setTimeout(later, wait);
		      }
		      if (callNow) {
		        result = func.apply(context, args);
		        context = args = null;
		      }
		
		      return result;
		    };
		  };
		
		  // Returns a function that will be executed at most one time, no matter how
		  // often you call it. Useful for lazy initialization.
		  _.once = function(func) {
		    var ran = false, memo;
		    return function() {
		      if (ran) return memo;
		      ran = true;
		      memo = func.apply(this, arguments);
		      func = null;
		      return memo;
		    };
		  };
		
		  // Returns the first function passed as an argument to the second,
		  // allowing you to adjust arguments, run code before and after, and
		  // conditionally execute the original function.
		  _.wrap = function(func, wrapper) {
		    return _.partial(wrapper, func);
		  };
		
		  // Returns a function that is the composition of a list of functions, each
		  // consuming the return value of the function that follows.
		  _.compose = function() {
		    var funcs = arguments;
		    return function() {
		      var args = arguments;
		      for (var i = funcs.length - 1; i >= 0; i--) {
		        args = [funcs[i].apply(this, args)];
		      }
		      return args[0];
		    };
		  };
		
		  // Returns a function that will only be executed after being called N times.
		  _.after = function(times, func) {
		    return function() {
		      if (--times < 1) {
		        return func.apply(this, arguments);
		      }
		    };
		  };
		
		  // Object Functions
		  // ----------------
		
		  // Retrieve the names of an object's properties.
		  // Delegates to **ECMAScript 5**'s native `Object.keys`
		  _.keys = function(obj) {
		    if (!_.isObject(obj)) return [];
		    if (nativeKeys) return nativeKeys(obj);
		    var keys = [];
		    for (var key in obj) if (_.has(obj, key)) keys.push(key);
		    return keys;
		  };
		
		  // Retrieve the values of an object's properties.
		  _.values = function(obj) {
		    var keys = _.keys(obj);
		    var length = keys.length;
		    var values = new Array(length);
		    for (var i = 0; i < length; i++) {
		      values[i] = obj[keys[i]];
		    }
		    return values;
		  };
		
		  // Convert an object into a list of `[key, value]` pairs.
		  _.pairs = function(obj) {
		    var keys = _.keys(obj);
		    var length = keys.length;
		    var pairs = new Array(length);
		    for (var i = 0; i < length; i++) {
		      pairs[i] = [keys[i], obj[keys[i]]];
		    }
		    return pairs;
		  };
		
		  // Invert the keys and values of an object. The values must be serializable.
		  _.invert = function(obj) {
		    var result = {};
		    var keys = _.keys(obj);
		    for (var i = 0, length = keys.length; i < length; i++) {
		      result[obj[keys[i]]] = keys[i];
		    }
		    return result;
		  };
		
		  // Return a sorted list of the function names available on the object.
		  // Aliased as `methods`
		  _.functions = _.methods = function(obj) {
		    var names = [];
		    for (var key in obj) {
		      if (_.isFunction(obj[key])) names.push(key);
		    }
		    return names.sort();
		  };
		
		  // Extend a given object with all the properties in passed-in object(s).
		  _.extend = function(obj) {
		    each(slice.call(arguments, 1), function(source) {
		      if (source) {
		        for (var prop in source) {
		          obj[prop] = source[prop];
		        }
		      }
		    });
		    return obj;
		  };
		
		  // Return a copy of the object only containing the whitelisted properties.
		  _.pick = function(obj) {
		    var copy = {};
		    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		    each(keys, function(key) {
		      if (key in obj) copy[key] = obj[key];
		    });
		    return copy;
		  };
		
		   // Return a copy of the object without the blacklisted properties.
		  _.omit = function(obj) {
		    var copy = {};
		    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		    for (var key in obj) {
		      if (!_.contains(keys, key)) copy[key] = obj[key];
		    }
		    return copy;
		  };
		
		  // Fill in a given object with default properties.
		  _.defaults = function(obj) {
		    each(slice.call(arguments, 1), function(source) {
		      if (source) {
		        for (var prop in source) {
		          if (obj[prop] === void 0) obj[prop] = source[prop];
		        }
		      }
		    });
		    return obj;
		  };
		
		  // Create a (shallow-cloned) duplicate of an object.
		  _.clone = function(obj) {
		    if (!_.isObject(obj)) return obj;
		    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
		  };
		
		  // Invokes interceptor with the obj, and then returns obj.
		  // The primary purpose of this method is to "tap into" a method chain, in
		  // order to perform operations on intermediate results within the chain.
		  _.tap = function(obj, interceptor) {
		    interceptor(obj);
		    return obj;
		  };
		
		  // Internal recursive comparison function for `isEqual`.
		  var eq = function(a, b, aStack, bStack) {
		    // Identical objects are equal. `0 === -0`, but they aren't identical.
		    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
		    if (a === b) return a !== 0 || 1 / a == 1 / b;
		    // A strict comparison is necessary because `null == undefined`.
		    if (a == null || b == null) return a === b;
		    // Unwrap any wrapped objects.
		    if (a instanceof _) a = a._wrapped;
		    if (b instanceof _) b = b._wrapped;
		    // Compare `[[Class]]` names.
		    var className = toString.call(a);
		    if (className != toString.call(b)) return false;
		    switch (className) {
		      // Strings, numbers, dates, and booleans are compared by value.
		      case '[object String]':
		        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
		        // equivalent to `new String("5")`.
		        return a == String(b);
		      case '[object Number]':
		        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
		        // other numeric values.
		        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
		      case '[object Date]':
		      case '[object Boolean]':
		        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
		        // millisecond representations. Note that invalid dates with millisecond representations
		        // of `NaN` are not equivalent.
		        return +a == +b;
		      // RegExps are compared by their source patterns and flags.
		      case '[object RegExp]':
		        return a.source == b.source &&
		               a.global == b.global &&
		               a.multiline == b.multiline &&
		               a.ignoreCase == b.ignoreCase;
		    }
		    if (typeof a != 'object' || typeof b != 'object') return false;
		    // Assume equality for cyclic structures. The algorithm for detecting cyclic
		    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
		    var length = aStack.length;
		    while (length--) {
		      // Linear search. Performance is inversely proportional to the number of
		      // unique nested structures.
		      if (aStack[length] == a) return bStack[length] == b;
		    }
		    // Objects with different constructors are not equivalent, but `Object`s
		    // from different frames are.
		    var aCtor = a.constructor, bCtor = b.constructor;
		    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
		                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
		                        && ('constructor' in a && 'constructor' in b)) {
		      return false;
		    }
		    // Add the first object to the stack of traversed objects.
		    aStack.push(a);
		    bStack.push(b);
		    var size = 0, result = true;
		    // Recursively compare objects and arrays.
		    if (className == '[object Array]') {
		      // Compare array lengths to determine if a deep comparison is necessary.
		      size = a.length;
		      result = size == b.length;
		      if (result) {
		        // Deep compare the contents, ignoring non-numeric properties.
		        while (size--) {
		          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
		        }
		      }
		    } else {
		      // Deep compare objects.
		      for (var key in a) {
		        if (_.has(a, key)) {
		          // Count the expected number of properties.
		          size++;
		          // Deep compare each member.
		          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
		        }
		      }
		      // Ensure that both objects contain the same number of properties.
		      if (result) {
		        for (key in b) {
		          if (_.has(b, key) && !(size--)) break;
		        }
		        result = !size;
		      }
		    }
		    // Remove the first object from the stack of traversed objects.
		    aStack.pop();
		    bStack.pop();
		    return result;
		  };
		
		  // Perform a deep comparison to check if two objects are equal.
		  _.isEqual = function(a, b) {
		    return eq(a, b, [], []);
		  };
		
		  // Is a given array, string, or object empty?
		  // An "empty" object has no enumerable own-properties.
		  _.isEmpty = function(obj) {
		    if (obj == null) return true;
		    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
		    for (var key in obj) if (_.has(obj, key)) return false;
		    return true;
		  };
		
		  // Is a given value a DOM element?
		  _.isElement = function(obj) {
		    return !!(obj && obj.nodeType === 1);
		  };
		
		  // Is a given value an array?
		  // Delegates to ECMA5's native Array.isArray
		  _.isArray = nativeIsArray || function(obj) {
		    return toString.call(obj) == '[object Array]';
		  };
		
		  // Is a given variable an object?
		  _.isObject = function(obj) {
		    return obj === Object(obj);
		  };
		
		  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
		  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
		    _['is' + name] = function(obj) {
		      return toString.call(obj) == '[object ' + name + ']';
		    };
		  });
		
		  // Define a fallback version of the method in browsers (ahem, IE), where
		  // there isn't any inspectable "Arguments" type.
		  if (!_.isArguments(arguments)) {
		    _.isArguments = function(obj) {
		      return !!(obj && _.has(obj, 'callee'));
		    };
		  }
		
		  // Optimize `isFunction` if appropriate.
		  if (typeof (/./) !== 'function') {
		    _.isFunction = function(obj) {
		      return typeof obj === 'function';
		    };
		  }
		
		  // Is a given object a finite number?
		  _.isFinite = function(obj) {
		    return isFinite(obj) && !isNaN(parseFloat(obj));
		  };
		
		  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
		  _.isNaN = function(obj) {
		    return _.isNumber(obj) && obj != +obj;
		  };
		
		  // Is a given value a boolean?
		  _.isBoolean = function(obj) {
		    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
		  };
		
		  // Is a given value equal to null?
		  _.isNull = function(obj) {
		    return obj === null;
		  };
		
		  // Is a given variable undefined?
		  _.isUndefined = function(obj) {
		    return obj === void 0;
		  };
		
		  // Shortcut function for checking if an object has a given property directly
		  // on itself (in other words, not on a prototype).
		  _.has = function(obj, key) {
		    return hasOwnProperty.call(obj, key);
		  };
		
		  // Utility Functions
		  // -----------------
		
		  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
		  // previous owner. Returns a reference to the Underscore object.
		  _.noConflict = function() {
		    root._ = previousUnderscore;
		    return this;
		  };
		
		  // Keep the identity function around for default iterators.
		  _.identity = function(value) {
		    return value;
		  };
		
		  _.constant = function(value) {
		    return function () {
		      return value;
		    };
		  };
		
		  _.property = function(key) {
		    return function(obj) {
		      return obj[key];
		    };
		  };
		
		  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
		  _.matches = function(attrs) {
		    return function(obj) {
		      if (obj === attrs) return true; //avoid comparing an object to itself.
		      for (var key in attrs) {
		        if (attrs[key] !== obj[key])
		          return false;
		      }
		      return true;
		    }
		  };
		
		  // Run a function **n** times.
		  _.times = function(n, iterator, context) {
		    var accum = Array(Math.max(0, n));
		    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
		    return accum;
		  };
		
		  // Return a random integer between min and max (inclusive).
		  _.random = function(min, max) {
		    if (max == null) {
		      max = min;
		      min = 0;
		    }
		    return min + Math.floor(Math.random() * (max - min + 1));
		  };
		
		  // A (possibly faster) way to get the current timestamp as an integer.
		  _.now = Date.now || function() { return new Date().getTime(); };
		
		  // List of HTML entities for escaping.
		  var entityMap = {
		    escape: {
		      '&': '&amp;',
		      '<': '&lt;',
		      '>': '&gt;',
		      '"': '&quot;',
		      "'": '&#x27;'
		    }
		  };
		  entityMap.unescape = _.invert(entityMap.escape);
		
		  // Regexes containing the keys and values listed immediately above.
		  var entityRegexes = {
		    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
		    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
		  };
		
		  // Functions for escaping and unescaping strings to/from HTML interpolation.
		  _.each(['escape', 'unescape'], function(method) {
		    _[method] = function(string) {
		      if (string == null) return '';
		      return ('' + string).replace(entityRegexes[method], function(match) {
		        return entityMap[method][match];
		      });
		    };
		  });
		
		  // If the value of the named `property` is a function then invoke it with the
		  // `object` as context; otherwise, return it.
		  _.result = function(object, property) {
		    if (object == null) return void 0;
		    var value = object[property];
		    return _.isFunction(value) ? value.call(object) : value;
		  };
		
		  // Add your own custom functions to the Underscore object.
		  _.mixin = function(obj) {
		    each(_.functions(obj), function(name) {
		      var func = _[name] = obj[name];
		      _.prototype[name] = function() {
		        var args = [this._wrapped];
		        push.apply(args, arguments);
		        return result.call(this, func.apply(_, args));
		      };
		    });
		  };
		
		  // Generate a unique integer id (unique within the entire client session).
		  // Useful for temporary DOM ids.
		  var idCounter = 0;
		  _.uniqueId = function(prefix) {
		    var id = ++idCounter + '';
		    return prefix ? prefix + id : id;
		  };
		
		  // By default, Underscore uses ERB-style template delimiters, change the
		  // following template settings to use alternative delimiters.
		  _.templateSettings = {
		    evaluate    : /<%([\s\S]+?)%>/g,
		    interpolate : /<%=([\s\S]+?)%>/g,
		    escape      : /<%-([\s\S]+?)%>/g
		  };
		
		  // When customizing `templateSettings`, if you don't want to define an
		  // interpolation, evaluation or escaping regex, we need one that is
		  // guaranteed not to match.
		  var noMatch = /(.)^/;
		
		  // Certain characters need to be escaped so that they can be put into a
		  // string literal.
		  var escapes = {
		    "'":      "'",
		    '\\':     '\\',
		    '\r':     'r',
		    '\n':     'n',
		    '\t':     't',
		    '\u2028': 'u2028',
		    '\u2029': 'u2029'
		  };
		
		  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
		
		  // JavaScript micro-templating, similar to John Resig's implementation.
		  // Underscore templating handles arbitrary delimiters, preserves whitespace,
		  // and correctly escapes quotes within interpolated code.
		  _.template = function(text, data, settings) {
		    var render;
		    settings = _.defaults({}, settings, _.templateSettings);
		
		    // Combine delimiters into one regular expression via alternation.
		    var matcher = new RegExp([
		      (settings.escape || noMatch).source,
		      (settings.interpolate || noMatch).source,
		      (settings.evaluate || noMatch).source
		    ].join('|') + '|$', 'g');
		
		    // Compile the template source, escaping string literals appropriately.
		    var index = 0;
		    var source = "__p+='";
		    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
		      source += text.slice(index, offset)
		        .replace(escaper, function(match) { return '\\' + escapes[match]; });
		
		      if (escape) {
		        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
		      }
		      if (interpolate) {
		        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
		      }
		      if (evaluate) {
		        source += "';\n" + evaluate + "\n__p+='";
		      }
		      index = offset + match.length;
		      return match;
		    });
		    source += "';\n";
		
		    // If a variable is not specified, place data values in local scope.
		    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
		
		    source = "var __t,__p='',__j=Array.prototype.join," +
		      "print=function(){__p+=__j.call(arguments,'');};\n" +
		      source + "return __p;\n";
		
		    try {
		      render = new Function(settings.variable || 'obj', '_', source);
		    } catch (e) {
		      e.source = source;
		      throw e;
		    }
		
		    if (data) return render(data, _);
		    var template = function(data) {
		      return render.call(this, data, _);
		    };
		
		    // Provide the compiled function source as a convenience for precompilation.
		    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
		
		    return template;
		  };
		
		  // Add a "chain" function, which will delegate to the wrapper.
		  _.chain = function(obj) {
		    return _(obj).chain();
		  };
		
		  // OOP
		  // ---------------
		  // If Underscore is called as a function, it returns a wrapped object that
		  // can be used OO-style. This wrapper holds altered versions of all the
		  // underscore functions. Wrapped objects may be chained.
		
		  // Helper function to continue chaining intermediate results.
		  var result = function(obj) {
		    return this._chain ? _(obj).chain() : obj;
		  };
		
		  // Add all of the Underscore functions to the wrapper object.
		  _.mixin(_);
		
		  // Add all mutator Array functions to the wrapper.
		  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
		    var method = ArrayProto[name];
		    _.prototype[name] = function() {
		      var obj = this._wrapped;
		      method.apply(obj, arguments);
		      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
		      return result.call(this, obj);
		    };
		  });
		
		  // Add all accessor Array functions to the wrapper.
		  each(['concat', 'join', 'slice'], function(name) {
		    var method = ArrayProto[name];
		    _.prototype[name] = function() {
		      return result.call(this, method.apply(this._wrapped, arguments));
		    };
		  });
		
		  _.extend(_.prototype, {
		
		    // Start chaining a wrapped Underscore object.
		    chain: function() {
		      this._chain = true;
		      return this;
		    },
		
		    // Extracts the result from a wrapped and chained object.
		    value: function() {
		      return this._wrapped;
		    }
		
		  });
		
		  // AMD registration happens at the end for compatibility with AMD loaders
		  // that may not enforce next-turn semantics on modules. Even though general
		  // practice for AMD registration is to be anonymous, underscore registers
		  // as a named module because, like jQuery, it is a base library that is
		  // popular enough to be bundled in a third party lib, but not be part of
		  // an AMD load request. Those cases could generate an error when an
		  // anonymous define() is called outside of a loader request.
		  if (typeof define === 'function' && define.amd) {
		    define('underscore', [], function() {
		      return _;
		    });
		  }
		}).call(this);
		return this._;
	}).apply({});
	/* global _ */
	var VMAPParser = (function(_) {
		// jshint unused:false
		/* exported VMAPParser */
		/* global _ */
		var PREROLL = "preroll",
			MIDROLL = "midroll",
			POSTROLL = "postroll",
			OFFSET_START = "start",
			OFFSET_END = "end";
	
		function truncate(num) {
			return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
		}
	
		/**
		 * @ignore
		 * convert something like "00:00:29.9330000+00:00" to 29.93
		 */
	
		function rawTime(seconds) {
			var b = seconds.split(/\D/);
			return (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]) + (b[3] ? parseFloat("." + truncate(b[3])) : 0);
		}
	
		/**
		 * @ignore
		 * Used for logging
		 */
	
		function formatTime(secs) {
			if (_.isString(secs)) {
				secs = parseFloat(secs, 10);
			}
			var hours = Math.floor(secs / (60 * 60));
	
			var divisor_for_minutes = secs % (60 * 60);
			var minutes = Math.floor(divisor_for_minutes / 60);
	
			var seconds = divisor_for_minutes % 60;
			seconds = Math.round(seconds * 100) / 100;
	
			// This line gives you 12-hour (not 24) time
			if (hours > 12) {
				hours = hours - 12;
			}
	
			// These lines ensure you have two-digits
			if (hours < 10) {
				hours = "0" + hours;
			}
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
	
			// This formats your string to HH:MM:SS
			var t = hours + ":" + minutes + ":" + seconds;
	
			return t;
		}
		/**
		 * @ignore
		 * find all objects with a specific name.
		 */
	
		function find(source, target) {
			var result = [];
			if (_.isObject(source) || _.isArray(source)) {
				_.each(source, function(value, key) {
					if (key === target) {
						result.push(value);
					}
					if (_.isObject(value) || _.isArray(value)) {
						result = result.concat(find(value, target));
					}
				});
			}
			return result;
		}
		/**
		 * @ignore
		 * @return {String} Duration
		 */
	
		function getAdDuration(data) {
			var durations = find(data, "Duration");
			// seems to be only one?
			return rawTime(durations[0]);
		}
	
		function getClickThrough(data) {
			var clickThrough = find(data, "ClickThrough");
			if (clickThrough.length > 0) {
				return clickThrough[0];
			}
			return null;
		}
	
		/**
		 * @ignore
		 * remove namespaces, @'s, #'s and any unwanted nodes.
		 */
	
		function clean(value, key, obj) {
			if (key.indexOf("xmlns") === 0) {
				delete obj[key];
			} else {
				var parts = key.split(":");
				if (key.indexOf("@") === 0 || key.indexOf("#") === 0) {
					obj[key.slice(1)] = value;
					delete obj[key];
				} else if (parts.length === 2) {
					obj[parts[1]] = value;
					delete obj[key];
				}
			}
		}
	
		function cleanProps(obj) {
			_.each(_.rest(_.toArray(arguments)), function(value) {
				var cleaning = obj[value];
				if (_.isArray(cleaning)) {
					_.each(cleaning, function(value) {
						_.each(value, clean);
					});
				} else {
					_.each(cleaning, clean);
				}
			});
		}
	
	
		function getAdType(timeOffset) {
			if (timeOffset === OFFSET_START) {
				return PREROLL;
			} else if (timeOffset === OFFSET_END) {
				return POSTROLL;
			}
			return MIDROLL;
		}
	
		function getOffsetFromItem(type, duration) {
			switch (type) {
				case "firstQuartile":
					return duration / 4;
				case "midpoint":
					return duration / 2;
				case "thirdQuartile":
					return duration * 3 / 4;
				case "complete":
					return duration;
				default:
					break;
			}
		}
	
		function createTrackers(breakId, duration, tracking, trackerStartTime, trackers) {
			_.each(tracking, function(item) {
				_.each(item, clean);
				var offset = parseFloat(item.offset, 10),
					tracker = {
						breakId: breakId,
						event: item.event,
						url: item.text
					};
				if (isNaN(offset)) {
					offset = getOffsetFromItem(item.event, duration);
				}
				if (!isNaN(offset)) {
					tracker.timeToFire = Math.round(trackerStartTime + offset);
					// console.log("Fire at", formatTime(tracker.timeToFire), "or " + tracker.timeToFire + " seconds");
				}
				// scoped var
				trackers.push(tracker);
			});
		}
		/**
		 * @ignore
		 * VMAP parser
		 */
		var VMAPParser = {
			find: find,
			clean: clean,
			process: function(vmap) {
				if (!vmap) {
					return {
						error: "vmap undefined"
					};
				}
				var trackers = [],
					accumulatedAdTime = 0,
					totalPostrollTime = 0,
					totalDuration;
	
				// clean up the property names.
				vmap = vmap["vmap:VMAP"];
				_.each(vmap, clean);
				cleanProps(vmap, "AdBreak", "Extensions");
				cleanProps(vmap.Extensions, "unicornOnce", "requestParameters");
	
				function processAdPod(rolls, group, offset) {
					// the start time for the group based on other previous group times.
					var adPodOffset = accumulatedAdTime + parseFloat(offset, 10);
					if (offset === OFFSET_END) {
						// if we're going from the end
						adPodOffset = totalDuration - totalPostrollTime;
					}
					// console.log("Ad Pod, Offset: " + (offset === OFFSET_END ? "End" : formatTime(offset)));
					var endTime;
					_.each(group, function(ad) {
						var AdSource = ad.AdSource;
						_.each(AdSource, clean);
						// console.log(ad.breakId);
						// parse
						var duration = getAdDuration(AdSource.VASTData.VAST.Ad),
							startTime = _.isUndefined(endTime) ? adPodOffset : endTime;
						endTime = startTime + duration;
						accumulatedAdTime += duration;
						// console.log("From " + formatTime(startTime) + " to " + formatTime(endTime), "seconds: " + truncate(startTime) + "-" + truncate(endTime));
						// trackers
						createTrackers(AdSource.id, duration, _.flatten(find(AdSource, "Tracking")), startTime, trackers);
						var result = {
							type: getAdType(ad.timeOffset),
							breakId: AdSource.id,
							startTime: truncate(startTime),
							endTime: truncate(endTime),
							timeOffset: ad.timeOffset,
							duration: truncate(duration)
						};
						var clickThrough = getClickThrough(AdSource);
						if (clickThrough) {
							result.clickThrough = clickThrough;
						}
						rolls.push(result);
					});
					return rolls;
				}
	
				// the whole thing, content and ads.
				totalDuration = parseFloat(vmap.Extensions.unicornOnce.payloadlength, 10);
				// if there's only one ad break, convert it to an Array.
				if (!_.isArray(vmap.AdBreak) && _.isObject(vmap.AdBreak)) {
					vmap.AdBreak = [vmap.AdBreak];
				}
				// parse all the ad breaks.
				var rolls = _.reduce(_.groupBy(vmap.AdBreak, function(adBreak) {
					if (adBreak.timeOffset === OFFSET_START) {
						return 0;
					}
					if (adBreak.timeOffset === OFFSET_END) {
						totalPostrollTime += getAdDuration(adBreak);
						return OFFSET_END;
					}
					return rawTime(adBreak.timeOffset);
				}), processAdPod, []);
				// console.log("rolls", rolls);
				return {
					uri: vmap.Extensions.unicornOnce.contenturi,
					timedTextURL: vmap.Extensions.timedTextURL["#cdata-section"],
					contentDuration: truncate(parseFloat(vmap.Extensions.unicornOnce.contentlength, 10)),
					totalDuration: truncate(totalDuration),
					trackers: trackers,
					adBreaks: rolls
				};
			},
			rawTime: rawTime,
			formatTime: formatTime,
			version: "Thu May 08 2014 17:22:13",
			build: "0.3.1"
		};
		return VMAPParser;
	})(_);
	/* exported Url */
	var Url = (function() {
		/* exported Url */
		function Url(url, queryString) {
			if (url) {
				this._parse(url);
			}
		
			if (queryString) {
				this.getQueryString().parse(queryString);
			}
		}
		
		Url.version = "0.1.0";
		Url.build = "Mon Feb 24 2014 11:57:12";
		
		function QueryString(queryString) {
			this._params = {};
		
			if (queryString) {
				this.parse(queryString);
			}
		}
		
		var protocolChars = 'abcdefghijklmnopqrstuvwxyz0123456789+-.';
		var validProtocolChars = {};
		
		for (var i = 0; i < protocolChars.length; i++) {
			validProtocolChars[protocolChars.charAt(i)] = true;
		}
		
		Url.parse = function(url, queryString) {
			return new Url(url, queryString);
		};
		
		/**
		 * @static util method.
		 * Take an object of params and append them.
		   {
		      "param1": "value1", 
		      "param2": "value2"
		    }
		 */
		Url.setParameters = function(url, params) {
			if (params) {
				url = Url.parse(url);
				for (var name in params) {
					if (params.hasOwnProperty(name)) {
						url.setParameter(name, params[name]);
					}
				}
			}
			return url.toString();
		};
		
		Url.isValidProtocol = function(protocol) {
			for (var i = 0; i < protocol.length; i++) {
				/*
				 * If we find an illegal character in the protocol then this is not
				 * the protocol...
				 */
				if (!validProtocolChars[protocol.charAt(i)]) {
					return false;
				}
			}
		
			return true;
		};
		
		Url.prototype = {
			_parse: function(url) {
		
				var pos;
		
				/*
				 * parse the fragment (part after hash symbol) first according to
				 * RFC
				 */
				pos = url.indexOf('#');
				if (pos !== -1) {
					if ((pos + 1) < url.length) {
						this.hash = url.substring(pos + 1);
					}
		
					/* continue parsing everything before the hash symbol */
					url = url.substring(0, pos);
				}
		
				/* parse the protocol according to RFC */
				pos = url.indexOf(':');
				if (pos !== -1) {
					/*
					 * We found what might be the protocol but let's make sure it
					 * doesn't contain any invalid characters..
					 */
					var possibleProtocol = url.substring(0, pos).toLowerCase();
		
					if (Url.isValidProtocol(possibleProtocol)) {
						this.protocol = possibleProtocol;
						pos++;
		
						if (pos === url.length) {
							/*
							 * reached the end of the string (input was something
							 * like "http:"
							 */
							return;
						}
		
						/* continue parsing everything past the protocol */
						url = url.substring(pos);
					}
				}
		
				if ((url.charAt(0) === '/') && (url.charAt(1) === '/')) {
		
					// Url will contain network location (i.e. <host>:<port>)
		
					/* find where the path part starts */
					pos = url.indexOf('/', 2);
					if (pos === -1) {
						/*
						 * There is no path and there can't be a query according to
						 * the RFC
						 */
						if (url.length > 2) {
							this._parseNetworkLocation(url.substring(2));
						}
						return;
					} else {
						/*
						 * there is a path so parse network location before the path
						 */
						this._parseNetworkLocation(url.substring(2, pos));
						url = url.substring(pos);
					}
				}
		
				var protocol = this.protocol;
				if (!protocol || (protocol === 'http') || (protocol === 'https')) {
					/*
					 * Now parse the path and query string.. If there is no '?'
					 * character then the remaining portion is just the path.
					 */
					pos = url.indexOf('?');
					if (pos === -1) {
						this.path = url;
					} else {
						this.path = url.substring(0, pos);
						if ((pos + 1) < url.length) {
							this.queryString = new QueryString(url.substring(pos + 1));
						}
					}
				} else {
					this.path = url;
				}
			},
		
			/**
			 * Parse the network location which will contain the host and possibly
			 * the port.
			 *
			 * @param networkLocation
			 *            the network location portion of Url being parsed
			 */
			_parseNetworkLocation: function(networkLocation) {
				var pos = networkLocation.indexOf(':');
				if (pos === -1) {
					this.host = networkLocation;
				} else {
					this.host = networkLocation.substring(0, pos);
					if (pos < (networkLocation.length - 1)) {
						this.port = networkLocation.substring(pos + 1);
					}
				}
			},
		
			setPath: function(path) {
				this.path = path;
			},
		
			getPath: function() {
				return this.path;
			},
		
			getQueryString: function() {
				if (!this.queryString) {
					this.queryString = new QueryString();
				}
		
				return this.queryString;
			},
		
			setQueryString: function(queryString) {
				this.queryString = queryString;
			},
		
			/**
			 * converts the Url to its string representation
			 *
			 * @return {String} string representation ofUrl
			 */
			toString: function() {
				var queryString = (this.queryString) ? this.queryString.toString() : null;
		
				var parts = [];
		
				if (this.protocol) {
					parts.push(this.protocol);
					parts.push('://');
				}
		
				if (this.host !== undefined) {
					parts.push(this.host);
				}
		
				if (this.port !== undefined) {
					parts.push(':');
					parts.push(this.port);
				}
		
				parts.push(this.path);
		
				if (queryString) {
					parts.push('?');
					parts.push(queryString);
				}
		
				if (this.hash) {
					parts.push('#');
					parts.push(this.hash);
				}
		
				return parts.join('');
			},
		
			/**
			 * removes a parameter from the query string
			 *
			 * @param {String}
			 *            name parameter name
			 */
			removeParameter: function(name) {
				this.getQueryString().remove(name);
			},
		
			/**
			 * sets the value of a query string parameter
			 *
			 * @param {String}
			 *            name parameter name
			 * @param {String}
			 *            value parameter value
			 */
			setParameter: function(name, value) {
				this.getQueryString().set(name, value);
			},
		
			/**
			 * retrieves a value of parameter from the query string
			 *
			 * @param {String}
			 *            name parameter name
			 */
			getParameter: function(name) {
				return this.getQueryString().get(name);
			},
		
			getPathWithQueryString: function() {
				return (this.queryString) ? this.path + '?' + this.queryString : this.path;
			},
		
			getPort: function() {
				if (this.port !== undefined) {
					return this.port;
				}
		
				if (this.protocol === 'http') {
					return 80;
				}
		
				if (this.protocol === 'https') {
					return 443;
				}
		
				return undefined;
			}
		};
		
		QueryString.parse = function(queryString) {
			if (!queryString) {
				return new QueryString();
			}
		
			if (queryString.constructor === QueryString) {
				return queryString;
			} else {
				return new QueryString(queryString.toString());
			}
		};
		
		QueryString.prototype = {
		
			getParameters: function() {
				return this._params;
			},
		
			parse: function(queryString) {
		
				if (typeof queryString === 'object') {
					for (var key in queryString) {
						if (queryString.hasOwnProperty(key)) {
							this.add(key, queryString[key]);
						}
					}
				} else {
					var parameters = queryString.split('&');
		
					for (var i = 0; i < parameters.length; i++) {
						var param = parameters[i],
							pos = param.indexOf('=');
		
						var name, value;
		
						if (pos === -1) {
							name = param;
							value = null;
						} else {
							name = param.substring(0, pos);
							value = decodeURIComponent(param.substring(pos + 1));
						}
		
						if (name === '') {
							continue;
						}
		
						this.add(name, value);
					}
				}
			},
		
			/**
			 * removes a parameter from the query string
			 *
			 * @param {String} name parameter name
			 */
			remove: function(name) {
				delete this._params[name];
			},
		
			/**
			 * sets the value of a query string parameter
			 *
			 * @param {String} name parameter name
			 * @param {Strign} value parameter value
			 */
			set: function(name, value) {
				if (value === null) {
					this.remove(name);
				} else {
					this._params[name] = value;
				}
			},
		
			/**
			 * sets the value of a query string parameter
			 *
			 * @param {String} name parameter name
			 * @param {Strign} value parameter value
			 */
			add: function(name, value) {
				var existingValue = this._params[name];
		
				if (existingValue !== undefined) {
					if (existingValue.constructor === Array) {
						if (value.constructor === Array) {
							for (var i = 0; i < value.length; i++) {
								existingValue.push(value[i]);
							}
						} else {
							existingValue.push(value);
						}
						value = existingValue;
					} else {
						value = [existingValue, value];
					}
				}
		
				this._params[name] = value;
			},
		
			/**
			 * retrieves a value of parameter from the query string
			 *
			 * @param {String} name parameter name
			 */
			get: function(name) {
				var value = this._params[name];
				if (value === undefined) {
					return null;
				}
		
				return value;
			},
		
			/**
			 * This function is used to return a value array. If there is only one
			 * parameter with the given name then a new array is returned that
			 * contains the single item.
			 */
			getValues: function(name) {
				var value = this._params[name];
				if (value === undefined) {
					return null;
				}
		
				if (value.constructor === Array) {
					return value;
				} else {
					return [value];
				}
			},
		
		
			/**
			 * converts the Url to its string representation
			 *
			 * @return {String} string representation ofUrl
			 */
			toString: function() {
				var parts = [];
		
				for (var name in this._params) {
					if (this._params.hasOwnProperty(name)) {
						var value = this._params[name];
		
						if ((value === undefined) || (value === null)) {
							parts.push(name);
						} else if (value.constructor === Array) {
		
							for (var i = 0; i < value.length; i++) {
								parts.push(name + '=' + encodeURIComponent(value[i]));
							}
						} else {
							parts.push(name + '=' + encodeURIComponent(value));
						}
					}
				}
		
				return parts.join('&');
			}
		};
		return Url;
	})();
	/* exported Request */
	var Request = function(url, success, error) {
		var request = this.request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.setRequestHeader("Accept", "application/json");
	
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				// Success!
				var result,
					err;
				try {
					result = JSON.parse(request.responseText);
				} catch (e) {
					err = e;
				}
				if (result) {
					success(result);
				} else {
					error(err);
				}
			} else {
				// We reached our target server, but it returned an error
				error("Load Error, http status:" + request.status + " for " + url);
			}
		};
	
		request.onerror = function() {
			error("Load Error, http status:" + request.status + " for " + url);
		};
	
		request.send();
	};
	
	Request.prototype = {
		abort: function() {
			this.request.abort();
		}
	};
	// in a few cases we've chosen optimizing script length over efficiency of code.
	// I think that is the right choice for this library.  If you're adding and
	// triggering A LOT of events, you might want to use a different library.
	/* exported EventEmitter */
	var EventEmitter = {
		convert: function(obj, handlers) {
			// we store the list of handlers as a local variable inside the scope
			// so that we don't have to add random properties to the object we are
			// converting. (prefixing variables in the object with an underscore or
			// two is an ugly solution)
			//      we declare the variable in the function definition to use two less
			//      characters (as opposed to using 'var ').  I consider this an inelegant
			//      solution since smokesignals.convert.length now returns 2 when it is
			//      really 1, but doing this doesn't otherwise change the functionallity of
			//      this module, so we'll go with it for now
			handlers = {};
	
			// add a listener
			obj.on = function(eventName, handler) {
				// either use the existing array or create a new one for this event
				//      this isn't the most efficient way to do this, but is the shorter
				//      than other more efficient ways, so we'll go with it for now.
				(handlers[eventName] = handlers[eventName] || [])
				// add the handler to the array
				.push(handler);
	
				return obj;
			};
	
			// add a listener that will only be called once
			obj.once = function(eventName, handler) {
				// create a wrapper listener, that will remove itself after it is called
				function wrappedHandler() {
					// remove ourself, and then call the real handler with the args
					// passed to this wrapper
					handler.apply(obj.off(eventName, wrappedHandler), arguments);
				}
				// in order to allow that these wrapped handlers can be removed by
				// removing the original function, we save a reference to the original
				// function
				wrappedHandler.h = handler;
	
				// call the regular add listener function with our new wrapper
				return obj.on(eventName, wrappedHandler);
			};
	
			// remove a listener
			obj.off = function(eventName, handler) {
				// loop through all handlers for this eventName, assuming a handler
				// was passed in, to see if the handler passed in was any of them so
				// we can remove it
				//      it would be more efficient to stash the length and compare i
				//      to that, but that is longer so we'll go with this.
				for (var list = handlers[eventName], i = 0; handler && list && list[i]; i++) {
					// either this item is the handler passed in, or this item is a
					// wrapper for the handler passed in.  See the 'once' function
					/* jshint -W030 */
					list[i] !== handler && list[i].h !== handler ||
					// remove it!
					list.splice(i--, 1);
				}
				// if i is 0 (i.e. falsy), then there are no items in the array for this
				// event name (or the array doesn't exist)
				if (!i) {
					// remove the array for this eventname (if it doesn't exist then
					// this isn't really hurting anything)
					delete handlers[eventName];
				}
				return obj;
			};
	
			obj.emit = function(eventName) {
				// loop through all handlers for this event name and call them all
				//      it would be more efficient to stash the length and compare i
				//      to that, but that is longer so we'll go with this.
				for (var list = handlers[eventName], i = 0; list && list[i];) {
					list[i++].apply(obj, list.slice.call(arguments, 1));
				}
				return obj;
			};
	
			return obj;
		}
	};
	/* global _, Url */
	/* exported UMBEParams */
	/* jshint devel:true */
	var UMBEParams = (function() {
		// map these config properties to UMBEPARAMs
		// config prop is the key, value is the umbe key.
		var overrideMap = {
			owner_org: "owner",
			playlist_title: "v28",
			artist: "v29",
			franchise: "ser",
			video_title_start: "sst",
			video_title_end: "set"
		};
		return {
			append: function(config, options) {
				var mediaGen = config.mediaGen,
					images = mediaGen.images,
					overrideParams = config.overrideParams || {},
					umbeParams = {},
					prefix = "UMBEPARAM";
				options = options || {};
				if (mediaGen.vmap && mediaGen.vmap.uri) {
	
					// config values
					if (config.uri) {
						umbeParams[prefix + "c66"] = config.uri;
					}
	
					// values from overrideParams
					_.each(overrideParams, function(value, key) {
						var umbeKey = (overrideMap[key] || key);
						umbeParams[prefix + umbeKey] = value;
					});
	
					if (overrideParams.playlist_title) {
						// an extra value for the same key playlist_title.
						umbeParams[prefix + "plTitle"] = overrideParams.playlist_title;
					}
	
					// values from mediaGen.images
					if (!_.isEmpty(images)) {
						umbeParams[prefix + "c30"] = images[0].contentUri;
						umbeParams[prefix + "plLen"] = images.length;
						umbeParams[prefix + "ssd"] = images[0].startTime;
						umbeParams[prefix + "sed"] = images[images.length - 1].endTime;
					}
					// make sure options.umbeParams contain prefix.
					_.each(_.clone(options.umbeParams), function(value, key, list) {
						if (key.toUpperCase().indexOf(prefix) === -1) {
							options.umbeParams[prefix + key] = value;
							delete list[key];
						}
					});
					// override any umbeParams with options.umbeParams
					_.extend(umbeParams, options.umbeParams);
					mediaGen.vmap.uri = Url.setParameters(mediaGen.vmap.uri, umbeParams);
					return mediaGen.vmap.uri;
				}
			}
		};
	})();
	/* exported MediaGen */
	/* global _, VMAPParser, Segments */
	var MediaGen = {
		MEDIA_GEN_ERROR: "mediaGenError",
		getItem: function(p) {
			if (p && p.item) {
				return p.item;
			} else {
				return p.video.item;
			}
		},
		isVideoItem: function(item) {
			return _.isObject(item.vmap) || _.isObject(item.rendition) || _.isArray(item.rendition);
		},
		process: function(mediaGen) {
			if (_.isString(mediaGen)) {
				mediaGen = JSON.parse(mediaGen);
			}
			var item = this.getItem(mediaGen.package),
				result;
			if (_.isArray(item)) {
				// loop through all items and find the one where isVideoItem true.
				result = _.find(item, this.isVideoItem);
				if (result) {
					// put the overlay on the video item.
					result.overlay = _.find(item, function(maybeOverlay) {
						return maybeOverlay.placement === "overlay";
					});
				}
			} else if (this.isVideoItem(item)) {
				// oh, here we have mediaGen.package.video.item as a object. 
				result = item;
			}
			if (!result) {
				_.some(item, function(maybeError) {
					if (maybeError.type === "text") {
						throw {
							name: MediaGen.MEDIA_GEN_ERROR,
							message: maybeError.text
						};
					}
				});
			}
			if (result.vmap) {
				// process the vmap if it's there.
				result.vmap = VMAPParser.process(result.vmap);
				if (result.image) {
					Segments.process(result.vmap.adBreaks, result.image);
				}
			}
	
			// return only the video item, not any others.
			return result;
		}
	};
	/* global _ */
	/* exported Segments */
	var Segments = {
		process: function(adBreaks, segments) {
			return Segments.adjustForAds(adBreaks, Segments.configureSegments(segments));
		},
		configureSegments: function(segments) {
			var currentTime = 0,
				truncate = function(num) {
					return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
				};
			return _.map(segments, function(segment) {
				// make sure these are numbers. numbers are string in media gen world.
				_.each(["contentDurationMs", "keyframeIntervalSeconds", "width", "height"], function(prop) {
					segment[prop] = parseFloat(segment[prop], 10);
				});
				// why ms? convert to seconds.
				segment.duration = truncate(segment.contentDurationMs / 1000);
				segment.startTime = truncate(currentTime);
				segment.endTime = truncate(currentTime + segment.duration);
				currentTime += segment.duration;
				return segment;
			});
		},
		adjustForAds: function(adBreaks, segments) {
			// For each ad break, 
			_.each(adBreaks, function(adBreak) {
				// loop through each segment
				_.each(segments, function(segment) {
					// if the ad break start time is less than the segment's...
					if (adBreak.startTime <= segment.startTime) {
						// bump the start time and end time.
						segment.startTime += adBreak.duration;
						segment.endTime += adBreak.duration;
					}
				});
			});
			return segments;
		}
	};
	/* global _ */
	/* exported Images */
	var Images = {
		getTimeString: function(chars) {
			var s = "";
			_.times(4 - chars, function() {
				s += "0";
			});
			return s;
		},
		getImage: function(segments, time) {
			time = Math.floor(time);
			var foundSegment = _.find(segments, function(segment) {
				return time >= segment.startTime && time < segment.endTime;
			});
			if (foundSegment) {
				foundSegment = _.clone(foundSegment);
				var imageNumber = Math.floor((time - foundSegment.startTime) / foundSegment.keyframeIntervalSeconds),
					padding = Images.getTimeString(imageNumber.toString().length);
				foundSegment.src = foundSegment.src.replace("{0:0000}", padding + imageNumber);
			}
			return foundSegment;
		}
	};
	/* exported Config */
	/* global _ */
	var Config = {
		whitelist: [
			"feed",
			"mediaGen",
			"brightcove_mediagenRootURL",
			"getImage",
			"uri",
			"geo",
			"ref",
			"type",
			"group",
			"device",
			"network",
			"chromeless",
			"autoPlay",
			"adFreeInterval",
			"ccEnabled",
			"useSegmentedScrubber",
			"useNativeControls"
		],
		process: function(config) {
			if (config) {
				config.adFreeInterval = config.timeSinceLastAd;
				if (_.isUndefined(config.adFreeInterval)) {
					config.adFreeInterval = config.freewheelMinTimeBtwAds;
				}
			}
			return config;
		},
		prune: function(config, options) {
			if (config) {
				return _.pick(config, this.whitelist.concat(options.whitelist || []));
			}
		}
	};
	/* exported ConfigLoader */
	/* global _, EventEmitter, MediaGen, Config, Url, Request, Images, UMBEParams */
	var ConfigLoader = function(options) {
		this.options = options || {};
		_.defaults(options, {
			shouldLoadMediaGen: true,
			configParams: _.defaults(options.configParams || {}, {
				returntype: "config",
				configtype: "vmap",
				uri: options.uri
			}),
			mediaGenParams: options.mediaGenParams || {}
		});
		if (options.verboseErrorMessaging) {
			this.getErrorMessage = _.identity;
		}
		this.initialize.apply(this, arguments);
	},
		template = function(template, data) {
			template = template.replace(/\{{1,}/g, "{{").replace(/\}{1,}/g, "}}");
			return _.template(template, data, {
				interpolate: /\{\{(.+?)\}\}/g
			});
		},
		CONFIG_URL = "http://media.mtvnservices.com/pmt/e1/access/index.html",
		Events = ConfigLoader.Events = {
			READY: "ready",
			ERROR: "error"
		};
	ConfigLoader.DEFAULT_ERROR_MESSAGE = "Sorry, this video is currently not available.";
	ConfigLoader.prototype = {
		initialize: function() {
			_.bindAll(this, "onConfigLoaded", "onMediaGenLoaded", "onError", "onLoadError", "getImage");
			EventEmitter.convert(this);
		},
		shouldLoadMediaGen: true,
		getConfigUrl: function() {
			var url = template(this.options.configURL || CONFIG_URL, this.options, {});
			return Url.setParameters(url, this.options.configParams);
		},
		load: function() {
			this.request = new Request(
				this.getConfigUrl(),
				this.onConfigLoaded,
				this.onLoadError
			);
		},
		getImage: function(time) {
			if (this.config) {
				var mediaGen = this.config.mediaGen;
				if (mediaGen) {
					return Images.getImage(mediaGen.image, time);
				}
			}
			return undefined;
		},
		getMediaGenUrl: function() {
			var config = this.config,
				mediaGen = this.options.mediaGenURL || config[this.options.mediaGenProperty || "mediaGen"];
			if (!mediaGen) {
				this.onError(this.getErrorMessage("no media gen specified."));
			} else {
				mediaGen = Url.setParameters(template(mediaGen, config), _.clone(this.options.mediaGenParams));
			}
			return mediaGen;
		},
		onConfigLoaded: function(config) {
			if (config.config) {
				// PMT returns a nested config object in the config response.
				config = config.config;
			}
			if (config.error) {
				this.onError(this.getErrorMessage(config.error));
				return;
			}
			this.config = Config.process(config, this.options);
			this.config.getImage = this.getImage;
			if (this.options.shouldLoadMediaGen) {
				// the config property for the mediaGen can be specified.
				var mediaGen = this.getMediaGenUrl();
				if (!mediaGen) {
					this.onError(this.getErrorMessage("no media gen specified."));
				} else {
					this.request = new Request(
						mediaGen,
						this.onMediaGenLoaded,
						this.onLoadError
					);
				}
			} else {
				this.sendReady();
			}
		},
		onMediaGenLoaded: function(mediaGen) {
			var error;
			try {
				mediaGen = MediaGen.process(mediaGen);
			} catch (e) {
				error = true;
				if (e.name === MediaGen.MEDIA_GEN_ERROR) {
					this.onError(e.message);
				} else {
					this.onError(this.getErrorMessage(e));
				}
			}
			if (!error) {
				this.config.mediaGen = mediaGen;
				UMBEParams.append(this.config, this.options);
				this.sendReady();
			}
		},
		sendReady: function() {
			this.config = Config.prune(this.config, this.options);
			this.emit(Events.READY, {
				type: Events.READY,
				data: this.config,
				target: this
			});
		},
		onLoadError: function(data) {
			this.onError(this.getErrorMessage(data));
		},
		onError: function(data) {
			this.emit(Events.ERROR, {
				type: Events.ERROR,
				data: data,
				target: this
			});
		},
		getErrorMessage: function() {
			return ConfigLoader.DEFAULT_ERROR_MESSAGE;
		},
		destroy: function() {
			if (this.request) {
				this.request.abort();
			}
		}
	};
	ConfigLoader.version = "0.7.0";
	ConfigLoader.build = "Wed May 21 2014 13:00:29";
	return ConfigLoader;
})();