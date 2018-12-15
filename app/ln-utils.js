const async = require('async');

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
                let lnrr = ((1 + (fees / channelbalance)) ** 12 - 1)*100

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

module.exports = {
    fundsInInactiveChannels,
    lnrr,
    capacity: channelStats,
};