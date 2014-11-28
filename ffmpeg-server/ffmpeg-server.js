var express = require('express')
var exec = require('child_process').exec
var elasticsearch = require('elasticsearch');
var child = null

var esClient = new elasticsearch.Client({
  host: 'w00tcamp-es.local:9200',
  log: 'info'
});

var app = express()
app.get('/', function (req, res) {

  var offset = (req.query.offset || "0").toHHMMSS()

  
  var camera = req.query.camera || "overview"
  var timestamp = req.query.timestamp

  var epochTimestamp = Date.parse(timestamp)
  if (isNaN(epochTimestamp)) {
    console.warn("Invalid timestamp: " + timestamp)
    return;
  }

  findLatestVideo(camera, timestamp).then(function (resp) {
    var hits = resp.hits.hits;
    var hit = hits.length > 0 ? hits[0] : null;

    if (hit != null) {
      var filename = hit._source.file;
      var width = hit._source.width;
      var height = hit._source.height;
      var epochVideo = Number(hit.fields._timestamp)
      var offset = ((epochTimestamp - epochVideo) / 1000).toString().toHHMMSS();

      if (child != null) {
        child.kill('SIGHUP')
      }

      console.log('starting playback for "' + filename + '" at ' + offset + ' with resolution ' + width + 'x' + height)
      child = exec('ffmpeg -re -ss ' + offset + ' -i video/' + filename + ' -f mpeg1video http://127.0.0.1:8082/mrvulcan/' + width + '/' + height,
        function (error, stdout, stderr) {})
    } else {
      console.warn("no video found")
    }
  }, function (err) {
    console.trace(err.message);
  });

  res.send('Acknowledged!')
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('ffmpeg stream server listening at http://%s:%s', host, port)
})

function findLatestVideo(camera, timestamp) {
  return esClient.search({
    index: 'seeingspace',
    type: 'video',
    size: 1,
    fields: ['_source','_timestamp'],
    body: {
      'query': {
        'filtered': {
           'query': {
              'match_phrase': {
                 'camera': camera
              }
           },
           'filter': {
              'range': {
                 '_timestamp': {
                    'lte': timestamp
                 }
              }
           }
        }
      },
      'sort': {
        '_timestamp': {
          'order': 'desc'
        }
      }
    }
  })
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}