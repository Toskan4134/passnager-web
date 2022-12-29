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
let editMode = false;
function showPopup(id, edit = false) {
    if (id && !edit) {
        document.getElementById(
            'popup-container'
        ).innerHTML = `<h2>Introduce la contraseña</h2>
                <form>
                    <div class="password-field-input">
                        <input id="passwordInput" type="password" oninvalid="this.classList.add('invalid')" autocomplete="false" placeholder="Contraseña"  required>
                        <i id="passwordViewBut" class="bi bi-eye"></i>
                    </div>
                    <div class="buttons"><button class="button" type="button" onclick="hidePopup()">Cancelar</button><button class="button" id="login-${id}">Entrar</button>
                </form>`;
    } else if (!id || edit) {
        document.getElementById('popup-container').innerHTML = `<h2>${
            edit ? 'Editar Perfil' : 'Crear Perfíl'
        }</h2>
                <form>
                    <div class="create-edit-profile-image">
                        <img src="${defaultImageSource}" id="image-placeholder" onclick="document.getElementById('imageChanger').click()"
                            alt="">
                        <i class="bi bi-pencil"></i>
                    </div>
                    <button class="button" type="button" onclick="resetImage()">Reestablecer Imágen</button>
                    <input type="file" id="imageChanger" accept="image/*"  onchange="changeProfileImage()" style="display: none;">

                    <div class="campos">
                        <label for="usuario">Usuario</label>
                        <input id="usuario" type="text" name="passnager-user" oninvalid="this.classList.add('invalid')"
                            required>
                    </div>
                    <div class="campos">
                        <label for="passwordInput">Contraseña</label>
                        <div class="password-field-input">
                            <input id="passwordInput" type="password" autocomplete="false" oninvalid="this.classList.add('invalid')"
                                required>
                            <i id="passwordViewBut" class="bi bi-eye"></i>
                        </div>
                    </div>

                    <div class="buttons"><button class="button" type="button" onclick="hidePopup()">Cancelar</button>${
                        edit
                            ? `<button class="button" id="edit-${id}">Editar</button>`
                            : '<button class="button" id="create">Crear</button>'
                    }
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
    document.getElementById('accept-popup').classList.remove('popup-visible');
}
function resetImage() {
    document.getElementById('image-placeholder').src = defaultImageSource;
}
function showAcceptPopup(text, func, id) {
    document.getElementById(
        'accept-popup-container'
    ).innerHTML = `<h2>¡Aviso!</h2>
                <form>
                    <p>${text}</p>
                    <div class="buttons"><button class="button" type="button" onclick="hidePopup()">Cancelar</button><button class="button" id="accept">Aceptar</button>
                </form>`;

    document.getElementById('accept').addEventListener('click', () => func(id));
    document.getElementById('accept-popup').classList.add('popup-visible');
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
        if (!data) return;
        location.reload();
    });
}

async function login(id) {
    const password = document.getElementById('passwordInput');
    let res = await fetch('https://localhost:7027/Profile/CheckLogin', {
        method: 'POST',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id,
            password: password.value.trim(),
        }),
    });
    res.json().then((data) => {
        if (!data) {
            password.value = '';
            password.classList.add('invalid');
            return;
        }
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

function toggleEditMode() {
    editMode = !editMode;
    if (editMode) {
        document.getElementById('toggleEditModeButton').innerText = 'Volver';
        document.querySelectorAll('.row').forEach((e) => {
            let editButtons = document.createElement('div');
            editButtons.classList.add('editionButtons');
            editButtons.innerHTML = `<button onclick="editPopup(${
                e.id.split('-')[1]
            })"><i class="bi bi-pencil"></i></button><button onclick="showAcceptPopup('¿Estás de acuerdo con borrar el perfil?',deleteProfile,${
                e.id.split('-')[1]
            })"><i class="bi bi-x-lg"></i></button>`;
            e.replaceChild(editButtons, e.lastChild);
        });
    } else {
        document.getElementById('toggleEditModeButton').innerText = 'Editar';
        document.querySelectorAll('.row').forEach((e) => {
            let button = document.createElement('button');
            button.classList.add('button');
            button.addEventListener('click', () =>
                showPopup(e.id.split('-')[1])
            );
            button.innerText = `Entrar`;
            e.replaceChild(button, e.lastChild);
        });
    }
}

async function editPopup(id) {
    let res = await fetch('https://localhost:7027/Profile/' + id);
    let data = await res.json();
    showPopup(id, true);
    document.getElementById('image-placeholder').src =
        data.icon?.length > 1
            ? 'data:image/png;base64, ' + data.icon
            : defaultImageSource;
    document.getElementById('usuario').value = data.name;
    document.getElementById('passwordInput').value = data.password;
}

async function editProfile(id) {
    let icon = document.getElementById('image-placeholder').src;
    let res = await fetch('https://localhost:7027/Profile/', {
        method: 'PUT',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id,
            icon:
                icon === defaultImageSource
                    ? ''
                    : icon.replace('data:image/png;base64, ', ''),
            name: document.getElementById('usuario').value.trim(),
            password: document.getElementById('passwordInput').value.trim(),
        }),
    });
    res.json().then((data) => {
        if (!data) return;
        location.reload();
    });
}
async function deleteProfile(id) {
    await fetch('https://localhost:7027/Profile/' + id, {
        method: 'DELETE',
    });

    if (!document.querySelectorAll('#rows .row').item(1))
        return location.reload();
    document.getElementById('row-' + id).remove();
    hidePopup();
}

async function drawRows() {
    let parent = document.getElementById('rows');
    parent.innerHTML = '';
    let res = await fetch('https://localhost:7027/Profile');
    let data = await res.json();
    if (data == '') {
        let row = document.createElement('div');
        row.classList.add('no-profile');
        row.innerHTML = '<h4>No hay ningún perfíl disponible</h4>';
        parent.appendChild(row);
        return;
    }
    data.forEach((profile) => {
        let row = document.createElement('div');
        row.classList.add('row');
        row.id = `row-${profile.id}`;
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
    if (e.submitter.id.includes('login')) login(e.submitter.id.split('-')[1]);
    if (e.submitter.id === 'create') createProfile();
    if (e.submitter.id.includes('edit'))
        editProfile(e.submitter.id.split('-')[1]);
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('popup').addEventListener('click', (e) => {
        if (e.target.id === 'popup') hidePopup();
    });

    drawRows();
});
