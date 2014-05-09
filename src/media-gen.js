/* exported MediaGen */
/* global _, VMAPParser, Segments */
var MediaGen = {
	MEDIA_GEN_ERROR: "mediaGenError",
	getItem: function(p) {
		if (p && p.item) {
			return p.item;
		} else {
			return p.video.item;
		}
	},
	isVideoItem: function(item) {
		return _.isObject(item.vmap) || _.isObject(item.rendition) || _.isArray(item.rendition);
	},
	process: function(mediaGen) {
		if (_.isString(mediaGen)) {
			mediaGen = JSON.parse(mediaGen);
		}
		var item = this.getItem(mediaGen.package),
			result;
		if (_.isArray(item)) {
			// loop through all items and find the one where isVideoItem true.
			result = _.find(item, this.isVideoItem);
			if (result) {
				// put the overlay on the video item.
				result.overlay = _.find(item, function(maybeOverlay) {
					return maybeOverlay.placement === "overlay";
				});
			}
		} else if (this.isVideoItem(item)) {
			// oh, here we have mediaGen.package.video.item as a object. 
			result = item;
		}
		if (!result) {
			_.some(item, function(maybeError) {
				if (maybeError.type === "text") {
					throw {
						name: MediaGen.MEDIA_GEN_ERROR,
						message: maybeError.text
					};
				}
			});
		}
		if (result.vmap) {
			// process the vmap if it's there.
			result.vmap = VMAPParser.process(result.vmap);
			if (result.image) {
				Segments.process(result.vmap.adBreaks, result.image);
			}
		}

		// return only the video item, not any others.
		return result;
	}
};