'use strict'
const http = require('http');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var request = require('request');

var helpers = require('./helpers.js').helpers;

var viewLink = "http://uchi.me/bae/view/#!/asset/";

const base = "http://localhost:3000/";
var fs = require('fs');

const userResp = "userResp.json"



module.exports = function(app, passport) {
	app.post('/_order', function(req, res) {

		const twiml = new MessagingResponse({
			accountSid : process.env.TWILIO_ACCOUNT_SID,
			authToken : process.env.TWILIO_AUTH_TOKEN
		});

		var action = {};
		var input;
		var sender;
		var msg;
		let url = base;
		// req.body = "what fruits are available in saskatoon next week"
		if (req.body.Body != undefined) {
			var sender = req.body.From;
			var jsonResp = helpers.jsonFromSMS(req.body);
			action = {
				type : "sms",
				inputs : jsonResp.input
			};
			// input = jsonResp.input;
			msg = jsonResp.msg;
			console.log(action)
			if ((action.inputs.action + '') == 'order') {			
				url += "_preferences?msg=confirm"
				var options = {
					url : url ,
					method : 'GET'
				};
			} 

			if ((action.inputs.action + '') == 'yes') {
				fs.readFile(userResp, 'utf8', function (err, data){
				    if (err){
				        console.log(err);
				    } else {
				    var obj = JSON.parse(data); //now it an object
				    msg = msg ? msg : "Thanks:\n" 
					+ 'Hi ' + (obj[sender].rest || '') + ',\n';

					msg += "Thanks for confirming your order. You will be charged $";
					msg += (obj[sender].price || 0);
					msg +=  ". You will receive a confirmation text when your order ships.\n- Farms2Forks ";
					res.writeHead(200, {
						'Content-Type' : 'text/xml'
					});

					twiml.message(msg);
					res.end(twiml.toString());	
				}});
				return;	

			}

			if (action.inputs.action == 'no') {
				fs.readFile(userResp, 'utf8', function (err, data){
				    if (err){
				        console.log(err);
				    } else {
				    var obj = JSON.parse(data); //now it an object
				    msg = msg ? msg : "Cancelled:\n"
					+ 'Hi ' + (obj[sender].rest || '') + ',\n';

					msg += "Your order has been cancelled.\n- Farms2Forks" 
					res.writeHead(200, {
						'Content-Type' : 'text/xml'
					});

					twiml.message(msg);
					res.end(twiml.toString());	
				}});
				return;	
			}

			if (action.inputs.action == 'other') {
				appendToFile('contacts.json', {
					phone: action.inputs.sender , 
					msg: 'contact', 
					msg: action.inputs.sms

				})
			    msg = msg ? msg : "Thank you:\n"
				+ 'Hi,\n';

				msg += "You probably sent a unique (unknown) command. We will contact you when we launch.\n- Farms2Forks" 
				res.writeHead(200, {
					'Content-Type' : 'text/xml'
				});

				twiml.message(msg);
				res.end(twiml.toString());	
				return;	
			}
		} else {
			action = {
				type : "http",
				inputs : req.body
			};
			var sender = req.body.owner;
		}
		console.log(url)

		// Start the request
		request(options, function(error, response, body) {
			// console.log(response.body)
			if (!error && response && response.statusCode == 200) {
				console.log("\n\nText sent on: " + new Date());
				console.log("*******************************************************************************************************");
				console.log("*   Transaction ID: " + response.body.transactionId);
				console.log("*   Transaction/Contract Executed: " + response.body["$class"]);
				console.log("*   Sender: " + action.inputs.owner);
				console.log("*   Preview: " + viewLink + response.body.transactionId + "/" + response.body.receiver + "/" + response.body.owner);
				
				response.body = JSON.parse(response.body);
				let preference = response.body[Math.floor(Math.random()*response.body.length)];
				console.log("-------------\n");
				console.log(preference);
				if (action.type == "sms") {
					console.log("*   Sent From: " + action.inputs.lastDevice)
					msg = msg ? msg : "ORDER CONFIRMATION:\n" 
					+ 'Hi ' + randomRest + ',\n'
					+ "Do you want to place an order for the following food items?\n" ;
					msg += "\n"
					let set = {}
					for (var i=0; i < preference.preferences.length; i++){
						if (set[preference.preferences[i].name] == undefined) {
							msg += preference.preferences[i].name + ":  " + preference.preferences[i].qty + "lb\n"
						}
					} 
					msg += "\n---------------------------";
					msg += "\nAmount due is $" + preference.totalPrice;
					msg += "\n---------------------------";
					msg += "\n\nYES to CONFIRM\nNO to CANCEL\n\n- Farms2Forks " ;


					appendToFile(userResp, {
						phone: sender, 
						msg: 'confirm', 
						price: preference.totalPrice,
						rest: randomRest

					})

					res.writeHead(200, {
						'Content-Type' : 'text/xml'
					});
					twiml.message(msg);
					res.end(twiml.toString());
				} else {
					res.json({
						"status" : response.statusCode,
						"data" : response.body
					});
				}
			} else {
				res.json({
					"status" : response ? response.statusCode : response,
					"data" : response ? response.body : response
				});
			}
			console.log("*******************************************************************************************************\n");
		});
	});


}

function appendToFile (file, item) {
	fs.readFile(file, 'utf8', function (err, data){
	    if (err){
	        console.log(err);
	    } else {
	    let obj = JSON.parse(data); //now it an object
	    console.log(obj)
	    obj = obj || {}
	    obj[item.phone] = item;
	    let json = JSON.stringify(obj); //convert it back to json
	    fs.writeFile(file, json, 'utf8', {}); // write it back 
	}});
}

var rest = [
	"Griff's Shenanigans Cafe & Bar",
	"Memphis Sports Pub Inc",
	"J B's",
	"Peanut Gallery",
	"City Club",
	"Post Bar",
	"Trolley's Downtown Bar & Grill",
	"Depot Pub & Grill",
	"Hot Iron Restaurant & Bar",
	"Sidetrack",
	"Jugheads Pub & Grub Llc",
	"Acme Bar & Grill",
	"Tomfooleries Restaurant & Bar",
	"Waterhouse Tavern & Grill",
	"Gabriel's Downtown",
	"B Of A Securities",
	"Kappa Kabanna",
	"Apex",
	"Gardens",
	"Arjon's International Club",
	"Matilda",
	"Bonker's",
	"Spotted Dog",
	"Bamboo Lounge",
	"Tin Shed Tavern",
	"Kell Well Food Management",
	"Meier's Catering",
	"Casa Del Sol",
	"Rebecca's Cafe Catering",
	"I-X Hough Catering & Food Svc",
	"Tate & Tate Catering",
	"Rochester Club Ballroom",
	"Woodstock Moveable Feast",
	"Mass Appeal Dining Svc Inc",
	"Flying Horse Catering",
	"Lochirco's St Louis Catering",
	"Cascade Fine Catering",
	"Breakers West",
	"Catering A'La King",
	"Josie's",
	"Monjunis",
	"Avanti Restaurant & Caterer",
	"Patton's",
	"Colonial Mansion Caterers",
	"Eattheworld",
	"Oakley's Quality Catering Inc",
	"Village Crossroads Restaurant",
	"Winstead Caterers",
	"G Texas Custom Catering",
	"Warrington Country Club",
	"Toast",
	"Church's Chicken",
	"Lobster Shanty",
	"M Henry",
	"Hoops Sports & Spirits",
	"Trattoria Sorrento",
	"Square One Brewery",
	"Trappers Turn Golf Club",
	"Chen's Bistro",
	"Pizza Oven",
	"El Mundo",
	"Kelsey Place Restaurant",
	"Vincenza's Banquet House",
	"Shilling House",
	"Symphonys",
	"Rio Grande Cantina Restaurant",
	"Orleans Grapevine",
	"Johnny Brusco's NY Style Pizza",
	"Stars & Strikes Llc",
	"Vines Grill & Wine Bar",
	"Rally's Hamburgers",
	"Giordano's Restaurant & Clam",
	"J R Crickets",
	"Furio",
	"Cafe Pappadeaux",
	"5 Stars Steak, Fish & Chicken, Inc",
	"Toriellos",
	"Motore Coffee",
	"Murray Street Station",
	"Sunshine Bakery",
	"Micayla Carl Catering",
	"Creative Turkey Cuisine Llc",
	"Cermak Live Poultry,inc.",
	"Hong An Chinese Takeout",
	"Downstairs Cabaret Theatre Center",
	"Roti King",
	"Due Mondi Cafe Inc.",
	"Darrell's",
	"Parents As Leaders",
	"Cj's Eatery",
	"Johnny Nole's Bar & Grill",
	"Hacienda La Amistad",
	"Patroon Room",
	"Catere",
	"Karen's At The Boathouse",
	"Keen Wah Kitchen",
	"Amigo Grocery Store",
	"Fabulous Foods",
	"Gas Plus Inc.",
	"East Main Hots"
]


let randomRest = rest[Math.floor(Math.random()*rest.length)];
