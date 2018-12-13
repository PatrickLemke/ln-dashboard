const lnservice = require('./ln.js');
const utils = require('./utils.js');
const express = require('express');
const ln = new lnservice();
const ln_utils = require('./ln-utils.js');
const async = require('async');
const path = require('path');
const lessMiddleware = require('less-middleware');

const app = express();

app.use(lessMiddleware('/styles', {
    dest: '/css',
    pathRoot: path.join(__dirname, '../public')
}));

app.use(express.static(__dirname + './../public'));
app.use(express.static(__dirname + './../node_modules'));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.locals.moment = require('moment');

app.get(['/', '/home'], (req, res) => {

    ln.getInfo({}, (err, getinfo) => {
        if(err) getinfo = null;

        ln.feeReport({}, (err, fees) => {

            if(err) fees = null;

            ln_utils.fundsInInactiveChannels(ln)
                .then(inactive_funds => {

                    ln_utils.lnrr(ln)
                    .then(lnrr => {
                        res.locals.utils = utils;
                        res.render('index', {title: 'Home', getinfo: getinfo, fees: fees, inactive_funds: inactive_funds, lnrr: lnrr});
                    })
                    .catch(err => {
                        res.status(400).send(err);
                    });
                })
                .catch(err => {
                    res.status(400).send(err);
                });


        });

    });
});

app.get('/channels', (req, res) => {

    ln.listChannels({}, (err, channels) => {

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
            res.locals.utils = utils;
            res.render('channels', {title: "Channels", channels: channels});
        });

    });

});

app.get('/funds', (req, res) => {

    ln.walletBalance({}, (err, on_chain) => {
        ln.channelBalance({}, (err, off_chain) => {
            res.locals.utils = utils;
            res.render('wallet', {title: "Funds", on_chain: on_chain, off_chain: off_chain});
        });
    });


});

app.get('/faq', (req, res) => {
    res.locals.utils = utils;
    res.render('faq', {title: 'FAQ'});
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
        //push_sat: (req.body.push_amt === '') ? null : req.body.push_amt,
        //target_conf: req.body.target_conf,
        //sat_per_byte: req.body.sat_per_byte,
        // private: (req.body.private === '') ? true : false,
        // min_htlc_msat: req.body.min_htlc_msat,
        // remote_csv_delay: req.body.remote_csv_delay,
        // min_confs: req.body.min_confs,
        // spend_unconfirmed: (req.body.spend_unconfirmed === '') ? true : false,
    };

    console.log(options);

    ln.openChannelSync(options, (err, response) => {
        if(err) {
            res.send(err);         
        } else {
            res.send(response);
        }
    });
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
        //target_conf: 10,
        //sat_per_byte: 1
    }

    console.log(options);

    const call = ln.closeChannel(options);

    let result;

    call.on('data', response => {
        result = response;
    });

    call.on('status', status => {
        console.log(status);
    });

    call.on('end', () => {
        res.send(result);
    });

});

app.listen(3000);
