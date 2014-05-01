/* global _, deepEqual, equal, test, Images, Segments */
/* jshint devel:true */
var adBreaks = [{
	breakId: "0",
	startTime: 0,
	endTime: 30,
	duration: 30
}, {
	breakId: "1",
	startTime: 90,
	endTime: 120,
	duration: 30
}, {
	breakId: "2",
	startTime: 120,
	endTime: 150,
	duration: 30
}, {
	breakId: "3",
	startTime: 210,
	endTime: 240,
	duration: 30
}, {
	breakId: "4",
	startTime: 300,
	endTime: 315,
	duration: 15
}],
	// this is what comes back in the mediaGen on the `images` property.
	contentDurations = [{
		uri: "A",
		contentDurationMs: 60000,
		src: "url/A{0:0000}.jpg",
		keyframeIntervalSeconds: "6"
	}, {
		uri: "B",
		contentDurationMs: 60000,
		src: "url/B{0:0000}.jpg",
		keyframeIntervalSeconds: 6
	}, {
		uri: "C",
		contentDurationMs: 60000,
		src: "url/C{0:0000}.jpg",
		keyframeIntervalSeconds: "6"
	}],
	// this should match the above after processed.
	expectedSegments = [{
		uri: "A",
		startTime: 30,
		endTime: 90,
		contentDurationMs: 60000,
		duration: 60,
		src: "url/A{0:0000}.jpg",
		keyframeIntervalSeconds: 6
	}, {
		uri: "B",
		startTime: 150,
		endTime: 210,
		contentDurationMs: 60000,
		duration: 60,
		src: "url/B{0:0000}.jpg",
		keyframeIntervalSeconds: 6
	}, {
		uri: "C",
		startTime: 240,
		endTime: 300,
		contentDurationMs: 60000,
		duration: 60,
		src: "url/C{0:0000}.jpg",
		keyframeIntervalSeconds: 6
	}],
	getRange = function(start, end) {
		return _.map(_.range(start, end), function(time) {
			return time + (Math.floor(Math.random(10) * 100) / 100);
		});
	},
	getThumbnailIndex = function(time, startTime) {
		return Math.floor((time - startTime) / 6);
	};
// test start.
var images = new Images(adBreaks, contentDurations);
test("segments", function() {
	var result = Segments.adjustForAds(adBreaks, Segments.configureSegments(contentDurations));
	deepEqual(result, expectedSegments, "segments adjusted.");
});
test("ad break 0", function() {
	// the first ad duration is 30, should time=30 be an AD or Content?
	_.each(getRange(0, 29), function(time) {
		equal(images.getImage(time), undefined, "ad, no image at " + time);
	});
});
test("segment A", function() {
	_.each(getRange(30, 89), function(time) {
		console.log("test-images.js:82 time", time);
		var image = images.getImage(time),
			thumbnailIndex = getThumbnailIndex(time, image.startTime);
		equal(image.uri, "A", "image at " + time);
		equal(image.src, "url/A000" + thumbnailIndex + ".jpg", "image at " + time + " equals thumb:" + thumbnailIndex);
	});
});
test("ad break 1", function() {
	_.each(getRange(91, 150), function(time) {
		equal(images.getImage(time), undefined, "ad, no image at " + time);
	});
});
test("segment B", function() {
	_.each(getRange(151, 210), function(time) {
		var image = images.getImage(time),
			thumbnailIndex = getThumbnailIndex(time, image.startTime);
		equal(image.uri, "B", "image at " + time);
		equal(image.src, "url/B000" + thumbnailIndex + ".jpg", "image at " + time + " equals thumb:" + thumbnailIndex);
	});
});
test("ad break 2", function() {
	_.each(getRange(211, 240), function(time) {
		equal(images.getImage(time), undefined, "ad, no image at " + time);
	});
});
test("segment C", function() {
	_.each(getRange(241, 300), function(time) {
		var image = images.getImage(time),
			thumbnailIndex = getThumbnailIndex(time, image.startTime);
		equal(image.uri, "C", "image at " + time);
		equal(image.src, "url/C000" + thumbnailIndex + ".jpg", "image at " + time + " equals thumb:" + thumbnailIndex);
	});
});
test("ad break 3", function() {
	_.each(getRange(301, 350), function(time) {
		equal(images.getImage(time), undefined, "ad, no image at " + time);
	});
});