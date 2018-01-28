'use strict';
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

// these are the credentials to use to connect to the Hyperledger Fabric
let cardname = "admin@recordchain";
const request = require("request");

/** Class for the asset registry*/
class RecordChain {

  /**
   * Need to have the mapping from bizNetwork name to the URLs to connect to.
   * bizNetwork nawme will be able to be used by Composer to get the suitable model files.
   *
   */
   constructor() {
    this.bizNetworkConnection = new BusinessNetworkConnection();
  }

  /** @description Initalizes the LandRegsitry by making a connection to the Composer runtime
   * @return {Promise} A promise whose fullfillment means the initialization has completed
   */
  init() {
    if (this.businessNetworkDefinition) {
      console.log("Connect")
      return true;
    } else {
      console.log("New connection")
      return this.bizNetworkConnection.connect(cardname)
      .then((result) => {
        this.businessNetworkDefinition = result;
        console.log('recordchain:<init>', 'businessNetworkDefinition obtained', this.businessNetworkDefinition.getIdentifier());
      }).catch(function (error) {
          console.log(error)
          throw error;
      });
    }
  }

  /** Request Access to a patient record..
      @return {Promise} resolved when this update has completed
  */
  _requestAccess(Tnx) {
    return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Patient')
    .then((patientRegistry) => {
      this.patientRegistry = patientRegistry;
      return patientRegistry.get(Tnx.patient);
      }).then((patient) => {
        if (patient.approvals && (patient.approvals.length > 0)) {
          patient.approvals.push(Tnx.patient)
        } else {
          patient.approvals = [];
          patient.approvals.push(Tnx.patient)
        }
        return this.patientRegistry.update(patient);
      }).then((updatedPatient) => {
        // Notify record.doc
        return this.bizNetworkConnection.getAssetRegistry('org.recordchain.biznet.Record')
        .then((recordRegistry) => {
          this.recordRegistry = recordRegistry;
          return recordRegistry.get(Tnx.patient);
          }).then((record) => {
            // Notify record.doc
            if (Tnx.doctor) {
              return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Doctor')
              .then((doctorRegistry) => {
                this.doctorRegistry = doctorRegistry;
                return doctorRegistry.get(record.recordOwner.getIdentifier());
              }).then((doctor) => {
                if (doctor.approvals && (doctor.approvals.length > 0)) {
                  doctor.approvals.push(Tnx.patient)
                } else {
                  doctor.approvals = [];
                  doctor.approvals.push(Tnx.patient)
                }
                return this.doctorRegistry.update(doctor);
              })
              console.log("DONE")
            } else {
              return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Institution')
              .then((institutionRegistry) => {
                console.log("Got institution Registry", institutionRegistry)
                this.institutionRegistry = institutionRegistry;
                return institutionRegistry.get(Tnx.institution);
              }).then((institution) => {
                institution.requests = institution.requests ? institution.requests.push(Tnx.patient) : [Tnx.patient]
                return this.institutionRegistry.update(institution);
              })
              console.log("DONE")
            }
            // patient.approvals = (patient.approvals && (patient.approvals.length > 0)) ? patient.approvals.push(Tnx.patient) : [Tnx.patient]
            return this.patientRegistry.update(patient);
          }).then((updatedPatient) => {


          })

      }).catch((error) => {
        console.log("ERROR:\n\n",error)
    });
  }

  /** External _requestAccess function..
      @return {Promise} resolved when this update has completed
  */
  static requestAccess(Tnx) {
    let registry = new RecordChain('recordchain');
    return registry.init()
    .then(() => {
      return registry._requestAccess(Tnx);
    })
  }

  /** Request approveReject transaction.
      @return {Promise} resolved when this update has completed
  */
  _approveReject(Tnx) {
    if (Tnx.approved == true) {
      return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Patient')
      .then((patientRegistry) => {
        this.patientRegistry = patientRegistry;
        return patientRegistry.get( Tnx.record.patientId);
      }).then((patient) => {
        let itemIdex = patient.approvals.indexOf(Tnx.record.patientId)
        console.log(itemIdex)
        if (itemIdex > -1) {
          patient.approvals.splice(itemIdex, 1);
          console.log("app len", patient.approvals.length)
          return this.patientRegistry.update(patient)
          .then((approval) => {
            console.log("approved")
            return new Promise((resolve, reject)=> {
                resolve({"approved": true});
            })
          }).catch ((reject) => {
            console.log("Not approved internal", reject)
            return new Promise((resolve, reject)=> {
                resolve({"approved": false, "error": reject});
            })
          })
        } else {
          return new Promise((resolve, reject)=> {
              resolve({"approved": false, "error": "Record not found" });
          })

        }
      })
    } else {
      console.log("Not approved false")
      return new Promise((resolve, reject)=> {
          resolve({"approved": false, "message":"Approval declined"});
      });
    }
  }

  /** External approveReject transaction.
      @return {Promise} resolved when this update has completed
  */
  static approveReject(Tnx) {
    let registry = new RecordChain('recordchain');
    return registry.init()
    .then(() => {
      return registry._approveReject(Tnx);
    })
  }

  /** Request _grantAccess transaction.
      @return {Promise} resolved when this update has completed
  */
  _grantAccess(Tnx) {
    console.log(Tnx)
    if (Tnx.granted) {
      return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Doctor')
      .then((doctorRegistry) => {
        this.doctorRegistry = doctorRegistry;
        let dId = Tnx.record.recordOwner.split("#")[1];
        console.log(dId)
        this.dId = dId;
        return doctorRegistry.get(dId);
      }).then((doctor) => {
        console.log(doctor)
        // let itemIdex = doctor.approvals.indexOf(Tnx.record.recordOwner.getIdentifier())
        console.log(doctor.approvals)
        let itemIdex = doctor.approvals.indexOf(Tnx.record.patientId)
        console.log(itemIdex)
        if (itemIdex > -1) {
          doctor.approvals.splice(itemIdex, 1);
          console.log("app len", doctor.approvals.length)
          return this.doctorRegistry.update(doctor)
          .then((approval) => {
            console.log("approved")
            // update the record
            return this.bizNetworkConnection.getAssetRegistry('org.recordchain.biznet.Record')
            .then((recordRegistry) => {
              this.recordRegistry = recordRegistry;
              return recordRegistry.get(Tnx.record.patientId);
            }).then((record) => {
              if (record.drCanView && (record.drCanView.length > 0)) {
                record.drCanView.push(this.dId)
              } else {
                record.drCanView = [];
                record.drCanView.push(this.dId)
              }
              return this.recordRegistry.update(record);
            }).then((updated) => {
              return new Promise((resolve, reject)=> {
                resolve({"approved": true, "record": updated});
              })  
            })
          }).catch ((reject) => {
            console.log("Not approved internal", reject)
            return new Promise((resolve, reject)=> {
                resolve({"approved": false, "error": reject});
            })
          })
        } else {
          return new Promise((resolve, reject)=> {
              resolve({"approved": false, "error": "Record not found" });
          })

        }
      })
    } else {
      console.log("Not approved false")
      return new Promise((resolve, reject)=> {
          resolve({"approved": false, "message":"granting declined"});
      });
    }
  }

  /** External _grantAccess transaction.
      @return {Promise} resolved when this update has completed
  */
  static grantAccess(Tnx) {
    let registry = new RecordChain('recordchain');
    return registry.init()
    .then(() => {
      return registry._grantAccess(Tnx);
    })
  }


  /** Request _view transaction to check if user can view stuff.
      @return {Promise} resolved when this update has completed
  */
  _view(Tnx) {
   return this.bizNetworkConnection.getAssetRegistry('org.recordchain.biznet.Record')
    .then((recordRegistry) => {
      this.recordRegistry = recordRegistry;
      return recordRegistry.get(Tnx.recordsId);
    }).then((record) => {
      if (record.drCanView && (record.drCanView.length > 0)) {
        console.log(record.drCanView)
        console.log(Tnx.doctorId)
        if (record.drCanView.indexOf(Tnx.doctorId) > -1) {
          console.log("canView1", true)
          return new Promise(function(resolve, reject){
            let url = 'https://api.github.com/repos/uchibeke/dhare/contents/_/_/_/f/i/l/e/s/' + Tnx.recordsId;
            request({
            headers: {
                'User-Agent': 'MY IPHINE 7s'
              },
              uri: url,
              method: 'GET'
            }, (err, res, body) => {
              if (err) return reject(err);
              try {
                let json = JSON.parse(body);
                json = json.map(function(value) {
                  return value.download_url;
                });
                console.log(json)
                return resolve({"canView": true, "data": json});
              } catch(e) {
                return reject(e);
              }
            });
          });
        } else {
          console.log("canView3", false)
          return new Promise((resolve, reject)=> {
            resolve({"canView": false});
          })  
        }
      } else {
        console.log("canView4", false)
        return new Promise((resolve, reject)=> {
          resolve({"canView": false});
        })  
      }
    })
    // .catch((view) => {
    //   console.log("canView5", false)
    //   return new Promise((resolve, reject)=> {
    //     resolve({"canView": false});
    //   })  
    // })
  }

  /** External _view transaction.
      @return {Promise} resolved when this update has completed
  */
  static view (Tnx) {
    let registry = new RecordChain('recordchain');
    return registry.init()
    .then(() => {
      return registry._view(Tnx);
    })
  }


}

// TO SUBMIT NEW REQUEST
// RecordChain.requestAccess({
//   "$class": "org.recordchain.biznet.Request",
//   "doctor":"d1",
//   "patient":"p2"
// })


// TO APPROVE/REJECT A REQUEST
// RecordChain.approveReject({
//   "$class": "org.recordchain.biznet.ApproveReject",
//   "record":{"patientId":"p1", "id":"p"},
//   "approved":true
// })


// TO GRANT ACCESS REQUEST
// RecordChain.grantAccess({
//   "$class": "org.recordchain.biznet.GrantAccess",
//   "record": {
//     "$class": "org.recordchain.biznet.Record",
//     "patientId": "p2",
//     "name": "string",
//     "recordOwner": "resource:org.recordchain.biznet.Doctor#d2"
//   },
//   "granted":true
// })

// TO CHECK IF DOCTOR CAN VIEW
// RecordChain.view ({
//   "$class": "org.recordchain.biznet.View",
//   "doctorId": "d2",
//   "recordsId":"p2"
// })

module.exports = RecordChain;
