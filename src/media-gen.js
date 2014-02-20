/* exported MediaGen */
/* global _, VMAPParser */
var MediaGen = {
	process: function(mediaGen) {
		console.log("media-gen.js:8 mediaGen", mediaGen);
		try {
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
		} catch (e) {
			console.error("model/media-gen.js, error parsing mediagen", e);
		}
		return mediaGen;
	}
};