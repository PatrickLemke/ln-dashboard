const async = require('async');
const moment = require('moment');

// Get funds that are locked up in inactive channels
const fundsInInactiveChannels = (ln) => {
    return new Promise((resolve, reject) => {

        ln.listChannels({}, (err, listinvoices) => {
            if(err) reject(err);

            let channels = listinvoices.channels;
            let inactive_funds = 0;

            async.each(channels, function (channel, callback) {
                if(!channel.active) {
                    inactive_funds += parseInt(channel.local_balance);
                }
                callback();

            }, function (err) {
                if(err) reject(err);

                resolve(inactive_funds);
            });
            
        });

    });
};

// Calculate the Lightning Network Rate of Return on an annualised basis
// Returns lnrr in %
const lnrr = (ln) => {
    return new Promise((resolve, reject) => {

        ln.channelBalance({}, (err, balance) => {
            if(err) reject(err);

            ln.feeReport({}, (err, feereport) => {
                if(err) reject(err);

                let channelbalance = parseFloat(balance.balance);
                let fees = parseFloat(feereport.month_fee_sum);

                // Calculate the lnrr on an annulised basis on the monthly fee revenue
                let lnrr = ((1 + (fees / channelbalance)) ** 12 - 1) * 100

                resolve(lnrr);
            });

        });
    });
};

const channelStats = (ln) => {
    return new Promise((resolve, reject) => {

        ln.listChannels({}, (err, channels) => {
            if(err) reject(err);

            resolve();

        });

    });   
};

const fwdingEvents = (ln) => {
    return new Promise((resolve, reject) => {

        let feesByDate = [];

        const request = {
            start_time: moment().subtract(5, 'years').unix(),
            end_time: moment().unix(),
            //index_offset: null,
            //num_max_events: null,
        };

        ln.forwardingHistory(request, (err, result) => {
            if(err) reject(err);

            const events = result.forwarding_events;

            Object.keys(events).map((key) => {
                events[key].date = moment.unix(events[key].timestamp).format('MM/DD/YYYY');
            });

            events.reduce((total, obj, index, array) => {
                return total += parseInt(obj.fee);
            }, 0);

            resolve(events);


            // async.each(events, (event, callback) => {

            //     if(feesByDate.length === 0) {
            //         feesByDate.push({date: event.date, fee: event.fee});
            //     }

            //     for(let i = 0; i < feesByDate.length; i++) {
            //         if(feesByDate[i].date === event.date) {
            //             feesByDate[i].fee += event.fee;
            //         } else {
            //             feesByDate.push({date: event.date, fee: event.fee});
            //         }
            //     }

            //     callback();

            // }, (err) => {
            //     if(err) reject(err);

            //     resolve(feesByDate);
            // });

        });

    });
};

const dashboardMetrics = (ln) => {
    return new Promise((resolve, reject) => {

        ln.getInfo({}, (err, getinfo) => {
            if(err) getinfo = null;
    
            ln.feeReport({}, (err, fees) => {
    
                if(err) fees = null;
    
                fundsInInactiveChannels(ln)
                    .then(inactive_funds => {
    
                        lnrr(ln)
                        .then(lnrr => {
    
                            ln.getNetworkInfo({}, (err, network) => {
                                if(err) res.send(err);
                                resolve({getinfo: getinfo, network:network, fees: fees, inactive_funds: inactive_funds, lnrr: lnrr});
                            });
    
                        })
                        .catch(err => {
                            reject(err);
                        });
                    })
                    .catch(err => {
                        reject(err);
                    });

            });
    
        });

    });
};

module.exports = {
    fundsInInactiveChannels,
    lnrr,
    capacity: channelStats,
    dashboardMetrics,
    fwdingEvents,
};