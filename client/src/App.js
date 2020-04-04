import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import ChatRoom from './pages/ChatRoom/ChatRoom';
import Authentication from './pages/Authentication/Authentication';
import Rooms from './pages/Rooms/Rooms';
import './App.css';

class App extends Component {

  render() {
    return (
      <Router>
      <div className="App">
        <Switch>
          <Route path="/chatRoom" component={props => <ChatRoom {...props} />} />
          <Route path="/rooms" component={props => <Rooms {...props} />} />
          <Route path="/authentication" component={props => <Authentication {...props} />} />
          <Route exact path="/">
            <Redirect to="/authentication" />
          </Route>
        </Switch>
      </div>
      </Router>
    );
  }
}

export default App;
