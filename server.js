var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'), 
	request = require('superagent'),
	q = require('q');

const PORT = 8080;
var app = express();
var server = http.createServer(app);

server.listen(PORT, function() {
	console.log('Server listening on http://localhost:%s', PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));  //this allows req.body

app.use(express.static('static')); 

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
* Send out order request. Upon success, save order in our own db
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

  	function sendOrder(make) {
  		var deferred = q.defer();

		if (make == 'ACME Autos') {

			models = ["anvil", "wile", "roadrunner"]
			packages = ["std", "super", "elite"]

			mdl = req_body.model.toLowerCase().replace(/ /g,'');
			pckg = req_body.trim_package.toLowerCase().replace(/ /g,'')

			if (models.indexOf(mdl) > -1) {
				if (packages.indexOf(pckg) > -1) {
					request 
						.post('http://localhost:3050/acme/api/v45.1/order')
						.set('Content-Type', 'application/x-www-form-urlencoded')
						.send({ api_key: 'cascade.53bce4f1dfa0fe8e7ca126f91b35d3a6' })
						.send({ model: mdl })
						.send({ package: pckg })
						.end(function(err, res) {
							if (err || !res.ok) {
						       //console.log('Error calling ACME API ' + err);
						       deferred.resolve(err);
						     } else {
						       //console.log('Success! Order Number: ' + res.text);
						       ordernum = JSON.parse(res.text);
						       deferred.resolve(ordernum.order);
						     }
						})
				} else {
					deferred.resolve("Package request not supported by ACME Autos")
				}
			} else {
				deferred.resolve("Model request not supported by ACME Autos")
			}
		}

		else if (make == 'Rainer') {

			models = ["pugetsound", "olympic"]
			packages = ["mtn", "ltd", "14k"]

			mdl = req_body.model.toLowerCase().replace(/ /g,'');
			pckg = req_body.trim_package.toLowerCase().replace(/ /g,'')

			if (models.indexOf(mdl) > -1) {
				if (packages.indexOf(pckg) > -1) {

					request
						.get('http://localhost:3051/r/nonce_token')
						.send({storefront: 'ccas­bb9630c04f'})
						.end(function(err, res) {
							if (err || !res.ok) {
						       //console.log('Error getting Rainer token ' + err);
						       deferred.resolve(err);
						    } else {
						    	token = res.body
						    	//console.log('Success! Token: ' + token.nonce_token);
						    	request
						    	 	.post('http://localhost:3051/r/request_customized_model')
						    	 	.send({ token: token.nonce_token })
						    	 	.send({ model: mdl })
						    	 	.send({ custom: pckg })
						    	 	.end(function(err, res) {
										if (err || !res.ok) {
									       //console.log('Error posting Rainer order ' + err);
									       deferred.resolve(err);
									     } else {
									       //console.log('Success! Order Number: ' + res.text);
									       ordernum = JSON.parse(res.text);
									       deferred.resolve(ordernum.order_id);
									     }
									})
						    }
						})
				} else {
					deferred.resolve("Package request not supported by Rainer")
				}
			} else {
				deferred.resolve("Model request not supported by Rainer")
			}
		}
		else {
			deferred.resolve("Supplier not recognized")
		}

		return deferred.promise;

  	}

  	sendOrder(req_body.make)
  		.then(function(orderId) {
  			//console.log(orderId);
  			if (typeof orderId == 'number') {
  				//console.log('saving order to db');
			    var newOrder = new Order({
			    	supplier: req_body.make,
					order_id: orderId,
					customer_id: req_body.customer_id
			    });

			    newOrder.save(function(err, data) {
			    	if(err != null) {
			        	//console.log('save error: ', err);
			        	res.status(422).send('Error Saving to database: ', err); 
			        } else {
			        	//console.log('order saved: ', data);
			        	res.status(200).send('Order Saved Successfully'); 
			        }
			    });
  			} else {
  				res.status(422).send(orderId);
  			}			
 
  		})

});