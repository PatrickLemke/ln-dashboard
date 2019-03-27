const lnservice = require('./ln.js');
const utils = require('./utils.js');
const ln = new lnservice();
const ln_utils = require('./ln-utils.js');
const async = require('async');

// Queries all possible routes to a channel
// This is only supposed to be used for channels where we have a direct connection with, otherwise it will fail
const queryRouteToChannel = (channel_id, amount) => {
    return new Promise((resolve, reject) => {
        ln.getChanInfo({chan_id: channel_id}, (err, channel) => {
            if(err) reject(err);

            ln.getInfo({}, (err, info) => {
                if(err) reject(err);

                // Since the node1_pub and node2_pub rules don't seem to be consistent accross channels, we need
                // to check if we are the first or the second node in that channel
                ln.queryRoutes({pub_key: (info.identity_pubkey === channel.node1_pub) ? channel.node2_pub: channel.node1_pub, amt: amount}, (err, routes) => {
                    if(err) reject(err);
    
                    resolve(routes.routes);
                });
            });

        });
    });
    
};

module.exports = {
    queryRouteToChannel,
}

// Testing script for rebalancing
let channel_id = 1590189582392492032;
let amt = 1000;
let my_pubkey = '030cab39774d523e379d385327ea12dab38d0edac19d1122df52175c4ec41a4af8';

queryRouteToChannel(channel_id, amt)
    .then(routes => {

        // Our own constructed routes, where the last hop is already added
        let constructedRoutes = [];

        async.each(routes, (route, callback) => {

            // We can copy all the info for our last hop from the second to last hop, since the last hop will always have
            // 0 fees because it is the channel with our own node.
            let secondToLastHop = route.hops[route.hops.length-1];

            ln.getChanInfo({chan_id: channel_id}, (err, channel) => {
                if(err) throw err;
    
                // Since lnd doesn't let us query for routes to our own node, we need to construct the last hop ourselves
                // The last hop always has 0 fees and does't require any additional inputs
                finalHop = {
                chan_id: channel_id.toString(),
                chan_capacity: channel.capacity,
                amt_to_forward: secondToLastHop.amt_to_forward,
                fee: '0',
                expiry: secondToLastHop.expiry,
                amt_to_forward_msat: secondToLastHop.amt_to_forward_msat,
                fee_msat: '0',
                pub_key: my_pubkey
                };

                if(secondToLastHop.chan_id !== finalHop.chan_id) {
                    route.hops.push(finalHop);
                    constructedRoutes.push(route);   
                    callback();
                } else {
                    callback();
                }     

            });
            
        }, (err) => {
            if(err) throw err;

            console.log(constructedRoutes[0]);
            console.log(constructedRoutes[1]);
            console.log(constructedRoutes[2]);
            
            // Adding a new invoice with the amount we queried for
            ln.addInvoice({value: amt}, (err, invoice) => {
                if(err) throw err;
    
                ln.getInfo({}, (err, info) => {
                    if(err) throw err;
    
                    ln.sendToRouteSync({payment_hash_string: invoice.r_hash.toString('hex'), routes: constructedRoutes}, (err, response) => {
                        if(err) throw err;
                        console.log(response);
                    });
                });
    
            });

        });

        
    });

// const request = {
//     pay_req: 'lntb17u1pwq6wzdpp58k7x4xk3me9ykrla0rvhgt38kve7phenm2d6d3rl4e7l2ghf3ccqdpzxysy2umswfjhxum0yppk76twypgxzmnwvycqp2jyzvv4vztf7mncap65ca8nn7pays7nkmet8wxt7pqkkrzkx5c6gpg0ltfxg37q62atcnz5hqrhcxajpal2s9m0m36w5c93fc8jh367cqwzy082'
// }

// ln.decodePayReq(request, (err, request) => {
//     if(err) throw err;
    
//     destination = request.destination;

//     ln.queryRoutes({pub_key: destination, amt: request.num_satoshis}, (err, routes) => {
//         if(err) throw err;
//         ln.sendToRouteSync({payment_hash_string: request.payment_hash, routes: routes.routes}, (err, response) => {
//             if(err) throw err;
//             console.log(response);
//         });
//     });
// });