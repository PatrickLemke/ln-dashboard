$(document).ready(function () {
    // Display tooltips
    $('[data-toggle="tooltip"]').tooltip();

    drawFeeChart([3000, 1100, 80, 6000, 500, 100], ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

});

function drawFeeChart(data, labels) {
    const ctx = document.getElementById("feeChart").getContext('2d');

    const feeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Fees Earned',
                data: data,
                borderColor: '#195D9E',
                backgroundColor: 'white',
                fill: false,
                lineTension: 0,
            }]
        },
        options: {
            legend: false,
            responsive: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}