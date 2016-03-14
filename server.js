var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'), 
	request = require('superagent');

const PORT = 8080;
var app = express();
var server = http.createServer(app);

server.listen(PORT, function() {
	console.log('Server listening on http://localhost:%s', PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));  //this allows req.body

app.use(express.static('static')); //sets static file directory to ./static/*

/* 
* Connect to mongodb through mongoose
*
*/

mongoose.connect('mongodb://localhost/cbtsampleproblem');

var db = mongoose.connection;

db.on('connected', function() {
	console.log('Mongoose connected')
});

db.on('error', function(err) {
	console.log('Mongoose connection error: ' + err);
});

db.on('disconnected', function() {
	console.log('Mongoose disconnected')
});

var OrderSchema = mongoose.Schema({
	supplier: String,
	order_id: Number,
	customer_id: String
});

var Order = mongoose.model("Order", OrderSchema);

/*
* App Requests
*
*/

app.get('/', function(req, res) {
	res.sendFile('static/index.html');
});

/*
* Return report of all orders 
*
* parameters: none
* response: JSON representation of previous orders
* url: /orders
*/

app.get('/orders', function(req, res) {
	Order.find().lean().exec(function (err, orders) {
		res.send(JSON.stringify(orders));
	});
});

/*
* Valitate cusomer's shipping address: exclude certain locations - need to add schema for Customer and shipping address
* Keep track of all placed orders
*
* parameters: 
*	make - supplier 
*	model - model 
*	package - string representation of trim packages 
*	customer_id - customer placing the order
*
* url: /order
*/

app.post('/order', function(req, res) {
	var req_body = req.body;
  	console.log('Post request to order: ', req_body);

  	/*
  	console.log('register make: ', req_body.make); 
  	console.log('register model: ', req_body.model); 
  	console.log('register package: ', req_body.trim_package); 
  	console.log('register customer_id: ', req_body.customer_id); 
  	*/


	//check make and call supplier's API
	if (req_body.make == 'ACME Autos') {
		request 
			.post('http://localhost:3050/order')
			.set('Content-Type', 'application/x-www-form-urlencoded')
			.send({ api_key: 'cascade.53bce4f1dfa0fe8e7ca126f91b35d3a6' })
			.send({ model: req_body.model })
			.send({ package: req_body.trim_package })
			.end(function(err, res) {
				if (err || !res.ok) {
			       console.log('Error calling ACME API ' + err);
			     } else {
			       console.log('Success! Order Number: ' + res.text);
			     }
			})

	}
	else if (req_body.make == 'Rainer') {
		request
			.get('http://localhost:3051/nonce_token')
			.send({storefront: 'ccas­bb9630c04f'})
			.end(function(err, res) {
				if (err || !res.ok) {
			       console.log('Error getting Rainer token ' + err);
			    } else {
			    	token = res.body
			    	console.log('Success! Token: ' + token.nonce_token);
			    	 request
			    	 	.post('http://localhost:3051/request_customized_model')
			    	 	.send({ token: token.nonce_token })
			    	 	.send({ model: req_body.model })
			    	 	.send({ custom: req_body.trim_package })
			    	 	.end(function(err, res) {
							if (err || !res.ok) {
						       console.log('Error posting Rainer order ' + err);
						     } else {
						       console.log('Success! Order Number: ' + res.text);
						     }
						})
			    }
			})

	}
	else {
		res.sendStatus(422)
	}

	//NEED PROMISE HERE TO ONLY SAVE ON A SUCCESSFUL REQUEST
	console.log('saving order to db');

    var newOrder = new Order({
    	supplier: req_body.make,
		order_id: 1000,
		customer_id: req_body.customer_id
    });
    newOrder.save(function(err, data) {
    	if(err != null) {
        	console.log('save error: ', err);
        } else {
        	console.log('order saved: ', data);
        }
    });

	res.sendStatus(200); 
	
});
