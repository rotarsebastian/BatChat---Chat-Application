const validateInput = (type, value) => {
    switch (type) {
        case 'username':
            return value.length >= 6 && value.length <= 20 && /^[a-zA-Z0-9_.-]*$/.test(value);
        case 'password':
            return value.length >= 6 && value.length <= 50;
        case 'email':
            return /\S+@\S+\.\S+/.test(value);
        default:
            console.log(`Validation failed! No validation for ${type}!`);
        break;
    }
}

const validateForm = form => {
    let formIsValid = true;
    let invalidInputs = [];
    form.map(input => {
        if(!validateInput(input.type, input.val)) {
            formIsValid = false;
            console.log(`${input.type} with value ${input.val} is not valid`);
            invalidInputs.push(input.type);
        }
    });
    return formIsValid ? { status: 1 } : { status: 0, invalidInputs };
}

module.exports = validateForm;