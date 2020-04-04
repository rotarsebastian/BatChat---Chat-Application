export const validateForm = (formElements, form, showNoError) => {
    let formIsValid = true;
    formElements.forEach(input => {
        if(!validateInputValue(input.type, input.val)) {
            formIsValid = false;
            if(!showNoError) showError(input.type, form);
        }
    });
    return formIsValid ? true : false;
}

export const validateInputValue = (type, value) => {
    switch (type) {
        case 'username':
            return value.length >= 6 && value.length <= 20 && /^[a-zA-Z0-9_.-]*$/.test(value);
        case 'password':
            return value.length >= 6 && value.length <= 50;
        case 'email':
            return /@.+\.[A-Za-z]{2,}$/.test(value);
        case 'newRoom':
            return value.length >= 3 && value.length <= 20 && /^[a-zA-Z0-9_.-]*$/.test(value);
        default:
            console.log(`Validation failed! No validation for ${type}!`);
        break;
    }
}

const showError = (type, form) => {
    form.querySelector(`#${type}`).classList.add('error');
    form.querySelector(`#${type}`).previousSibling.lastChild.classList.add('error');
}