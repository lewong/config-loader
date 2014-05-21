/* global equal, test, UMBEParams, Url */
/* jshint devel:true */
test("UMBEParams", function() {
	var url = "http://test-umbe-params.com/video.m3u8?a=b&c=d",
		config = {};
	equal(UMBEParams.append(config, url), url, "appened");
});
test("UMBEParams", function() {
	var url = "http://test-umbe-params.com/video.m3u8?a=b&c=d",
		config = {
			uri: "uri:hi:bye:uri"
		};
	equal(UMBEParams.append(config, url), url + "&UMBEPARAMc66=" + encodeURIComponent(config.uri), "appened");
});
test("UMBEParams test overrideParams", function() {
	var url = "http://test-umbe-params.com/video.m3u8?a=b&c=d",
		config = {
			uri: "uri:hi:bye:uri",
			overrideParams: {
				playlist_title: "playlist title",
				artist: "the artist",
				owner_org: "the owner",
				video_title_start: "video | title | start",
				video_title_end: "video | title | end"
			}
		};
	var result = new Url(UMBEParams.append(config, url, {
		umbeParams: {
			testParam: "test umbe param",
			UMBEPARAMtest2ndParam: "test second umbe param",
			UMBEPARAMtest3rdParam: "test third umbe param"
		}
	}));
	console.log("test-umbe-params.js:42 result", result.toString());
	equal(result.getParameter("UMBEPARAMc66"), config.uri, "contains c66");
	equal(result.getParameter("UMBEPARAMowner"), "the owner", "contains owner");
	equal(result.getParameter("UMBEPARAMv28"), "playlist title", "contains V28");
	equal(result.getParameter("UMBEPARAMplTitle"), "playlist title", "contains plTitle");
	equal(result.getParameter("UMBEPARAMv29"), "the artist", "contains v29");
	equal(result.getParameter("UMBEPARAMsst"), "video | title | start", "contains video_title_start");
	equal(result.getParameter("UMBEPARAMset"), "video | title | end", "contains video_title_end");
	equal(result.getParameter("UMBEPARAMtestParam"), "test umbe param", "contains passed in umbeParam");
	equal(result.getParameter("UMBEPARAMtest2ndParam"), "test second umbe param", "contains passed in umbeParam");
	equal(result.getParameter("UMBEPARAMtest3rdParam"), "test third umbe param", "contains passed in umbeParam");
});
test("UMBEParams test images", function() {
	var url = "http://test-umbe-params.com/video.m3u8?a=b&c=d",
		config = {
			uri: "uri:hi:bye:uri",
			overrideParams: {
				playlist_title: "playlist title"
			},
			mediaGen: {
				images: [{
					contentUri: "first segment uri",
					startTime: 20
				}, {
					contentUri: "second segment uri",
					endTime: 180
				}]
			}
		};
	var result = new Url(UMBEParams.append(config, url, {
		umbeParams: {
			testParam: "test umbe param",
			UMBEPARAMtest2ndParam: "test second umbe param",
			UMBEPARAMtest3rdParam: "test third umbe param"
		}
	}));
	console.log("test-umbe-params.js:42 result", result.toString());
	equal(result.getParameter("UMBEPARAMc66"), config.uri, "contains uri");
	equal(result.getParameter("UMBEPARAMplTitle"), "playlist title", "contains plTitle");
	equal(result.getParameter("UMBEPARAMc30"), "first segment uri", "contains c30");
	equal(result.getParameter("UMBEPARAMssd"), 20, "contains ssd");
	equal(result.getParameter("UMBEPARAMsed"), 180, "contains ssd");
	equal(result.getParameter("UMBEPARAMplLen"), 2, "contains plLen");
	equal(result.getParameter("UMBEPARAMtest2ndParam"), "test second umbe param", "contains passed in umbeParam");
	// TODO a bug in Url.getParamater.
	equal(result.getParameter("UMBEPARAMUMBEPARAMtest2ndParam"), null, "bad param get");
});
test("UMBEParams test single image", function() {
	var url = "http://test-umbe-params.com/video.m3u8?a=b&c=d",
		config = {
			uri: "uri:hi:bye:uri",
			overrideParams: {
				playlist_title: "playlist title"
			},
			mediaGen: {
				images: [{
					contentUri: "first segment uri",
					startTime: 20,
					endTime: 180
				}]
			}
		};
	var result = new Url(UMBEParams.append(config, url, {
		umbeParams: {
			testParam: "test umbe param",
			UMBEPARAMtest2ndParam: "test second umbe param",
			UMBEPARAMtest3rdParam: "test third umbe param"
		}
	}));
	console.log("test-umbe-params.js:42 result", result.toString());
	equal(result.getParameter("UMBEPARAMc66"), config.uri, "contains uri");
	equal(result.getParameter("UMBEPARAMplTitle"), "playlist title", "contains plTitle");
	equal(result.getParameter("UMBEPARAMc30"), "first segment uri", "contains c30");
	equal(result.getParameter("UMBEPARAMssd"), 20, "contains ssd");
	equal(result.getParameter("UMBEPARAMsed"), 180, "contains ssd");
	equal(result.getParameter("UMBEPARAMplLen"), 1, "contains plLen");
	equal(result.getParameter("UMBEPARAMtest2ndParam"), "test second umbe param", "contains passed in umbeParam");
	// TODO 
	equal(result.getParameter("UMBEPARAMUMBEPARAMtest2ndParam"), null, "bad param get");
	equal(result, "http://test-umbe-params.com/video.m3u8?a=b&c=d&UMBEPARAMc66=uri%3Ahi%3Abye%3Auri&UMBEPARAMv28=playlist%20title&UMBEPARAMplTitle=playlist%20title&UMBEPARAMc30=first%20segment%20uri&UMBEPARAMplLen=1&UMBEPARAMssd=20&UMBEPARAMsed=180&testParam=test%20umbe%20param&UMBEPARAMtest2ndParam=test%20second%20umbe%20param&UMBEPARAMtest3rdParam=test%20third%20umbe%20param&UMBEPARAMtestParam=test%20umbe%20param", "full url matches.");
});