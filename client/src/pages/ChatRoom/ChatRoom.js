import React, { Component } from 'react';
import Parser from 'html-react-parser';
import openSocket from 'socket.io-client';
import capitalize from '../../helpers/capitalize';

import './ChatRoom.css';

class ChatRoom extends Component {

    constructor(props) {
        super(props);
        this.messagesBox = React.createRef();
    }

    state = {
        sendMessage: '',
        users: [],
        room: '',
        messages: [],
        endpoint: 'http://127.0.0.1:9000',
        socket: null
    }

    componentDidMount() {
        const { history } = this.props;
        if(localStorage.getItem('userToken') === null) {
            history.push('/authentication');
            return;
        } else {
            const { endpoint } = this.state;
            const socket = openSocket(endpoint);
            const token = localStorage.getItem('userToken');
            socket.emit('checkToken', { token } );
            socket.on('authorized', ({ status, username }) => {
                if(status === 1) {
                    let room = undefined;
                    // QUICKFIX (change this)
                    if(room === undefined) room = 'JavaScript'; // If no room set room to default JavaScript room
                       else room = this.props.location.state.room;
                    // Join chat room
                    socket.emit('joinRoom', { username, room });  
                    // Get room and users
                    socket.on('roomUsers', ({ room, users }) => {
                        this.setState({room, users, socket});
                    });
                    // Message from server
                    socket.on('message', message => {
                        const { messages } = this.state;
                        const { current: messagesContainer } = this.messagesBox;
                        const updatedMessages = [...messages];
                        updatedMessages.push(message);
                        this.setState({messages: updatedMessages});
                        // Scroll down -- replace this with smooth scroll
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    });
                } else {
                    history.push('/authentication');
                    return;
                }
            })
        }
    }

    handleChange = e => {
        const { value: newValue } = e.target;
        this.setState({sendMessage: newValue});
    }

    handleSubmit = e => {
        e.preventDefault();
        const { sendMessage, socket } = this.state;
        // Emit message to server
        socket.emit('chatMessage', capitalize(sendMessage));
        this.setState({sendMessage: ''});
        e.target.firstChild.focus();
    }

    handleLeaveChat = () => {
        const { history } = this.props;
        const { socket } = this.state;
        socket.disconnect();
        this.setState({socket: null});
        history.push('/authentication');
    }

    render () {
        const { sendMessage, room, users, messages } = this.state;
        return (
            <div className="chat-container">
                <header className="chat-header">
                    <h1><i className="fas fa-comments"></i> BatChat</h1>
                    <button onClick={this.handleLeaveChat} className="btn">Leave Room</button>
                </header>
                <main className="chat-main">
                    <div className="chat-sidebar">
                        <h3><i className="fas fa-comments"></i> Room: </h3>
                        {/* Here goes the room you are in */}
                        <h2 id="room-name">{room}</h2>
                        <h3><i className="fas fa-users"></i> Users<span className="online-status"> &#9673;</span></h3>
                        {/* Inside here go the current users in the room */}
                        <ul id="users"> { users.map(user => <li key={user.id + 'user'}>{user.username}</li>) } </ul>
                    </div>
                    {/* Messages will go in here */}
                    <div className="chat-messages" ref={this.messagesBox}> 
                        { messages.map((message, index) => {
                            let messageClass = 'message', botIcon = '';
                            // Adding BOT icon for the BOT
                            if(message.fromBot) {
                                botIcon = ' <i class="fas fa-robot"></i>';
                                messageClass += ' fromBot';
                            } 
                            return <div key={message.id + index} className={messageClass}>
                                        <p className="meta">{message.username} {Parser(botIcon)} <span>{message.time}</span></p>
                                        <p className="text">{message.text}</p>
                                    </div>
                        })} 
                    </div>
                </main>
                <div className="chat-form-container">
                    <form id="chat-form" onSubmit={this.handleSubmit}>
                        <input
                            id="msg"
                            type="text"
                            placeholder="Enter Message"
                            required
                            value={sendMessage}
                            onChange={this.handleChange}
                            autoComplete="off"
                        />
                        <button type="submit" className="btn"><i className="fas fa-paper-plane"></i> Send</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default ChatRoom;