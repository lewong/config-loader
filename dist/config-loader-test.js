/* global _, VMAPParser, Url */
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
		append: function(config, url, options) {
			var mediaGen = config.mediaGen || {},
				images = mediaGen.images,
				overrideParams = config.overrideParams || {},
				umbeParams = {},
				prefix = "UMBEPARAM";
			options = options || {};

			// config values
			if (config.uri) {
				umbeParams[prefix + "c66"] = config.uri;
			}

			// values from overrideParams
			_.each(overrideParams, function(value, key) {
				// only include override params that are in the override map.
				if (overrideMap[key]) {
					umbeParams[prefix + overrideMap[key]] = value;
				}
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
			return Url.setParameters(url, umbeParams);
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
			mediaGen = UMBEParams.append(this.config, mediaGen, this.options);
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
ConfigLoader.version = "0.8.0";
ConfigLoader.build = "Thu May 22 2014 11:00:16";