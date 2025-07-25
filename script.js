let currentImages = [];
let currentIndex = -1;

// Load folder contents
function loadDirectory(path) {
  fetch(`/api.php?dir=${encodeURIComponent(path)}`)
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

// ✅ Render thumbnails and store them for modal navigation
function renderImages(images) {
  const grid = document.getElementById('image-grid');
  grid.innerHTML = '';
  currentImages = images;

  if (images && images.length) {
    images.forEach((img, index) => {
      const image = document.createElement('img');
      image.src = img.thumb;
      image.className = 'thumbnail';
      image.addEventListener('click', () => openModal(index)); // use index
      grid.appendChild(image);
    });
  }
}

// ✅ Modal control functions
function openModal(index) {
  const modal = document.getElementById('modal');
  const img = modal.querySelector('img');

  if (index < 0 || index >= currentImages.length) return;

  currentIndex = index;
  const src = currentImages[index].path;
  const decoded = decodeURIComponent(src);
  img.src = decoded.startsWith('/') ? decoded : '/' + decoded;
  modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  modal.querySelector('img').src = '';
}

// ✅ Modal nav buttons
function showPrevImage() {
  if (currentIndex > 0) openModal(currentIndex - 1);
}

function showNextImage() {
  if (currentIndex < currentImages.length - 1) openModal(currentIndex + 1);
}

// Hook up close button
document.getElementById('close-modal').addEventListener('click', closeModal);

// ✅ Hook up modal nav buttons
document.getElementById('modal-prev').addEventListener('click', showPrevImage);
document.getElementById('modal-next').addEventListener('click', showNextImage);

// Breadcrumb click
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

