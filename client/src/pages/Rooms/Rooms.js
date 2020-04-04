import React, { Component } from 'react';
import auth from '../../helpers/auth';
import { createRoom, isRoomNameAvailable } from '../../helpers/rooms';
import { validateInputValue } from '../../helpers/validation';
import { DebounceInput } from 'react-debounce-input';
import './Rooms.css';

class Rooms extends Component {

    constructor(props) {
        super(props);
        this.eventSource = null;
    }

    state = {
        rooms: [],
        username: null,
        searchValue: '',
        newRoomName: { val: '', valid: false },
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
                        let searchedRooms = rooms;
                        if(this.state.searchValue.length > 1) {
                            searchedRooms = rooms.filter(room => room.name.toLowerCase().includes(this.state.searchValue.toLowerCase()));
                        }
                        this.setState({ rooms: searchedRooms });
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

    handleCreateRoom = async(e) => {
        e.persist();
        const { newRoomName, username } = this.state;
        if(newRoomName.isValid && username.length > 0) {
            const res = await createRoom(newRoomName.val, username);
            if(res.status === 0) return console.log(res);
            e.target.previousSibling.classList.remove('show');
            this.setState({newRoomName: { val: '', isValid: false }});
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

    handleInputChange = async(e) => {
        const { value: newRoomName } = e.target;
        const isValid = await this.validateNewRoomInput(newRoomName, e);
        if(isValid) this.setState({ newRoomName: { val: newRoomName, isValid } });
            else this.setState({ newRoomName: { val: newRoomName, isValid } });
    }

    validateNewRoomInput = async(newRoomName, e) => {
        const validClass = e.target.nextSibling.classList;
        const errorClass = e.target.previousSibling.classList;
        if(newRoomName.length >= 3) {
            const isValid = validateInputValue('newRoom', newRoomName);
            if(isValid) {
                const res = await isRoomNameAvailable(newRoomName);
                if(res.isAvailable === 1) {
                    validClass.add('show');
                    errorClass.remove('show');
                    return true;
                } else {
                    errorClass.add('show');
                    validClass.remove('show');
                    return false;
                }
            }
        } else {
            validClass.remove('show');
            errorClass.remove('show');
            return false;
        }
    }

    handleSearch = el => {
        const { value: inputValue } = el;
        this.setState({ searchValue: inputValue });
    }

    handleLogout = () => {
        this.eventSource.close();
        const { history } = this.props;
        history.push('/authentication');
    }

    render () {
        const { rooms, newRoomName, searchValue } = this.state;
        if(rooms === null) return null;
        return (
            <div className="Rooms">
                <div className="rooms-title">Rooms</div>
                <div className="rooms-search-bar">
                    <div className="rooms-search-icon"><i className="fas fa-search"></i></div>
                    <DebounceInput
                        className="rooms-search-bar-input"
                        placeholder="Search for a room" 
                        minLength={1}
                        value={searchValue}
                        debounceTimeout={400}
                        onChange={({ target }) => this.handleSearch(target)} />
                </div>
                <div className="rooms-list">
                    { rooms.length === 0 ? <div>No rooms matching your search!</div> : undefined }
                    {
                        rooms.map(room => {
                            return (
                                <div className="room-element" key={room.id} id={room.id} >
                                    <div className="room-name">{room.name}</div>
                                    <div className="room-active-users">{room.users.length} Members</div>
                                    <button onClick={this.handleJoinRoom} className="rooms-join-room" >Join Room</button>
                                </div>
                            );
                        })
                    }
                </div>
                <div className="rooms-add-room-container">
                    <div className="rooms-room-already-taken">This room name is already taken!</div>
                    <input  id="rooms-new-room-input" type="text" value={newRoomName.val} 
                        onChange={this.handleInputChange} 
                        placeholder="Your room name"
                        maxLength="20"
                        minLength="3"
                    />
                    <span className="rooms-new-room-verification" ><i className="fas fa-check"></i></span>
                    <button onClick={this.handleCreateRoom} className="rooms-create-new-room" >Add new room</button>
                </div>
                <button onClick={this.handleLogout} >Logout</button>
            </div>
        );
    }
}

export default Rooms;