var expect  = require("chai").expect;
var request = require("request");
var app = require("../app");

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

let Wedding = require('../routes/wedding');
chai.use(chaiHttp);

describe("Made in Canada wedding tests", function() {
  describe("Startup tests", function() {
    it("app should be defined", function() {
      expect(app).to.not.equal(undefined);
    });
  });

});

describe('Wedding route', () => {

  describe('/GET wedding', () => {
      it('it return message = "No wedding"', (done) => {
        chai.request(app)
            .get('/_wedding')
            .end((err, res) => {
              console.log(res.body)
              res.should.have.status(200);
              expect(res.body).to.not.equal(undefined);
              expect(res.body.message).to.equal('No wedding');
              done();
            });
      });
      it('it should GET tesing wedding with ID ', (done) => {
        chai.request(app)
            .get('/_wedding?_id=' + '5a346b0956e41605a4db86b0')
            .end((err, res) => {
              console.log(res.body)
              res.should.have.status(200);
              expect(res.body).to.not.equal(undefined);
              expect(res.body.message).to.equal('No wedding');
              done();
            });
      });
  });
});
