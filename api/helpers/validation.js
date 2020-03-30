const validateInput = (type, value) => {
    switch (type) {
        case 'username':
            return value.length >= 6 && value.length <= 20 && /^[a-zA-Z]+$/.test(value);
        case 'password':
            return value.length >= 6 && value.length <= 50;
        case 'email':
            return /\S+@\S+\.\S+/.test(value);
        default:
            console.log(`Validation failed! No validation for ${type}!`);
        break;
    }
}

const validateForm = (formElements) => {
    let formIsValid = true;
    formElements.forEach(input => {
        if(!validateInput(input.type, input.val)) {
            formIsValid = false;
            console.log(`${input.type} with value ${input.val} is not valid`);
            // showError(inputType);
        }
    });
    return formIsValid ? true : false;
}

module.exports = validateForm;