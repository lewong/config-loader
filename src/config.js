/* exported Config */
/* global _ */
var Config = {
	whitelist: [
		"feed",
		"mediaGen",
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
	process: function(config, options) {
		if (config) {
			config.adFreeInterval = config.timeSinceLastAd;
			if (_.isUndefined(config.adFreeInterval)) {
				config.adFreeInterval = config.freewheelMinTimeBtwAds;
			}
			config = _.pick(config, this.whitelist.concat(options.whitelist || []));
		}
		return config;
	}
};