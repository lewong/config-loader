/* global _ */
/* exported Segments */
var Segments = {
	process: function(adBreaks, segments) {
		return Segments.adjustForAds(adBreaks, Segments.configureSegments(segments));
	},
	configureSegments: function(segments) {
		var currentTime = 0,
			truncate = function(num) {
				return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
			};
		return _.map(segments, function(segment) {
			// make sure these are numbers. numbers are string in media gen world.
			_.each(["contentDurationMs", "keyframeIntervalSeconds", "width", "height"], function(prop) {
				segment[prop] = parseFloat(segment[prop], 10);
			});
			// why ms? convert to seconds.
			segment.duration = truncate(segment.contentDurationMs / 1000);
			segment.startTime = truncate(currentTime);
			segment.endTime = truncate(currentTime + segment.duration);
			currentTime += segment.duration;
			return segment;
		});
	},
	adjustForAds: function(adBreaks, segments) {
		// For each ad break, 
		_.each(adBreaks, function(adBreak) {
			// loop through each segment
			_.each(segments, function(segment) {
				// if the ad break start time is less than the segment's...
				if (adBreak.startTime <= segment.startTime) {
					// bump the start time and end time.
					segment.startTime += adBreak.duration;
					segment.endTime += adBreak.duration;
				}
			});
		});
		return segments;
	}
};