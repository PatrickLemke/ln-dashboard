import React from 'react';
import { ListGroupItem, Progress } from 'reactstrap';
import { numberWithCommas } from '../../Server/utils';
import { Icon } from 'antd';
import ReactCSSTransitiongroup from 'react-addons-css-transition-group';
import moment from 'moment';
import './channel.scss';

class Channel extends React.Component {

    constructor(props) {
        super(props);

        this.displayAdditionalAttributes = this.displayAdditionalAttributes.bind(this);

        const totalBalance = parseFloat(this.props.attributes.local_balance) + parseFloat(this.props.attributes.remote_balance);
        const localBalancePct = parseFloat(this.props.attributes.local_balance) / totalBalance * 100;

        let progressBarColor;
        
        if(localBalancePct <= 5.0 || localBalancePct >= 95.0) {
            progressBarColor = 'danger';
        }

        this.state = {
            localBalancePct: localBalancePct,
            progressBarColor: progressBarColor,
            caretRight: true,
        }

    }

    displayAdditionalAttributes() {
        this.setState({
            caretRight: !this.state.caretRight,
        });
    }

    render() {
        return(
            <ListGroupItem className={this.props.attributes.active ? 'text-muted' : ''}>
                <div>
                    Alias: {this.props.attributes.alias}
                    {this.props.attributes.active ? <div className="badge badge-dark ml-2">Inactive</div> : ''}
                    <div className="badge badge-dark ml-2">{this.props.attributes.num_updates} Channel Updates</div>
                </div> 
                <div id="pubkey">Pubkey: {this.props.attributes.remote_pubkey}</div>
                <div>Local Balance: {numberWithCommas(this.props.attributes.local_balance)}</div>
                <div>Remote Balance: {numberWithCommas(this.props.attributes.remote_balance)}</div>
                <Progress  color={this.state.progressBarColor} value={this.state.localBalancePct} />
                <Icon type={this.state.caretRight ? 'caret-right' : 'caret-down'} onClick={this.displayAdditionalAttributes} />
                <ReactCSSTransitiongroup
                    transitionName="additionalAttributes"
                    transitionEnterTimeout={50}
                    transitionLeaveTimeout={50}>

                    {this.state.caretRight ? '' :
                    <div>
                        <div className="font-italic mt-1">Last Update (UTC)</div>
                        <div>{moment(this.props.attributes.last_update * 1000).format('MMMM Do YYYY, h:mm:ss a')}</div>
                        <div className="font-italic mt-1">Payments</div>
                        <div>Satoshis sent: {numberWithCommas(this.props.attributes.total_satoshis_sent)}</div>
                        <div>Satoshis received: {numberWithCommas(this.props.attributes.total_satoshis_received)}</div>
                        <div className="font-italic mt-1">Fees</div>
                        <div>Commit Fee: {numberWithCommas(this.props.attributes.commit_fee)} sat</div>
                        <div>Commit Weight: {numberWithCommas(this.props.attributes.commit_weight)} sat</div>
                        <div>Fee per kw: {numberWithCommas(this.props.attributes.fee_per_kw)} sat</div>
                        <div>CSV delay: {numberWithCommas(this.props.attributes.csv_delay)} blocks ({Math.round(this.props.attributes.csv_delay * 10 / 60 / 24)} days)</div>
                    </div>
                    }
                </ReactCSSTransitiongroup>

            </ListGroupItem>
        );
    }
}

export default Channel;