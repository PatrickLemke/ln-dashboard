const numberWithCommas = (x) => {
    if(x !== null && typeof(x) !== 'undefined') {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return null;
    }
};

module.exports = {
    numberWithCommas,
};