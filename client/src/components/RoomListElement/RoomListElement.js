import React, { Component } from 'react';
import classes from './RoomListElement.module.css';

class RoomListElement extends Component {
    render() {
        const { room, joinRoom } = this.props;
        return (
            <div className={classes['room-element']} key={room._id} id={room._id} >
                <div className={classes['room-name']}>{room.name}</div>
                <div className={classes['room-active-users']}>{room.users.length} Members</div>
                <button onClick={joinRoom} className={classes['rooms-join-room']}>Join Room</button>
            </div>
        )
    }
}

export default RoomListElement;