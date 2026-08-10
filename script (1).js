function posterMarkup(m){
  if(m.Image){
    return `<img src="posters/${m.Image}" alt="${m.title}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'poster-fallback',textContent:'${m.icon || '🎬'}'}))">`;
  }
  return m.icon || '🎬';
}

function renderCards(list, containerId, badgeText){
  const container = document.getElementById(containerId);
  container.innerHTML = list.map(m => `
    <a class="movie-card" href="movie.html?id=${m.id}">
      <div class="poster">
        <span class="badge">${badgeText}</span>
        ${posterMarkup(m)}
      </div>
      <div class="card-body">
        <h3>${m.title}</h3>
        <div class="genre">${m.genre.map(g=>`<span>${g}</span>`).join('')}</div>
        <span class="detail-btn">ดูรายละเอียด</span>
      </div>
    </a>
  `).join('');
}

const nowShowing = MOVIES.filter(m => m.status === "showing");
const comingSoon = MOVIES.filter(m => m.status === "soon");

renderCards(nowShowing, "nowShowing", "NOW SHOWING");
renderCards(comingSoon, "comingSoon", "COMING SOON");