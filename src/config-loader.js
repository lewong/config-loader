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
	CONFIG_URL = "http://media.mtvnservices-q.mtvi.com/pmt/e1/access/index.html?returntype=config&configtype=vmap&uri={{uri}}",
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
		var mediaGen = Url.setParameters(config.mediaGen, this.options.mediaGenParams);
		this.request = new Request(
			mediaGen,
			this.onMediaGenLoaded,
			this.onError
		);
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