import React from 'react';
import './faq.scss';

class Faq extends React.Component {

    render() {
        return(
            <div>
                <h5>FAQ</h5>
                <div>How do I maximise my routing fees?</div>
                <ul>
                    <li>Uptime is very important. Try to be online 100% of the time.</li>
                    <li>Increase the number of channels. More channels means higher probability of finding a valid route.</li>
                    <li>Make sure your channels are balanced. As a rough measure you should make sure that at least 20% of the channels balance are on one side of the channel. The reason for this is that other nodes can't see your channel balance, they can only see the total capacity. If routing through your node doesn't work, they will not try to pay someone through your node again.</li>
                    <li>Close Channels with inactive peers. If your peer is offline, no payment can be routed through them.</li>
                    <li>Only make channels with peers that are also good routing nodes themselves. This increases the probability that a payment can be routed first through you and then them or visa versa.</li>
                    <li>Manage your channel fees. Don't charge too much but at the same time if you channel is used a lot, you might be able to increase your fees.</li>
                    <li>Offer a product or service. If people are making a channel to connect with you directly, you can route more payments for them if they want to pay someone else.</li>
                </ul>
                <div>Where do I find good nodes to connect with?</div>
                <ul>
                    <li>You can look for nodes on explorers such as 1ml.com or explore.casa to find nodes with high liquidity.</li>
                </ul>
                <div>Should I use autopilot?</div>
                <ul>
                    <li>Autopilot is not recommended to use on mainnet right now, since it is not very sophisticated. You will be able to open better channels if you open them manually.</li>
                </ul>
                <div>If you want to learn more about channel management, watch this excellent presentation by Alex Bosworth, chief Infrastructure Engineer at Lightning Labs</div>
                <iframe title="Channel Management" width="100%" height="500px" src="https://www.youtube.com/embed/HlPIB6jt6ww" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
        );
    }
}

export default Faq;