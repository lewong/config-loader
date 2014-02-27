var ConfigLoader = function() {
	"use strict";
	var Backbone, _, $;
	//= ../../components/jquery/jquery.js
	//= ../../components/lodash/dist/lodash.underscore.js
	_ = this._;
	$ = this.$;
	(function() {
		//= ../../components/backbone/backbone.js
		Backbone = this.Backbone;
		Backbone.$ = this.$;
	}).apply({
		_: _,
		$: $
	});
	//= ../../components/vmap-parser/dist/vmap-parser.js
	//= ../../components/url-util/dist/url-util.js
	//= ../media-gen.js
	//= ../config.js
	//= ../config-loader.js
	return ConfigLoader;
}.apply(this);