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
    let res = await fetch('https://localhost:7027/Category/' + cookieId);
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
            categoryElement.innerHTML = `<div class="icon-container"><img src="${
                category.icon?.length > 1
                    ? 'data:image/png;base64,' + category.icon
                    : defaultImageSource
            }"></div><h3>${category.name}</h3>`;
            categoryElement.addEventListener('click', () => {
                drawSites(category.id);
                selectedCategoryId = category.id;
                document.querySelectorAll('#categories li').forEach((c) => {
                    c.style.boxShadow = 'none';
                });
                categoryElement.style.boxShadow =
                    'inset 0px 0px 0px 5px var(--color-tabla)';
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
        siteElement.innerHTML = `
            <td>${site.site}</td>
            <td>${site.user}</td>
            <td>${site.date}</td>
            <td class="actions">
                <a href="${site.url}"><i class="bi bi-box-arrow-up-right"></i></a>
                <button onclick="goToSite('edit', ${site.id})"><i class="bi bi-pencil"></i></button>
                <button><i class="bi bi-trash3"></i></button>
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

function showPopup() {
    document.getElementById('popup-container').innerHTML = `
            <h2>Crear Categoría</h2>
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
                    <button class="button" id="create">Crear</button>
                </div>

            </form>`;
    document.getElementById('popup').classList.add('popup-visible');
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
    if (e.submitter.id === 'create') {
        createCategory();
    }
});

searchInput.addEventListener('input', () => {
    searchSites();
});
searchButton.addEventListener('click', () => searchSites());
