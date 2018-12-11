$(document).ready(function () {

    // Display tooltips
    $('[data-toggle="tooltip"]').tooltip();

    $('.arrow-collapse').click(e => {
        if($(event.target).hasClass('fa-caret-right')) {
            $(event.target).removeClass('fa-caret-right');
            $(event.target).addClass('fa-caret-down', 1000);
        } else {
            $(event.target).removeClass('fa-caret-down');
            $(event.target).addClass('fa-caret-right', 1000);
        }

    });

});


function channelModal(channel_point) {
    let modal = $('#channel-policy-modal');
    modal.modal();

    $.get('/channelpolicies', {})
        .then(fees => {

            for(let i = 0; i < fees.channel_fees.length; i++) {
                if(fees.channel_fees[i].chan_point === channel_point) {
                    $('#channel-modal-header').text('Channel Policy');
                    $('#channel-modal-body').html(
                        '<div>Current base fee: <input type="text" class="form-control" id="base-fee-msat" value="' + fees.channel_fees[i].base_fee_msat + '" />' + '</div>' +
                        //'<div>Fee per mil: ' + fees.channel_fees[i].fee_per_mil + '</div>' +
                        '<div>Fee rate: <input type="text" class="form-control" id="fee-rate" value="' + fees.channel_fees[i].fee_rate + '" /></div>' +
                        '<div class="btn btn-secondary btn-sm mt-2" onClick="updatePolicy(\'' + channel_point + 
                        '\')">Update Channel Policy</div>' +
                        '<div class="mt-2">Please note that this can take a very long time to complete.</div>' + 
                        '<div>It might also crash your node so treat this as an experimental feature.</div>' +
                        '<i class="fa fa-spinner fa-spin d-none"></i>'
                    );
                }
            }

        })
        .fail(

        );

}

function closeChannelModal(channel_point) {
    let modal = $('#channel-close-modal');
    modal.modal();

    $('#close-channel-button').text(channel_point);
}

function closeChannel(force) {

    const channel_point = $('#close-channel-button').text();

    const options = {
        chan_point: channel_point,
        force: force
    };

    $.post('/closechannel', options)
    .then(result => {
        console.log(result);
    })
    .fail(err => {
        console.log(err);
    });
}

function updatePolicy(chan_point) {
    const base_fee_msat = $('#base-fee-msat').val();
    const fee_rate = $('#fee-rate').val();

    options = {
        global: false,
        chan_point: chan_point,
        base_fee_msat: base_fee_msat,
        fee_rate: fee_rate
    }

    $('.fa-spin').removeClass('d-none');

    $.post('/updatechanpolicy', options)
    .then(result => {
        console.log(result);
        $('.fa-spin').addClass('d-none');
    })
    .fail(err => {
        console.log(err);
    });
}