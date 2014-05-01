/* exported ConfigLoader */
/* global _, EventEmitter, MediaGen, Config, Url, Request, Images */
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
		if (!this.images) {
			if (this.config) {
				var mediaGen = this.config.mediaGen;
				if (mediaGen) {
					this.images = new Images(mediaGen.vmap.adBreaks, mediaGen.image);
				}
			}
		}
		return this.images ? this.images.getImage(time) : undefined;
	},
	getMediaGenUrl: function() {
		var mediaGen = this.options.mediaGenURL || this.config[this.options.mediaGenProperty || "mediaGen"];
		if (!mediaGen) {
			this.onError(this.getErrorMessage("no media gen specified."));
		} else {
			var mediaGenParams = _.clone(this.options.mediaGenParams);
			_.each(this.config.overrideParams, function(value, key) {
				mediaGenParams["UMBEPARAM" + key] = value;
			});
			mediaGen = Url.setParameters(template(mediaGen, this.config), mediaGenParams);
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
ConfigLoader.version = "@@version";
ConfigLoader.build = "@@timestamp";