var request = require('request');
var firebaseAdmin = require("firebase-admin");

var serviceAccount = require("../madeincanada-design-firebase-adminsdk-525vm-10ab3e47f1.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://madeincanada-design.firebaseio.com"
});

var firebase_db = firebaseAdmin.firestore();
var fs = require('fs');
var beautiful = require('beautiful-scrape')



module.exports = function(app, passport) {
	var text = require('../controllers/text.js')(app, passport);
    // save a food_products
    app.post("/_save_product", function(req, res) {
      if(req.isAuthenticated() || process.env.TEST_MODE == 1) {
        firebase_db.collection("food_products")
        .doc(req.body['id'] || 'nonsense')
        .get().then(function(docRef) {
          let newData = {
            name: req.body.name || "",
            type: req.body.type || "",
            type2: req.body.type2 || "",
            price: req.body.price || "",
            unit: req.body.unit || "",
            quantity: req.body.quantity || "",
            seller: req.body.seller || "",
            pictures: req.body.pictures || "",
            location: req.body.location || ""
          }
          if (docRef.exists) {
              console.log("{docRef.id} => ", docRef.data());
              console.log("Got doc: ", docRef.id);
              firebase_db.collection("food_products")
              .doc(req.body['id']).update(newData).then(function(docRef) {
                  console.log("Document successfully updated!");
                  res.json(docRef);
              }).catch(function(error) {
                  console.error("Error updating document: ", error);
                  res.status(500).send(error)
              });
          } else {
              console.log("No such document!");
              firebase_db.collection("food_products").add(newData).then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
                res.json(docRef);
              }).catch(function(error) {
                console.error("Error adding document: ", error);
                res.status(500).send(error)
              });
          }
        }).catch(function(error) {
          console.error("Error getting document: ", error);
          res.status(500).send(error)
        });

      } else {
        res.status(400).json({
          error: "Not logged in"
        })
      }
    });   

    app.get("/_save_lastMsg", function(req, res) {
      console.log(req.query)
      if(req.isAuthenticated() || process.env.TEST_MODE == 1) {    
        firebase_db.collection("last_msg")
        .get().then(function(doc) {
        	let list = []
        	if (req.query.phone != undefined) {
	        	doc.forEach(function(item) {
	        		let data = item.data();
	        		if (data.phone === req.query.phone) {
	        			res.json(data);
	        		}
			    });
        	}
        	res.json({message: "No such document!"});
        }).catch(function(error) {
          console.error("Error getting document: ", error);
          res.status(500).send(error)
        });
      } else {
        res.status(400).json({
          error: "Not logged in"
        })
      }
    }); 
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

let s = [];

for(var i=0; i < 100;i++) {
	s.push(guid())
}

