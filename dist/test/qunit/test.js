/*globals test, asyncTest, ConfigLoader, start, ok*/
test("exported", function() {
	ok(ConfigLoader, "Object Exported");
});


asyncTest("config loader", 7, function() {
	var cl = new ConfigLoader({
		uri: "mgid:cms:video:nickjr.com:119998",
		configParams: {
			someConfigParam: "param1"
		},
		mediaGenParams: {
			someMediaGenParam: "param2"
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
	cl.load();
});

asyncTest("test error", 2, function() {
	var cl = new ConfigLoader({
		configURL: "http://google.com",
		uri: "mgid:cms:video:nickjr.com:119998"
	});
	cl.on(ConfigLoader.Events.ERROR, function(event) {
		// equal totally causes the tests to hang :(
		ok(event.type === ConfigLoader.Events.ERROR);
		ok(event.target === cl, "event target match");
		start();
	});
	cl.load();
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