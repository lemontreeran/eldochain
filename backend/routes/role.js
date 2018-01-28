var request = require('request');
let namespace = "org.recordchain.biznet."
var assetchain = require('../smartContracts/recordchain.js');




module.exports = function(app, passport) {
  var text = require('../controllers/text.js')(app, passport);
  
  app.get("/test", function(req, res) {
    res.json({
      dd: true,
      message:"It works",
      added: true
    })


  })

  app.post("/_requestAccess", function(req, res) {
    req.checkBody('patient', 'patient must not be empty.').notEmpty();

    if(req.body['doctor'] == undefined){
      req.checkBody('institution', 'institution must not be empty.').notEmpty();
      }
      else if(req.body['institution'] == undefined){
      req.checkBody('doctor', 'doctor must not be empty.').notEmpty()
      }
    let errors = req.validationErrors();
    if (errors){
      res.status(400).json({
        error: errors
      })
    } 
    let _Request = {
      "$class": namespace + "Request",
      "patient" : req.body['patient'] , 
      "doctor": req.body['doctor'] , 
      "institution": req.body['institution'] ,
      
    };

    console.log("in")
    assetchain.requestAccess(_Request).then((x)=> {
      console.log("GOOD:=>\n",x) // Return OK response
      res.json({
        message: x
      })
    }).catch((error) => {
      console.log("BAD:=>\n", error) // Return error response
      res.status(400).json({
        message: "Not added",
        added: false
      })
    })
  });

  app.post("/_approveReject", function(req, res) {
    console.log("Here")
    req.checkBody('record', 'record must not be empty.').notEmpty();
    req.checkBody('userApproving', 'userApproving must not be empty.').notEmpty();
    req.checkBody('approved', 'approved must not be empty.').notEmpty();
    let errors = req.validationErrors();
    
    if (errors){
      res.status(400).json({
        error: errors
      })
    } 
    let _ApproveReject = {
      "$class": namespace + "ApproveReject",
      "record": req.body['record'] , 
      "approved": req.body['approved'] , 
      
      
    };
    console.log("2")
    assetchain.approveReject(_ApproveReject).then((x)=> {
      console.log("GOOD:=>\n",x) // Return OK response
      res.json({
        message: x
      })
    }).catch((error) => {
      console.log("BAD:=>\n", error) // Return error response
      res.status(400).json({
        message: "Not added",
        added: false
      })
    })
  });

  app.post("/_grantAccess", function(req, res) {
    req.checkBody('record', 'record must not be empty.').notEmpty();
    req.checkBody('granted', 'granted must not be empty.').notEmpty();
    let errors = req.validationErrors();
    
    if (errors){
      res.status(400).json({
        error: errors
      })
    } 
    let grant = {
      "$class": namespace + "GrantAccess",
      "record": req.body['record'] , 
      "granted": req.body['granted'] , 
      "doctorGranting": req.body['doctorGranting'] || ""
    };

    console.log(grant)
    
    assetchain.grantAccess(grant).then((x)=> {
      console.log("GOOD:=>\n",x) // Return OK response
      res.json({
        message:  x
      })
    }).catch((error) => {
      console.log("BAD:=>\n", error) // Return error response
      res.status(400).json({
        message: "Not added",
        added: false
      })
    })
  });

  app.post("/_view", function(req, res) {
    req.checkBody('doctorId', 'doctorId must not be empty.').notEmpty();
    req.checkBody('recordsId', 'recordsId must not be empty.').notEmpty();
    let errors = req.validationErrors();
    
    if (errors){
      res.status(400).json({
        error: errors
      })
    } 
    let view = {
      "$class": namespace + "View",
      "recordsId": req.body['recordsId'] , 
      "doctorId": req.body['doctorId']
    };

    assetchain.view(view).then((x)=> {
      console.log("GOOD:=>", x) // Return OK response
      res.json({
        message:  x
      })
    }).catch((error) => {
      console.log("BAD:=>\n", error) // Return error response
      res.status(400).json({
        message: "Not done",
        added: false
      })
    })

  app.post("/_msg", function(req, res) {
    req.checkBody('doctorId', 'doctorId must not be empty.').notEmpty();
    req.checkBody('image', 'image must not be empty.').notEmpty();
    req.checkBody('patientId', 'patientId must not be empty.').notEmpty();
    let errors = req.validationErrors();
    
    if (errors){
      res.status(400).json({
        error: errors
      })
    } 
    const client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.CELL_PHONE_NUMBER,
      body: "Image for patient " + req.body.patientId  + "\n---------------\n\n" + req.body.image
    }).then((messsage) => {
      console.log(message.sid)
      res.json({
        message: "message sent",
        sent: true
      })
    });

  });
}
//-------------------------------------------------------------------------------------------------------
