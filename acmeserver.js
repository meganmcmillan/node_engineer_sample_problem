var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser');

const PORT = 3050;
var app = express();
var server = http.createServer(app);

server.listen(PORT, function() {
	console.log('ACME Server listening on http://localhost:%s', PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));  //this allows req.body

/*
* App Requests
*
* parameters: 
*	api_key - string
*	model - [anvil, wile, roadrunner]
*	package - [std, super, elite]
*
* url: /order
*/

app.post('/order', function(req, res) {
	var req_body = req.body;
  	console.log('Post request to order: ', req_body);

  	
  	console.log('register api_key: ', req_body.api_key); 
  	console.log('register model: ', req_body.model); 
  	console.log('register package: ', req_body.package); 

  	orderNum = getRandomInt(1, 100000)

	res.send(
		{ order: orderNum }
	);
	
});

function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1) + min);
	}