/* global _ */
/* exported Images */
var Images = {
	getTimeString: function(chars) {
		var s = "";
		_.times(4 - chars, function() {
			s += "0";
		});
		return s;
	},
	getImage: function(segments, time) {
		time = Math.floor(time);
		var foundSegment = _.find(segments, function(segment) {
			return time >= segment.startTime && time < segment.endTime;
		});
		if (foundSegment) {
			foundSegment = _.clone(foundSegment);
			var imageNumber = Math.floor((time - foundSegment.startTime) / foundSegment.keyframeIntervalSeconds),
				padding = Images.getTimeString(imageNumber.toString().length);
			foundSegment.src = foundSegment.src.replace("{0:0000}", padding + imageNumber);
		}
		return foundSegment;
	}
};