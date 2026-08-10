const params = new URLSearchParams(window.location.search);
const movieId = params.get('id');
const movie = getMovieById(movieId);

const wrap = document.getElementById('detailWrap');
const crumbTitle = document.getElementById('crumbTitle');

// ======================================================
// ไม่พบข้อมูลหนัง
// ======================================================
if (!movie) {

  wrap.innerHTML = `
    <div class="not-found">
      <h1>ไม่พบข้อมูลหนังที่คุณค้นหา</h1>
      <p>
        หนังเรื่องนี้อาจถูกนำออกจากระบบ หรือลิงก์ไม่ถูกต้อง
      </p>
      <br>
      <a href="index.html">
        ← กลับหน้าหลัก
      </a>
    </div>
  `;

}

// ======================================================
// พบข้อมูลหนัง
// ======================================================
else {

  document.title = `${movie.title}`;

  if (crumbTitle) {
    crumbTitle.textContent = movie.title;
  }

  // ==================================================
  // สถานะหนัง
  // ==================================================
  const statusLabel = movie.status === "showing" ? "NOW SHOWING" : "COMING SOON";

  // ==================================================
  // Poster
  // ==================================================
  const posterHtml = movie.Image
    ? `
      <img
        src="posters/${movie.Image}"
        alt="${movie.title}"
        onerror="
          this.replaceWith(
            Object.assign(
              document.createElement('div'),
              {
                className: 'poster-fallback',
                textContent: '${movie.icon || '🎬'}'
              }
            )
          )
        "
      >
    `
    : `
      <div class="poster-fallback">
        ${movie.icon || '🎬'}
      </div>
    `;

  // ==================================================
  // Genre
  // ==================================================
  const genreHtml = Array.isArray(movie.genre)
    ? movie.genre
        .map(g => `<span>${g}</span>`)
        .join('')
    : `<span>${movie.genre || 'ไม่ระบุประเภท'}</span>`;

  // ==================================================
  // Cast
  // ==================================================
  const castHtml = Array.isArray(movie.cast)
    ? movie.cast
        .map(c => `<span>${c}</span>`)
        .join('')
    : `<span>${movie.cast || 'ไม่ระบุ'}</span>`;

  // ==================================================
  // QR Code หนัง (แสดงในหน้า)
  // ==================================================
  const qrHtml = `
    <div class="detail-section">
      <h2>QR Code หนัง</h2>
      <div class="qr-square" id="qrDisplayBox">
        <img id="qrImage" src="" alt="QR Code สำหรับจองตั๋ว - ${movie.title}" class="qr-square-img">
      </div>
    </div>
  `;

  // ==================================================
  // ปุ่ม QR ดูคลิป
  // ==================================================
  const videoQRButton = movie.videoUrl
    ? `
      <button
        id="videoQrBtn"
        class="video-qr-btn"
        type="button"
      >
        📱 QR ดูคลิป
      </button>
    `
    : '';

  // ==================================================
  // สร้างหน้า Detail
  // ==================================================
  wrap.innerHTML = `
    <div class="detail-card">

      <!-- ========================== POSTER =========================== -->
      <div class="detail-poster">
        <span class="status-badge">
          ${statusLabel}
        </span>
        ${posterHtml}
      </div>

      <!-- ========================== INFORMATION =========================== -->
      <div class="detail-info">

        <h1>
          ${movie.title}
        </h1>

        <!-- GENRE -->
        <div class="detail-genre">
          ${genreHtml}
        </div>

        <!-- META -->
        <div class="meta-grid">
          <div class="meta-item">
            <div class="label">
              ⏱ ระยะเวลา
            </div>
            <div class="value">
              ${movie.duration || '-'}
            </div>
          </div>

          <div class="meta-item">
            <div class="label">
              📅 วันที่จัดทำ
            </div>
            <div class="value">
              ${movie.releaseDate || '-'}
            </div>
          </div>
        </div>

        <!-- ========================== SYNOPSIS =========================== -->
        <div class="detail-section">
          <h2>
            เรื่องย่อ
          </h2>
          <p>
            ${movie.synopsis || 'ไม่มีข้อมูลเรื่องย่อ'}
          </p>
        </div>

        <!-- ========================== CAST =========================== -->
        <div class="detail-section">
          <h2>
            ผู้จัดทำ
          </h2>
          <div class="cast-list">
            ${castHtml}
          </div>
        </div>

        

        <!-- ========================== VIDEO QR BUTTON =========================== -->
        ${
          movie.videoUrl
            ? `
              <div class="movie-actions">
                <button
                  id="videoQrBtn"
                  class="video-qr-btn"
                  type="button"
                >
                  📱 QR ดูคลิป
                </button>
              </div>
            `
            : ''
        }

      </div>
    </div>
  `;

  // ==================================================
  // เซ็ต QR Code หนัง (movie.QR ถ้ามี ไม่งั้น generate จาก id)
  // ==================================================
  const qrImageEl = document.getElementById('qrImage');

  if (qrImageEl) {
    qrImageEl.src = movie.QR
      ? `qr/${movie.QR}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=0B2E4E&bgcolor=EAF6FD&data=${encodeURIComponent(`AOU-CINEMA-BOOKING:${movie.id}`)}`;
  }

  // ==================================================
  // VIDEO QR
  // ==================================================
  const videoQrBtn = document.getElementById('videoQrBtn');
  const videoQrModal = document.getElementById('videoQrModal');
  const videoQrImg = document.getElementById('videoQrImg');
  const videoQrTitle = document.getElementById('videoQrTitle');
  const videoQrClose = document.getElementById('videoQrClose');

  // ==================================================
  // ตรวจสอบว่ามี videoUrl
  // ==================================================
  if (
    movie.videoUrl &&
    videoQrBtn &&
    videoQrModal &&
    videoQrImg &&
    videoQrTitle
  ) {

    // ==============================================
    // กดปุ่ม QR ดูคลิป
    // ==============================================
    videoQrBtn.addEventListener('click', () => {

      const qrData = encodeURIComponent(movie.videoUrl);

      // ==========================================
      // สร้าง QR Code อัตโนมัติ
      // ==========================================
      videoQrImg.src =
        `https://api.qrserver.com/v1/create-qr-code/` +
        `?size=250x250` +
        `&color=0B2E4E` +
        `&bgcolor=EAF6FD` +
        `&data=${qrData}`;

      // ชื่อหนัง
      videoQrTitle.textContent = movie.title;

      // เปิด Modal
      videoQrModal.classList.add('open');

    });
  }

  // ==================================================
  // ปิด VIDEO QR
  // ==================================================
  if (videoQrClose && videoQrModal) {
    videoQrClose.addEventListener('click', () => {
      videoQrModal.classList.remove('open');
    });
  }

  // ==================================================
  // คลิกพื้นหลังเพื่อปิด QR
  // ==================================================
  if (videoQrModal) {
    videoQrModal.addEventListener('click', (e) => {
      if (e.target === videoQrModal) {
        videoQrModal.classList.remove('open');
      }
    });
    function getMovieById(id){
  return MOVIES.find(m => m.id === id);
}

// ตรวจสอบ id ซ้ำ (เตือนใน console เท่านั้น ไม่กระทบการทำงาน)
(function checkDuplicateIds(){
  const ids = MOVIES.map(m => m.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) {
    console.warn('⚠️ พบ Movie ID ซ้ำ:', [...new Set(dup)]);
  }
})();
  }

}