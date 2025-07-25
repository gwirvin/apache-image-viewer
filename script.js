//const root = '/viewer';  // Adjust if your structure changes
const root = ''; // No need to use /viewer since images.irvin.lan is root

// Load folder contents
function loadDirectory(path) {
  fetch(`${root}/api.php?dir=${encodeURIComponent(path)}`)
    .then(res => res.json())
    .then(data => {
      updateBreadcrumb(path);
      const folders = data.filter(item => item.type === 'dir');
      const images = data.filter(item => item.type === 'file');
      renderFolders(folders.map(f => f.name), path);
      renderImages(images);
    });
}

// Breadcrumbs
function updateBreadcrumb(path) {
  const parts = path.split('/').filter(p => p);
  const container = document.getElementById('breadcrumb');
  container.innerHTML = `<a href="#" data-path="">Home</a>`;
  let built = '';
  parts.forEach((part, i) => {
    built += '/' + part;
    container.innerHTML += ` / <a href="#" data-path="${built.slice(1)}">${part}</a>`;
  });
}

// Render folders
function renderFolders(folders, path) {
  const list = document.getElementById('directory-list');
  list.innerHTML = '';
  if (folders && folders.length) {
    const ul = document.createElement('ul');
    folders.forEach(folder => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = folder;
      a.dataset.path = path ? `${path}/${folder}` : folder;
      a.addEventListener('click', e => {
        e.preventDefault();
        loadDirectory(a.dataset.path);
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    list.appendChild(ul);
  }
}

// Render thumbnails
function renderImages(images) {
  const grid = document.getElementById('image-grid');
  grid.innerHTML = '';
  if (images && images.length) {
    images.forEach(img => {
      const image = document.createElement('img');
      image.src = img.thumb;
      image.className = 'thumbnail';
//      image.dataset.full = `${root}/${img.path}`;
//      image.dataset.full = encodeURIComponent(img.path);
//       image.dataset.full = img.path;
      image.dataset.full = encodeURIComponent(img.path.replace(/^\//, ''));
      image.addEventListener('click', () => openModal(image.dataset.full));
      grid.appendChild(image);
    });
  }
}

// Modal functions
//function openModal(src) {
//  const modal = document.getElementById('modal');
//  const img = modal.querySelector('img');
//  img.src = src;
//  img.src = '/' + decodeURIComponent(src);
//  modal.classList.remove('hidden');
//}

function openModal(src) {
  const modal = document.getElementById('modal');
  const img = modal.querySelector('img');
  const decodedPath = decodeURIComponent(src);
  img.src = decodedPath.startsWith('/') ? decodedPath : '/' + decodedPath;
  modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  modal.querySelector('img').src = '';
}

document.getElementById('close-modal').addEventListener('click', closeModal);

// Breadcrumb clicks
document.getElementById('breadcrumb').addEventListener('click', function (e) {
  if (e.target.tagName === 'A') {
    e.preventDefault();
    loadDirectory(e.target.dataset.path);
  }
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadDirectory('');
});

