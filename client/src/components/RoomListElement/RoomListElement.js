import React, { Component } from 'react';
import classes from './RoomListElement.module.css';
import ClipLoader from "react-spinners/ClipLoader";

class RoomListElement extends Component {

    state = {
        loadRoomAnimation: ' animated fadeInLeft',
        showSpinner: false
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({loadRoomAnimation: ''});
        }, 1100);
    }

    handlleDeleteItem = (e, room) => {
        this.setState({showSpinner: true});
        this.props.deleteRoom(e, room);
    }

    render() {
        const { showSpinner } = this.state;
        const { username, room, joinRoom, removingRoom } = this.props;
        const classAnimate = removingRoom && removingRoom === room.name ? ' animated fadeOutRight' : '';
        return (
            <div className={classes['room-element'] + classAnimate + this.state.loadRoomAnimation} key={room._id} id={room._id} onClick={joinRoom}>
                <div className={classes['room-name']}>{room.name}</div>
                <div className={classes['room-active-users']}>{room.users.length}<i className="fas fa-users"></i></div>
                { room.createdBy === username ? <button className={classes['rooms-join-room']} onClick={(e) => this.handlleDeleteItem(e, room)}><i className="fas fa-trash"></i></button> : undefined }
                { showSpinner ? <div className={classes['room-spinner']}><ClipLoader size={20} color={"#fff"} /></div> : undefined }
            </div>
        )
    }
}

export default RoomListElement;