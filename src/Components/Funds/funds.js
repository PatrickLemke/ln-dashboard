import React from 'react';
import axios from 'axios';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { numberWithCommas } from '../../Server/utils';

class Funds extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            inChannels: {
                balance: null,
                pendingOpenBalance: null,
            },
            onChain: {
                totalBalance: null,
                confirmedBalance: null,
                unconfirmedBalance: null,
            },
            combinedBalance: null,
        }
    }

    componentDidMount() {
        axios.get('/funds')
        .then(results => {
            const metrics = results.data;

            const combinedBalance = parseFloat(metrics.off_chain.balance) + parseFloat(metrics.on_chain.total_balance);
            const channel_balance_pct = Math.round(parseFloat(metrics.off_chain.balance) / combinedBalance * 100);
            const onchain_balance_pct = Math.round(parseFloat(metrics.on_chain.total_balance) / combinedBalance * 100);

            this.setState({
                inChannels: {
                    balance: metrics.off_chain.balance,
                    channel_balance_pct: channel_balance_pct, 
                    pendingOpenBalance: metrics.off_chain.pending_open_balance,
                },
                onChain: {
                    totalBalance: metrics.on_chain.total_balance,
                    onchain_balance_pct: onchain_balance_pct,
                    confirmedBalance: metrics.on_chain.confirmed_balance,
                    unconfirmedBalance: metrics.on_chain.unconfirmed_balance,
                },

            });

            console.log(this.state);
        });
    }

    render() {
        return(
            <div>
                <h6>Funds</h6>
                <ListGroup>
                    <ListGroupItem>
                        <h6>In Channels</h6>
                        <div>Balance: {numberWithCommas(this.state.inChannels.balance)} sat ({this.state.inChannels.channel_balance_pct}%)</div>
                        <div>Pending Open Balance: {numberWithCommas(this.state.inChannels.pendingOpenBalance)} sat</div>
                    </ListGroupItem>
                    <ListGroupItem>
                        <h6>On Chain</h6>
                        <div>Total Balance: {numberWithCommas(this.state.onChain.totalBalance)} sat ({this.state.onChain.onchain_balance_pct}%)</div>
                        <div>Confirmed Balance: {numberWithCommas(this.state.onChain.confirmedBalance)} sat</div>
                        <div>Unconfirmed Balance: {numberWithCommas(this.state.onChain.unconfirmedBalance)} sat</div>
                    </ListGroupItem>
                </ListGroup>
            </div>
        );
    }
}

export default Funds;