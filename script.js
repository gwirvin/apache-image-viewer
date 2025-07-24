let currentDir = '';
let imageList = [];
let currentIndex = 0;

const grid = document.getElementById('image-grid');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const breadcrumb = document.getElementById('breadcrumb');

function loadImages(dir = '') {
  currentDir = dir;
  fetch(`api.php?dir=${encodeURIComponent(dir)}`)
    .then(res => res.json())
    .then(data => {
      grid.innerHTML = '';
      imageList = [];

      breadcrumb.innerHTML = `<a href="#" onclick="loadImages('')">[root]</a> / ${dir}`;

      data.forEach((item, i) => {
        if (item.type === 'dir') {
          const div = document.createElement('div');
          div.innerHTML = `<strong>[${item.name}]</strong>`;
          div.style.cursor = 'pointer';
          div.onclick = () => loadImages(`${dir}/${item.name}`.replace(/^\/+/, ''));
          grid.appendChild(div);
        } else if (item.type === 'file') {
          const img = document.createElement('img');
          img.src = item.path;
          img.classList.add('thumbnail');
          img.onclick = () => openModal(i);
          grid.appendChild(img);
          imageList.push(item);
        }
      });
    });
}

function openModal(index) {
  currentIndex = index;
  const img = imageList[index];
  modalImg.src = img.path;
  document.getElementById('download-btn').href = img.path;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function showNext() {
  currentIndex = (currentIndex + 1) % imageList.length;
  openModal(currentIndex);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
  openModal(currentIndex);
}

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

loadImages(); // Initial load
