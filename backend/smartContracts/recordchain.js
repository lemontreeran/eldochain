'use strict';
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

// these are the credentials to use to connect to the Hyperledger Fabric
let cardname = "admin@recordchain";

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
        console.log("app len", patient.approvals.length)
        patient.approvals = patient.approvals & patient.approvals.length > 0 ? patient.approvals.push(Tnx.patient) : [Tnx.patient]
        return this.patientRegistry.update(patient);
      }).then((updatedPatient) => {
        if (Tnx.doctor) {
          return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Doctor')
          .then((doctorRegistry) => {
            this.doctorRegistry = doctorRegistry;
            return doctorRegistry.get(Tnx.doctor);
          }).then((doctor) => {
            doctor.requests = doctor.requests  & doctor.requests.length > 0 ? doctor.requests.push(Tnx.patient) : [Tnx.patient]
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
        let pID = Tnx.record.patient;
        return patientRegistry.get(pID);
      }).then((patient) => {
        let itemIdex = patient.approvals.indexOf(Tnx.record.Id)
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
    if (Tnx.granted == true) {
      return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Doctor')
      .then((doctorRegistry) => {
        this.doctorRegistry = doctorRegistry;
        let dID = Tnx.doctorGranting;
        return doctorRegistry.get(dID);
      }).then((doctor) => {
        let itemIdex = doctor.approvals.indexOf(Tnx.record.Id)
        console.log(itemIdex)
        if (itemIdex > -1) {
          console.log("app len", doctor.approvals.length)
          doctor.approvals.splice(itemIdex, 1);
          console.log("app len", doctor.approvals.length)
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
      console.log("Not granted false")
      return new Promise((resolve, reject)=> {
          resolve({"approved": false, "message":"Access not granted"});
      });
    }
  }
}
RecordChain.requestAccess({
  "$class": "org.recordchain.biznet.Request",
  "doctor":"d1",
  "patient":"p1"
})
// RecordChain.approveReject({
//   "$class": "org.recordchain.biznet.ApproveReject",
//   "record":{"patient":"p1", "Id":"d1"},
//   "approved":true
// })

module.exports = RecordChain;
