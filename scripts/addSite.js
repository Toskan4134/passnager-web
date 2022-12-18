function generatePassword(min) {
    const characters =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    while (password.length < min) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
}

function viewPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordViewBut = document.getElementById('passwordViewBut');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordViewBut.classList.remove('bi-eye');
        passwordViewBut.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordViewBut.classList.add('bi-eye');
        passwordViewBut.classList.remove('bi-eye-slash');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const genPasswordBut = document.getElementById('genPasswordBut');
    const passwordInput = document.getElementById('passwordInput');
    const passwordViewBut = document.getElementById('passwordViewBut');

    genPasswordBut.addEventListener('click', () => {
        const password = generatePassword(16);
        passwordInput.value = password;
    });

    passwordViewBut.addEventListener('click', () => {
        viewPassword();
    });
});
