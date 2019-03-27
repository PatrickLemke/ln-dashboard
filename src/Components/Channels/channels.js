import React from 'react';
import Channel from '../Channel/channel';
import { ListGroup } from 'reactstrap';
import axios from 'axios';

class Channels extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            channels: []  
        }
    }

    componentDidMount() {
        axios.get('/channels')
        .then(result => {
            this.setState({
                channels: result.data.channels.channels
            });
        })
        .catch(() => {
            alert('Could not fetch channels');
        });
    }

    render() {
        return(
            <div>
                <h6>Channels</h6>
                <ListGroup>
                    {this.state.channels.map((channel, i) => (
                        <Channel attributes={channel} key={i} />
                    ))}
                </ListGroup>
            </div>
        );
    }
}

export default Channels;
