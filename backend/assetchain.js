'use strict';
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const composer_common = require('composer-common');
// these are the credentials to use to connect to the Hyperledger Fabric
let cardname = "admin@c-net";

/** Class for the asset registry*/
class AssetRegistry {

  /**
   * Need to have the mapping from bizNetwork name to the URLs to connect to.
   * bizNetwork nawme will be able to be used by Composer to get the suitable model files.
   *
   */
   constructor() {
    this.bizNetworkConnection = new BusinessNetworkConnection();
    console.log("cons")
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
        console.log('c-net:<init>', 'businessNetworkDefinition obtained', this.businessNetworkDefinition.getIdentifier());
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
// transaction GetRoles {
//     --> User user
// }


  /** Gets the roles of a user..
      @return {Promise} resolved when this update has completed
  */
  _userRoles(Role) {
    return this.bizNetworkConnection.getAssetRegistry('org.assetchain.biznet.Role')
    .then((RoleRegistry)=> {
      this.RoleRegistry = RoleRegistry;

      return RoleRegistry.getAll();
    }).then ((roles)=> {
      console.log(roles)
      var factory = this.businessNetworkDefinition.getFactory();
      let user = factory.newRelationship('org.assetchain.biznet', 'User', Role.user)
      console.log(user.getIdentifier())

      var userRoles = roles.filter(function( role ) {
        return role.members.indexOf(user.getIdentifier()) >= 0;
      }).map(function(obj) {
          return {
            id: obj.id, 
            name: obj.name
          };
      });
      let serializer = this.businessNetworkDefinition.getSerializer();
      return new Promise((resolve, reject)=> {
        // resolve(serializer.fromJSON(userRoles));
        resolve(userRoles);
      });
    })
  }

  /** External _userRoles function..
      @return {Promise} resolved when this update has completed
  */
  static userRoles(Role) {
    let registry = new AssetRegistry('c-net');
    return registry.init()
    .then(() => {
      return registry._userRoles(Role);
    })
  }

}
module.exports = AssetRegistry;
