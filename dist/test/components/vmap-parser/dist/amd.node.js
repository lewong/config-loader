(function(root, factory) {
	/* global exports, module, define, require */
	if (typeof exports === 'object') {
		module.exports = factory(require('lodash'));
	} else if (typeof define === 'function' && define.amd) {
		define(['lodash'], factory);
	}
}(this, function(_) {
	/* jshint unused:false */
	/* global VMAPParser */
	/* exported VMAPParser */
	/* global _ */
	var PREROLL = "preroll",
		MIDROLL = "midroll",
		POSTROLL = "postroll";
	
	function truncate(num) {
		return Math.round(num * 100) / 100;
	}
	
	/**
	 * @ignore
	 * convert something like "00:00:29.9330000+00:00" to 29.93
	 */
	
	function rawTime(seconds) {
		var b = seconds.split(/\D/);
		return (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]) + (b[3] ? parseFloat("." + truncate(b[3])) : 0);
	}
	
	/**
	 * @ignore
	 * Used for logging
	 */
	
	function formatTime(secs) {
		if (_.isString(secs)) {
			secs = parseFloat(secs, 10);
		}
		var hours = Math.floor(secs / (60 * 60));
	
		var divisor_for_minutes = secs % (60 * 60);
		var minutes = Math.floor(divisor_for_minutes / 60);
	
		var seconds = divisor_for_minutes % 60;
		seconds = Math.round(seconds * 100) / 100;
	
		// This line gives you 12-hour (not 24) time
		if (hours > 12) {
			hours = hours - 12;
		}
	
		// These lines ensure you have two-digits
		if (hours < 10) {
			hours = "0" + hours;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
	
		// This formats your string to HH:MM:SS
		var t = hours + ":" + minutes + ":" + seconds;
	
		return t;
	}
	/**
	 * @ignore
	 * find all objects with a specific name.
	 */
	
	function find(source, target) {
		var result = [];
		if (_.isObject(source) || _.isArray(source)) {
			_.each(source, function(value, key) {
				if (key === target) {
					result.push(value);
				}
				if (_.isObject(value) || _.isArray(value)) {
					result = result.concat(find(value, target));
				}
			});
		}
		return result;
	}
	/**
	 * @ignore
	 * @return {String} Duration
	 */
	
	function getAdDuration(data) {
		var durations = find(data, "Duration");
		// seems to be only one?
		return rawTime(durations[0]);
	}
	
	function getClickThrough(data) {
		var clickThrough = find(data, "ClickThrough");
		if (clickThrough.length > 0) {
			return clickThrough[0];
		}
		return null;
	}
	
	/**
	 * @ignore
	 * remove namespaces, @'s, #'s and any unwanted nodes.
	 */
	
	function clean(value, key, obj) {
		if (key.indexOf("xmlns") === 0) {
			delete obj[key];
		} else {
			var parts = key.split(":");
			if (key.indexOf("@") === 0 || key.indexOf("#") === 0) {
				obj[key.slice(1)] = value;
				delete obj[key];
			} else if (parts.length === 2) {
				obj[parts[1]] = value;
				delete obj[key];
			}
		}
	}
	
	function cleanProps(obj) {
		_.each(_.rest(_.toArray(arguments)), function(value) {
			var cleaning = obj[value];
			if (_.isArray(cleaning)) {
				_.each(cleaning, function(value) {
					_.each(value, clean);
				});
			} else {
				_.each(cleaning, clean);
			}
		});
	}
	
	
	function getAdType(timeOffset) {
		if (timeOffset === "start") {
			return PREROLL;
		} else if (timeOffset === "end") {
			return POSTROLL;
		}
		return MIDROLL;
	}
	
	function getOffsetFromItem(type, duration) {
		switch (type) {
			case "firstQuartile":
				return duration / 4;
			case "midpoint":
				return duration / 2;
			case "thirdQuartile":
				return duration * 3 / 4;
			case "complete":
				return duration;
			default:
				break;
		}
	}
	
	function createTrackers(breakId, duration, tracking, trackerStartTime, trackers) {
		_.each(tracking, function(item) {
			_.each(item, clean);
			var offset = parseFloat(item.offset, 10),
				tracker = {
					breakId: breakId,
					event: item.event,
					url: item.text
				};
			if (isNaN(offset)) {
				offset = getOffsetFromItem(item.event, duration);
			}
			if (!isNaN(offset)) {
				tracker.timeToFire = Math.round(trackerStartTime + offset);
				// console.log("Fire at", formatTime(tracker.timeToFire), "or " + tracker.timeToFire + " seconds");
			}
			// scoped var
			trackers.push(tracker);
		});
	}
	/**
	 * @ignore
	 * VMAP parser
	 */
	var VMAPParser = {
		find: find,
		clean: clean,
		process: function(vmap) {
			if (!vmap) {
				return {
					error: "vmap undefined"
				};
			}
			var trackers = [],
				accumulatedAdTime = 0,
				totalPostrollTime = 0,
				totalDuration,
				ranges = [];
	
			// clean up the property names.
			vmap = vmap["vmap:VMAP"];
			_.each(vmap, clean);
			cleanProps(vmap, "AdBreak", "Extensions");
			cleanProps(vmap.Extensions, "unicornOnce", "requestParameters");
	
			function processAdPod(rolls, group, offset) {
				// the start time for the group based on other previous group times.
				var adPodOffset = accumulatedAdTime + parseFloat(offset, 10);
				if (offset === "end") {
					// if we're going from the end
					adPodOffset = totalDuration - totalPostrollTime;
				}
				// console.log("Ad Pod, Offset: " + (offset === "end" ? "End" : formatTime(offset)));
				var adPodRange = [];
				_.each(group, function(ad) {
					var AdSource = ad.AdSource;
					_.each(AdSource, clean);
					// console.log(ad.breakId);
					// parse
					var duration = getAdDuration(AdSource.VASTData.VAST.Ad),
						adStartTime = _.isEmpty(adPodRange) ? adPodOffset : _.last(adPodRange) + 1,
						endTime = adStartTime + duration;
					accumulatedAdTime += duration;
					// console.log("From " + formatTime(adStartTime) + " to " + formatTime(endTime), "seconds: " + truncate(adStartTime) + "-" + truncate(endTime));
					// the range 
					adPodRange = adPodRange.concat(_.range(Math.ceil(adStartTime), Math.floor(endTime)));
					// trackers
					createTrackers(AdSource.id, duration, _.flatten(find(AdSource, "Tracking")), adStartTime, trackers);
					var result = {
						type: getAdType(ad.timeOffset),
						breakId: AdSource.id,
						startTime: adStartTime,
						endTime: endTime,
						timeOffset: ad.timeOffset,
						duration: duration
					};
					var clickThrough = getClickThrough(AdSource);
					if (clickThrough) {
						result.clickThrough = clickThrough;
					}
					rolls.push(result);
				});
				ranges.push(_.flatten(adPodRange));
				return rolls;
			}
	
			// the whole thing, content and ads.
			totalDuration = parseFloat(vmap.Extensions.unicornOnce.payloadlength, 10);
			// parse all the ad breaks.
			// console.log("vmap.js:240 vmap.AdBreak", vmap.AdBreak);
			var rolls = _.reduce(_.groupBy(vmap.AdBreak, function(adBreak) {
				if (adBreak.timeOffset === "start") {
					return 0;
				}
				if (adBreak.timeOffset === "end") {
					totalPostrollTime += getAdDuration(adBreak);
					return "end";
				}
				return rawTime(adBreak.timeOffset);
			}), processAdPod, []);
			// console.log("rolls", rolls);
			return {
				uri: vmap.Extensions.unicornOnce.contenturi,
				// ranges: ranges, TODO include ranges?
				contentDuration: parseFloat(vmap.Extensions.unicornOnce.contentlength, 10),
				totalDuration: totalDuration,
				trackers: trackers,
				adBreaks: rolls
			};
		},
		rawTime: rawTime,
		formatTime: formatTime,
		version: "Fri Feb 21 2014 16:12:51",
		build: "0.0.1"
	};
	return VMAPParser;
}));