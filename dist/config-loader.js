/* global _, VMAPParser, Url */
var ConfigLoader = (function(_, VMAPParser, Url) {
	// jshint unused:false
	/* exported Request */
	var Request = function(url, success, error) {
		var request = this.request = new XMLHttpRequest();
		request.open('GET', url, true);
	
		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				// Success!
				success(JSON.parse(request.responseText));
			} else {
				// We reached our target server, but it returned an error
				error(request.status);
			}
		};
	
		request.onerror = function() {
			error(request.status);
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
	/* exported MediaGen */
	/* global _, VMAPParser */
	var MediaGen = {
		process: function(mediaGen) {
			if (mediaGen) {
				if (_.isString(mediaGen)) {
					mediaGen = JSON.parse(mediaGen);
				}
				var p = mediaGen.package;
				if (p && p.item) {
					mediaGen.vmap = VMAPParser.process(p.item.vmap);
					delete mediaGen.package;
					delete p.item;
				}
			}
			return mediaGen;
		}
	};
	/* exported Config */
	/* global _ */
	var Config = {
		whitelist: [
			"feed",
			"mediaGen",
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
		process: function(config, options) {
			if (config) {
				config.adFreeInterval = config.timeSinceLastAd;
				if (_.isUndefined(config.adFreeInterval)) {
					config.adFreeInterval = config.freewheelMinTimeBtwAds;
				}
				config = _.pick(config, this.whitelist.concat(options.whitelist || []));
			}
			return config;
		}
	};
	/* exported ConfigLoader */
	/* global _, EventEmitter, MediaGen, Config, Url, Request */
	var ConfigLoader = function(options) {
		this.options = options || {};
		_.defaults(options, {
			feed: true,
			mediaGen: false
		});
		this.initialize.apply(this, arguments);
	},
		// CONFIG_URL = "http://pjs-services-dev-cmtnxgpqy5.elasticbeanstalk.com/config/{{uri}}/?feed={{feed}}&mediaGen={{mediaGen}}",
		CONFIG_URL = "http://media.mtvnservices-q.mtvi.com/pmt/e1/access/index.html?returntype=config&configtype=vmap&uri={{uri}}",
		Events = ConfigLoader.Events = {
			READY: "ready",
			ERROR: "error"
		};
	ConfigLoader.prototype = {
		initialize: function() {
			_.bindAll(this, "onConfigLoaded", "onMediaGenLoaded", "onError");
		},
		load: function() {
			var url = _.template(this.options.configURL || CONFIG_URL, this.options, {
				interpolate: /\{\{(.+?)\}\}/g
			});
			url = Url.setParameters(url, this.options.configParams);
			this.request = new Request(
				url,
				this.onConfigLoaded,
				this.onError
			);
		},
		onConfigLoaded: function(config) {
			if (config.config) {
				// PMT returns a nested config object in the config response.
				config = config.config;
			}
			this.config = Config.process(config, this.options);
			// TODO, this is temporary.
			var mediaGen = config.mediaGen.replace(/&amp;/gi, "&");
			mediaGen = Url.setParameters(mediaGen, this.options.mediaGenParams);
			this.request = new Request(
				mediaGen,
				this.onMediaGenLoaded,
				this.onError
			);
		},
		onMediaGenLoaded: function(mediaGen) {
			this.config.mediaGen = MediaGen.process(mediaGen);
			this.emit(Events.READY, {
				type: Events.READY,
				data: this.config,
				target: this
			});
		},
		onError: function(data) {
			this.emit(Events.ERROR, {
				type: Events.ERROR,
				data: data,
				target: this
			});
		},
		destroy: function() {
			if (this.request) {
				this.request.abort();
			}
		}
	};
	ConfigLoader.version = "0.4.0";
	ConfigLoader.build = "Wed Mar 05 2014 15:58:24";
	EventEmitter.convert(ConfigLoader.prototype);
	return ConfigLoader;
})(_, VMAPParser, Url);