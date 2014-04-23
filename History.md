0.5.0 (WIP) / 2014-04-22 
==================

 * Never use default error message for media gen error responses.
 * Use default error message unless `verboseErrorMessaging:true` is passed in constructor.
 * Use overrideParams in mediaGen request. 
 * Add test for timedTextURL.
 * Use live PMT url. 
 * Handle mediaGen errors.
 * Append overaly item to mediaGen.
 * Update tests now that config response returns correctly formatted errors.
 * Set request header `Accept` to application/json. When receiving a json error response, dispatch the `ERROR` event with the message in the response.
 * Update tests to use media-resolver.

0.4.0 / 2014-04-01 
==================

 * `mediaGenProperty` the name of the config property that contains the mediaGen URL.
 * Handling errors better.
 * Wrap VMAP/mediaGen parse in a try/catch and emit error event.
 * Remove parsing of ampersands, no longer needed.
 * removing $ and Backbone deps, using micro libs and custom code.

0.3.0 / 2014-02-27 
==================

 * Including build and version info.
 * Use PMT Url. Test run off of the pjs services until pmt stables. 
 * Process config client side in lieu of not using service.
 * Create bundled build with deps for Ensemble.

0.2.0 / 2014-02-25 
==================

 * Add destroy method and destroy method test.
