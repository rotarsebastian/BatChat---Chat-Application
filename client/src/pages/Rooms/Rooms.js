import React, { Component } from 'react';
import auth from '../../helpers/auth';
import { createRoom, isRoomNameAvailable, getMoreRooms, deleteRoom } from '../../helpers/rooms';
import { validateInputValue } from '../../helpers/validation';
import { DebounceInput } from 'react-debounce-input';
import classes from './Rooms.module.css';
import RoomListElement from '../../components/RoomListElement/RoomListElement';
import CreateNewRoom from '../../components/CreateNewRoom/CreateNewRoom';

class Rooms extends Component {

    constructor(props) {
        super(props);
        this.eventSource = null;
        this.roomsContainer = React.createRef();
    }

    state = {
        rooms: null,
        searchedRooms: null,
        username: null,
        searchValue: '',
        newRoomName: { val: '', valid: false },
        loadedItems: null,
        showCreateRoom: false,
        animateHideCreateRoom: false,
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
                this.setState({ rooms, username, loadedItems: rooms.length });

                this.roomsContainer.current.addEventListener('scroll', () => this.lazyLoadRooms(this.roomsContainer.current));

                this.eventSource = new EventSource(`${this.state.endpoint}/rooms/sse`);

                this.eventSource.addEventListener('message', e => {
                    if(e.data !== '0') {
                        try {
                            // const rooms = JSON.parse(e.data.split('||')[0]);
                            const { touchedRoom } = JSON.parse(e.data.split('||')[1]);
                            if(!!touchedRoom) {
                                const { isNew } = JSON.parse(e.data.split('||')[2]);
                                const { isDeleted } = JSON.parse(e.data.split('||')[3]);
                                const { rooms: currentRooms, loadedItems } = this.state;
                                const newRooms = [...currentRooms];
                                if(isNew) {
                                    delete touchedRoom.isNew;
                                    const foundRoomIndex = newRooms.findIndex(room => room.name === touchedRoom.name);
                                    if(foundRoomIndex === -1) {
                                        newRooms.unshift(touchedRoom);
                                        this.setState({ rooms: newRooms, loadedItems: loadedItems + 1 });
                                    }
                                } else if(isDeleted) {
                                    delete touchedRoom.isDeleted;
                                    const foundRoomIndex = newRooms.findIndex(room => room.name === touchedRoom.name);
                                    if(foundRoomIndex !== -1) {
                                        newRooms.splice(foundRoomIndex, 1);
                                        this.setState({ rooms: newRooms, loadedItems: loadedItems - 1 });
                                    }
                                } else {
                                    const foundRoomIndex = rooms.findIndex(room => room.name === touchedRoom.name);
                                    if(foundRoomIndex !== -1) {
                                        newRooms[foundRoomIndex] = touchedRoom;
                                        this.setState({ rooms: newRooms });
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }, false);

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
            e.target.previousSibling.classList.remove(classes.show);
            this.handleShowCreateRoom();
            this.setState({newRoomName: { val: '', isValid: false }});
        }
    }

    componentWillUnmount() {
        if(this.eventSource) this.eventSource.close();
    }

    lazyLoadRooms = el => {
        if(el.scrollHeight - el.scrollTop === el.clientHeight) this.showMoreRooms();
    }

    handleJoinRoom = roomName => {
        this.eventSource.close();
        const { history } = this.props;
        history.push('/chatRoom', { roomName });
    }

    handleDeleteRoom = async(e, room) => {
        e.stopPropagation();
        const { username } = this.state;
        const token = localStorage.getItem('userToken');
        if(username === room.createdBy) {
            const res = await deleteRoom(room, token);
            if(res.status === 0) return console.log(res);
        }
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
                    validClass.add(classes.show);
                    errorClass.remove(classes.show);
                    return true;
                } else {
                    errorClass.add(classes.show);
                    validClass.remove(classes.show);
                    return false;
                }
            }
        } else {
            validClass.remove(classes.show);
            errorClass.remove(classes.show);
            return false;
        }
    }

    handleSearch = el => {
        const { rooms } = this.state;
        const { value: inputValue } = el;
        if(inputValue.length < 2) this.setState({searchedRooms: null});
        let searchedRooms = [...rooms];
        searchedRooms = rooms.filter(room => room.name.toLowerCase().includes(inputValue.toLowerCase()));
        this.setState({ searchedRooms, searchValue: inputValue  });
    }

    handleLogout = () => {
        this.eventSource.close();
        const { history } = this.props;
        history.push('/authentication');
    }

    showMoreRooms = async() => {
        const { loadedItems, rooms } = this.state;
        const res = await getMoreRooms(loadedItems);
        if(res && res.status === 1) {
            if(res.rooms.length === 0 ) return console.log('No more rooms to load!');
                else console.log('Rooms loaded!');
            const newRooms = [...rooms].concat(res.rooms);
            this.setState({rooms: newRooms, loadedItems: loadedItems + res.rooms.length});
        }
    }

    handleShowCreateRoom = () => {
        const { showCreateRoom } = this.state;
        if(showCreateRoom) {
            this.setState({ animateHideCreateRoom: true });
            setTimeout(() => {
                this.setState({ showCreateRoom: !showCreateRoom});
            }, 500)
        } else { 
            this.setState({ animateHideCreateRoom: false });
            this.setState({ showCreateRoom: !showCreateRoom});
        }
    }

    render () {
        let { rooms, newRoomName, searchValue, searchedRooms, username, showCreateRoom, animateHideCreateRoom } = this.state;
        if(rooms === null) return <div>SPINNNNER</div>;
        if(searchedRooms !== null) rooms = searchedRooms;
        return (
            <div className={classes.Rooms}>
                <div className={classes['rooms-logout']}>
                    <i className="fas fa-sign-out-alt" onClick={this.handleLogout}></i>
                </div>
                <div className={classes['rooms-title']}>Active rooms</div>
                <div className={classes['rooms-search-bar']}>
                    <div className={classes['rooms-search-icon']}><i className="fas fa-search"></i></div>
                    <DebounceInput
                        className={classes['rooms-search-bar-input']}
                        placeholder="Search for a room" 
                        minLength={1}
                        value={searchValue}
                        debounceTimeout={400}
                        onChange={({ target }) => this.handleSearch(target)} />
                </div>
                <div className={classes['rooms-new-room']} onClick={this.handleShowCreateRoom} ><i className={showCreateRoom ? 'fas fa-chevron-up' : 'fas fa-plus-circle' }></i>{ showCreateRoom ? 'Hide menu' : 'Create a room' }</div>
                { showCreateRoom ? <CreateNewRoom animateHideCreateRoom={animateHideCreateRoom} newRoomName={newRoomName} input={this.handleInputChange} createRoom={this.handleCreateRoom} /> : undefined }
                <div className={classes['rooms-list']} ref={this.roomsContainer}>
                    { rooms.length === 0 ? <div className={classes['rooms-empty']}>No active rooms at the moment!</div> : undefined } 
                    { rooms.map(room => <RoomListElement deleteRoom={(e) => this.handleDeleteRoom(e, room)} username={username} key={room._id} room={room} joinRoom={() => this.handleJoinRoom(room.name)} />) }
                </div>
            </div>
        );
    }
}

export default Rooms;