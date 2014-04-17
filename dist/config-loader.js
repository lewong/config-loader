/* global _, VMAPParser, Url */
var ConfigLoader = (function(_, VMAPParser, Url) {
	// jshint unused:false
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
		getItem: function(p) {
			if (p && p.item) {
				return p.item;
			} else {
				return p.video.item;
			}
		},
		process: function(mediaGen) {
			if (_.isString(mediaGen)) {
				mediaGen = JSON.parse(mediaGen);
			}
			var item = this.getItem(mediaGen.package),
				vmapItem;
			if (_.isArray(item)) {
				// if it's an array, find the item with a vmap property.
				vmapItem = _.find(item, function(maybeVmap) {
					return _.isObject(maybeVmap.vmap);
				});
				if (vmapItem) {
					vmapItem.overlay = _.find(item, function(maybeOverlay) {
						return maybeOverlay.placement === "overlay";
					});
				}
			} else if (_.isObject(item) && item.vmap) {
				vmapItem = item;
			}
			if (!vmapItem) {
				_.some(item, function(maybeError) {
					if (maybeError.type === "text") {
						throw maybeError.text;
					}
				});
			}
			// return only the vmap item.
			// and process only the vmap.
			vmapItem.vmap = VMAPParser.process(vmapItem.vmap);
			return vmapItem;
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
			mediaGen: false,
			configParams: _.defaults(options.configParams || {}, {
				returntype: "config",
				configtype: "vmap",
				uri: options.uri
			})
		});
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
	ConfigLoader.prototype = {
		initialize: function() {
			_.bindAll(this, "onConfigLoaded", "onMediaGenLoaded", "onError");
			EventEmitter.convert(this);
		},
		load: function() {
			var url = template(this.options.configURL || CONFIG_URL, this.options, {});
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
			if (config.error) {
				this.onError(config.error);
				return;
			}
			this.config = Config.process(config, this.options);
			// the config property for the mediaGen can be specified.
			var mediaGen = this.options.mediaGenURL || config[this.options.mediaGenProperty || "mediaGen"];
			if (!mediaGen) {
				this.onError("no media gen specified");
			} else {
				mediaGen = Url.setParameters(template(mediaGen, config), this.options.mediaGenParams);
				this.request = new Request(
					mediaGen,
					this.onMediaGenLoaded,
					this.onError
				);
			}
		},
		onMediaGenLoaded: function(mediaGen) {
			var error;
			try {
				mediaGen = MediaGen.process(mediaGen);
			} catch (e) {
				error = true;
				this.onError(e);
			}
			if (!error) {
				this.config.mediaGen = mediaGen;
				this.emit(Events.READY, {
					type: Events.READY,
					data: this.config,
					target: this
				});
			}
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
	ConfigLoader.version = "0.5.0";
	ConfigLoader.build = "Thu Apr 17 2014 16:08:27";
	return ConfigLoader;
})(_, VMAPParser, Url);