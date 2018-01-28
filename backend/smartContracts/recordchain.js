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

  /** Assigns a role to a user..
      @return {Promise} resolved when this update has completed
  */
  _assignRole(Assign) {
    return this.bizNetworkConnection.getAssetRegistry('org.assetchain.biznet.Role')
    .then((roleRegistry) => {
      console.log("Got Role Registry", roleRegistry)
      this.roleRegistry = roleRegistry;
      return roleRegistry.exists(Assign.id);
      }).then((exists) => {
        console.log(exists ? "Role is is Registry" : "New Role")
        if (exists) {
          return this.roleRegistry.get(Assign.id)
          .then((role) => {
            role.members = role.members.concat(Assign.members.filter((item) => {
              return role.members.indexOf(item) < 0;
            }));
            role.members = Array.from(new Set(role.members))
            return this.roleRegistry.update(role);
          })
        } else {
          // Get the factory.
          var factory = this.businessNetworkDefinition.getFactory();
          // Create a new asset.
          var newAsset = factory.newResource('org.assetchain.biznet', 'Role', Assign.id);
          // Set the properties of the new asset.
          newAsset.id = Assign.id 
          newAsset.name = Assign.name || "";
          newAsset.members = Assign.members;
          newAsset.assigner = factory.newRelationship('org.assetchain.biznet', 'User', Assign.assigner)
          return this.roleRegistry.add(newAsset);
        }
      }).catch((error) => {
        console.log("ERROR:\n\n",error)
    });
  }

  /** External assign role function..
      @return {Promise} resolved when this update has completed
  */
  static assignRole(Assign) {
    let registry = new AssetRegistry('c-net');
    return registry.init()
    .then(() => {
      return registry._assignRole(Assign);
    })
  }

  /** Request Access to a patient record..
      @return {Promise} resolved when this update has completed
  */
  _requestAccess(Tnx) {
    return this.bizNetworkConnection.getParticipantRegistry('org.recordchain.biznet.Patient')
    .then((patientRegistry) => {
      this.patientRegistry = patientRegistry;
      this.requester = Tnx.doctor || doctor.institution
      return patientRegistry.get(Tnx.patient);
      }).then((patient) => {
        console.log("app len", patient.approvals.length)
        patient.approvals = patient.approvals & patient.approvals.length > 0 ? patient.approvals.push(this.requester) : [this.requester]
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

  /** External _userRoles function..
      @return {Promise} resolved when this update has completed
  */
  static requestAccess(Tnx) {
    let registry = new RecordChain('recordchain');
    return registry.init()
    .then(() => {
      return registry._requestAccess(Tnx);
    })
  }

}
module.exports = RecordChain;
