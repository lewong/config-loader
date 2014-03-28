/* exported MediaGen */
/* global _, VMAPParser */
var MediaGen = {
	process: function(mediaGen) {
		if (_.isString(mediaGen)) {
			mediaGen = JSON.parse(mediaGen);
		}
		var p = mediaGen.package;
		if (p && p.item) {
			mediaGen.vmap = VMAPParser.process(p.item.vmap);
			delete mediaGen.package;
			delete p.item;
		}
		return mediaGen;
	}
};