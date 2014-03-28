/* exported Request */
var Request = function(url, success, error) {
	var request = this.request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			success(JSON.parse(request.responseText));
		} else {
			// We reached our target server, but it returned an error
			error(request.status);
		}
	};

	request.onerror = function() {
		error(request.status);
	};

	request.send();
};

Request.prototype = {
	abort: function() {
		this.request.abort();
	}
};