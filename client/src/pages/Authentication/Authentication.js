import React, { Component } from 'react';
import login from '../../helpers/login';
import register from '../../helpers/register';
import './Authentication.css';
import { validateForm, validateInputValue } from '../../helpers/validation';

class Authentication extends Component {

    constructor(props) {
        super(props);
        this.formEl = React.createRef();
    }

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

    handleChange = e => {
        const { name: type, value: newValue } = e.target;
        this.validateInput(e, type, newValue);
        this.updateInputState(type, newValue);
    }

    handleSubmit = async(e) => {
        e.preventDefault();
        const { isRegisterPage, room } = this.state;
        let areThereErrors = false;
        
        if(isRegisterPage) areThereErrors = await this.handleRegistration(e);
          else areThereErrors = await this.handleLogin(e);

        if(!areThereErrors) {
            console.log('Good To Go!')
            // const { history } = this.props;
            // history.push('/chatRoom', { username: username.val, room });
        }
    }

    handleRegistration = async(e) => {
        const { username, password, email } = this.state;
        const isFormValid = validateForm([username, password, email], e.target);
        if(!this.isRepeatPasswordValid()) return true;
        if(isFormValid) {
            const res = await register(username, password, email);
            if(res.status === 1) {
                this.setState({ isRegisterPage: false });
                return false;
            } else {
                this.handleServerRes(res);
                // SHOW ERRORS
                return true;
            } 
        } else return true;
    }

    handleLogin = async(e) => {
        const { username, password } = this.state;
        const isFormValid = validateForm([username, password], e.target);
        if(isFormValid) {
            const res = await login(username, password);
            if(res.status === 1) {
                localStorage.setItem('userToken', res.token);
                return false;
            } else {
                this.handleServerRes(res);
                // SHOW ERRORS
                return true;
            } 
        } else return true;
    }

    handleServerRes = res => {
        // Handle errors toastr redux
        console.log(res);
        if(res.code === 12) {}
    }

    validateInput = (e, type, newValue) => {
        const { target: el } = e;
        let isValid = false;
        
        // Switch when becomes valid
        if(type !== 'rePassword') {
            isValid = validateInputValue(type, newValue);
            if(type === 'password' && this.state.isRegisterPage) this.byPassValidationForPasswords(isValid, newValue);
        } else isValid = (this.state.password.val === newValue && newValue !== '' && newValue.length > 5) ? true : false;

        // Add/Remove valid check mark on valid/invalid elements
        this.showValidationInput(el, isValid); 
    }

    updateInputState = (type, newValue) => {
        const newEl = { type, val: newValue };
        switch (type) {
            case 'username':
                return this.setState({username: newEl});
            case 'password':
                return this.setState({password: newEl});
            case 'rePassword':
                return this.setState({rePassword: { type: 'password', val: newValue }});
            case 'email':
                return this.setState({email: newEl});
            case 'room':
                return this.setState({room: newValue});
            default:
                return console.log(`Failed to update state for ${type}!`);
        }
    }

    showValidationInput = (el, isValid) => {
        if(isValid === true) {
            el.classList.remove('error');
            el.previousSibling.lastChild.classList.remove('error');
            el.nextSibling.classList.add('valid');
        } else el.nextSibling.classList.remove('valid');
    }

    byPassValidationForPasswords = (isValid, pass) => {
        const { val: rePass } = this.state.rePassword;
            if(isValid && rePass.length > 0) {
                if(rePass !== pass ) this.formEl.current.querySelector('#rePassword').nextSibling.classList.remove('valid');
                    else this.formEl.current.querySelector('#rePassword').nextSibling.classList.add('valid');
            } else if(!isValid && rePass.length > 0) 
                this.formEl.current.querySelector('#rePassword').nextSibling.classList.remove('valid');
    }

    isRepeatPasswordValid = () => {
        const { password, rePassword } = this.state;
        if(password.val !== rePassword.val || rePassword.val === '' || rePassword.val < 6) {
            const rePassInput = this.formEl.current.querySelector('#rePassword');
            rePassInput.classList.add('error');
            rePassInput.previousSibling.lastChild.classList.add('error');
            return false;
        }
        return true;
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
                    <form onSubmit={this.handleSubmit} ref={this.formEl}>
                        <div className="form-control">
                            <label htmlFor="username">Username <span>minimum 6 letters</span></label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={username.val}
                                onChange={this.handleChange}
                                onKeyPress={(e) => !(/[a-z]/i.test(e.key)) ? e.preventDefault() : undefined}
                                maxLength="20"
                                placeholder="Enter username..."
                                
                            />
                            <span className="verification" ><i className="fas fa-check"></i></span>
                            { isRegisterPage ? <label htmlFor="email">Email <span>e.g. joe@smith.com</span></label> : null }
                            {   isRegisterPage ? 
                                <input
                                    type="text"
                                    name="email"
                                    id="email"
                                    value={email.val}
                                    onChange={this.handleChange}
                                    placeholder="Enter email..."
                                    
                                /> : null
                            }
                            <span className="verification" ><i className="fas fa-check"></i></span>
                            <label htmlFor="password">Password <span>minimum 6 characters</span></label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={password.val}
                                onChange={this.handleChange}
                                placeholder="Enter password..."
                                
                            />
                            <span className="verification" ><i className="fas fa-check"></i></span>
                            { isRegisterPage ? <label htmlFor="rePassword"> Confirm Password <span>same as password above</span></label>: null }
                            {   isRegisterPage ? 
                                <input
                                    type="password"
                                    name="rePassword"
                                    id="rePassword"
                                    value={rePassword.val}
                                    onChange={this.handleChange}
                                    placeholder="Enter password..."
                                    
                                /> : null
                            }
                            <span className="verification" ><i className="fas fa-check"></i></span>
                        </div>
                        { showRooms }
                        <button type="submit" className="btn">{isRegisterPage ? 'Register' : 'Join Chat'}</button>
                    </form>
                    { isRegisterPage 
                        ? 
                        <div className="auth-switch-page">Already have an account? <span onClick={() => this.state.isRegisterPage ? this.setState({isRegisterPage: false}) : this.setState({isRegisterPage: true})}>Log in here</span></div>
                        :
                        <div className="auth-switch-page">Don't have an account yet? <span onClick={() => this.state.isRegisterPage ? this.setState({isRegisterPage: false}) : this.setState({isRegisterPage: true})}>Sign up here</span></div> 
                    }
                </main>
		    </div>
        );
    }
}

export default Authentication;