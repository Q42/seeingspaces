import socket, requests, json, uuid, time

url = 'http://w00tcamp-es.local:9200/seeingspace/log'
uuid = uuid.uuid1().__str__();

def log(clientName, logName, data):
	payload = {
		'clientTimestamp' : int(time.time() * 1000),
		'clientName' : clientName,
		'sessionGuid' : uuid,
		'logName' : logName,
		'json' : data 
	};
	headers = {'content-type': 'application/json'}
	response = requests.post(url, data=json.dumps(payload), headers=headers)
	return;
