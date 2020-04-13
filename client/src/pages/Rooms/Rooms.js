import React, { Component } from 'react';
import auth from '../../helpers/auth';
import { createRoom, isRoomNameAvailable, getMoreRooms } from '../../helpers/rooms';
import { validateInputValue } from '../../helpers/validation';
import { DebounceInput } from 'react-debounce-input';
import classes from './Rooms.module.css';
import RoomListElement from '../../components/RoomListElement/RoomListElement';
import CreateNewRoom from '../../components/CreateNewRoom/CreateNewRoom';

class Rooms extends Component {

    constructor(props) {
        super(props);
        this.eventSource = null;
    }

    state = {
        rooms: null,
        searchedRooms: null,
        username: null,
        searchValue: '',
        newRoomName: { val: '', valid: false },
        loadedItems: null,
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

                this.eventSource = new EventSource(`${this.state.endpoint}/rooms/sse`);

                this.eventSource.addEventListener('message', e => {
                    if(e.data !== '0') {
                        try {
                            // const rooms = JSON.parse(e.data.split('||')[0]);
                            const { touchedRoom } = JSON.parse(e.data.split('||')[1]);
                            if(!!touchedRoom) {
                                const { isNew } = JSON.parse(e.data.split('||')[2]);
                                const { rooms: currentRooms } = this.state;
                                const newRooms = [...currentRooms];
                                if(isNew) {
                                    delete touchedRoom.isNew;
                                    const foundRoomIndex = newRooms.findIndex(room => room.name === touchedRoom.name);
                                    if(foundRoomIndex === -1) newRooms.push(touchedRoom);
                                } else {
                                    const foundRoomIndex = rooms.findIndex(room => room.name === touchedRoom.name);
                                    if(foundRoomIndex !== -1) newRooms[foundRoomIndex] = touchedRoom;
                                }
                                this.setState({ rooms: newRooms });
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
            this.setState({newRoomName: { val: '', isValid: false }});
        }
    }

    componentWillUnmount() {
        if(this.eventSource) this.eventSource.close();
    }

    handleJoinRoom = roomName => {
        this.eventSource.close();
        const { history } = this.props;
        history.push('/chatRoom', { roomName });
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
        // const { rooms } = this.state;
        // const { value: inputValue } = el;
        // if(inputValue.length < 2) this.setState({searchedRooms: null});
        // let searchedRooms = [...rooms];
        // searchedRooms = rooms.filter(room => room.name.toLowerCase().includes(inputValue.toLowerCase()));
        // this.setState({ searchedRooms, searchValue: inputValue  });
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
            const newRooms = [...rooms].concat(res.rooms);
            this.setState({rooms: newRooms, loadedItems: loadedItems + res.rooms.length});
        }
    }

    render () {
        let { rooms, newRoomName, searchValue, searchedRooms } = this.state;
        if(rooms === null) return <div>SPINNNNER</div>;
        if(searchedRooms !== null) rooms = searchedRooms;
        return (
            <div className={classes.Rooms}>
                <button onClick={this.handleLogout}>Logout</button>
                <div className={classes['rooms-title']}>Rooms</div>
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
                <div className={classes['rooms-list']}>
                    { rooms.length === 0 ? <div>No rooms matching your search!</div> : undefined } 
                    { rooms.map(room => <RoomListElement key={room._id} room={room} joinRoom={() => this.handleJoinRoom(room.name)} />) }
                </div>
                <button className="" onClick={this.showMoreRooms}>Show more</button>
                <CreateNewRoom newRoomName={newRoomName} input={this.handleInputChange} createRoom={this.handleCreateRoom} />
            </div>
        );
    }
}

export default Rooms;