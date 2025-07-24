let currentDir = '';
let imageList = [];
let currentIndex = 0;

const grid = document.getElementById('image-grid');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const breadcrumb = document.getElementById('breadcrumb');

// Check if elements are found
console.log('DOM elements found:');
console.log('grid:', grid);
console.log('modal:', modal);
console.log('modalImg:', modalImg);
console.log('breadcrumb:', breadcrumb);

if (!grid) {
  console.error('ERROR: image-grid element not found!');
}
if (!modal) {
  console.error('ERROR: modal element not found!');
}

function loadImages(dir = '') {
  currentDir = dir;
  console.log('Loading directory:', dir);
  
  // Show loading message
  grid.innerHTML = '<div style="color: #999; padding: 2em;">Loading...</div>';
  
  fetch(`api.php?dir=${encodeURIComponent(dir)}`)
    .then(res => {
      console.log('API response status:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('API data received:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('API returned non-array data: ' + JSON.stringify(data));
      }
      
      grid.innerHTML = '';
      imageList = [];

      // Breadcrumbs
      const parts = dir.split('/').filter(Boolean);
      let path = '';
      breadcrumb.innerHTML = `<a href="#" onclick="loadImages('')">[root]</a>`;
      parts.forEach(part => {
        path += (path ? '/' : '') + part;
        breadcrumb.innerHTML += ` / <a href="#" onclick="loadImages('${path}')">${part}</a>`;
      });

      data.forEach((item, i) => {
        console.log('Processing item:', item);
        if (item.type === 'dir' && item.name !== 'viewer') {
          const div = document.createElement('div');
          div.innerHTML = `<strong>[${item.name}]</strong>`;
          div.classList.add('thumbnail', 'folder');
          div.onclick = () => loadImages(`${dir}/${item.name}`.replace(/^\/+/, ''));
          grid.appendChild(div);
          console.log('Added directory:', item.name);
        } else if (item.type === 'file') {
          const img = document.createElement('img');
          img.src = item.thumb || item.path;
          img.classList.add('thumbnail');
          img.onclick = () => openModal(i);
          grid.appendChild(img);
          imageList.push(item);
          console.log('Added image:', item.name);
        }
      });
      
      console.log('Final grid HTML:', grid.innerHTML);
      console.log('Grid children count:', grid.children.length);
      
      // Show message if no content found
      if (data.length === 0) {
        grid.innerHTML = '<div style="color: #999; padding: 2em;">No directories or images found in this location.</div>';
      }
    })
    .catch(error => {
      console.error('Error loading images:', error);
      grid.innerHTML = '<div style="color: red; padding: 2em;">Error loading directory. Check console for details.</div>';
    });
}

function openModal(index) {
  const img = imageList[index];
  if (!img || img.type !== 'file') return;

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
    loadImages(currentDir);
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
    loadImages(currentDir);
  });
}

document.getElementById('close-modal').onclick = closeModal;
document.getElementById('prev-img').onclick = showPrev;
document.getElementById('next-img').onclick = showNext;
document.getElementById('delete-btn').onclick = deleteImage;
document.getElementById('move-btn').onclick = moveImage;

// Test functions
function testAPI() {
  console.log('Testing API...');
  fetch('api.php?dir=')
    .then(res => res.text())
    .then(data => {
      console.log('Raw API response:', data);
      alert('API Response (check console for full details): ' + data.substring(0, 200));
    })
    .catch(error => {
      console.error('API test failed:', error);
      alert('API test failed: ' + error.message);
    });
}

function testDebug() {
  console.log('Testing debug endpoint...');
  fetch('api.php?debug=1')
    .then(res => res.json())
    .then(data => {
      console.log('Debug info:', data);
      alert('Debug info (check console): ' + JSON.stringify(data, null, 2));
    })
    .catch(error => {
      console.error('Debug test failed:', error);
      alert('Debug test failed: ' + error.message);
    });
}

function forceHideModal() {
  console.log('Forcing modal to hide...');
  modal.classList.add('hidden');
  modal.style.display = 'none';
  console.log('Modal hidden. Grid should now be visible.');
  console.log('Grid content:', grid.innerHTML);
}

loadImages(); // initial call

// Debug initial state
console.log('Initial modal state - hidden class present:', modal.classList.contains('hidden'));
console.log('Modal computed display style:', window.getComputedStyle(modal).display);
console.log('Grid element:', grid);
console.log('Breadcrumb element:', breadcrumb);

