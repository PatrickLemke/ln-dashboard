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
            console.log(fees.channel_fees);
            console.log(fees.channel_fees.length);

            for(let i = 0; i < fees.channel_fees.length; i++) {
                if(fees.channel_fees[i].chan_point === channel_point) {
                    $('#channel-modal-header').text('Update Channel Policy');
                    $('#channel-modal-body').html(
                        '<div>Current base fee: ' + fees.channel_fees[i].base_fee_msat + '</div>' +
                        '<div>Fee per mil: ' + fees.channel_fees[i].fee_per_mil + '</div>' +
                        '<div>Fee rate: ' + fees.channel_fees[i].fee_rate + '</div>'
                    );
                }
            }

        })
        .fail(

        );

}