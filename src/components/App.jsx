import React, { Component } from 'react';
import { allInbox, users } from '../firebase';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as firebase from 'firebase';

import Header from './Header';
import Users from './Users';
import Messages from './Messages';
import Inbox from './Inbox';
import { selectedUser } from '../actions/index';
import Profile from './Profile';
import '../css/App.css';

class App extends Component {

  constructor (props) {
    super(props);
    this.state = {
      inbox: undefined,
      user: {},
      dirtyState: false,
    }
  }
  componentWillReceiveProps (nextProps, nextState) {
    if (nextProps.user.uniqueKey) {
      allInbox.child(nextProps.user.uniqueKey).child('inbox').on('value', snap => {
        let inbox = [];
        snap.forEach(item => {
          const messages = item.val().messages;
          const selectedUser = item.val().selectedUser;
          const time = item.val().time;
          inbox.push({
            messages,
            selectedUser,
            time,
          });
        });
        inbox.sort(function(a,b) {
            return b.time - a.time;
        });
        this.setState({ inbox: inbox.length > 0 ? inbox : [] });
        if (nextProps.selectedUserObj.userName ===  null ) {
          if (inbox.length > 0 && !this.state.dirtyState) {
            this.props.selectedUser(inbox[0].selectedUser);
          } else {
            this.props.selectedUser(this.props.user);
          }
        }
      });
    }
  }

  updateTime = (key) => {
    users.child(key).child('time').set(firebase.database.ServerValue.TIMESTAMP);
  }
  dirtyStateTrue = () => {
    this.setState({dirtyState:  true});
  }
  showMyProfile = () => {
  this.props.selectedUser(this.props.user);
  }
  componentDidMount () {
    this.setState({ })
  }
  render() {
    return (
      <div className="App">
        <div className="App-body">
          <div className='row'>
            <div
              className='col col-sm-3 nopadd'
            >
              <Inbox
                inbox={this.state.inbox}
              />
            </div>
            <div
              className='col col-sm-6 border-lr'
            >
              <Messages
              />
            </div>
            <div
              className='col col-sm-3 nopadd'
            >
              <Header
                updateTime={this.updateTime}
                showMyProfile={this.showMyProfile}
              />
              <Profile
                user={this.props.user}
                dirtyStateTrue={this.dirtyStateTrue}
              />
              <Users
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  const { user, users, selectedUser } = state;
  const selectedUserObj = selectedUser;
  return { user, users, selectedUserObj };
}
function mapDispatchToProps (dispatch) {
  return bindActionCreators({selectedUser},dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
