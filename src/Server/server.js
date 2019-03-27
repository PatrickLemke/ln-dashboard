const lnservice = require('./ln.js');
const utils = require('./utils.js');
const express = require('express');
const ln = new lnservice();
const ln_utils = require('./ln-utils.js');
const async = require('async');

const app = express();

app.use(express.static(__dirname + '../../../build'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.locals.moment = require('moment');

app.get(['/', '/home'], (req, res) => {
    res.sendFile('index.html');
});

app.get(['/dashboard'], (req, res) => {

    ln_utils.dashboardMetrics(ln)
    .then(result => {
        res.send(result);
    });
});

app.get('/fwdingevents', (req, res) => {
    ln_utils.fwdingEvents(ln)
    .then(result => {
        //console.log(result);
        res.send(result);
    });
});

app.get('/channels', (req, res) => {

    ln.listChannels({}, (err, channels) => {

        if(err) res.send(err);

        async.each(channels.channels, function (channel, callback) {

            ln.getNodeInfo({pub_key: channel.remote_pubkey}, (err, node) => {

                if(err) {
                    callback();
                } else {
                    if(node.node.alias) {
                        channel.alias = node.node.alias;
                    } else {
                        node.node.alias = "";
                    }

                    ln.getChanInfo({chan_id: channel.chan_id}, (err, chaninfo) => {
                        if(err) {
                            callback();
                        } else {
                            channel.last_update = chaninfo.last_update;
                            callback();
                        }
                    });
                }

            });

        }, function (err) {
            if(err) res.send(err);

            res.locals.utils = utils;
            res.send({channels: channels});
        });

    });

});

app.get('/funds', (req, res) => {

    ln.walletBalance({}, (err, on_chain) => {
        ln.channelBalance({}, (err, off_chain) => {
            res.send({on_chain: on_chain, off_chain: off_chain});
        });
    });


});

app.get('/channelpolicies', (req, res) => {

    ln.feeReport({}, (err, fees) => {
       res.send(fees);
    });

});

app.post('/updatechanpolicy', (req, res) => {
    const output_index = req.body.chan_point.substring(req.body.chan_point.indexOf(':') + 1);
    const funding_txid_str = req.body.chan_point.substring(0, req.body.chan_point.indexOf(':'));

    const options = {
        global: req.body.global,
        chan_point: {
            funding_txid_str: funding_txid_str,
            output_index: output_index
        },
        base_fee_msat: req.body.base_fee_msat,
        fee_rate: req.body.fee_rate,
        time_lock_delta: 144
    };

    console.log(options);

    ln.updateChannelPolicy(options, (err, response) => {
        if(err) {
            res.send(err);
        } else {     
            res.send(response);
        }
    });

});

app.post('/openchannel', (req, res) => {

    const options = {
        node_pubkey_string: req.body.pubkey,
        local_funding_amount: req.body.local_amt,
        push_sat: (req.body.push_amt === '') ? null : req.body.push_amt,
        target_conf: (req.body.target_conf === '') ? null : req.body.target_conf,
        sat_per_byte: (req.body.sat_per_byte === '') ? null : req.body.sat_per_byte,
        private: (req.body.private === '') ? true : false,
        min_htlc_msat: (req.body.min_htlc_msat === '') ? null : req.body.min_htlc_msat,
        remote_csv_delay: (req.body.remote_csv_delay === '') ? null : req.body.remote_csv_delay,
        min_confs: (req.body.min_confs === '') ? null : req.body.min_confs,
        spend_unconfirmed: (req.body.spend_unconfirmed === '') ? true : false,
    };

    if(options.node_pubkey_string === '' || options.local_funding_amount === '') {
        res.send('Please fill in Pubkey and Amount');
    } else {

        ln.openChannelSync(options, (err, response) => {
            if(err) {
                res.send(err);         
            } else {
                res.send(response);
            }
        });
    }

    
});

app.post('/closechannel', (req, res) => {
    const output_index = parseInt(req.body.chan_point.substring(req.body.chan_point.indexOf(':') + 1));
    const funding_txid_str = req.body.chan_point.substring(0, req.body.chan_point.indexOf(':'));

    const options = {
        channel_point: {
            funding_txid_str: funding_txid_str,
            output_index: output_index
        },
        force: (req.body.force == 'true') ? true : false,
        target_conf: (req.body.target_conf === '') ? null : req.body.target_conf,
        sat_per_byte: (req.body.sat_per_byte === '') ? null : req.body.sat_per_byte
    }
    const call = ln.closeChannel(options);
    
    let response_index = 0;
    call.on('data', response => {
        if(response_index === 0) {
            res.send(response);
            response_index++;
        }
    });

    call.on('error', err => {
        res.send(err);
    });

    call.on('status', status => {
        console.log('Status: ' + status);
    });

});

app.listen(3001);
