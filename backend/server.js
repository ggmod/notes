var express = require('express');
var notesAPI = require('./app/notes-api.js');
var config = require('./config.json');
var bodyParser = require('body-parser');
var cronJobs = require('./app/cron-jobs.js');


process.title = 'notes-app'; // so that ps shows more than "node server.js"

cronJobs.start();

var app = express();
var router = express.Router();

app.set('json spaces', 4);

app.use(express.static('../frontend/public'));

app.use(bodyParser.text());

notesAPI(router);

app.use('/', router);

app.get('/test', function(req, res) {
	res.send('Hello world');
});

app.get('/', function(req, res) {
	res.sendfile('../frontend/public/index.html');
});

app.listen(config.PORT, function() {
	console.log('Notes app is listening to http://localhost:' + config.PORT);
});