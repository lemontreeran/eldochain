'use strict';
/**
* Write your transction processor functions here
*/

/**
* CanView transaction processor function.
* @param {org.recordchain.biznet.CanView} CanView The transaction to save a new asset to the blockchain.
* @transaction
*/
function Check(CanView) {
    return getAssetRegistry('org.recordchain.biznet.Resource')
    .then(function (AssetRegistry) {
        return AssetRegistry.get(CanView.asset.assetId);
    }).then (function(asset) {
        console.log(asset)
        if(asset != undefined) {
            return asset.viewers.indexOf(CanView.asset) >= 0
        } else {
            return false
        }
    })
}





