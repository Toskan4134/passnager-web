const backendUri = 'https://localhost:7027/'; //'https://192.168.1.48:7027/';
let cookieId = document.cookie
    .split(', ')
    .find((row) => row.startsWith('id='))
    ?.split('=')[1];
if (!cookieId || cookieId == 0) {
    location.pathname = '/profiles';
}
let siteId;
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

async function generateSite() {
    let url = new URL(location.href);
    let cats;
    let categories = document.getElementById('categories');
    let submitButton = document.getElementById('submitButton');
    switch (url.searchParams.get('mode')) {
        case 'create':
            submitButton.id = 'create';
            cats = await (
                await fetch(backendUri + 'Category/GetByProfile/' + cookieId)
            ).json();
            cats.forEach((c) => {
                let child = document.createElement('option');
                child.value = c.id;
                child.innerText = c.name;
                if (c.id == url.searchParams.get('id')) child.selected = true;
                categories.appendChild(child);
            });
            break;
        case 'edit':
            submitButton.value = 'Editar';
            submitButton.id = 'edit';
            document.getElementById('title').innerText = 'Editar Sitio';
            let res = await fetch(
                backendUri + 'Site/' + url.searchParams.get('id')
            );
            let data = await res.json();
            siteId = data.id;
            document.getElementById('sitio').value = data.site;
            document.getElementById('usuario').value = data.user;
            document.getElementById('url').value = data.url;
            document.getElementById('passwordInput').value = data.password;
            document.getElementById('descripción').value = data.description;
            cats = await (
                await fetch(backendUri + 'Category/GetByProfile/' + cookieId)
            ).json();
            cats.forEach((c, i) => {
                let child = document.createElement('option');
                if (c.id === data.categoryId) child.selected = true;
                child.value = c.id;
                child.innerText = c.name;
                categories.appendChild(child);
            });
            break;
        default:
            location.pathname = '/';
            break;
    }
}

async function editSite() {
    let res = await fetch(backendUri + 'Site', {
        method: 'PUT',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: siteId,
            categoryId: document.getElementById('categories').value,
            site: document.getElementById('sitio').value.trim(),
            url: document.getElementById('url').value.trim(),
            user: document.getElementById('usuario').value.trim(),
            password: document.getElementById('passwordInput').value.trim(),
            description: document.getElementById('descripción').value,
        }),
    });
    await res.json().then(async () => {
        let url = new URL(location.href);
        url.pathname = '/';
        let params = Array.from(url.searchParams);
        for (const param in params) {
            url.searchParams.delete(params[param][0]);
            if (param == params.length - 1) location.href = url;
        }
    });
}

function closeSite() {
    let url = new URL(location.href);
    url.pathname = '/';
    let params = Array.from(url.searchParams);
    for (const param in params) {
        url.searchParams.delete(params[param][0]);
        if (param == params.length - 1) location.href = url;
    }
}

async function createSite() {
    let res = await fetch(backendUri + 'Site', {
        method: 'POST',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            categoryId: document.getElementById('categories').value,
            site: document.getElementById('sitio').value.trim(),
            url: document.getElementById('url').value.trim(),
            user: document.getElementById('usuario').value.trim(),
            password: document.getElementById('passwordInput').value.trim(),
            description: document.getElementById('descripción').value,
        }),
    });
    await res.json().then(async () => {
        let url = new URL(location.href);
        url.pathname = '/';
        let params = Array.from(url.searchParams);
        for (const param in params) {
            url.searchParams.delete(params[param][0]);
            if (param == params.length - 1) location.href = url;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const genPasswordBut = document.getElementById('genPasswordBut');
    const passwordInput = document.getElementById('passwordInput');
    const passwordViewBut = document.getElementById('passwordViewBut');
    generateSite();

    genPasswordBut.addEventListener('click', () => {
        const password = generatePassword(16);
        passwordInput.value = password;
    });

    passwordViewBut.addEventListener('click', () => {
        viewPassword();
    });
});

document.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.submitter.id === 'create') createSite();
    if (e.submitter.id === 'edit') editSite();
});
