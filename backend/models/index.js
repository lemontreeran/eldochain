var mongoose = require("mongoose");
mongoose.connect("mongodb://"  + process.env.dbUser +  ":" 
	+ process.env.dbP + "@ds141786.mlab.com:41786/wedding", {
  useMongoClient: true,
  /* other options */
});

mongoose.set("debug", true);

module.exports.User = require("./user");