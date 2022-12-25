let cookieId = document.cookie
    .split('; ')
    .find((row) => row.startsWith('id='))
    ?.split('=')[1];
if (cookieId && cookieId != 0) {
    location.pathname = '/';
}
const defaultImageSource =
    'https://bklyner.com/content/images/avatar/658c5875148fe3d738d2dd23da91fd3f.jpeg';
let base64String = '';
function showPopup(id) {
    if (id) {
        document.getElementById(
            'popup-container'
        ).innerHTML = `<h2>Introduce la contraseña</h2>
                <form>
                    <div class="password-field-input">
                        <input id="passwordInput" type="password" oninvalid="this.classList.add('invalid')" placeholder="Contraseña"  required>
                        <i id="passwordViewBut" class="bi bi-eye"></i>
                    </div>
                    <div class="buttons"><button class="button" onclick="hidePopup()">Cancelar</button><button class="button" id="login">Entrar</button>
                </form>`;
        document.querySelector('.popup button').id = 'submitbutton-' + id;
    } else {
        document.getElementById(
            'popup-container'
        ).innerHTML = `<h2>Crea un nuevo perfíl</h2>
                <form>
                    <div class="create-edit-profile-image">
                        <img src="${defaultImageSource}" id="image-placeholder" onclick="document.getElementById('imageChanger').click()"
                            alt="">
                        <i class="bi bi-pencil"></i>
                    </div>
                    <input type="file" id="imageChanger" accept="image/*"  onchange="changeProfileImage()" style="display: none;">

                    <div class="campos">
                        <label for="usuario">Usuario</label>
                        <input id="usuario" type="text" name="passnager-user" oninvalid="this.classList.add('invalid')"
                            required>
                    </div>
                    <div class="campos">
                        <label for="passwordInput">Contraseña</label>
                        <div class="password-field-input">
                            <input id="passwordInput" type="password" oninvalid="this.classList.add('invalid')"
                                required>
                            <i id="passwordViewBut" class="bi bi-eye"></i>
                        </div>
                    </div>

                    <div class="buttons"><button class="button" onclick="hidePopup()">Cancelar</button><button class="button" id="create">Crear</button>
                    </div>

                </form>`;
    }
    document.getElementById('passwordViewBut').addEventListener('click', () => {
        viewPassword();
    });
    document.getElementById('popup').classList.add('popup-visible');
}
function hidePopup() {
    document.getElementById('popup').classList.remove('popup-visible');
}

function changeProfileImage() {
    var file = document.getElementById('imageChanger')['files'][0];
    if (file.size > 100000000) {
        alert('EL ARCHIVO ES DE MÁS DE UN GB, ESTÁS BIEN?');
        file.value = '';
        return;
    }
    var reader = new FileReader();

    reader.onload = function () {
        base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
        imageBase64Stringsep = base64String;
        document.getElementById('image-placeholder').src =
            'data:image/png;base64, ' + base64String;
    };

    reader.readAsDataURL(file);
}

async function createProfile() {
    let icon = document.getElementById('image-placeholder').src;
    let res = await fetch('https://localhost:7027/Profile', {
        method: 'POST',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            icon: icon === defaultImageSource ? null : base64String,
            name: document.getElementById('usuario').value.trim(),
            password: document.getElementById('passwordInput').value.trim(),
        }),
    });
    res.json().then((data) => {
        console.log(data);
        if (!data) return;
        location.reload();
    });
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
        console.log(data);
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
            profile.icon?.length > 1
                ? 'data:image/png;base64,' + profile.icon
                : defaultImageSource
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
    if (e.submitter.id === 'login') login();
    if (e.submitter.id === 'create') createProfile();
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('popup').addEventListener('click', (e) => {
        if (e.target.id === 'popup') hidePopup();
    });

    drawRows();
});
