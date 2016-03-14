var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser');

const PORT = 3051;
var app = express();
var server = http.createServer(app);

server.listen(PORT, function() {
	console.log('ACME Server listening on http://localhost:%s', PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));  //this allows req.body


/*
* Return report of all orders 
*
* parameters: none
* response: JSON representation of previous orders
* url: /orders
*/

app.get('/nonce_token', function(req, res) {
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
*	model - [anvil, wile, roadrunner]
*	package - [std, super, elite]
*
* url: /order
*/

app.post('/request_customized_model', function(req, res) {
	var req_body = req.body;
  	console.log('Post request to order: ', req_body);

  	
  	console.log('register order token: ', req_body.token); 
  	console.log('register model: ', req_body.model); 
  	console.log('register custom package: ', req_body.custom); 

  	orderNum = getRandomInt(1, 100000)

	res.send(
		{ order_id: orderNum }
	);
	
});

function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1) + min);
	}