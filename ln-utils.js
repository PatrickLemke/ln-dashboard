const async = require('async');

// LN functions
const fundsInInactiveChannels = (ln) => {
    return new Promise((resolve, reject) => {

        ln.listChannels({}, (err, listinvoices) => {
            if(err) reject(err);

            let channels = listinvoices.channels;
            let inactive_funds = 0;

            async.each(channels, function (channel, callback) {
                if(!channel.active) {
                    inactive_funds += channel.local_balance;
                }
                callback();

            }, function (err) {
                if(err) reject(err);

                resolve(inactive_funds);
            });
            
        });

    });
};

module.exports = {
    fundsInInactiveChannels
};