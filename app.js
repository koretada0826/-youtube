// ===== サンプルデータ =====
const channels = [
  { id: 1, name: "テックラボ", subs: "42万人", subsCount: 420000, color: "#ff4444", avatar: "https://ui-avatars.com/api/?name=TL&background=ff4444&color=fff&size=80" },
  { id: 2, name: "ゲーム道場", subs: "128万人", subsCount: 1280000, color: "#44aa44", avatar: "https://ui-avatars.com/api/?name=GD&background=44aa44&color=fff&size=80" },
  { id: 3, name: "料理マスター", subs: "87万人", subsCount: 870000, color: "#ff8800", avatar: "https://ui-avatars.com/api/?name=RM&background=ff8800&color=fff&size=80" },
  { id: 4, name: "旅するカメラ", subs: "35万人", subsCount: 350000, color: "#4488ff", avatar: "https://ui-avatars.com/api/?name=TC&background=4488ff&color=fff&size=80" },
  { id: 5, name: "音楽スタジオ", subs: "256万人", subsCount: 2560000, color: "#aa44ff", avatar: "https://ui-avatars.com/api/?name=MS&background=aa44ff&color=fff&size=80" },
  { id: 6, name: "サイエンスTV", subs: "19万人", subsCount: 190000, color: "#00aaaa", avatar: "https://ui-avatars.com/api/?name=ST&background=00aaaa&color=fff&size=80" },
  { id: 7, name: "フィットネスPro", subs: "63万人", subsCount: 630000, color: "#ff4488", avatar: "https://ui-avatars.com/api/?name=FP&background=ff4488&color=fff&size=80" },
  { id: 8, name: "アニメレビュー", subs: "95万人", subsCount: 950000, color: "#8844ff", avatar: "https://ui-avatars.com/api/?name=AR&background=8844ff&color=fff&size=80" },
];

const myChannel = { id: 99, name: 'マイチャンネル', subs: '0人', subsCount: 0, color: '#888', avatar: 'https://ui-avatars.com/api/?name=U&background=888888&color=fff&size=80' };

const thumbnailColors = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
  "#1abc9c", "#e67e22", "#34495e", "#e91e63", "#00bcd4",
  "#8bc34a", "#ff5722", "#607d8b", "#795548", "#673ab7", "#009688"
];

// ===== ユーティリティ =====
function generateThumbnail(title, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 640, 360);
  grd.addColorStop(0, color); grd.addColorStop(1, shadeColor(color, -30));
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 640, 360);
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 640, Math.random() * 360, Math.random() * 120 + 40, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(320, 160, 40, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(308, 140); ctx.lineTo(308, 180); ctx.lineTo(342, 160); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.font = 'bold 28px Roboto, sans-serif'; ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
  wrapText(ctx, title, 320, 240, 560, 36);
  return canvas.toDataURL();
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split(''); let line = ''; const lines = [];
  for (const c of chars) {
    if (ctx.measureText(line + c).width > maxWidth) { lines.push(line); line = c; }
    else { line += c; }
  }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16), G = parseInt(color.substring(3, 5), 16), B = parseInt(color.substring(5, 7), 16);
  R = Math.min(255, Math.max(0, R + Math.round(R * percent / 100)));
  G = Math.min(255, Math.max(0, G + Math.round(G * percent / 100)));
  B = Math.min(255, Math.max(0, B + Math.round(B * percent / 100)));
  return `#${(R << 16 | G << 8 | B).toString(16).padStart(6, '0')}`;
}
function randomDuration() {
  return `${Math.floor(Math.random() * 30) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
}
function randomViews() {
  const n = Math.floor(Math.random() * 500) + 1;
  return n >= 100 ? `${(n / 10).toFixed(0)}万回視聴` : `${n}万回視聴`;
}
function randomDate() {
  const d = Math.floor(Math.random() * 365);
  if (d === 0) return '今日'; if (d === 1) return '1日前';
  if (d < 7) return `${d}日前`; if (d < 30) return `${Math.floor(d / 7)}週間前`;
  if (d < 365) return `${Math.floor(d / 30)}か月前`; return '1年前';
}
function formatNumber(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString();
}
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

// ===== 状態管理 =====
const state = {
  currentPage: 'home',
  currentVideoId: null,
  subscribedChannels: new Set(),
  likedVideos: new Set(),
  dislikedVideos: new Set(),
  savedVideos: new Set(),
  watchHistory: [],       // 視聴済みvideoのid（新しい順）
};

// ===== 動画データ =====
const videoTitles = [
  "【完全解説】最新AIプログラミング入門 2024年版","世界一美味いパスタの作り方を発見した",
  "1000時間プレイして分かった最強ビルド","【旅vlog】京都の隠れた名所を巡る",
  "プロが教える筋トレの正しいフォーム","【衝撃】最新の宇宙発見がヤバすぎる",
  "初心者でも弾けるギター練習法TOP5","今期アニメ全作品レビュー 本音で語る",
  "React vs Vue 2024年 どちらを選ぶべき？","【大食い】巨大ラーメンチャレンジ",
  "ガジェットレビュー 買ってよかったBEST10","猫と暮らす日常 かわいすぎる瞬間まとめ",
  "DIY 100均アイテムで作るインテリア","【検証】一週間水だけ生活やってみた",
  "新作ゲーム実況 初見プレイ#1","プロジェクトマネジメント基礎講座",
  "【ピアノ】超絶技巧で弾いてみた","東京グルメ探訪 行列のできるお店",
  "Pythonでデータ分析 実践チュートリアル","【ホラー】深夜の廃墟探索が怖すぎた",
  "最新スマホ徹底比較 iPhone vs Android","簡単おうちカフェレシピ3選",
  "マインクラフト建築 中世の城を作る","数学を面白く学ぶ方法を教えます",
];
const videoCategories = [
  "プログラミング","料理","ゲーム","旅行","スポーツ","教育",
  "音楽","アニメ","プログラミング","料理","プログラミング","ペット",
  "教育","スポーツ","ゲーム","教育","音楽","料理",
  "プログラミング","ゲーム","プログラミング","料理","ゲーム","教育"
];
const commentTexts = [
  "とても参考になりました！ありがとうございます。","この動画を待ってました！最高です。",
  "わかりやすい説明で助かりました。","毎日見てます！次の動画も楽しみにしています。",
  "これは神動画ですね....","初めてコメントします。チャンネル登録しました！",
  "5:30 のところが特に面白かったです！","もっと詳しく教えてほしいです。パート2お願いします！",
  "素晴らしいクオリティですね。プロの仕事だ。","友達にもシェアしました。みんなに見てほしい！",
];
const commentAuthors = ["たかし","さくら","ゆうき","あおい","はると","みお","そうた","ひなた","れん","ゆい"];

const videos = videoTitles.map((title, i) => {
  const channel = channels[i % channels.length];
  const color = thumbnailColors[i % thumbnailColors.length];
  return {
    id: i + 1, title, channel,
    thumbnail: generateThumbnail(title, color),
    duration: randomDuration(), views: randomViews(), date: randomDate(),
    category: videoCategories[i],
    likes: Math.floor(Math.random() * 50000) + 1000,
    dislikes: Math.floor(Math.random() * 1000),
    description: `${title}\n\nこの動画では${title.replace(/【.*?】/g, '').trim()}について詳しく解説しています。\nチャンネル登録と高評価をお願いします！\n\n#ViewTube #${videoCategories[i]}`,
    comments: Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, ci) => ({
      id: `${i + 1}-${ci}`,
      author: commentAuthors[Math.floor(Math.random() * commentAuthors.length)],
      text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      date: randomDate(), likes: Math.floor(Math.random() * 500), liked: false,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(commentAuthors[Math.floor(Math.random() * commentAuthors.length)].charAt(0))}&background=random&size=40`,
    })),
  };
});

// ===== DOM =====
const videoGrid = document.getElementById('video-grid');
const watchPage = document.getElementById('watch-page');
const sidebarEl = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const chipsBar = document.getElementById('chips-bar');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const pageHeader = document.getElementById('page-header');
const emptyState = document.getElementById('empty-state');
const channelPage = document.getElementById('channel-page');

// ======================================================
// サイドバー描画（登録チャンネルを動的更新）
// ======================================================
function renderSidebar() {
  const items = [
    { page: 'home', icon: 'home', label: 'ホーム' },
    { page: 'explore', icon: 'explore', label: '探索' },
    { page: 'subscriptions', icon: 'subscriptions', label: '登録チャンネル' },
  ];
  const items2 = [
    { page: 'library', icon: 'video_library', label: 'ライブラリ' },
    { page: 'history', icon: 'history', label: '履歴' },
    { page: 'watch-later', icon: 'watch_later', label: '後で見る' },
    { page: 'liked', icon: 'thumb_up', label: '高評価の動画' },
  ];

  let html = '<div class="sidebar-section">';
  items.forEach(it => {
    html += `<a href="#" class="sidebar-item ${state.currentPage === it.page ? 'active' : ''}" data-page="${it.page}">
      <span class="material-icons">${it.icon}</span><span class="sidebar-label">${it.label}</span></a>`;
  });
  html += '</div><hr class="sidebar-divider"><div class="sidebar-section">';
  items2.forEach(it => {
    html += `<a href="#" class="sidebar-item ${state.currentPage === it.page ? 'active' : ''}" data-page="${it.page}">
      <span class="material-icons">${it.icon}</span><span class="sidebar-label">${it.label}</span></a>`;
  });
  html += '</div>';

  // 登録チャンネル一覧
  if (state.subscribedChannels.size > 0) {
    html += '<hr class="sidebar-divider"><div class="sidebar-section"><h3 class="sidebar-heading">登録チャンネル</h3>';
    const allCh = [...channels, myChannel];
    state.subscribedChannels.forEach(chId => {
      const ch = allCh.find(c => c.id === chId);
      if (ch) {
        html += `<a href="#" class="sidebar-item" data-channel-id="${ch.id}">
          <img src="${ch.avatar}" class="sidebar-avatar" alt=""><span class="sidebar-label">${ch.name}</span></a>`;
      }
    });
    html += '</div>';
  }

  sidebarEl.innerHTML = html;

  // サイドバーのクリックイベント
  sidebarEl.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });
  sidebarEl.querySelectorAll('[data-channel-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openChannelPage(parseInt(el.dataset.channelId));
    });
  });
}

// ======================================================
// ページナビゲーション
// ======================================================
function navigateTo(page) {
  // 動画ページが開いてたら閉じる
  if (watchPage.classList.contains('active')) closeVideo();

  state.currentPage = page;
  renderSidebar();

  // すべてのコンテンツ領域を隠す
  chipsBar.style.display = 'none';
  videoGrid.style.display = 'none';
  pageHeader.style.display = 'none';
  emptyState.style.display = 'none';
  channelPage.style.display = 'none';

  switch (page) {
    case 'home':
      chipsBar.style.display = '';
      videoGrid.style.display = '';
      // チップを「すべて」に
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      document.querySelector('.chip').classList.add('active');
      renderVideoGrid(videos);
      break;

    case 'explore':
      showPageHeader('explore', '探索');
      // 探索：ランダム順で全動画
      const shuffled = [...videos].sort(() => Math.random() - 0.5);
      videoGrid.style.display = '';
      renderVideoGrid(shuffled);
      break;

    case 'subscriptions':
      showPageHeader('subscriptions', '登録チャンネル');
      if (state.subscribedChannels.size === 0) {
        showEmpty('subscriptions', 'まだチャンネルを登録していません\n動画を視聴してチャンネル登録してみましょう');
      } else {
        const subVideos = videos.filter(v => state.subscribedChannels.has(v.channel.id));
        if (subVideos.length === 0) {
          showEmpty('subscriptions', '登録チャンネルの動画はまだありません');
        } else {
          videoGrid.style.display = '';
          renderVideoGrid(subVideos);
        }
      }
      break;

    case 'library':
      showPageHeader('video_library', 'ライブラリ');
      const libVideos = [...new Set([...state.watchHistory, ...state.savedVideos])].map(id => videos.find(v => v.id === id)).filter(Boolean);
      if (libVideos.length === 0) {
        showEmpty('video_library', '動画を視聴したり保存するとここに表示されます');
      } else {
        videoGrid.style.display = '';
        renderVideoGrid(libVideos);
      }
      break;

    case 'history':
      showPageHeader('history', '履歴');
      const histVideos = state.watchHistory.map(id => videos.find(v => v.id === id)).filter(Boolean);
      if (histVideos.length === 0) {
        showEmpty('history', 'まだ動画を視聴していません\n視聴した動画がここに表示されます');
      } else {
        videoGrid.style.display = '';
        renderVideoGrid(histVideos);
      }
      break;

    case 'watch-later':
      showPageHeader('watch_later', '後で見る');
      const savedArr = [...state.savedVideos].map(id => videos.find(v => v.id === id)).filter(Boolean);
      if (savedArr.length === 0) {
        showEmpty('watch_later', '保存した動画はまだありません\n動画の「保存」ボタンで追加できます');
      } else {
        videoGrid.style.display = '';
        renderVideoGrid(savedArr);
      }
      break;

    case 'liked':
      showPageHeader('thumb_up', '高評価の動画');
      const likedArr = [...state.likedVideos].map(id => videos.find(v => v.id === id)).filter(Boolean);
      if (likedArr.length === 0) {
        showEmpty('thumb_up', '高評価した動画はまだありません\n動画の「いいね」ボタンで追加できます');
      } else {
        videoGrid.style.display = '';
        renderVideoGrid(likedArr);
      }
      break;
  }
}

function showPageHeader(icon, title) {
  pageHeader.style.display = '';
  document.getElementById('page-header-icon').textContent = icon;
  document.getElementById('page-header-title').textContent = title;
}

function showEmpty(icon, text) {
  emptyState.style.display = '';
  document.getElementById('empty-state-icon').textContent = icon;
  document.getElementById('empty-state-text').textContent = text;
}

// ======================================================
// チャンネルページ
// ======================================================
function openChannelPage(channelId) {
  if (watchPage.classList.contains('active')) closeVideo();

  const allCh = [...channels, myChannel];
  const ch = allCh.find(c => c.id === channelId);
  if (!ch) return;

  state.currentPage = 'channel';
  renderSidebar();

  chipsBar.style.display = 'none';
  videoGrid.style.display = 'none';
  pageHeader.style.display = 'none';
  emptyState.style.display = 'none';
  channelPage.style.display = '';

  document.getElementById('channel-banner').style.background =
    `linear-gradient(135deg, ${ch.color}, ${shadeColor(ch.color, -30)})`;
  document.getElementById('channel-page-avatar').src = ch.avatar;
  document.getElementById('channel-page-name').textContent = ch.name;
  document.getElementById('channel-page-subs').textContent = `チャンネル登録者数 ${ch.subs}`;

  // 登録ボタン
  const subBtn = document.getElementById('channel-page-subscribe-btn');
  updateChannelSubscribeBtn(subBtn, channelId);
  subBtn.onclick = () => {
    toggleSubscribe(channelId);
    updateChannelSubscribeBtn(subBtn, channelId);
    renderSidebar();
  };

  // このチャンネルの動画
  const chVideos = videos.filter(v => v.channel.id === channelId);
  const grid = document.getElementById('channel-page-videos');
  grid.innerHTML = chVideos.map(v => videoCardHTML(v)).join('');
  grid.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => openVideo(parseInt(card.dataset.id)));
  });
}

function updateChannelSubscribeBtn(btn, channelId) {
  if (state.subscribedChannels.has(channelId)) {
    btn.classList.add('subscribed');
    btn.textContent = '登録済み';
  } else {
    btn.classList.remove('subscribed');
    btn.textContent = 'チャンネル登録';
  }
}

// ======================================================
// 動画カード
// ======================================================
function videoCardHTML(v) {
  return `
    <div class="video-card" data-id="${v.id}">
      <div class="thumbnail-wrapper">
        <img class="thumbnail" src="${v.thumbnail}" alt="${v.title}">
        <span class="duration-badge">${v.duration}</span>
      </div>
      <div class="video-info">
        <img class="channel-avatar" src="${v.channel.avatar}" alt="${v.channel.name}" data-channel-id="${v.channel.id}">
        <div class="video-details">
          <div class="video-title">${v.title}</div>
          <span class="video-channel" data-channel-id="${v.channel.id}">${v.channel.name}</span>
          <span class="video-stats">${v.views} ・ ${v.date}</span>
        </div>
      </div>
    </div>`;
}

function renderVideoGrid(filteredVideos) {
  videoGrid.innerHTML = filteredVideos.map(v => videoCardHTML(v)).join('');
  videoGrid.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // チャンネルアバター or チャンネル名クリック → チャンネルページ
      const chEl = e.target.closest('[data-channel-id]');
      if (chEl && !e.target.closest('.thumbnail-wrapper') && !e.target.closest('.video-title')) {
        e.stopPropagation();
        openChannelPage(parseInt(chEl.dataset.channelId));
        return;
      }
      openVideo(parseInt(card.dataset.id));
    });
  });
}

// ======================================================
// 動画再生ページ
// ======================================================
function openVideo(id) {
  const video = videos.find(v => v.id === id);
  if (!video) return;
  state.currentVideoId = id;

  // 履歴に追加（重複排除・先頭に）
  state.watchHistory = [id, ...state.watchHistory.filter(x => x !== id)];

  document.getElementById('watch-title').textContent = video.title;
  document.getElementById('watch-channel-avatar').src = video.channel.avatar;
  document.getElementById('watch-channel-name').textContent = video.channel.name;
  document.getElementById('watch-channel-subs').textContent = `チャンネル登録者数 ${video.channel.subs}`;
  document.getElementById('watch-views').textContent = video.views;
  document.getElementById('watch-date').textContent = video.date;
  document.getElementById('watch-desc-text').textContent = video.description;

  updateLikeUI(video);
  updateSubscribeUI(video.channel.id);
  updateSaveUI(video.id);
  renderComments(video);
  renderRelatedVideos(id);
  resetPlayer(video);

  // チャンネル名クリックでチャンネルページ
  document.getElementById('watch-channel-name').onclick = () => {
    closeVideo();
    openChannelPage(video.channel.id);
  };
  document.getElementById('watch-channel-avatar').onclick = () => {
    closeVideo();
    openChannelPage(video.channel.id);
  };

  watchPage.classList.add('active');
  sidebarEl.style.display = 'none';
  document.body.style.overflow = 'hidden';
  watchPage.scrollTop = 0;
}

function updateLikeUI(video) {
  const likeBtn = document.getElementById('like-btn');
  const dislikeBtn = document.getElementById('dislike-btn');
  document.getElementById('like-count').textContent = formatNumber(video.likes);
  likeBtn.classList.toggle('active', state.likedVideos.has(video.id));
  dislikeBtn.classList.toggle('active', state.dislikedVideos.has(video.id));
}

function updateSubscribeUI(channelId) {
  const btn = document.getElementById('subscribe-btn');
  if (state.subscribedChannels.has(channelId)) {
    btn.classList.add('subscribed');
    btn.textContent = '登録済み';
  } else {
    btn.classList.remove('subscribed');
    btn.textContent = 'チャンネル登録';
  }
}

function updateSaveUI(videoId) {
  const saveBtn = document.getElementById('save-btn');
  if (state.savedVideos.has(videoId)) {
    saveBtn.classList.add('active');
    saveBtn.querySelector('span:last-child').textContent = '保存済み';
  } else {
    saveBtn.classList.remove('active');
    saveBtn.querySelector('span:last-child').textContent = '保存';
  }
}

function toggleSubscribe(channelId) {
  if (state.subscribedChannels.has(channelId)) {
    state.subscribedChannels.delete(channelId);
    showToast('チャンネル登録を解除しました');
  } else {
    state.subscribedChannels.add(channelId);
    showToast('チャンネルを登録しました');
  }
}

function closeVideo() {
  watchPage.classList.remove('active');
  sidebarEl.style.display = '';
  document.body.style.overflow = '';
  clearInterval(playerInterval);
  playerPlaying = false;
  state.currentVideoId = null;
  // サイドバーを再描画（登録チャンネルが更新されている可能性）
  renderSidebar();
}

// ======================================================
// コメント
// ======================================================
function renderComments(video) {
  document.getElementById('comments-count').textContent = `${video.comments.length} 件のコメント`;
  document.getElementById('comments-list').innerHTML = video.comments.map(c => `
    <div class="comment-item" data-comment-id="${c.id}">
      <img class="comment-avatar" src="${c.avatar}" alt="">
      <div class="comment-body">
        <div class="comment-author">${escapeHtml(c.author)}<span>${c.date}</span></div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
        <div class="comment-actions">
          <button class="comment-like-btn ${c.liked ? 'active' : ''}" data-comment-id="${c.id}">
            <span class="material-icons">${c.liked ? 'thumb_up' : 'thumb_up_off_alt'}</span>
            <span class="comment-like-count">${c.likes}</span>
          </button>
          <button class="comment-dislike-btn"><span class="material-icons">thumb_down_off_alt</span></button>
          <button class="comment-reply-btn" data-comment-id="${c.id}">返信</button>
        </div>
      </div>
    </div>
  `).join('');
}

document.getElementById('comments-list').addEventListener('click', (e) => {
  const video = videos.find(v => v.id === state.currentVideoId);
  if (!video) return;
  const likeBtn = e.target.closest('.comment-like-btn');
  if (likeBtn) {
    const c = video.comments.find(c => c.id === likeBtn.dataset.commentId);
    if (c) {
      c.liked = !c.liked; c.likes += c.liked ? 1 : -1;
      likeBtn.classList.toggle('active');
      likeBtn.querySelector('.material-icons').textContent = c.liked ? 'thumb_up' : 'thumb_up_off_alt';
      likeBtn.querySelector('.comment-like-count').textContent = c.likes;
    }
    return;
  }
  const replyBtn = e.target.closest('.comment-reply-btn');
  if (replyBtn) {
    const c = video.comments.find(c => c.id === replyBtn.dataset.commentId);
    if (c) {
      const input = document.getElementById('comment-input');
      input.value = `@${c.author} `;
      input.focus();
    }
  }
});

document.getElementById('comment-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }
});

function submitComment() {
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text) return;
  const video = videos.find(v => v.id === state.currentVideoId);
  if (!video) return;
  video.comments.unshift({
    id: `${video.id}-${Date.now()}`, author: 'あなた', text, date: '今',
    likes: 0, liked: false,
    avatar: 'https://ui-avatars.com/api/?name=U&background=888888&color=fff&size=40',
  });
  input.value = '';
  renderComments(video);
  showToast('コメントを投稿しました');
}

// ======================================================
// 関連動画
// ======================================================
function renderRelatedVideos(currentId) {
  const related = videos.filter(v => v.id !== currentId).sort(() => Math.random() - 0.5).slice(0, 15);
  document.getElementById('related-videos').innerHTML = related.map(v => `
    <div class="related-card" data-id="${v.id}">
      <div class="related-thumb-wrapper">
        <img src="${v.thumbnail}" alt="${v.title}"><span class="duration-badge">${v.duration}</span>
      </div>
      <div class="related-info">
        <div class="related-title">${v.title}</div>
        <div class="related-channel">${v.channel.name}</div>
        <div class="related-stats">${v.views} ・ ${v.date}</div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.related-card').forEach(card => {
    card.addEventListener('click', () => openVideo(parseInt(card.dataset.id)));
  });
}

// ======================================================
// プレイヤー（時間シミュレーション）
// ======================================================
let playerInterval = null, playerTime = 0, playerDuration = 0, playerPlaying = false;

function resetPlayer(video) {
  clearInterval(playerInterval); playerTime = 0; playerPlaying = false;
  const p = video.duration.split(':');
  playerDuration = parseInt(p[0]) * 60 + parseInt(p[1]);
  document.getElementById('time-display').textContent = `0:00 / ${video.duration}`;
  document.getElementById('progress-played').style.width = '0%';
  document.getElementById('progress-handle').style.left = '0%';
  document.getElementById('play-pause-btn').querySelector('.material-icons').textContent = 'play_arrow';
  document.getElementById('player-overlay').style.display = 'flex';
}
function togglePlay() { playerPlaying ? pausePlayer() : playPlayer(); }
function playPlayer() {
  playerPlaying = true;
  document.getElementById('play-pause-btn').querySelector('.material-icons').textContent = 'pause';
  document.getElementById('player-overlay').style.display = 'none';
  clearInterval(playerInterval);
  playerInterval = setInterval(() => {
    playerTime++;
    if (playerTime >= playerDuration) { playerTime = playerDuration; pausePlayer(); }
    updatePlayerUI();
  }, 1000);
}
function pausePlayer() {
  playerPlaying = false; clearInterval(playerInterval);
  document.getElementById('play-pause-btn').querySelector('.material-icons').textContent = 'play_arrow';
  const o = document.getElementById('player-overlay'); o.style.display = 'flex';
  o.querySelector('.material-icons').textContent = 'play_arrow';
}
function updatePlayerUI() {
  const pct = (playerTime / playerDuration) * 100;
  document.getElementById('progress-played').style.width = `${pct}%`;
  document.getElementById('progress-handle').style.left = `${pct}%`;
  const cm = Math.floor(playerTime / 60), cs = playerTime % 60;
  const dm = Math.floor(playerDuration / 60), ds = playerDuration % 60;
  document.getElementById('time-display').textContent =
    `${cm}:${cs.toString().padStart(2,'0')} / ${dm}:${ds.toString().padStart(2,'0')}`;
}

document.getElementById('player-overlay').addEventListener('click', togglePlay);
document.getElementById('play-pause-btn').addEventListener('click', togglePlay);
document.getElementById('progress-bar').addEventListener('click', (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  playerTime = Math.floor(((e.clientX - r.left) / r.width) * playerDuration);
  updatePlayerUI();
  if (!playerPlaying) playPlayer();
});
document.getElementById('volume-slider').addEventListener('input', (e) => {
  const v = parseInt(e.target.value);
  const ic = document.getElementById('volume-btn').querySelector('.material-icons');
  ic.textContent = v === 0 ? 'volume_off' : v < 50 ? 'volume_down' : 'volume_up';
});
document.getElementById('volume-btn').addEventListener('click', () => {
  const s = document.getElementById('volume-slider');
  const ic = document.getElementById('volume-btn').querySelector('.material-icons');
  if (parseInt(s.value) > 0) { s.dataset.prev = s.value; s.value = 0; ic.textContent = 'volume_off'; }
  else { s.value = s.dataset.prev || 100; ic.textContent = parseInt(s.value) < 50 ? 'volume_down' : 'volume_up'; }
});
document.getElementById('fullscreen-btn').addEventListener('click', () => {
  const p = document.getElementById('player');
  if (!document.fullscreenElement) p.requestFullscreen().catch(() => {});
  else document.exitFullscreen();
});

// ======================================================
// いいね / 低評価 / 登録 / 共有 / 保存
// ======================================================
document.getElementById('like-btn').addEventListener('click', () => {
  const v = videos.find(v => v.id === state.currentVideoId); if (!v) return;
  if (state.likedVideos.has(v.id)) { state.likedVideos.delete(v.id); v.likes--; }
  else {
    state.likedVideos.add(v.id); v.likes++;
    if (state.dislikedVideos.has(v.id)) { state.dislikedVideos.delete(v.id); v.dislikes--; }
  }
  updateLikeUI(v);
});

document.getElementById('dislike-btn').addEventListener('click', () => {
  const v = videos.find(v => v.id === state.currentVideoId); if (!v) return;
  if (state.dislikedVideos.has(v.id)) { state.dislikedVideos.delete(v.id); v.dislikes--; }
  else {
    state.dislikedVideos.add(v.id); v.dislikes++;
    if (state.likedVideos.has(v.id)) { state.likedVideos.delete(v.id); v.likes--; }
  }
  updateLikeUI(v);
});

document.getElementById('subscribe-btn').addEventListener('click', () => {
  const v = videos.find(v => v.id === state.currentVideoId); if (!v) return;
  toggleSubscribe(v.channel.id);
  updateSubscribeUI(v.channel.id);
  renderSidebar();
});

document.getElementById('share-btn').addEventListener('click', () => {
  const v = videos.find(v => v.id === state.currentVideoId); if (!v) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`https://viewtube.example.com/watch?v=${v.id}`).then(() => showToast('リンクをコピーしました'));
  } else { showToast('リンク: viewtube.example.com/watch?v=' + v.id); }
});

document.getElementById('save-btn').addEventListener('click', () => {
  const v = videos.find(v => v.id === state.currentVideoId); if (!v) return;
  if (state.savedVideos.has(v.id)) {
    state.savedVideos.delete(v.id);
    showToast('「後で見る」から削除しました');
  } else {
    state.savedVideos.add(v.id);
    showToast('「後で見る」に追加しました');
  }
  updateSaveUI(v.id);
});

// ======================================================
// トースト
// ======================================================
function showToast(message) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast';
    const btm = window.innerWidth <= 640 ? '100px' : '40px';
    t.style.cssText = `position:fixed;bottom:${btm};left:50%;transform:translateX(-50%);background:#fff;color:#0f0f0f;padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;max-width:90vw;text-align:center;`;
    document.body.appendChild(t);
  }
  t.textContent = message; t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

// ======================================================
// ヘッダー操作
// ======================================================
document.querySelector('.logo').addEventListener('click', (e) => {
  e.preventDefault();
  if (watchPage.classList.contains('active')) closeVideo();
  if (uploadPage.classList.contains('active')) closeUploadPage();
  navigateTo('home');
});

// サイドバー開閉（モバイルはオーバーレイ付き）
const sidebarOverlay = document.getElementById('sidebar-overlay');
menuBtn.addEventListener('click', () => {
  sidebarEl.classList.toggle('open');
  sidebarOverlay.classList.toggle('active', sidebarEl.classList.contains('open'));
});
sidebarOverlay.addEventListener('click', () => {
  sidebarEl.classList.remove('open');
  sidebarOverlay.classList.remove('active');
});

// チップフィルター
chipsBar.addEventListener('click', (e) => {
  if (!e.target.classList.contains('chip')) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  e.target.classList.add('active');
  const cat = e.target.textContent;
  renderVideoGrid(cat === 'すべて' ? videos : videos.filter(v => v.category === cat));
});

// 検索
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (watchPage.classList.contains('active')) closeVideo();
  const q = searchInput.value.trim().toLowerCase();
  state.currentPage = 'home';
  renderSidebar();
  chipsBar.style.display = ''; videoGrid.style.display = '';
  pageHeader.style.display = 'none'; emptyState.style.display = 'none'; channelPage.style.display = 'none';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.chip').classList.add('active');
  if (!q) { renderVideoGrid(videos); return; }
  const results = videos.filter(v =>
    v.title.toLowerCase().includes(q) || v.channel.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)
  );
  if (results.length === 0) {
    videoGrid.style.display = 'none';
    showEmpty('search', `「${searchInput.value}」の検索結果はありません`);
  } else {
    renderVideoGrid(results);
  }
});

// キーボード
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (uploadPage.classList.contains('active')) closeUploadPage();
    else if (watchPage.classList.contains('active')) closeVideo();
    return;
  }
  if (watchPage.classList.contains('active') && !e.target.matches('input, textarea')) {
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') { playerTime = Math.min(playerDuration, playerTime + 5); updatePlayerUI(); }
    else if (e.key === 'ArrowLeft') { playerTime = Math.max(0, playerTime - 5); updatePlayerUI(); }
    else if (e.key === 'f') document.getElementById('fullscreen-btn').click();
  }
});

window.addEventListener('popstate', () => { if (watchPage.classList.contains('active')) closeVideo(); });

// ======================================================
// アップロード機能
// ======================================================
const uploadPage = document.getElementById('upload-page');
const uploadBtn = document.getElementById('upload-btn');
const uploadCloseBtn = document.getElementById('upload-close-btn');
const uploadDropzone = document.getElementById('upload-dropzone');
const uploadFileInput = document.getElementById('upload-file-input');
const uploadStep1 = document.getElementById('upload-step-1');
const uploadStep2 = document.getElementById('upload-step-2');
const uploadTitleInput = document.getElementById('upload-title');
const uploadDescriptionInput = document.getElementById('upload-description');
const uploadCategorySelect = document.getElementById('upload-category');
const uploadThumbnailInput = document.getElementById('upload-thumbnail');
const thumbnailPreviewBox = document.getElementById('thumbnail-preview-box');
const thumbnailPreviewImg = document.getElementById('thumbnail-preview-img');
const thumbnailRemoveBtn = document.getElementById('thumbnail-remove-btn');
const thumbnailUploadLabel = document.getElementById('thumbnail-upload-label');
const uploadBackBtn = document.getElementById('upload-back-btn');
const uploadSubmitBtn = document.getElementById('upload-submit-btn');
const uploadPreviewFilename = document.getElementById('upload-preview-filename');
const uploadPreviewStatus = document.getElementById('upload-preview-status');
const uploadProgressFill = document.getElementById('upload-progress-fill');
const uploadPreviewThumb = document.getElementById('upload-preview-thumb');
const titleCharCount = document.getElementById('title-char-count');
let uploadedFile = null, uploadedThumbnailDataUrl = null, uploadSimInterval = null;

uploadBtn.addEventListener('click', () => { uploadPage.classList.add('active'); document.body.style.overflow = 'hidden'; });
uploadCloseBtn.addEventListener('click', closeUploadPage);

function closeUploadPage() {
  uploadPage.classList.remove('active');
  document.body.style.overflow = watchPage.classList.contains('active') ? 'hidden' : '';
  resetUploadForm();
}
function resetUploadForm() {
  clearInterval(uploadSimInterval);
  uploadStep1.style.display = ''; uploadStep2.style.display = 'none';
  uploadTitleInput.value = ''; uploadDescriptionInput.value = ''; uploadCategorySelect.value = '';
  titleCharCount.textContent = '0'; uploadFileInput.value = '';
  uploadedFile = null; uploadedThumbnailDataUrl = null;
  thumbnailPreviewBox.style.display = 'none'; thumbnailUploadLabel.style.display = '';
  uploadPreviewThumb.innerHTML = '<span class="material-icons">movie</span>';
  uploadProgressFill.style.width = '0%';
  uploadPreviewStatus.textContent = 'アップロード待ち';
  uploadPreviewFilename.textContent = 'ファイル名';
  uploadSubmitBtn.disabled = true;
}

uploadDropzone.addEventListener('dragover', (e) => { e.preventDefault(); uploadDropzone.classList.add('dragover'); });
uploadDropzone.addEventListener('dragleave', () => uploadDropzone.classList.remove('dragover'));
uploadDropzone.addEventListener('drop', (e) => {
  e.preventDefault(); uploadDropzone.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('video/')) handleFileSelected(f);
});
uploadFileInput.addEventListener('change', () => { if (uploadFileInput.files[0]) handleFileSelected(uploadFileInput.files[0]); });

function handleFileSelected(file) {
  uploadedFile = file;
  uploadStep1.style.display = 'none'; uploadStep2.style.display = '';
  const name = file.name.replace(/\.[^/.]+$/, '');
  uploadTitleInput.value = name; titleCharCount.textContent = name.length;
  uploadPreviewFilename.textContent = file.name;
  validateUploadForm();
  const url = URL.createObjectURL(file);
  uploadPreviewThumb.innerHTML = `<video src="${url}" muted></video>`;
  uploadPreviewThumb.querySelector('video').addEventListener('loadeddata', function() { this.currentTime = 1; });
  simulateUpload();
}
function simulateUpload() {
  let p = 0; uploadPreviewStatus.textContent = 'アップロード中...';
  clearInterval(uploadSimInterval);
  uploadSimInterval = setInterval(() => {
    p += Math.random() * 15 + 5;
    if (p >= 100) { p = 100; clearInterval(uploadSimInterval); uploadPreviewStatus.textContent = 'アップロード完了'; }
    uploadProgressFill.style.width = `${p}%`;
  }, 200);
}

uploadTitleInput.addEventListener('input', () => { titleCharCount.textContent = uploadTitleInput.value.length; validateUploadForm(); });
uploadThumbnailInput.addEventListener('change', () => {
  const f = uploadThumbnailInput.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = (e) => { uploadedThumbnailDataUrl = e.target.result; thumbnailPreviewImg.src = uploadedThumbnailDataUrl; thumbnailPreviewBox.style.display = ''; thumbnailUploadLabel.style.display = 'none'; };
  r.readAsDataURL(f);
});
thumbnailRemoveBtn.addEventListener('click', () => { uploadedThumbnailDataUrl = null; thumbnailPreviewBox.style.display = 'none'; thumbnailUploadLabel.style.display = ''; uploadThumbnailInput.value = ''; });
function validateUploadForm() { uploadSubmitBtn.disabled = !uploadTitleInput.value.trim(); }
uploadBackBtn.addEventListener('click', () => { uploadStep1.style.display = ''; uploadStep2.style.display = 'none'; uploadedFile = null; clearInterval(uploadSimInterval); });

uploadSubmitBtn.addEventListener('click', () => {
  const title = uploadTitleInput.value.trim(); if (!title) return;
  const cat = uploadCategorySelect.value || 'その他';
  const desc = uploadDescriptionInput.value.trim() || title;
  const color = thumbnailColors[Math.floor(Math.random() * thumbnailColors.length)];
  const thumb = uploadedThumbnailDataUrl || generateThumbnail(title, color);
  videos.unshift({
    id: videos.length + 1, title, channel: myChannel, thumbnail: thumb,
    duration: randomDuration(), views: '0回視聴', date: '今日', category: cat,
    likes: 0, dislikes: 0, description: desc, comments: [],
  });
  closeUploadPage();
  navigateTo('home');
  showToast('動画を公開しました！');
});

uploadPage.addEventListener('click', (e) => { if (e.target === uploadPage) closeUploadPage(); });

// ======================================================
// 通知ボタン
// ======================================================
document.getElementById('notif-btn').addEventListener('click', () => {
  showToast('新しい通知はありません');
});

// ======================================================
// モバイル検索バー
// ======================================================
const mobileSearchBar = document.getElementById('mobile-search-bar');
const mobileSearchInput = document.getElementById('mobile-search-input');
const mobileSearchForm = document.getElementById('mobile-search-form');
const mobileSearchToggle = document.getElementById('mobile-search-toggle');
const mobileSearchBack = document.getElementById('mobile-search-back');

mobileSearchToggle.addEventListener('click', () => {
  mobileSearchBar.classList.add('active');
  mobileSearchInput.focus();
});

mobileSearchBack.addEventListener('click', () => {
  mobileSearchBar.classList.remove('active');
  mobileSearchInput.value = '';
});

mobileSearchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // モバイル検索をメイン検索に委譲
  searchInput.value = mobileSearchInput.value;
  searchForm.dispatchEvent(new Event('submit'));
  mobileSearchBar.classList.remove('active');
});

// ======================================================
// モバイルボトムナビ
// ======================================================
const bottomNav = document.getElementById('bottom-nav');

// ＋ボタン（投稿）
document.getElementById('bottom-nav-create').addEventListener('click', () => {
  uploadPage.classList.add('active');
  document.body.style.overflow = 'hidden';
});

bottomNav.addEventListener('click', (e) => {
  const item = e.target.closest('.bottom-nav-item');
  if (!item || item.id === 'bottom-nav-create') return;
  const page = item.dataset.page;
  if (!page) return;
  navigateTo(page);
  updateBottomNav(page);
});

function updateBottomNav(page) {
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

// navigateTo にボトムナビ同期を追加
const _origNavigateTo = navigateTo;
// ページ遷移時にボトムナビも更新（navigateTo内で呼ぶ）

// 動画ページ開く時にボトムナビを隠す
const _origOpenVideo = openVideo;

// watchPage表示時にボトムナビ非表示
const watchObserver = new MutationObserver(() => {
  if (watchPage.classList.contains('active')) {
    bottomNav.style.display = 'none';
  } else {
    bottomNav.style.display = '';
  }
});
watchObserver.observe(watchPage, { attributes: true, attributeFilter: ['class'] });

// navigateTo のフックでボトムナビを同期
const origRenderSidebar = renderSidebar;
// renderSidebarが呼ばれる度にボトムナビも更新
const _patchedNavigateTo = (function() {
  const pages = ['home', 'explore', 'subscriptions', 'library'];
  return function() {
    if (pages.includes(state.currentPage)) {
      updateBottomNav(state.currentPage);
    }
  };
})();

// ページ遷移後にボトムナビ同期
const contentEl = document.getElementById('content');
const contentObserver = new MutationObserver(() => {
  const pages = ['home', 'explore', 'subscriptions', 'library', 'history', 'watch-later', 'liked'];
  if (pages.includes(state.currentPage)) {
    updateBottomNav(state.currentPage);
  }
});
contentObserver.observe(contentEl, { childList: true, subtree: true });

// サイドバーのナビゲーション時にもサイドバーを閉じる（モバイル）
const origSidebarRender = renderSidebar;
const patchSidebarNav = () => {
  sidebarEl.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      sidebarEl.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  });
  sidebarEl.querySelectorAll('[data-channel-id]').forEach(el => {
    el.addEventListener('click', () => {
      sidebarEl.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  });
};

// renderSidebarを拡張してモバイル対応を含める
const _baseRenderSidebar = renderSidebar;
// サイドバー描画後にモバイル用のイベントをパッチ
const sidebarMutObserver = new MutationObserver(() => {
  patchSidebarNav();
});
sidebarMutObserver.observe(sidebarEl, { childList: true });

// トーストのモバイル位置調整
function updateToastPosition() {
  const t = document.getElementById('toast');
  if (t && window.innerWidth <= 640) {
    t.style.bottom = '100px';
  } else if (t) {
    t.style.bottom = '40px';
  }
}
window.addEventListener('resize', updateToastPosition);

// ======================================================
// 初期描画
// ======================================================
renderSidebar();
renderVideoGrid(videos);
