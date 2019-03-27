import React from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Popover, PopoverBody } from 'reactstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { numberWithCommas } from '../../Server/utils';
import './home.scss';

class Home extends React.Component {
    constructor(props) {
        super(props);

        library.add(faInfoCircle);

        this.toggleInactiveFundsPopover = this.toggleInactiveFundsPopover.bind(this);
        this.toggleLnrrPopover = this.toggleLnrrPopover.bind(this);
        
        this.state = {

            dashboardMetricsReceived: false,

            feeChartData: {
                labels: ['1/22', '1/23', '1/24', '1/25', '1/26', '1/27'],
                datasets: [{
                    label: 'Routing fees earned (sat)',
                    data: [8, 3, 10, 20, 2, 9],
                    borderColor: '#195D9E',
                    backgroundColor: 'white',
                    fill: false,
                    lineTension: 0,
                }]
            },

            routingChartData : {
                labels: ['1/22', '1/23', '1/24', '1/25', '1/26', '1/27'],
                datasets: [{
                    label: 'Amount routed (sat)',
                    data: [8000, 30000, 1000000, 2000, 200000, 90000],
                    borderColor: '#195D9E',
                    backgroundColor: 'white',
                    fill: false,
                    lineTension: 0,
                }]
            },
            
            feesEarned: {
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
            },

            inactiveFunds: 0,
            inactiveFundsPopoverOpen: false,

            lnrr: 0,
            lnrrPopoverOpen: false,

            getInfo: {
                alias: null,
                identity_pubkey: null,
                num_pending_channels: null,
                num_active_channels: null,
                num_inactive_channels: null,
                num_peers: null,
                block_height: null,
                block_hash: null,
                synced_to_chain: null,
                testnet: null,
                version: null,
            },

            getNetworkInfo: {
                num_nodes: null,
                num_channels: null,
                total_network_capacity: null,
                avg_channel_size: null,
                min_channel_size: null,
                max_channel_size: null,
                graph_diameter: null,
                avg_out_degree: null,
                max_out_degree: null,
            },

        }
    }

    componentDidMount() {
        axios.get('/dashboard')
        .then(result => {
            const metrics = result.data;

            this.setState({
                dashboardMetricsReceived: true,
                feesEarned: {
                    today: metrics.fees.day_fee_sum,
                    thisWeek: metrics.fees.week_fee_sum,
                    thisMonth: metrics.fees.month_fee_sum,
                },
                inactiveFunds: metrics.inactive_funds,
                lnrr: metrics.lnrr,
                getInfo: {
                    alias: metrics.getinfo.alias,
                    identity_pubkey: metrics.getinfo.identity_pubkey,
                    num_pending_channels: metrics.getinfo.num_pending_channels,
                    num_active_channels: metrics.getinfo.num_active_channels,
                    num_inactive_channels: metrics.getinfo.num_inactive_channels,
                    num_channels: metrics.getinfo.num_active_channels + metrics.getinfo.num_inactive_channels,
                    num_peers: metrics.getinfo.num_peers,
                    block_height: metrics.getinfo.block_height,
                    block_hash: metrics.getinfo.block_hash,
                    synced_to_chain: metrics.getinfo.synced_to_chain,
                    testnet: metrics.getinfo.testnet,
                    version: metrics.getinfo.version,
                },
                getNetworkInfo: {
                    num_nodes: metrics.network.num_nodes,
                    num_channels: metrics.network.num_channels,
                    total_network_capacity: metrics.network.total_network_capacity,
                    avg_channel_size: metrics.network.avg_channel_size,
                    min_channel_size: metrics.network.min_channel_size,
                    max_channel_size: metrics.network.max_channel_size,
                    graph_diameter: metrics.network.graph_diameter,
                    avg_out_degree: metrics.network.avg_out_degree,
                    max_out_degree: metrics.network.max_out_degree,
                },
            });
        });
    }

    toggleInactiveFundsPopover() {
        this.setState({
            inactiveFundsPopoverOpen: !this.state.inactiveFundsPopoverOpen
        });
    }

    toggleLnrrPopover() {
        this.setState({
            lnrrPopoverOpen: !this.state.lnrrPopoverOpen
        });
    }

    changeChart() {
        this.setState({
            feeChartData: {
                labels: ['Monday', 'Tuesday', 'laksdjfl', 'Thursday', 'Friday', 'Saturday'],
                datasets: [{
                    label: 'Fees Earned',
                    data: [1500, 200, 80, 400, 500, 100],
                    borderColor: '#195D9E',
                    backgroundColor: 'white',
                    fill: false,
                    lineTension: 0,
                }]
            }
        });
    }

    render() {
        return(
            <div>
                <h6>Overview</h6>

                <div className="dashboard-section">
                    <Line
                        data={this.state.feeChartData}
                        height={200}
                        options={{maintainAspectRatio: false}}
                    />
                    {/* <Button color="primary" onClick={() => this.changeChart()}>Change Charts</Button> */}
                </div>

                <div className="dashboard-section">
                    <Line
                        data={this.state.routingChartData}
                        height={200}
                        options={{
                            maintainAspectRatio: false,
                            scales: {
                                yAxes: {
                                    ticks: {
                                        beginAtZero:false,
                                        callback: (value, index, values) => {
                                            value = value.toString();
                                            value = value.split(/(?=(?:...)*$)/);
                                            value = value.join(',');
                                            console.log(value);
                                            return value;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>

                <div className="dashboard-section">
                    <h6 className="font-weight-light">Fees earned</h6>
                    <div>
                        Today
                        <div className="badge badge-primary ml-2">{numberWithCommas(this.state.feesEarned.today) + ' sat'}</div>
                    </div>
                    <div>
                        This Week
                        <div className="badge badge-primary ml-2">{numberWithCommas(this.state.feesEarned.thisWeek) + ' sat'}</div>
                    </div>
                    <div>
                        This Month
                        <div className="badge badge-primary ml-2">{numberWithCommas(this.state.feesEarned.thisMonth) + ' sat'}</div>
                    </div>
                </div>
                
                <div className="dashboard-section">
                    <div>
                        <div>Inactive Channels: {numberWithCommas(this.state.getInfo.num_inactive_channels)} ({Math.round(this.state.getInfo.num_inactive_channels / this.state.getInfo.num_channels * 100)}%)</div>
                        <div>Inactive Funds: {numberWithCommas(this.state.inactiveFunds) + ' sat '}
                        <FontAwesomeIcon id="inactiveFundsPopover" icon={["fa", "info-circle"]} /></div>
                        <Popover placement="top" trigger="hover" isOpen={this.state.inactiveFundsPopoverOpen} target="inactiveFundsPopover" toggle={this.toggleInactiveFundsPopover}>
                            <PopoverBody>Those are funds that are locked up in inactive channels. Your channel partner is probably offline</PopoverBody>
                        </Popover>
                    </div>     
                </div>

                <div className="dashboard-section">
                    <div>
                        Lightning Network Rate of Return (annualised): {this.state.lnrr + '% '}
                        <FontAwesomeIcon id="lnrrPopover" icon={["fa", "info-circle"]} />
                        <Popover placement="top" trigger="hover" isOpen={this.state.lnrrPopoverOpen} target="lnrrPopover" toggle={this.toggleLnrrPopover}>
                            <PopoverBody>The LNRR is calculated based on the annualised monthly returns of your channel funds</PopoverBody>
                        </Popover>
                    </div>     
                </div>

                <div className="dashboard-section">
                    <div>
                        <h6 className="font-weight-light">Node Info</h6>
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td>Alias</td>
                                    <td>{this.state.getInfo.alias}</td>
                                </tr>
                                <tr>
                                    <td>Pubkey</td>
                                    <td>{this.state.getInfo.identity_pubkey}</td>
                                </tr>
                                <tr>
                                    <td>Active channels</td>
                                    <td>{this.state.getInfo.num_active_channels}</td>
                                </tr>
                                <tr>
                                    <td>Inactive channels</td>
                                    <td>{this.state.getInfo.num_inactive_channels}</td>
                                </tr>
                                <tr>
                                    <td>Pending channels</td>
                                    <td>{this.state.getInfo.num_pending_channels}</td>
                                </tr>
                                <tr>
                                    <td>Peers</td>
                                    <td>{this.state.getInfo.num_peers}</td>
                                </tr>
                                <tr>
                                    <td>Block height</td>
                                    <td>{this.state.getInfo.block_height}</td>
                                </tr>
                                <tr>
                                    <td>Latest block hash</td>
                                    <td>{this.state.getInfo.block_hash}</td>
                                </tr>
                                <tr>
                                    <td>Synched to chain</td>
                                    <td>{this.state.getInfo.synced_to_chain ? "Yes" : "No"}</td>
                                </tr>
                                <tr>
                                    <td>Testnet</td>
                                    <td>{this.state.getInfo.testnet ? "Yes" : "No"}</td>
                                </tr>
                                <tr>
                                    <td>LND version</td>
                                    <td>{this.state.getInfo.version}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-section">
                    <div>
                        <h6 className="font-weight-light">Network Info</h6>
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td>Nodes</td>
                                    <td>{numberWithCommas(this.state.getNetworkInfo.num_nodes)}</td>
                                </tr>
                                <tr>
                                    <td>Channels</td>
                                    <td>{numberWithCommas(this.state.getNetworkInfo.num_channels)}</td>
                                </tr>
                                <tr>
                                    <td>Total Network Capacity</td>
                                    <td>{numberWithCommas(this.state.getNetworkInfo.total_network_capacity) + ' sat (' + this.state.getNetworkInfo.total_network_capacity / 100000000 + ' BTC)'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>


        );
    }
}

export default Home;