/* global _, Segments */
/* exported Images */
var Images = function(adBreaks, segments) {
	this.segments = Segments.get(adBreaks, segments);
};
Images.prototype = {
	getImage: function(time) {
		time = Math.floor(time);
		var foundSegment = _.find(this.segments, function(segment) {
			return time >= segment.startTime && time < segment.endTime;
		});
		if (foundSegment) {
			foundSegment = _.clone(foundSegment);
			var imageNumber = Math.floor((time - foundSegment.startTime) / foundSegment.keyframeIntervalSeconds),
				padding = new Array(5 - imageNumber.toString().length).join("0");
			foundSegment.src = foundSegment.src.replace("{0:0000}", padding + imageNumber);
		}
		return foundSegment;
	}
};