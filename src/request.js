/* exported Request */
var Request = function(url, success, error) {
	var request = this.request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var result,
				err;
			try {
				result = JSON.parse(request.responseText);
			} catch (e) {
				err = e;
			}
			if (result) {
				success(result);
			} else {
				error(err);
			}
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