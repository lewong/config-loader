/* exported ConfigLoader */
/* global $, _, Backbone, MediaGen, Url */
var ConfigLoader = function(options) {
	this.options = options || {};
	_.defaults(options, {
		feed: true,
		mediaGen: false
	});
	this.initialize.apply(this, arguments);
},
	CONFIG_URL = "http://pjs-services-dev-cmtnxgpqy5.elasticbeanstalk.com/config/{{uri}}/?feed={{feed}}&mediaGen={{mediaGen}}",
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
		this.request = $.getJSON(url, this.onConfigLoaded);
		this.request.onerror = this.onError;
	},
	onConfigLoaded: function(config) {
		this.config = config;
		// TODO, this is temporary.
		var mediaGen = config.mediaGen.replace(/&amp;/gi, "&");
		mediaGen = Url.setParameters(mediaGen, this.options.mediaGenParams);
		this.request = $.getJSON(mediaGen, this.onMediaGenLoaded);
		this.request.onerror = this.onError;
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