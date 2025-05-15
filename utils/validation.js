export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.text(String(email).toLowerCase());
};

export function isValidName(name) {
    const re = /^[a-zA-Z\s'-]{2,50}$/;
    return re.test(name) && !/\p{Emoji}/u.test(name);
};

export function isStrongPassword(password) {
    return password.length >= 6;
}

