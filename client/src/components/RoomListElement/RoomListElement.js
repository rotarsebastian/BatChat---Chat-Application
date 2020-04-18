import React, { Component } from 'react';
import classes from './RoomListElement.module.css';

class RoomListElement extends Component {
    render() {
        const { username, room, joinRoom, deleteRoom } = this.props;
        return (
            <div className={classes['room-element']} key={room._id} id={room._id} onClick={joinRoom}>
                <div className={classes['room-name']}>{room.name}</div>
                <div className={classes['room-active-users']}>{room.users.length}<i className="fas fa-users"></i></div>
                { room.createdBy === username ? <i onClick={deleteRoom} className={classes['rooms-join-room'] + " fas fa-trash"}></i> : undefined }
            </div>
        )
    }
}

export default RoomListElement;