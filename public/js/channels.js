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

    $('#open-channel-button').click((e) => {
        e.preventDefault();
        //console.log($('#open-channel-form').serialize());
        $.post('/openchannel', $('#open-channel-form').serialize())
        .then(result => {
            if(result.output_index !== 'undefined') {
                $('#channel-open-response').text('Channel successfully opened');
            } else {
                $('#channel-open-response').text(result);
            }
        })
        .fail(err => {
            $('#channel-open-response').text(JSON.stringify(err));
        })
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
                        '<div><i class="fa fa-spinner fa-spin d-none"></i></div>' + 
                        '<div id="channel-policy-response" class="mt-2"></div>'
                    );
                }
            }

        })
        .fail(

        );

}

function openChannelModal() {
    let modal = $('#channel-open-modal');
    modal.modal();
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
        force: force,
        target_conf: $('#target-conf-close').val(),
        sat_per_byte: $('#sat-per-byte-close').val()
    };

    $.post('/closechannel', options)
    .then(result => {
        $('#channel-close-response').text(JSON.stringify(result));
    })
    .fail(err => {
        $('#channel-close-response').text(JSON.stringify(err));
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
        $('.fa-spin').addClass('d-none');
        $('#channel-policy-response').text('Done');
    })
    .fail(err => {
        $('#channel-policy-response').text('Error');
    });
}