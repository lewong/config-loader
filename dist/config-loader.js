/* global _, $, VMAPParser */
var ConfigLoader = (function(_, $, VMAPParser) {
	// jshint unused:false
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
	/* exported ConfigLoader */
	/* global $, _, Backbone, MediaGen */
	var ConfigLoader = function(options) {
		this.options = options || {};
		_.defaults(options, {
			feed: true,
			mediaGen: false
		});
		this.initialize.apply(this, arguments);
	},
		CONFIG_URL = "http://localhost:3000/config/{{uri}}/?feed={{feed}}&mediaGen={{mediaGen}}",
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
			$.ajax({
				url: url,
				dataType: "json",
				error: this.onError,
				success: this.onConfigLoaded
			});
		},
		onConfigLoaded: function(config) {
			this.config = config;
			// TODO, this is temporary.
			var mediaGen = config.mediaGen.replace(/&amp;/gi, "&");
			$.ajax({
				url: mediaGen,
				dataType: "json",
				error: this.onError,
				success: this.onMediaGenLoaded
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
		}
	};
	_.extend(ConfigLoader.prototype, Backbone.Events);
	return ConfigLoader;
})(_, $, VMAPParser);