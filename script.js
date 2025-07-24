let currentDir = '';
let imageList = [];
let currentIndex = 0;

const directoryList = document.getElementById('directory-list');
const imageGrid = document.getElementById('image-grid');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const breadcrumb = document.getElementById('breadcrumb');

function loadDirectory(dir = '') {
  currentDir = dir;
  console.log('Loading directory:', dir);
  
  fetch(`api.php?dir=${encodeURIComponent(dir)}`)
    .then(res => res.json())
    .then(data => {
      console.log('API data received:', data);
      
      // Clear both containers
      directoryList.innerHTML = '';
      imageGrid.innerHTML = '';
      imageList = [];

      // Update breadcrumbs
      updateBreadcrumbs(dir);

      // Separate directories and files
      const directories = data.filter(item => item.type === 'dir' && item.name !== 'viewer');
      const files = data.filter(item => item.type === 'file');

      // Show directories as text links
      if (directories.length > 0) {
        const ul = document.createElement('ul');
        directories.forEach(item => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#';
          a.textContent = `📁 ${item.name}`;
          a.onclick = (e) => {
            e.preventDefault();
            loadDirectory(`${dir}/${item.name}`.replace(/^\/+/, ''));
          };
          li.appendChild(a);
          ul.appendChild(li);
        });
        directoryList.appendChild(ul);
      }

      // Show images in grid (only when we're in a leaf directory with images)
      if (files.length > 0) {
        files.forEach((item, i) => {
          const img = document.createElement('img');
          img.src = item.thumb || item.path;
          img.classList.add('thumbnail');
          img.onclick = () => openModal(i);
          imageGrid.appendChild(img);
          imageList.push(item);
        });
      }

      // Show message if empty directory
      if (directories.length === 0 && files.length === 0) {
        directoryList.innerHTML = '<p style="color: #999; font-style: italic;">Empty directory</p>';
      }
    })
    .catch(error => {
      console.error('Error loading directory:', error);
      directoryList.innerHTML = '<p style="color: red;">Error loading directory. Check console for details.</p>';
    });
}

function updateBreadcrumbs(dir) {
  const parts = dir.split('/').filter(Boolean);
  let path = '';
  breadcrumb.innerHTML = `<a href="#" onclick="loadDirectory('')">🏠 Root</a>`;
  
  parts.forEach(part => {
    path += (path ? '/' : '') + part;
    breadcrumb.innerHTML += ` / <a href="#" onclick="loadDirectory('${path}')">${part}</a>`;
  });
}

function openModal(index) {
  const img = imageList[index];
  if (!img || img.type !== 'file') return;

  currentIndex = index;
  modalImg.src = img.path;
  document.getElementById('download-btn').href = img.path;
  modal.classList.remove('hidden');
}

function closeModal() { modal.classList.add('hidden'); }
function showNext() { currentIndex = (currentIndex + 1) % imageList.length; openModal(currentIndex); }
function showPrev() { currentIndex = (currentIndex - 1 + imageList.length) % imageList.length; openModal(currentIndex); }

function deleteImage() {
  const img = imageList[currentIndex];
  fetch('api.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', path: img.path }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => {
    imageList.splice(currentIndex, 1);
    closeModal();
    loadDirectory(currentDir);
  });
}

function moveImage() {
  const img = imageList[currentIndex];
  fetch('api.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'move', path: img.path }),
    headers: { 'Content-Type': 'application/json' }
  }).then(() => {
    imageList.splice(currentIndex, 1);
    closeModal();
    loadDirectory(currentDir);
  });
}

document.getElementById('close-modal').onclick = closeModal;
document.getElementById('prev-img').onclick = showPrev;
document.getElementById('next-img').onclick = showNext;
document.getElementById('delete-btn').onclick = deleteImage;
document.getElementById('move-btn').onclick = moveImage;

// Initialize the directory browser
loadDirectory();

