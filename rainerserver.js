var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser');

const PORT = 3051;
var app = express();
var server = http.createServer(app);

server.listen(PORT, function() {
	console.log('ACME Server listening on http://localhost:%s/r', PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));  //this allows req.body


/*
* Return report of all orders 
*
* parameters: none
* response: JSON representation of previous orders
* url: /orders
*/

app.get('/r/nonce_token', function(req, res) {
  	console.log('Get request to nonce_token');

	res.send(
		{ nonce_token: "ff6bfd673ab6ae03d8911"}
	);
	
});

/*
* App Requests
*
* parameters: 
*	api_key - string
*	model - [pugetsound, olympic]
*	package - [mtn, ltd, 14k]
*
* url: /order
*/

app.post('/r/request_customized_model', function(req, res) {

  	orderNum = getRandomInt(1, 100000)

	res.send(
		{ order_id: orderNum }
	);
	
});

function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1) + min);
	}