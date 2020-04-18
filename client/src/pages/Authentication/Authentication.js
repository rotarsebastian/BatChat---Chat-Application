import React, { Component } from 'react';
import { login, register } from '../../helpers/auth';
import './Authentication.css';
import { validateForm, validateInputValue } from '../../helpers/validation';
import capitalize from '../../helpers/capitalize';

const initialState = {
    username: { type: 'username', val: '' },
    password: { type: 'password', val: '' },
    rePassword: { type: 'password', val: '' },
    email: { type: 'email', val: '' },
    isRegisterPage: false
};
class Authentication extends Component {

    constructor(props) {
        super(props);
        this.formEl = React.createRef();
        this.wholeContainer = React.createRef();
        this.state = initialState;
    }

    componentDidMount() {
        localStorage.clear();
    }

    handleChange = e => {
        const { isRegisterPage } = this.state;
        const { name: type, value: newValue } = e.target;
        this.validateInput(e, type, newValue);
        isRegisterPage ? this.showValidButton(4) : this.showValidButton(2);
        this.updateInputState(type, newValue);
    }

    handleSubmit = async(e) => {
        e.preventDefault();
        const { isRegisterPage } = this.state;
        let areThereErrors = false;
        
        if(isRegisterPage) areThereErrors = await this.handleRegistration(e);
          else areThereErrors = await this.handleLogin(e);

        if(!areThereErrors) {
            console.log('Good To Go!');
            if(isRegisterPage) this.setState( {isRegisterPage: false} );
                else {
                    const { history } = this.props;
                    history.push('/rooms');
                }
            
        }
    }

    handleRegistration = async(e) => {
        const { username, password, email } = this.state;
        const isFormValid = validateForm([username, password, email], e.target);
        if(!this.isRepeatPasswordValid()) return true;
        if(isFormValid) {
            const res = await register(username, password, email);
            if(res.status === 1) {
                this.clearInputs();
                this.setState({ ...initialState, username: { type: username.type, val: username.val } });
                return false;
            } else {
                this.handleServerErrors(res);
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
                console.log(res);
                localStorage.setItem('userToken', res.token);
                return false;
            } else {
                this.handleServerErrors(res);
                return true;
            } 
        } else return true;
    }

    handleServerErrors = res => {
        if(res.code === 11) this.showServerErrors(res.invalids, res); // REGISTRATION / LOGIN - Validation failed!
            else if(res.code === 12) this.showServerErrors(['username', 'email'], res);  // REGISTRATION - Both email and username are already used!
            else if(res.code === 13 || res.code === 15) this.showServerErrors(['username'], res); // REGISTRATION - Username is already used! ---- LOGIN - Incorrect username!
            else if(res.code === 14) this.showServerErrors(['email'], res); // REGISTRATION - Email is already used!
            else if(res.code === 16) this.showServerErrors(['password'], res); // LOGIN - Incorrect pass!

    }

    showServerErrors = (invalidInputs, res) => {
        invalidInputs.forEach(el => {
            const element = this.formEl.current.querySelector(`#${el}`);
            element.classList.add('error');
            element.previousSibling.lastChild.classList.add('error');
        });

        // Adding messages to toastr
        //TODO: // Handle errors toastr redux
        if(res.hasOwnProperty('invalids')) console.log(`${capitalize(invalidInputs.join(', '))} are not valid!`);
            else console.log(capitalize(res.message));
    }

    clearInputs = () => {
        const elToBeCleaned = Array.from(this.formEl.current.querySelectorAll('.valid'));
        elToBeCleaned.map(el => el.previousSibling.id !== 'username' ? el.classList.remove('valid') : undefined);
    }

    showValidButton = validInputs => {
        const allValidEl = Array.from(this.formEl.current.querySelectorAll('.verification.valid')).length;
        const formButtonClasses = this.formEl.current.lastChild.classList;

        if(allValidEl === validInputs) { 
            formButtonClasses.add('valid');
            this.formEl.current.lastChild.disabled = false;
        } else {
            formButtonClasses.remove('valid');
            this.formEl.current.lastChild.disabled = true;
        }
    }

    switchPageHandler = () => {
        const { isRegisterPage } = this.state;
        const formButtonClasses = this.formEl.current.lastChild.classList;
        const elToBeCleaned = Array.from(this.formEl.current.querySelectorAll('.error, .valid'));
        elToBeCleaned.map(el => el.classList.remove('error', 'valid'));
        if(isRegisterPage) {
            const { username, password } = this.state;
            this.animateCSS(this.wholeContainer.current, 'flipInX');
            const isValidForm = validateForm([username, password], this.formEl.current, true);
            if(isValidForm) formButtonClasses.add('valid');
            this.setState({...initialState, isRegisterPage: false});
        }  else { 
            this.animateCSS(this.wholeContainer.current, 'flipInY');
            formButtonClasses.remove('valid');
            this.setState({...initialState, isRegisterPage: true});
        }
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

    animateCSS = (element, animationName, callback) => {
        element.classList.remove('fadeInDown');
        element.classList.add('animated', animationName);

        const handleAnimationEnd = () => {
            element.classList.remove('animated', animationName);
            element.removeEventListener('animationend', handleAnimationEnd);
            if (typeof callback === 'function') callback()
        }

        element.addEventListener('animationend', handleAnimationEnd)
    }

    render () {
        const { username, password, rePassword, isRegisterPage, email } = this.state;
        let pageName = null;
        if(!isRegisterPage) pageName = 'Login';
        return (
            <div className="auth-container animated fadeInDown" ref={this.wholeContainer}>
                <header className="auth-header">
                    <h1><i className="fas fa-comments"></i> BatChat</h1>
                    <p className="motto">Secured messages. No Ads.</p>
                </header>
                <main className="auth-main">
                    <h3 className="page-name">{pageName ? pageName : 'Register'}</h3>
                    <form onSubmit={this.handleSubmit} ref={this.formEl}>
                        <div className="form-control">
                            <label htmlFor="username">Username <span>minimum 6 characters</span></label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={username.val}
                                onChange={this.handleChange}
                                onKeyPress={(e) => !(/^[aA-zZ0-9-]+$/g.test(e.key)) ? e.preventDefault() : undefined}
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
                        <button type="submit" disabled={true} className="btn">{isRegisterPage ? 'Register' : 'Join Chat'}</button>
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