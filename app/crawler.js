const lnservice = require('./ln.js');
const utils = require('./utils.js');
const ln = new lnservice();
const ln_utils = require('./ln-utils.js');
const async = require('async');
const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'dbuser',
    database: 'bigdata',
});

function initializeTables(callback) {
    const feeTable = new Promise((resolve, reject) => {
        // Fee table
        pool.query('CREATE TABLE IF NOT EXISTS`fees` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
        '`day` int(11) NOT NULL,' +
        '`week` int(11) NOT NULL,' +
        '`month` int(11) NOT NULL,' +
        'PRIMARY KEY (`id`)' + ')', (err, response) => {
            if(err) reject(err);
            resolve(response);
        });
    });

    const walletBalanceTable = new Promise((resolve, reject) => {
        // Wallet Balance table
        pool.query('CREATE TABLE IF NOT EXISTS `walletbalance` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
        '`total_balance` bigint(20) NOT NULL,' +
        '`confirmed_balance` bigint(20) NOT NULL,' +
        '`unconfirmed_balance` bigint(20) NOT NULL,' +
        'PRIMARY KEY (`id`)' +
        ')', (err, response) => {
            if(err) reject(err);
            resolve(response);
        });
    });

    const channelBalanceTable = new Promise((resolve, reject) => {
        // Channel Balance
        pool.query('CREATE TABLE IF NOT EXISTS `channelbalance` (' +
        '`id` int(11) NOT NULL AUTO_INCREMENT,' +
        '`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
        '`balance` bigint(20) NOT NULL,' +
        '`pending_open_balance` bigint(20) NOT NULL,' +
        'PRIMARY KEY (`id`)' +
        ')', (err, response) => {
            if(err) reject(err);
            resolve(response);
        });
    });

    Promise.all([feeTable, walletBalanceTable, channelBalanceTable])
    .then(() => {
        callback();
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });

    
}


function insertFees() {
    ln.feeReport({}, (err, fees) => {

        if(err) console.log(err);

        let day_fee_sum = fees.day_fee_sum;
        let month_fee_sum = fees.month_fee_sum;
        let week_fee_sum = fees.week_fee_sum;

        pool.query('INSERT INTO fees (day, week, month) VALUES(?, ?, ?)',
         [day_fee_sum, week_fee_sum, month_fee_sum], (err, response) => {
            console.log(response);
        })

    });

    // Once per day
    setTimeout(insertFees, 1000*60*60*24);
}

function insertWalletBalances() {
    ln.walletBalance({}, (err, walletBalance) => {

        if(err) console.log(err);

        let total_balance = walletBalance.total_balance;
        let confirmed_balance = walletBalance.confirmed_balance;
        let unconfirmed_balance = walletBalance.unconfirmed_balance;

        pool.query('INSERT INTO walletbalance (total_balance, confirmed_balance, unconfirmed_balance) VALUES(?, ?, ?)',
        [total_balance, confirmed_balance, unconfirmed_balance], (err, response) => {
            console.log(response);
        });

    });

    // Every hour
    setTimeout(insertWalletBalances, 1000*60*60);
}

function insertChannelBalances() {
    ln.channelBalance({}, (err, channelBalance) => {

        if(err) console.log(err);

        let balance = channelBalance.balance;
        let pending_open_balance = channelBalance.pending_open_balance;

        pool.query('INSERT INTO channelbalance (balance, pending_open_balance) VALUES(?, ?)', [balance, pending_open_balance], (err, response) => {
            console.log(response);
        });

    });

    // Every hour
    setTimeout(insertChannelBalances, 1000*60*60);
}

initializeTables(() => {
    insertFees();
    insertWalletBalances();
    insertChannelBalances();
});
