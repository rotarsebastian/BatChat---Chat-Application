import React, { Component } from 'react';
import classes from './CreateNewRoom.module.css';

class CreateNewRoom extends Component {
    render() {
        const { newRoomName, input, createRoom } = this.props;
        return (
            <div className={classes['rooms-add-room-container']}>
                <div className={classes['rooms-room-already-taken']}>This room name is already taken!</div>
                <input className={classes['rooms-new-room-input']} type="text" value={newRoomName.val} 
                    onChange={input} 
                    placeholder="Your room name"
                    maxLength="20"
                    minLength="3"
                />
                <span className={classes['rooms-new-room-verification']}><i className="fas fa-check"></i></span>
                <button onClick={createRoom} className={classes['rooms-create-new-room']}>Add new room</button>
            </div>
        )
    }
}

export default CreateNewRoom;