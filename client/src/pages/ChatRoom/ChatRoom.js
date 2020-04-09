import React, { Component } from 'react';
import Parser from 'html-react-parser';
import openSocket from 'socket.io-client';
import capitalize from '../../helpers/capitalize';

import './ChatRoom.css';

class ChatRoom extends Component {

    constructor(props) {
        super(props);
        this.messagesBox = React.createRef();
        this.textArea = React.createRef();
    }

    state = {
        sendMessage: '',
        users: [],
        room: '',
        messages: [],
        endpoint: 'http://127.0.0.1:9000',
        socket: null,
        textareaLimit: 100,
        peopleTyping: []
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
                    
                    if(this.props.location.state === undefined) {
                        history.push('/rooms');
                        return;
                    }

                    let room = this.props.location.state.roomName;

                    // Join chat room
                    socket.emit('joinRoom', { username, room });  

                    // Get room and users
                    socket.on('getRoomUsers', ({ users }) => {
                        this.setState({username, room, users, socket});
                    });

                    // Message from server
                    socket.on('message', message => {
                        const { messages, peopleTyping } = this.state;
                        const { current: messagesContainer } = this.messagesBox;
                        const updatedMessages = [...messages];
                        updatedMessages.push(message);

                        const updatedPeopleTyping = [...peopleTyping].filter(user => user !== message.username);

                        this.setState({ messages: updatedMessages, peopleTyping: updatedPeopleTyping });
                        // Scroll down -- replace this with smooth scroll
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    });

                    // Typing from server
                    socket.on('printIsTyping', usernameTyping => {
                        this.handleOnTyping(usernameTyping);
                    });
                } else {
                    history.push('/authentication');
                    return;
                }
            })
        }
    }

    handleChange = e => {
        const textarea = e.target;
        const { value: newValue } = textarea
        const { textareaLimit, username, socket } = this.state;

        socket.emit('isTyping', username);

        textarea.style.height = ''; 
        textarea.style.height = Math.min(textarea.scrollHeight, textareaLimit) + 'px';
        this.setState({sendMessage: newValue});
    }

    handleOnTyping = usernameTyping => {
        const newPeopleTyping = [...this.state.peopleTyping];
        if(newPeopleTyping.findIndex(user => user === usernameTyping) === -1) {
            newPeopleTyping.push(usernameTyping);
            const index = newPeopleTyping[newPeopleTyping.length - 1];
            setTimeout(() => {
                const newStatePeopleTyping = [...this.state.peopleTyping];
                if(newStatePeopleTyping.findIndex(user => user === usernameTyping) !== -1) {
                    newStatePeopleTyping.splice(index, 1);
                    this.setState({peopleTyping: newStatePeopleTyping});
                }
            }, 3000);
        }
        this.setState({peopleTyping: newPeopleTyping});
    }

    onEnterPress = e => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            this.handleSubmit(e.target.parentElement.parentElement, true);
        }
    }

    handleSubmit = (e, fromEnter) => {
        if(fromEnter !== true) e.preventDefault();
        const { sendMessage, socket } = this.state;
        // Emit message to server
        socket.emit('chatMessage', capitalize(sendMessage));
        this.setState({sendMessage: ''});
        if(fromEnter !== true) e.target.firstChild.firstChild.focus();
        this.textArea.current.style.height = ''; 
    }

    componentWillUnmount(){
        const { socket } = this.state;
        if(socket) socket.disconnect();
        // this.setState({ socket: null });
        console.log('disconnected from ' + this.state.room);
    }

    handleLeaveChat = () => {
        const { history } = this.props;
        history.push('/rooms');
    }

    render () {
        const { sendMessage, room, users, messages, username, peopleTyping } = this.state;
        let showPeopleAreTyping = null;
        let sortedPeopleTyping = [...new Set(peopleTyping)];
        if(sortedPeopleTyping.length > 0) {
            if(sortedPeopleTyping.length <= 3) {
                showPeopleAreTyping = (
                <div>
                    {
                        sortedPeopleTyping.map((username, index) => {
                            let comma = null;
                            if(sortedPeopleTyping[sortedPeopleTyping.length - 1] !== username && sortedPeopleTyping.length > 1) comma = ', ';
                            return <span key={index}>{username}{comma}</span>
                        })
                    }
                    <span>{sortedPeopleTyping.length > 1 ? ' are typing...' : ' is typing...' }</span>
                </div>
                );
            } else showPeopleAreTyping = <div><span>Several people are typing...</span></div>;
        }
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
                        <ul id="users"> { users.map((user, index) => <li key={user + index}>{user}</li>) } </ul>
                    </div>
                    {/* Messages will go in here */}
                    <div className="chat-messages-container">
                        <div className="chat-messages" ref={this.messagesBox}> 
                            {   messages.map((message, index) => {
                                let messageClass = 'message', botIcon = '', hideMyMessage = '', bypassMessage = '', position= 'left', sameExpeditor = '';
                                // Adding BOT icon for the BOT
                                if(message.fromBot) {
                                    botIcon = ' <i class="fas fa-robot"></i>';
                                    messageClass += ' fromBot';
                                } else {
                                    if(message.username === username) {
                                        position = 'right';
                                        hideMyMessage = ' hide';
                                        bypassMessage = ' bypass';
                                    } 
                                    if(messages[index - 1].username === message.username) {
                                        sameExpeditor = ' close-up';
                                    }
                                } 
                                return (<div key={message.id + index} className={position}>
                                            <div className={messageClass + bypassMessage + sameExpeditor}>
                                                <p className={"meta" + hideMyMessage}>{ username === message.username || sameExpeditor.length > 0 ? '' : message.username} {Parser(botIcon)} <span>{message.time}</span></p>
                                                <p className={"text" + bypassMessage} >{message.text}</p>
                                            </div>
                                        </div>);
                            })} 
                        </div>
                        {/* <div className="chat-is-typing">AndraR is typing...</div> */}
                        <div className="chat-is-typing">{ showPeopleAreTyping }</div>
                    </div>
                </main>
                <div className="chat-form-container">
                    <form id="chat-form" onSubmit={this.handleSubmit}>
                        <div className="chat-form-control">
                            <textarea
                                id="msg"
                                type="text"
                                ref={this.textArea}
                                placeholder="Enter Message"
                                required
                                value={sendMessage}
                                onChange={this.handleChange}
                                onKeyDown={this.onEnterPress}
                                autoComplete="off"
                            ></textarea>
                        </div>
                        <button type="submit" className="btn"><i className="fas fa-paper-plane"></i> Send</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default ChatRoom;