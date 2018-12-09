const lnservice = require('./ln.js');
const utils = require('./utils.js');
const express = require('express');
const ln = new lnservice();
const ln_utils = require('./ln-utils.js');
const async = require('async');

const app = express();

app.use(express.static(__dirname + './../public'));
app.use(express.static(__dirname + './../node_modules'));

app.set('views', '../views');
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.locals.moment = require('moment');

app.get('/', (req, res) => {

    ln.getInfo({}, (err, getinfo) => {
        if(err) getinfo = null;

        ln.feeReport({}, (err, fees) => {

            if(err) fees = null;

            ln_utils.fundsInInactiveChannels(ln)
                .then(inactive_funds => {

                    ln_utils.lnrr(ln)
                    .then(lnrr => {
                        res.locals.utils = utils;
                        res.render('index', {getinfo: getinfo, fees: fees, inactive_funds: inactive_funds, lnrr: lnrr});
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

app.get('/channelpolicies', (req, res) => {

    ln.feeReport({}, (err, fees) => {
       res.send(fees);
    });

});

app.post('/updatechanpolicy', (req, res) => {
    const funding_txid_str = req.body.chan_point.substring(req.body.chan_point.indexOf(':') + 1);
    const output_index = req.body.chan_point.substring(0, req.body.chan_point.indexOf(':'));

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

    ln.updateChannelPolicy(options, (err, response) => {
        if(err) {
            console.log(err);
            res.status(400).send();
        } else {     
            res.send(response);
        }
    });

});

app.listen(3000);
