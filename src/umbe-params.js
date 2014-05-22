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