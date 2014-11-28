var uuid = guid();
var url = "http://w00tcamp-es.local:9200/seeingspace/log";

log = function(clientName, logName, json) {
	var data = {
		"clientTimestamp" : new Date().getTime(),
		"clientName" : clientName,
		"sessionGuid" : uuid,
		"logName" : logName,
		"json" : json 
	};

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.send(JSON.stringify(data));
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return function() {
	return
		s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	};
};
