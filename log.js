var uuid = guid();
var url = "http://w00tcamp-es.local:9200/seeingspace/log";

log = function(clientName, logName, json) {
	console.log('log');
	var data = {
		"clientTimestamp" : new Date().getTime(),
		"clientName" : clientName,
		"sessionGuid" : uuid,
		"logName" : logName,
		"json" : json 
	};

	meteorLog(data);
	elasticLog(data);
}

function meteorLog(data) {
	console.log('meteorLog');
	Logs.insert(data);
}

function elasticLog(data) {
	console.log('elasticLog');
	console.log(HTTP.call("POST", url, { data: data }));
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