import React, { Component } from 'react';
import auth from '../../helpers/auth';
import { createRoom } from '../../helpers/rooms';
import './Rooms.css';

class Rooms extends Component {

    constructor(props) {
        super(props);
        this.eventSource = null;
    }

    state = {
        rooms: null,
        username: null,
        newRoomName: '',
        endpoint: 'http://127.0.0.1:9000',
    }

    async componentDidMount() {
        const { history } = this.props;
        if(localStorage.getItem('userToken') === null) {
            history.push('/authentication');
            return;
        } else {
            const token = localStorage.getItem('userToken');
            const res = await auth(token, 'rooms');
            if(res.status === 1) {
                const { rooms, username } = res;
                this.setState({ rooms, username });

                this.eventSource = new EventSource(`${this.state.endpoint}/rooms/sse`);
                this.eventSource.addEventListener('message', e => {
                    try {
                        console.log(e.data);
                        const rooms = JSON.parse(e.data);
                        this.setState({ rooms });
                    } catch (error) {
                        console.log(error);
                    }
                });
            } else {
                history.push('/authentication');
                return;
            }
        }
    }

    handleCreateRoom = async() => {
        const { newRoomName, username } = this.state;
        // VALIDATE NEWROOM 
        if(newRoomName && username) {
            const res = await createRoom(newRoomName, username);
            console.log(res);
        }
    }

    componentWillUnmount() {
        if(this.eventSource) this.eventSource.close();
    }

    handleJoinRoom = () => {
        this.eventSource.close();
        const { history } = this.props;
        history.push('/chatRoom');
    }

    render () {
        const { rooms, newRoomName } = this.state;
        if(rooms === null) return null;
        return (
            <div className="Rooms">
                <div className="rooms-title">Rooms</div>
                <div className="rooms-list">
                    {
                        rooms.map((room, index) => {
                            return (
                                <div className="room-element" key={index} >
                                    <div className="room-name">{room.name}</div>
                                    <div className="room-active-users">{room.users.length}</div>
                                    <button onClick={this.handleJoinRoom} className="rooms-join-room" >Join Room</button>
                                </div>
                            );
                        })
                    }
                </div>
                <div className="rooms-add-room-container">
                    <input  id="rooms-new-room-input" type="text" value={newRoomName} onChange={(e) => this.setState({newRoomName: e.target.value})} 
                        placeholder="Enter new room name"
                    />
                    <button onClick={this.handleCreateRoom} className="rooms-create-new-room" >Add new room</button>
                </div>
            </div>
        );
    }
}

export default Rooms;