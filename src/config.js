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