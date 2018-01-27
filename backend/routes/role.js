var request = require('request');
var assetchain = require('../assetchain.js');
let namespace = "org.shareedoc.sample."



module.exports = function(app, passport) {
  var text = require('../controllers/text.js')(app, passport);
  
  app.get("/test", function(req, res) {
    res.json({
      dd: true,
      message:"It works",
      added: true
    })


  })

app.get("/_Request", function(req, res) {

if(req.isAuthenticated() || process.env.TEST_MODE == 1){
      req.checkBody('patient', 'patient must not be empty.').notEmpty();

      if(req.body['doctor'] == undefined){
        req.checkBody('institution', 'institution must not be empty.').notEmpty();
       }
       else if(req.body['institution'] == undefined){
        req.checkBody('doctor', 'doctor must not be empty.').notEmpty()
       }
      
      if (errors){
        res.status(400).json({
          error: errors
        })
      } 
      let _Request = {
        "$class": namespace + "Request",
        "patient" : req.body['patient'] , //would we still need both of these if one is undefined
        "doctor": req.body['doctor'] , 
        "institution": req.body['institution'] ,
        //"assigner": req.body['assigner'] || "admin"//???????????
      };
      assetchain.assignRole(_Request).then((x)=> {
        console.log("GOOD:=>\n",x) // Return OK response
        res.json({
          message: "added " + req.body['patient'].join(" "),
          added: true
        })
      }).catch((error) => {
        console.log("BAD:=>\n", error) // Return error response
        res.status(400).json({
          message: "Not added",
          added: false
        })
      })

}
});

app.get("/_ApproveReject", function(req, res) {

  if(req.isAuthenticated() || process.env.TEST_MODE == 1){
        req.checkBody('record', 'record must not be empty.').notEmpty();
        req.checkBody('userApproving', 'userApproving must not be empty.').notEmpty();
        req.checkBody('approved', 'approved must not be empty.').notEmpty();
        
        if (errors){
          res.status(400).json({
            error: errors
          })
        } 
        let _ApproveReject = {
          "$class": namespace + "ApproveReject",
          "record": req.body['record'] , 
          "userApproving": req.body['userApproving'] , 
          "approved": req.body['approved'] , 
          
          "assigner": req.body['assigner'] || "admin"//???????????
        };
        assetchain.assignRole(_ApproveReject).then((x)=> {
          console.log("GOOD:=>\n",x) // Return OK response
          res.json({
            message: "added " + req.body['record'].join(" "),
            added: true
          })
        }).catch((error) => {
          console.log("BAD:=>\n", error) // Return error response
          res.status(400).json({
            message: "Not added",
            added: false
          })
        })
  
  }
  });

  app.get("/_GrantAccess", function(req, res) {

    if(req.isAuthenticated() || process.env.TEST_MODE == 1){
          req.checkBody('record', 'record must not be empty.').notEmpty();
          req.checkBody('doctorGranting', 'doctorGranting must not be empty.').notEmpty();
          
          if (errors){
            res.status(400).json({
              error: errors
            })
          } 
          let _GrantAccess = {
            "$class": namespace + "GrantAccess",
            "record": req.body['record'] , 
            "doctorGranting": req.body['doctorGranting'] , 
            
            "assigner": req.body['assigner'] || "admin"//???????????
          };
          assetchain.assignRole(_GrantAccess).then((x)=> {
            console.log("GOOD:=>\n",x) // Return OK response
            res.json({
              message: "added " + req.body['record'].join(" "),
              added: true
            })
          }).catch((error) => {
            console.log("BAD:=>\n", error) // Return error response
            res.status(400).json({
              message: "Not added",
              added: false
            })
          })
    
    }
    });


    app.get("/_View", function(req, res) {

      if(req.isAuthenticated() || process.env.TEST_MODE == 1){
            req.checkBody('user', 'user must not be empty.').notEmpty();
            req.checkBody('recordId', 'recordId must not be empty.').notEmpty();
            
            if (errors){
              res.status(400).json({
                error: errors
              })
            } 
            let _GrantAccess = {
              "$class": namespace + "View",
              "user": req.body['user'] , 
              "recordId": req.body['recordId'] , 
              
              "assigner": req.body['assigner'] || "admin"//???????????
            };
            assetchain.assignRole(_View).then((x)=> {
              console.log("GOOD:=>\n",x) // Return OK response
              res.json({
                message: "added " + req.body['user'].join(" "),
                added: true
              })
            }).catch((error) => {
              console.log("BAD:=>\n", error) // Return error response
              res.status(400).json({
                message: "Not added",
                added: false
              })
            })
      
      }
      });
//-------------------------------------------------------------------------------------------------------
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

