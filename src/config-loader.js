/* exported ConfigLoader */
/* global $, _, Backbone, MediaGen, Config, Url */
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
		this.request = $.ajax({
			url: url,
			dataType: "json",
			success: this.onConfigLoaded,
			error: this.onError
		});
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
		this.request = $.ajax({
			url: mediaGen,
			dataType: "json",
			success: this.onMediaGenLoaded,
			error: this.onError
		});
	},
	onMediaGenLoaded: function(mediaGen) {
		this.config.mediaGen = MediaGen.process(mediaGen);
		this.trigger(Events.READY, {
			type: Events.READY,
			data: this.config,
			target: this
		});
	},
	onError: function(data) {
		this.trigger(Events.ERROR, {
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
_.extend(ConfigLoader.prototype, Backbone.Events);