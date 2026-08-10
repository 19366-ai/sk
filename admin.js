// ===== STATE (in-memory, ไม่ใช้ localStorage) =====
let movies = MOVIES.map(m => ({...m}));
let editingId = null; // null = โหมดเพิ่มใหม่
let deletingId = null;

// เก็บค่ารูปภาพ/ไฟล์ชั่วคราวระหว่างกรอกฟอร์ม (base64 data URL)
let draft = { posterImage:null, bgImage:null, trailerFileData:null, trailerFileName:null, qrImage:null };

// ===== DOM =====
const tbody = document.getElementById('movieTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const overlay = document.getElementById('overlay');
const formPanel = document.getElementById('formPanel');
const formTitle = document.getElementById('formTitle');
const movieForm = document.getElementById('movieForm');
const toast = document.getElementById('toast');

// ===== TOAST =====
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), 2400);
}

// ===== RENDER TABLE =====
function renderTable(){
  const q = searchInput.value.trim().toLowerCase();
  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
  );

  if(filtered.length === 0){
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(m => `
    <tr>
      <td>
        <div class="row-poster">
          ${m.posterImage ? `<img src="${m.posterImage}" alt="${m.title}">` : (m.icon || '🎬')}
        </div>
      </td>
      <td>
        <div class="row-title">${m.title}</div>
        <div class="row-id">${m.id}</div>
      </td>
      <td>
        <div class="genre-tags">${(m.genre||[]).map(g=>`<span>${g}</span>`).join('')}</div>
      </td>
      <td>
        <span class="status-pill ${m.status}">${m.status === 'showing' ? 'กำลังฉาย' : 'กำลังจะเข้าฉาย'}</span>
      </td>
      <td>
        <div class="row-qr">${m.qrImage ? `<img src="${m.qrImage}" alt="QR">` : '—'}</div>
      </td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="แก้ไข" onclick="openEdit('${m.id}')">✎</button>
          <button class="icon-btn danger" title="ลบ" onclick="askDelete('${m.id}')">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

searchInput.addEventListener('input', renderTable);

// ===== OPEN / CLOSE FORM PANEL =====
function resetDraft(){
  draft = { posterImage:null, bgImage:null, trailerFileData:null, trailerFileName:null, qrImage:null };
}

function openForm(){
  overlay.classList.add('open');
  formPanel.classList.add('open');
}
function closeForm(){
  overlay.classList.remove('open');
  formPanel.classList.remove('open');
  movieForm.reset();
  resetDraft();
  updatePreviews();
  editingId = null;
  document.getElementById('f_id').disabled = false;
}

document.getElementById('addNewBtn').addEventListener('click', ()=>{
  closeForm();
  formTitle.textContent = 'เพิ่มหนังใหม่';
  openForm();
});
document.getElementById('panelClose').addEventListener('click', closeForm);
document.getElementById('cancelBtn').addEventListener('click', closeForm);
overlay.addEventListener('click', ()=>{
  if(formPanel.classList.contains('open')) closeForm();
});

function openEdit(id){
  const m = movies.find(x => x.id === id);
  if(!m) return;
  editingId = id;
  formTitle.textContent = `แก้ไข: ${m.title}`;

  document.getElementById('f_id').value = m.id;
  document.getElementById('f_id').disabled = true;
  document.getElementById('f_status').value = m.status || 'showing';
  document.getElementById('f_title').value = m.title || '';
  document.getElementById('f_genre').value = (m.genre||[]).join(', ');
  document.getElementById('f_duration').value = m.duration || '';
  document.getElementById('f_releaseDate').value = m.releaseDate || '';
  document.getElementById('f_cast').value = (m.cast||[]).join(', ');
  document.getElementById('f_synopsis').value = m.synopsis || '';
  document.getElementById('f_icon').value = m.icon || '';
  document.getElementById('f_trailerUrl').value = m.trailerUrl || '';
  document.getElementById('trailerFileName').textContent = m.trailerFileName ? `ไฟล์ที่แนบ: ${m.trailerFileName}` : '';

  draft.posterImage = m.posterImage || null;
  draft.bgImage = m.bgImage || null;
  draft.trailerFileData = m.trailerFileData || null;
  draft.trailerFileName = m.trailerFileName || null;
  draft.qrImage = m.qrImage || null;

  updatePreviews();
  openForm();
}

function updatePreviews(){
  const posterPreview = document.getElementById('posterPreview');
  posterPreview.innerHTML = draft.posterImage
    ? `<img src="${draft.posterImage}" alt="poster">`
    : (document.getElementById('f_icon').value || '🖼');

  const bgPreview = document.getElementById('bgPreview');
  bgPreview.innerHTML = draft.bgImage ? `<img src="${draft.bgImage}" alt="background">` : '🌌';

  const qrPreview = document.getElementById('qrPreview');
  qrPreview.innerHTML = draft.qrImage ? `<img src="${draft.qrImage}" alt="qr code">` : '<span>ยังไม่มี QR Code</span>';
}

// ===== FILE HELPERS =====
function readFileAsDataURL(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Poster upload
document.getElementById('posterBtn').addEventListener('click', ()=> document.getElementById('f_poster').click());
document.getElementById('f_poster').addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  draft.posterImage = await readFileAsDataURL(file);
  updatePreviews();
});
document.getElementById('posterClear').addEventListener('click', ()=>{
  draft.posterImage = null;
  document.getElementById('f_poster').value = '';
  updatePreviews();
});

// Background upload
document.getElementById('bgBtn').addEventListener('click', ()=> document.getElementById('f_bg').click());
document.getElementById('f_bg').addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  draft.bgImage = await readFileAsDataURL(file);
  updatePreviews();
});
document.getElementById('bgClear').addEventListener('click', ()=>{
  draft.bgImage = null;
  document.getElementById('f_bg').value = '';
  updatePreviews();
});

// Trailer file upload
document.getElementById('trailerBtn').addEventListener('click', ()=> document.getElementById('f_trailerFile').click());
document.getElementById('f_trailerFile').addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  draft.trailerFileData = await readFileAsDataURL(file);
  draft.trailerFileName = file.name;
  document.getElementById('trailerFileName').textContent = `ไฟล์ที่แนบ: ${file.name}`;
});

// QR upload
document.getElementById('qrUploadBtn').addEventListener('click', ()=> document.getElementById('f_qr').click());
document.getElementById('f_qr').addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  draft.qrImage = await readFileAsDataURL(file);
  updatePreviews();
});
document.getElementById('qrClearBtn').addEventListener('click', ()=>{
  draft.qrImage = null;
  document.getElementById('f_qr').value = '';
  updatePreviews();
});

// QR generate อัตโนมัติจาก Movie ID
document.getElementById('qrGenBtn').addEventListener('click', ()=>{
  const id = document.getElementById('f_id').value.trim();
  if(!id){
    showToast('กรุณากรอก Movie ID ก่อนสร้าง QR Code');
    return;
  }
  const qrData = encodeURIComponent(`AOU-CINEMA-BOOKING:${id}`);
  draft.qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0B2E4E&bgcolor=EAF6FD&data=${qrData}`;
  updatePreviews();
});

// อัปเดต preview poster เวลาพิมพ์ emoji
document.getElementById('f_icon').addEventListener('input', updatePreviews);

// ===== SAVE (SUBMIT) =====
movieForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  const id = document.getElementById('f_id').value.trim();
  const title = document.getElementById('f_title').value.trim();

  if(!id || !title){
    showToast('กรุณากรอก Movie ID และชื่อหนัง');
    return;
  }
  if(!editingId && movies.some(m => m.id === id)){
    showToast('Movie ID นี้ถูกใช้แล้ว กรุณาใช้รหัสอื่น');
    return;
  }

  const movieData = {
    id,
    title,
    status: document.getElementById('f_status').value,
    genre: document.getElementById('f_genre').value.split(',').map(s=>s.trim()).filter(Boolean),
    duration: document.getElementById('f_duration').value.trim(),
    releaseDate: document.getElementById('f_releaseDate').value.trim(),
    cast: document.getElementById('f_cast').value.split(',').map(s=>s.trim()).filter(Boolean),
    synopsis: document.getElementById('f_synopsis').value.trim(),
    icon: document.getElementById('f_icon').value.trim() || '🎬',
    posterImage: draft.posterImage,
    bgImage: draft.bgImage,
    trailerUrl: document.getElementById('f_trailerUrl').value.trim(),
    trailerFileData: draft.trailerFileData,
    trailerFileName: draft.trailerFileName,
    qrImage: draft.qrImage
  };

  if(editingId){
    const idx = movies.findIndex(m => m.id === editingId);
    movies[idx] = movieData;
    showToast(`บันทึกการแก้ไข "${title}" เรียบร้อย`);
  } else {
    movies.push(movieData);
    showToast(`เพิ่มหนัง "${title}" เรียบร้อย`);
  }

  renderTable();
  closeForm();
});

// ===== DELETE =====
const deleteOverlay = document.getElementById('deleteOverlay');
const deleteBox = document.getElementById('deleteBox');
const deleteMovieName = document.getElementById('deleteMovieName');

function askDelete(id){
  const m = movies.find(x => x.id === id);
  if(!m) return;
  deletingId = id;
  deleteMovieName.textContent = `"${m.title}" (${m.id}) จะถูกลบออกจากระบบอย่างถาวร`;
  deleteOverlay.classList.add('open');
  deleteBox.classList.add('open');
}
function closeDelete(){
  deleteOverlay.classList.remove('open');
  deleteBox.classList.remove('open');
  deletingId = null;
}
document.getElementById('deleteCancel').addEventListener('click', closeDelete);
deleteOverlay.addEventListener('click', closeDelete);
document.getElementById('deleteConfirm').addEventListener('click', ()=>{
  if(!deletingId) return;
  const m = movies.find(x => x.id === deletingId);
  movies = movies.filter(x => x.id !== deletingId);
  renderTable();
  showToast(`ลบหนัง "${m ? m.title : ''}" แล้ว`);
  closeDelete();
});

// ===== EXPORT movies-data.js =====
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const cleaned = movies.map(m => {
    const copy = {...m};
    // ตัด field รูปภาพ base64 ขนาดใหญ่ออกจากไฟล์ข้อมูลหลัก เพื่อไม่ให้ไฟล์บวมเกินไป
    // (รูปยังอยู่ในระบบระหว่าง session นี้ แต่ export จะเก็บเฉพาะข้อมูลหลัก + ลิงก์)
    return copy;
  });

  const content = `// ===== ข้อมูลหนังทั้งหมด (ส่งออกจากหน้า Admin) =====
const MOVIES = ${JSON.stringify(cleaned, null, 2)};

function getMovieById(id){
  return MOVIES.find(m => m.id === id);
}
`;

  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'movies-data.js';
  a.click();
  URL.revokeObjectURL(url);
  showToast('ส่งออกไฟล์ movies-data.js แล้ว — นำไปแทนที่ไฟล์เดิมเพื่อบันทึกถาวร');
});

// ===== INIT =====
renderTable();