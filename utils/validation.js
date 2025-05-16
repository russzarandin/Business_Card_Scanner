export function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
};

export function isValidName(name) {
    const re = /^[a-zA-Z\s'-]{2,50}$/;
    return re.test(name) && !/\p{Emoji}/u.test(name);
};

export function isStrongPassword(password) {
    const validLength = password.length >= 6 && password.length <= 15;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasOnlySafeChars = /^[\w!@#$%^&*()\-+=;:'",.<>?\\|[\]{}]*$/.test(password);
    return validLength && hasLetter && hasNumber && hasOnlySafeChars;
};

