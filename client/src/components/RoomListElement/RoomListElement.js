import React, { Component } from 'react';
import classes from './RoomListElement.module.css';

class RoomListElement extends Component {

    state = {
        loadRoomAnimation: ' animated fadeInLeft'
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({loadRoomAnimation: ''});
        }, 1000);
    }

    render() {
        const { username, room, joinRoom, deleteRoom, removingRoom } = this.props;
        const classAnimate = removingRoom && removingRoom === room.name ? ' animated fadeOutRight' : '';
        return (
            <div className={classes['room-element'] + classAnimate + this.state.loadRoomAnimation} key={room._id} id={room._id} onClick={joinRoom}>
                <div className={classes['room-name']}>{room.name}</div>
                <div className={classes['room-active-users']}>{room.users.length}<i className="fas fa-users"></i></div>
                { room.createdBy === username ? <button className={classes['rooms-join-room']} onClick={deleteRoom}><i className="fas fa-trash"></i></button> : undefined }
            </div>
        )
    }
}

export default RoomListElement;