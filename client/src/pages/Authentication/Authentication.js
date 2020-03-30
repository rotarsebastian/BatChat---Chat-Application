import React, { Component } from 'react';
import login from '../../helpers/login';
import register from '../../helpers/register';
import './Authentication.css';
import { validateForm } from '../../helpers/validation';

class Authentication extends Component {

    state = {
        username: { type: 'username', val: '' },
        room: 'JavaScript',
        password: { type: 'password', val: '' },
        rePassword: { type: 'password', val: '' },
        email: { type: 'email', val: '' },
        isRegisterPage: false
    }

    componentDidMount() {
        localStorage.clear();
    }

    switchPageHandler = () => {
        const { isRegisterPage } = this.state;
        isRegisterPage ? this.setState({isRegisterPage: false}) : this.setState({isRegisterPage: true});
    }

    handleChange = e => {
        const { name: type, value: newValue } = e.target;
        if(type === 'username') {
            this.setState({username: { type: type, val: newValue }});
        } else if (type === 'password') {
            this.setState({password: { type: type, val: newValue }});
        } else if (type === 'rePassword') {
            this.setState({rePassword: { type: 'password', val: newValue }});
        } else if (type === 'email') {
            this.setState({email: { type: type, val: newValue }});
        }
        else {
            this.setState({room: newValue});
        }
    }

    handleSubmit = async(e) => {
        e.persist();
        e.preventDefault();
        const { username, password, isRegisterPage, email, rePassword, room } = this.state;
        if(isRegisterPage) {
            if(password.val !== rePassword.val) return console.log('Pass dont match'); // Show error
            const isFormValid = validateForm([username, password, email]);
            if(isFormValid) {
                const regSuccess = await register(username, password, email);
                if(regSuccess) {
                    this.setState({ isRegisterPage: false });
                } // else {} // SHOW ERRORS
            }
        } else {
            const isFormValid = validateForm([username, password]);
            if(isFormValid) {
                const token = await login(username, password);
                if(token) {
                    localStorage.setItem('userToken', token);
                }
            }
        }
        const { history } = this.props;
        history.push('/chatRoom', { username: username.val, room });
    }

    checkInput = (e) => {
        const re = /[a-z]/i;
        if (!re.test(e.key)) {
          e.preventDefault();
        }
    }

    render () {
        const { room, username, password, rePassword, isRegisterPage, email } = this.state;
        let showRooms = null;
        if(!isRegisterPage) {
            showRooms =                         
                <div className="form-control">
                    <label htmlFor="room">Room</label>
                    <select name="room" id="room" value={room} onChange={this.handleChange}>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="PHP">PHP</option>
                        <option value="C#">C#</option>
                        <option value="Ruby">Ruby</option>
                        <option value="Java">Java</option>
                    </select>
                </div>;
        }
        return (
            <div className="auth-container">
                <header className="auth-header">
                    <h1><i className="fas fa-comments"></i> BatChat</h1>
                </header>
                <main className="auth-main">
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-control">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={username.val}
                                onChange={this.handleChange}
                                onKeyPress={this.checkInput}
                                maxLength="20"
                                placeholder="Enter username..."
                                required
                            />
                            { isRegisterPage ? <label htmlFor="email">Email</label> : null }
                            {   isRegisterPage ? 
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    value={email.val}
                                    onChange={this.handleChange}
                                    placeholder="Enter email..."
                                    required
                                /> : null
                            }
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={password.val}
                                onChange={this.handleChange}
                                placeholder="Enter password..."
                                required
                            />
                            { isRegisterPage ? <label htmlFor="rePassword"> Confirm Password</label>: null }
                            {   isRegisterPage ? 
                                <input
                                    type="password"
                                    name="rePassword"
                                    id="rePassword"
                                    value={rePassword.val}
                                    onChange={this.handleChange}
                                    placeholder="Enter password..."
                                    required
                                /> : null
                            }
                        </div>
                        { showRooms }
                        <button type="submit" className="btn">{isRegisterPage ? 'Register' : 'Join Chat'}</button>
                    </form>
                    { isRegisterPage 
                        ? 
                        <div className="auth-switch-page">Already have an account? <span onClick={this.switchPageHandler}>Log in here</span></div>
                        :
                        <div className="auth-switch-page">Don't have an account yet? <span onClick={this.switchPageHandler}>Sign up here</span></div> 
                    }
                </main>
		    </div>
        );
    }
}

export default Authentication;