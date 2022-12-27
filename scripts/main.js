let cookieId = document.cookie
    .split('; ')
    .find((row) => row.startsWith('id='))
    ?.split('=')[1];
if (!cookieId || cookieId == 0) {
    location.pathname = '/pages/profiles.html';
}
let selectedCategoryId;
let base64String;
let searchButton = document.getElementById('searchButton');
let searchInput = document.getElementById('searchInput');
const defaultImageSource =
    'https://cdn.iconscout.com/icon/free/png-256/category-2456577-2036097.png';

async function drawCategories() {
    let parent = document.getElementById('categories');
    let res = await fetch(
        'https://localhost:7027/Category/GetByProfile/' + cookieId
    );
    await res.json().then((data) => {
        if (data.length === 0) {
            let categoryElement = document.createElement('li');
            categoryElement.innerHTML = `<h3 style="width: 100%">No hay categorías disponibles</h3>`;
            categoryElement.style.filter = 'none';
            categoryElement.style.cursor = 'auto';
            categoryElement.style.backgroundColor = 'var(--color-tabla)';
            categoryElement.style.fontStyle = 'italic';
            categoryElement.style.textAlign = 'center';
            categoryElement.style.fontSize = '14px';
            parent.appendChild(categoryElement);
            return;
        }
        data.forEach((category) => {
            let categoryElement = document.createElement('li');
            categoryElement.id = 'category-' + category.id;
            categoryElement.innerHTML = `<div>
                <div class="icon-container"><img src="${
                    category.icon?.length > 1
                        ? 'data:image/png;base64,' + category.icon
                        : defaultImageSource
                }"></div>
                <div class="h3-container">
                <h3>${category.name}</h3>
                </div>
            </div>
            <div class="li-buttons">
                <i class="bi bi-pencil" onclick="editPopup()"></i>
                <i class="bi bi-x-lg" onclick="showAcceptPopup('¿Estás de acuerdo con borrar la categoría?', deleteCategory, ${
                    category.id
                })"></i>
            </div>`;
            categoryElement.addEventListener('click', () => {
                drawSites(category.id);
                selectedCategoryId = category.id;
                document.querySelectorAll('#categories li').forEach((c) => {
                    c.lastChild.classList.remove('active');
                    c.style.boxShadow = 'none';
                });
                categoryElement.style.boxShadow =
                    'inset 0px 0px 0px 5px var(--color-tabla)';
                categoryElement.lastChild.classList.add('active');
            });
            parent.appendChild(categoryElement);
        });
    });
}

function changeTableContent(data) {
    let parent = document.getElementById('sites');
    parent.innerHTML = '';
    if (data.length === 0) {
        let siteElement = document.createElement('tr');
        let cell = document.createElement('td');
        cell.colSpan = 4;
        cell.innerText = 'No hay ningún sitio en esta categoría';
        cell.style.fontStyle = 'italic';
        cell.style.textAlign = 'center';
        siteElement.appendChild(cell);
        parent.appendChild(siteElement);
        return;
    }
    data.forEach((site) => {
        let siteElement = document.createElement('tr');
        siteElement.id = 'site-' + site.id;
        siteElement.innerHTML = `
            <td>${site.site}</td>
            <td>${site.user}</td>
            <td>${site.date}</td>
            <td class="actions">
                <a href="${site.url}"><i class="bi bi-box-arrow-up-right"></i></a>
                <button onclick="goToSite('edit', ${site.id})"><i class="bi bi-pencil"></i></button>
                <button onclick="showAcceptPopup('¿Estás de acuerdo con borrar el sitio?', deleteSite, ${site.id})"><i class="bi bi-trash3"></i></button>
            </td>`;
        parent.appendChild(siteElement);
    });
}

async function drawSites(id) {
    let res = await fetch('https://localhost:7027/Site/GetByCategory/' + id);
    await res.json().then((data) => {
        changeTableContent(data);
    });
}

async function drawFilteredSites(filter, value) {
    let url = new URL(
        `https://localhost:7027/Site/GetByCategory/${selectedCategoryId}/${filter}`
    );
    url.searchParams.set('value', value);
    let res = await fetch(url.href);
    await res.json().then((data) => {
        changeTableContent(data);
    });
}

function searchSites() {
    let searchValue = document.getElementById('searchInput').value.trim();

    if (searchValue && searchValue !== '') {
        drawFilteredSites(document.getElementById('filter').value, searchValue);
    } else {
        drawSites(selectedCategoryId);
    }
}

function goToSite(mode = 'create', id = selectedCategoryId) {
    if (mode === 'create' && !selectedCategoryId) return;
    let url = new URL(location.href);
    url.pathname = '/pages/site.html';
    url.searchParams.set('mode', mode);
    url.searchParams.set('id', id);
    location.href = url;
}

async function deleteSite(id) {
    await fetch('https://localhost:7027/Site/' + id, {
        method: 'DELETE',
    });
    document.getElementById('site-' + id).remove();
    hidePopup();
}

function showPopup(id) {
    document.getElementById('popup-container').innerHTML = `
            <h2>${id ? 'Editar Categoría' : 'Crear Categoría'} </h2>
            <form>
                <div class="create-edit-profile-image">
                    <img src="${defaultImageSource}"
                        id="image-placeholder" onclick="document.getElementById('imageChanger').click()" alt="">
                    <i class="bi bi-pencil"></i>
                </div>
                <button class="button" type="button" onclick="resetImage()">Reestablecer Imágen</button>
                <input type="file" id="imageChanger" accept="image/*" onchange="changeProfileImage()"
                    style="display: none;">

                <div class="campos">
                    <label for="categoría">Nombre de Categoría</label>
                    <input id="categoría" type="text" name="passnager-category" oninvalid="this.classList.add('invalid')"
                        required>
                </div>
                <div class="buttons"><button class="button" type="button" onclick="hidePopup()">Cancelar</button>
                    <button class="button" id=${id ? 'edit' : 'create'}>${
        id ? 'Editar' : 'Crear'
    }</button>
                </div>

            </form>`;
    document.getElementById('popup').classList.add('popup-visible');
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

function hidePopup() {
    document.getElementById('popup').classList.remove('popup-visible');
    document.getElementById('accept-popup').classList.remove('popup-visible');
}
function resetImage() {
    document.getElementById('image-placeholder').src = defaultImageSource;
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

async function editPopup() {
    let res = await fetch(
        'https://localhost:7027/Category/' + selectedCategoryId
    );
    let data = await res.json();
    showPopup(selectedCategoryId);
    document.getElementById('image-placeholder').src =
        data.icon?.length > 1
            ? 'data:image/png;base64, ' + data.icon
            : defaultImageSource;
    document.getElementById('categoría').value = data.name;
}

async function editCategory() {
    let icon = document.getElementById('image-placeholder').src;
    let res = await fetch('https://localhost:7027/Category', {
        method: 'PUT',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: selectedCategoryId,
            icon: icon === defaultImageSource ? '' : base64String,
            name: document.getElementById('categoría').value.trim(),
        }),
    });
    res.json().then((data) => {
        if (!data) return;
        location.reload();
    });
}

async function deleteCategory(id) {
    await fetch('https://localhost:7027/Category/' + id, {
        method: 'DELETE',
    });
    document.querySelectorAll('#categories li').item(0).click();
    document.getElementById('category-' + id).remove();
    hidePopup();
}

async function createCategory() {
    let icon = document.getElementById('image-placeholder').src;
    let res = await fetch('https://localhost:7027/Category', {
        method: 'POST',
        headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            profileId: cookieId,
            icon: icon === defaultImageSource ? null : base64String,
            name: document.getElementById('categoría').value.trim(),
        }),
    });
    res.json().then((data) => {
        if (!data) return;
        location.reload();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    drawCategories().then(() => {
        let firstCategory = document.querySelectorAll('#categories li').item(0);
        firstCategory.click();
        selectedCategoryId = firstCategory.id.split('-')[1];
    });
    document.getElementById('popup').addEventListener('click', (e) => {
        if (e.target.id === 'popup') hidePopup();
    });
});

document.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.submitter.id === 'create') createCategory();
    if (e.submitter.id === 'edit') editCategory();
});

searchInput.addEventListener('input', () => {
    searchSites();
});
searchButton.addEventListener('click', () => searchSites());
