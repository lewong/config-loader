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
ConfigLoader.version = "@@version";
ConfigLoader.build = "@@timestamp";