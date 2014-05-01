/*globals test, asyncTest, ConfigLoader, start, ok, expect, equal*/
/* jshint devel:true */
test("exported", function() {
	ok(ConfigLoader, "Object Exported");
});

asyncTest("config loader", 7, function() {
	var cl = new ConfigLoader({
		uri: "mgid:uma:videolist:mtv.com:1724375",
		mediaGenProperty: "brightcove_mediagenRootURL",
		configParams: {
			ref: "http://media.mtvnservices.com/player/api/xbox/MTV_App_XBoxone_v1"
		}
	});
	cl.on(ConfigLoader.Events.READY, function(event) {
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.READY, "event type READY");
		ok(event.target === cl, "event target match");
		var config = event.data;
		ok(config, "config exists");
		ok(config.mediaGen, "config.mediaGen exists");
		ok(config.mediaGen.vmap, "config.mediaGen.vmap exists");
		ok(config.mediaGen.vmap.adBreaks, "config.mediaGen.vmap.adBreaks exists");
		ok(config.mediaGen.vmap.trackers, "config.mediaGen.vmap.trackers exists");

		start();
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.error("config loader test", event.data);
		expect(1);
		ok(false, "error thrown");
		start();
	});
	cl.load();
});

asyncTest("load regular mediaGen", 6, function() {
	var cl = new ConfigLoader({
		uri: "mgid:uma:videolist:mtv.com:1713174",
		mediaGenURL: "http://media-utils.mtvnservices.com/services/MediaGenerator/mgid:uma:video:mtv.com:903906?format=json"
	});
	cl.on(ConfigLoader.Events.READY, function(event) {
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.READY, "event type READY");
		ok(event.target === cl, "event target match");
		var config = event.data;
		ok(config, "config exists");
		ok(config.mediaGen, "config.mediaGen exists");
		ok(config.mediaGen.rendition, "config.mediaGen.rendition exists");
		ok(config.mediaGen.rendition[0].src, "config.mediaGen.rendition src exists");
		start();
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.error("config loader test", event.data);
		expect(1);
		ok(false, "error thrown");
		start();
	});
	cl.load();
});

asyncTest("test images", 8, function() {
	var cl = new ConfigLoader({
		uri: "mgid:uma:videolist:mtv.com:1724375",
		mediaGenProperty: "brightcove_mediagenRootURL",
		mediaGenURL: "data/mediaGenWithImages.json",
		configParams: {
			ref: "http://media.mtvnservices.com/player/api/xbox/MTV_App_XBoxone_v1"
		}
	});
	cl.on(ConfigLoader.Events.READY, function(event) {
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.READY, "event type READY");
		ok(event.target === cl, "event target match");
		var config = event.data;
		ok(config, "config exists");
		ok(config.mediaGen, "config.mediaGen exists");
		console.log("test.js:78 config.mediaGen.vmap", config.mediaGen.vmap);
		equal(config.getImage(0), undefined, 'no thumb matches');
		equal(config.getImage(30), undefined, 'no thumb matches');
		equal(config.getImage(31).src, "http://a16.akadl.mtvnservices.com/10740/mtvnorigin/gsp.originmusicstor/sites/mtv.com/shows/catfish/208/full/mt_catfish_ep208_306158_next_960x540_2200_m31_thumbs/t_0000.jpg", 'thumbnail matches');
		equal(config.getImage(60).src, "http://a16.akadl.mtvnservices.com/10740/mtvnorigin/gsp.originmusicstor/sites/mtv.com/shows/catfish/208/full/mt_catfish_ep208_306158_next_960x540_2200_m31_thumbs/t_0004.jpg", 'thumbnail matches');
		start();
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.error("config loader test", event.data);
		expect(1);
		ok(false, "error thrown");
		start();
	});
	cl.load();
});

asyncTest("media gen property with local json", 9, function() {
	var cl = new ConfigLoader({
		uri: "mgid:uma:videolist:mtv.com:1712673",
		mediaGenProperty: "brightcove_mediagenRootURL",
		mediaGenURL: "data/mediaGen.json",
		configParams: {
			ref: "http://media.mtvnservices.com/player/api/xbox/MTV_App_XBoxone_v1",
			someConfigParam: "param1"
		}
	});
	cl.on(ConfigLoader.Events.READY, function(event) {
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.READY, "event type READY");
		ok(event.target === cl, "event target match");
		var config = event.data;
		ok(config, "config exists");
		ok(config.mediaGen, "config.mediaGen exists");
		ok(config.mediaGen.vmap, "config.mediaGen.vmap exists");
		ok(config.mediaGen.vmap.adBreaks, "config.mediaGen.vmap.adBreaks exists");
		ok(config.mediaGen.vmap.trackers, "config.mediaGen.vmap.trackers exists");
		ok(config.mediaGen.vmap.timedTextURL, "config.mediaGen.timedTextURL");
		ok(config.mediaGen.overlay, "config.mediaGen.overlay");
		console.log("test.js:49 config", config);
		start();
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.log("test.js:49 event", event.data);
		ok(false, "error thrown");
		start();
	});
	cl.load();
});

asyncTest("media gen property", 8, function() {
	var cl = new ConfigLoader({
		uri: "mgid:uma:videolist:mtv.com:1712673",
		mediaGenProperty: "brightcove_mediagenRootURL",
		configParams: {
			ref: "http://media.mtvnservices.com/player/api/xbox/MTV_App_XBoxone_v1",
			someConfigParam: "param1"
		}
	});
	cl.on(ConfigLoader.Events.READY, function(event) {
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.READY, "event type READY");
		ok(event.target === cl, "event target match");
		var config = event.data;
		ok(config, "config exists");
		ok(config.mediaGen, "config.mediaGen exists");
		ok(config.mediaGen.vmap, "config.mediaGen.vmap exists");
		ok(config.mediaGen.vmap.adBreaks, "config.mediaGen.vmap.adBreaks exists");
		ok(config.mediaGen.vmap.trackers, "config.mediaGen.vmap.trackers exists");
		ok(config.mediaGen.overlay, "config.mediaGen.overlay");
		console.log("test.js:49 config", config);
		start();
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.error("unexpected", event.data);
		ok(false, "error thrown");
		start();
	});
	cl.load();
});

asyncTest("json parse error", 1, function() {
	var cl = new ConfigLoader({
		configURL: "data/invalid-format.json"
	});
	cl.on(ConfigLoader.Events.ERROR, function() {
		ok(true, "error thrown");
		start();
	});
	cl.load();
});

asyncTest("test config error", 2, function() {
	var cl = new ConfigLoader({
		configURL: "http://google.com",
		uri: "mgid:cms:video:nickjr.com:119998"
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.ERROR, "async test error, type");
		ok(event.target === cl, "async test error, event target match");
		start();
	});
	cl.load();
});


asyncTest("test mediaGen error with verboseErrorMessaging", 1, function() {
	var cl = new ConfigLoader({
		uri: "mgid:uma:videolist:mtv.com:17243f75",
		mediaGenProperty: "brightcove_mediagenRootURL",
		verboseErrorMessaging: true,
		configParams: {
			ref: "http://media.mtvnservices.com/player/api/xbox/MTV_App_XBoxone_v1"
		}
	});
	cl.on(ConfigLoader.Events.READY, function() {
		ok(false, "ready event fired");
		start();
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		equal(event.data, "Sorry, this video is not found or no longer available due to date or rights restrictions.", "test error message");
		start();
	});
	cl.load();
});

asyncTest("test mediaGen error", 1, function() {
	var cl = new ConfigLoader({
		uri: "mgid:uma:videolist:mtv.com:17243f75",
		mediaGenProperty: "brightcove_mediagenRootURL",
		configParams: {
			ref: "http://media.mtvnservices.com/player/api/xbox/MTV_App_XBoxone_v1"
		}
	});
	cl.on(ConfigLoader.Events.READY, function() {
		ok(false, "ready event fired");
		start();
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		// verbose messages are always on for media gen error responses.
		equal(event.data, "Sorry, this video is not found or no longer available due to date or rights restrictions.", "test error message");
		start();
	});
	cl.load();
});

asyncTest("test error response parser error", 3, function() {
	var cl = new ConfigLoader({
		configURL: "http://media.mtvnservices-q.mtvi.com/pmt/e1/access/index.html?returntype=config&configtype=html&stage=d"
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.log("test mediaGen parser error:", event.data);
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.ERROR, "event type");
		ok(event.target === cl, "event target match");
		ok(event.data === ConfigLoader.DEFAULT_ERROR_MESSAGE, "error message match");
		start();
	});
	cl.load();
});

asyncTest("test error response parser error with verbose messaging", 3, function() {
	var cl = new ConfigLoader({
		configURL: "http://media.mtvnservices-q.mtvi.com/pmt/e1/access/index.html?returntype=config&configtype=html&stage=d",
		verboseErrorMessaging: true
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.log("test mediaGen parser error:", event.data);
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.ERROR, "event type");
		ok(event.target === cl, "event target match");
		equal(event.data, "there was an error", "error message match");
		start();
	});
	cl.load();
});

asyncTest("test error response parser error local", 3, function() {
	var cl = new ConfigLoader({
		configURL: "data/error.json"
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.log("test mediaGen parser error:", event.data);
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.ERROR, "event type");
		ok(event.target === cl, "event target match");
		equal(event.data, ConfigLoader.DEFAULT_ERROR_MESSAGE, "error message match");
		start();
	});
	cl.load();
});

asyncTest("test error response parser error local with verboseErrorMessaging", 3, function() {
	var cl = new ConfigLoader({
		configURL: "data/error.json",
		verboseErrorMessaging: true
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.log("test mediaGen parser error:", event.data);
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.ERROR, "event type");
		ok(event.target === cl, "event target match");
		equal(event.data, "json formatted error", "error message match");
		start();
	});
	cl.load();
});

asyncTest("test mediaGen parser error", 2, function() {
	var cl = new ConfigLoader({
		uri: "mgid:cms:video:nickjr.com:119998"
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		console.log("test mediaGen parser error:", event.data);
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.ERROR, "event type");
		ok(event.target === cl, "event target match");
		start();
	});
	setTimeout(function() {
		cl.onMediaGenLoaded(undefined);
	}, 500);
});

asyncTest("test abort", 1, function() {
	var cl = new ConfigLoader({
		uri: "mgid:cms:video:nickjr.com:119998"
	});
	cl.on(ConfigLoader.Events.READY, function() {
		throw "config loaded!";
	});
	cl.load();
	cl.destroy();
	setTimeout(function() {
		ok(true, "config not loaded");
		start();
	}, 2000);
});