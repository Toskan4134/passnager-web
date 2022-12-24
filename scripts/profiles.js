let cookieId = document.cookie
    .split('; ')
    .find((row) => row.startsWith('id='))
    ?.split('=')[1];
if (cookieId && cookieId != 0) {
    location.pathname = '/';
}

function showPopup(id) {
    document.getElementById('popup').classList.add('popup-visible');
    document.querySelector('.popup button').id = 'submitbutton-' + id;
}
function hidePopup() {
    document.getElementById('popup').classList.remove('popup-visible');
}

async function login() {
    let password = document.getElementById('passwordInput').value.trim();
    let id = document.querySelector('.popup button').id.split('-')[1];
    let res = await fetch('https://localhost:7027/Profile/CheckLogin', {
        method: 'POST',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id,
            password,
        }),
    });
    res.json().then((data) => {
        if (!data) return;
        document.cookie = 'id=' + id + '; Secure; path=/';
        location.pathname = '/';
    });
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

async function drawRows() {
    let parent = document.getElementById('rows');
    let res = await fetch('https://localhost:7027/Profile');
    let data = await res.json();

    data.forEach((profile) => {
        let row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
        <div class="icon-container"><img src="${
            profile.icon || profile.icon.length > 1
                ? 'data:image/png;base64,' + profile.icon
                : 'https://bklyner.com/content/images/avatar/658c5875148fe3d738d2dd23da91fd3f.jpeg'
        }" alt=""></div>
        <h3>${profile.name}</h3>
        <button class="button" onclick="showPopup(${
            profile.id
        })">Entrar</button>`;

        parent.appendChild(row);
    });
}

document.addEventListener('submit', (e) => {
    e.preventDefault();
    login();
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('popup').addEventListener('click', (e) => {
        if (e.target.id === 'popup') hidePopup();
    });
    document.getElementById('passwordViewBut').addEventListener('click', () => {
        viewPassword();
    });
    drawRows();
});
