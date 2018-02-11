# Eldochain: A blockchain for seniors' health record

## Setting up and running

- Install hyperledger fabric and composer by following instructions here: 
		https://hyperledger.github.io/composer/installing/development-tools

- Genrate .bna file: 

		composer archive create -t dir -n .
- Install composer runtime: 

		composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName tutorial-network
- Start network: 
		composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile tutorial-network@0.0.1.bna --file networkadmin.card
- Import an admin card: 

		composer card import --file networkadmin.card
- Ping a network: 

		composer network ping --card admin@t-network
- Start rest server: 

		composer-rest-server -c admin@c-net -n never -w true
- Update with new .bna file 

		composer network update -a <business-network-archive> -c <card-name>


## About

### Vishvajit

The final idea is to make a universal document controller that holds all different kind of document, files, etc that are confidential. Building this app via blockchain mechanism we can ensure that the file is accessible only to those with given permission (R/W) but it's different then gdrive

For example, if student wants to submit transcript to different universities, he/she has to first upload the unofficial document and then after approval he/she sends the official from uni which is chargeable. Instead of that, using our app user can create an account and he can request official transcript to the university and university is the only person allowed to upload the file. User can only read and share the link to other people who can read and share

This is very short example but this app is very useful in finance, government, medical and public sector where there is lots of sharing of document in paper(sealed documents). Using our app, we can go green and save the future!😂😀

Also, it's difficult to hack the blockchain as I am sure your all are aware of that.

### Uchi 

So it looks like we our app has 3 parts: the blockchain itself, the ui (mobile/web app) and the middleware(rest service) to connect blockchain to ui



