/* global _, Url */
/* exported UMBEParams */
/* jshint devel:true */
var UMBEParams = (function() {
	// map these config properties to UMBEPARAMs
	// umbe is the key, config prop is the value.	
	var configMap = {
		c66: "uri"
	},
		overrideMap = {
			owner: "owner_org",
			v28: "playlist_title",
			plTitle: "playlist_title",
			ser: "franchise"
		};
	return {
		append: function(config, options) {
			var mediaGen = config.mediaGen,
				images = mediaGen.images,
				umbeParams = {},
				prefix = "UMBEPARAM";
			if (mediaGen.vmap && mediaGen.vmap.uri) {
				_.each(config.overrideParams, function(value, key) {
					umbeParams[prefix + key] = value;
				});
				// values from config
				_.each(configMap, function(value, key) {
					if (config[value]) {
						umbeParams[prefix + key] = config[value];
					}
				});
				// values from overrideParams
				_.each(overrideMap, function(value, key) {
					if (config.overrideParams[value]) {
						umbeParams[prefix + key] = config.overrideParams[value];
					}
				});
				// values from mediaGen.images
				if (!_.isEmpty(images)) {
					umbeParams.c30 = images[0].contentUri;
					umbeParams.plLen = images.length;
					umbeParams.ssd = images[0].startTime;
					umbeParams.sed = images[images.length - 1].endTime;
				}
				// make sure options.umbeParams contain prefix.
				_.each(options.umbeParams, function(value, key, list) {
					if (key.toLowerCase().indexOf("umbeparams") === -1) {
						list[prefix + key] = value;
						delete list[key];
					}
				});
				// override any umbeParams with options.umbeParams
				_.extend(umbeParams, options.umbeParams);
				mediaGen.vmap.uri = Url.setParameters(mediaGen.vmap.uri, umbeParams);
			}
		}
	};
})();