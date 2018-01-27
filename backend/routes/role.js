var request = require('request');
var assetchain = require('../assetchain.js');
let namespace = "org.assetchain.biznet."



module.exports = function(app, passport) {
	var text = require('../controllers/text.js')(app, passport);

  // Give user a role
  app.post("/_assign_role", function(req, res) {
    if(req.isAuthenticated() || process.env.TEST_MODE == 1) {
      req.checkBody('id', 'id must not be empty.').notEmpty();
      req.checkBody('name', 'name must not be empty.').notEmpty();
      req.checkBody('members', 'members must not be empty.').notEmpty();
      var errors = req.validationErrors();
      if (errors){
        res.status(400).json({
          error: errors
        })
      } 
      let Assign = {
          "$class": namespace + "AssignRole",
          "id" : req.body['id'] ,
          "name": req.body['name'] ,
          "members": req.body['members'] ,
          "assigner": req.body['assigner'] || "admin"
        };

      assetchain.assignRole(Assign).then((x)=> {
        console.log("GOOD:=>\n",x) // Return OK response
        res.json({
          message: "added " + req.body['members'].join(" "),
          added: true
        })
      }).catch((error) => {
        console.log("BAD:=>\n", error) // Return error response
        res.status(400).json({
          message: "Not added",
          added: false
        })
      })
    } else {
      res.status(400).json({
        error: "Not logged in"
      })
    }
  });  

  // Get user a roles
  app.get("/_roles", function(req, res) {
    if(req.isAuthenticated() || process.env.TEST_MODE == 1) {
      req.checkQuery('user', 'user must not be empty.').notEmpty();
      var errors = req.validationErrors();
      if (errors){
        res.status(400).json({
          error: errors
        })
      } 
      let userRole = {
        "$class": namespace + "Role",
        "user": req.query.user
      }

      assetchain.userRoles(userRole).then((roles)=> {
        console.log("GOOD:=>\n", roles) // Return OK response
        res.json({
          roles: roles,
          has_role: roles.length > 0
        })
      }).catch((error) => {
        console.log("BAD:=>\n", error) // Return error response
        res.status(400).json({
          message: error,
          has_role: false
        })
      })
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

