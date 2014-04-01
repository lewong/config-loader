/* exported MediaGen */
/* global _, VMAPParser */
var MediaGen = {
	getItem: function(p) {
		if (p && p.item) {
			return p.item;
		} else {
			return p.video.item;
		}
	},
	process: function(mediaGen) {
		if (_.isString(mediaGen)) {
			mediaGen = JSON.parse(mediaGen);
		}
		var item = this.getItem(mediaGen.package),
			vmapItem;
		if (_.isArray(item)) {
			// if it's an array, find the item with a vmap property.
			vmapItem = _.find(item, function(maybeVmap) {
				return _.isObject(maybeVmap.vmap);
			});
		} else if (_.isObject(item) && item.vmap) {
			vmapItem = item;
		}
		// return only the vmap item.
		// and process only the vmap.
		vmapItem.vmap = VMAPParser.process(vmapItem.vmap);
		return vmapItem;
	}
};