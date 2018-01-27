var db = require("../models");

module.exports = function(app, passport) {
    // process the login form
    app.post("/_login", passport.authenticate('local-login'), function(req, res) {
      res.json(req.user);
    });

    // handle logout
    app.post("/_logout", function(req, res) {
      req.logOut();
      res.send(200);
    })

    // loggedin
    app.get("/_loggedin", function(req, res) {
      res.send(req.isAuthenticated() ? req.user : '0');
    });

    // signup
    app.post("/_signup", function(req, res) {
      db.User.findOne({
        username: req.body.username
      }, function(err, user) {
        if (user) {
          res.json(null);
          return;
        } else {
          var newUser = new db.User();
          newUser.username = req.body.username.toLowerCase();
          newUser.password = newUser.generateHash(req.body.password);
          newUser.save(function(err, user) {
            req.login(user, function(err) {
              if (err) {
                res.status(500).send(err)
              }
              res.json(user);
            });
          });
        }
      });
    }); 

    // Facebook auth routes
    app.get('/auth/facebook', function authenticateFacebook (req, res, next) {
      req.session.returnTo = '/#' + req.query.returnTo; 
      next ();
    },
    passport.authenticate ('facebook'));

    app.get('/auth/facebook/callback', function (req, res, next) {
     var authenticator = passport.authenticate ('facebook', {
       successRedirect: req.session.returnTo,
       failureRedirect: '/'
      });

    delete req.session.returnTo;
    authenticator (req, res, next);
  })
};