import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.scss';
import Home from '../Home/home';
import Channels from '../Channels/channels';
import Funds from '../Funds/funds';
import FAQ from '../Faq/faq';

import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';

class App extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Navbar expand="lg" className="navbar-dark bg-primary">
          <Container>
            <NavbarBrand href="/">Lightning Network Dashboard</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="mr-auto" navbar>
                <NavItem>
                  <NavLink tag={Link} to="/">Home</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/channels">Channels</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/funds">Funds</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/faq">FAQ</NavLink>
                </NavItem>
              </Nav>
              </Collapse>
              </Container>
          </Navbar>
        
          <section>
            <Container>
              <Route path="/" exact component={Home} />
              <Route path="/channels" exact component={Channels} />
              <Route path="/funds" exact component={Funds} />
              <Route path="/faq" exact component={FAQ} />
            </Container>
          </section>
        </div>
    </Router>
    );
  }
}

export default App;
