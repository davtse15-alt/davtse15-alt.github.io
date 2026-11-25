const GITHUB_USER = 'davtse15-alt';
const HUB_REPO = 'davtse15-alt.github.io';
const REQUIRED_TOPIC = 'playroom';
const CACHE_KEY = 'playroom_discovered_games_v2';

const PALETTES = [
  { accent: '#e86b51', accentDeep: '#c75138', artBg: '#fff1e4' },
  { accent: '#3d84b8', accentDeep: '#2b6794', artBg: '#eaf3fb' },
  { accent: '#5c9178', accentDeep: '#43705b', artBg: '#ebf5ef' },
  { accent: '#d69435', accentDeep: '#b3761f', artBg: '#fdf5df' },
  { accent: '#c96787', accentDeep: '#a64d6b', artBg: '#fbedf2' },
  { accent: '#489199', accentDeep: '#337279', artBg: '#e8f5f6' },
];

const FEATURED_GAMES = [
  {
    id: 'drum-smash',
    repo: 'Drumsmash',
    title: 'Drum Smash',
    description: 'Tap anywhere or hold for drum rolls, silly sounds, and musical surprises.',
    url: 'https://davtse15-alt.github.io/Drumsmash/',
    image: 'assets/drum-smash.jpg',
    imageAlt: 'Colorful toy drum set with drumsticks and floating music notes',
    accent: '#e86b51',
    accentDeep: '#c75138',
  },
  {
    id: 'flex-paint',
    repo: 'felixpaint',
    title: 'Flex Paint',
    description: 'Draw with rainbow brushes, symmetry, drum stamps, and letter tracing.',
    url: 'https://davtse15-alt.github.io/felixpaint/?v=20',
    image: 'assets/flex-paint.jpg',
    imageAlt: 'Wooden paint palette and smiling paintbrush making a rainbow arc',
    accent: '#3d84b8',
    accentDeep: '#2b6794',
  },
  {
    id: 'sound-steps',
    repo: 'learningapp',
    title: 'Sound Steps',
    description: 'Listen to sounds, tap letters, and practice early phonics step by step.',
    url: 'https://davtse15-alt.github.io/learningapp/',
    image: 'assets/sound-steps.jpg',
    imageAlt: 'Pastel wooden blocks and a smiling sage flower with golden sound waves',
    accent: '#5c9178',
    accentDeep: '#43705b',
  },
  {
    id: 'mix-paint',
    repo: 'mixpaint',
    title: 'Mix Paint',
    description: 'Mix primary colors in a studio bowl to discover new shades and paint with them.',
    url: 'https://davtse15-alt.github.io/mixpaint/',
    image: 'assets/mix-paint.jpg',
    imageAlt: 'Mixing bowl of swirling rainbow paint with a smiling wooden spoon and paint jars',
    accent: '#d69435',
    accentDeep: '#b3761f',
  },
  {
    id: 'numberblocks',
    repo: 'numberblock',
    title: 'Numberblocks',
    description: 'Count, match, and tuck Numberblocks into bed, onto trains, and for snack time.',
    url: 'https://davtse15-alt.github.io/numberblock/',
    image: 'assets/numberblocks.jpg',
    imageAlt: 'Colorful Numberblocks characters 1 through 5 standing in an ascending staircase',
    accent: '#c96787',
    accentDeep: '#a64d6b',
  },
];

const hub = document.getElementById('hub');
const gamesGrid = document.getElementById('gamesGrid');
const gameStage = document.getElementById('gameStage');
const stageTitle = document.getElementById('stageTitle');
const stageLoader = document.getElementById('stageLoader');
const loaderLabel = document.getElementById('loaderLabel');
const gameFrame = document.getElementById('gameFrame');
const backToGamesBtn = document.getElementById('backToGames');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
const openExternalLink = document.getElementById('openExternal');

const games = [...FEATURED_GAMES];
const renderedIds = new Set();

let activeGameId = null;
let lastTriggerEl = null;
let isStageFullscreen = false;
let enteredNativeFullscreen = false;

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function formatRepoTitle(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractLeadingEmoji(text) {
  if (!text) return null;
  const match = text.trim().match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);
  return match ? match[1] : null;
}

function buildCardArt(game) {
  const art = document.createElement('div');
  art.className = 'card-art';

  if (game.image) {
    const img = document.createElement('img');
    img.src = game.image;
    img.alt = game.imageAlt || game.title;
    img.loading = 'eager';
    img.decoding = 'async';
    art.appendChild(img);
    return art;
  }

  art.classList.add('card-art--fallback');
  if (game.artBg) {
    art.style.setProperty('--art-bg', game.artBg);
  }

  const badge = document.createElement('div');
  badge.className = 'card-art-badge';
  badge.setAttribute('aria-hidden', 'true');

  if (game.emoji) {
    badge.textContent = game.emoji;
  } else {
    badge.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 2.75l2.58 5.23 5.77.84-4.18 4.07.99 5.75L12 15.92l-5.16 2.72.99-5.75-4.18-4.07 5.77-.84L12 2.75z" />
      </svg>
    `;
  }

  art.appendChild(badge);
  return art;
}

function createGameCard(game) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'game-card';
  card.id = `card-${game.id}`;
  card.style.setProperty('--accent', game.accent);
  card.style.setProperty('--accent-deep', game.accentDeep);
  card.setAttribute('aria-label', `Play ${game.title}`);

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = game.title;

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = game.description;

  const action = document.createElement('span');
  action.className = 'card-action';
  action.setAttribute('aria-hidden', 'true');
  action.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.67-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14z"/></svg>
    Play
  `;

  body.append(title, desc, action);
  card.append(buildCardArt(game), body);

  card.addEventListener('click', () => {
    lastTriggerEl = card;
    openGame(game, { pushHash: true });
  });

  return card;
}

function renderNewGames(list) {
  const fragment = document.createDocumentFragment();
  let added = false;

  for (const game of list) {
    if (renderedIds.has(game.id)) continue;
    renderedIds.add(game.id);
    if (!games.some((existing) => existing.id === game.id)) {
      games.push(game);
    }
    fragment.appendChild(createGameCard(game));
    added = true;
  }

  if (added) {
    gamesGrid.appendChild(fragment);
  }
}

function getRepoUrl(repo) {
  if (repo.has_pages) {
    return `https://${GITHUB_USER}.github.io/${repo.name}/`;
  }
  const homepage = (repo.homepage || '').trim();
  if (/^https?:\/\//i.test(homepage)) {
    return homepage;
  }
  return null;
}

function mapRepoToGame(repo) {
  const palette = PALETTES[hashString(repo.name) % PALETTES.length];
  const rawDescription = (repo.description || '').trim();
  const leadingEmoji = extractLeadingEmoji(rawDescription);
  const cleanDescription = leadingEmoji
    ? rawDescription.slice(leadingEmoji.length).trim() || 'Tap to open and play.'
    : rawDescription || 'Tap to open and play.';

  return {
    id: toSlug(repo.name),
    repo: repo.name,
    title: formatRepoTitle(repo.name),
    description: cleanDescription,
    url: getRepoUrl(repo),
    image: null,
    emoji: leadingEmoji,
    accent: palette.accent,
    accentDeep: palette.accentDeep,
    artBg: palette.artBg,
  };
}

function readCachedDiscovered() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.games)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedDiscovered(discovered) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), games: discovered }),
    );
  } catch {
    // Ignore storage quota or private-mode errors.
  }
}

function syncDiscoveredCards(discovered) {
  const featuredIds = new Set(FEATURED_GAMES.map((g) => g.id));
  const validIds = new Set([...featuredIds, ...discovered.map((g) => g.id)]);

  // Remove stale discovered cards that were untagged or removed.
  for (const id of [...renderedIds]) {
    if (!validIds.has(id)) {
      renderedIds.delete(id);
      const cardEl = document.getElementById(`card-${id}`);
      if (cardEl) cardEl.remove();
      const idx = games.findIndex((g) => g.id === id);
      if (idx !== -1) games.splice(idx, 1);
    }
  }

  renderNewGames(discovered);
}

async function discoverGitHubGames() {
  const cached = readCachedDiscovered();
  if (cached && cached.games.length > 0) {
    renderNewGames(cached.games);
    if (!activeGameId && location.hash) {
      syncFromHash();
    }
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      { headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!response.ok) return;

    const repos = await response.json();
    if (!Array.isArray(repos)) return;

    const featuredRepoNames = new Set(
      FEATURED_GAMES.map((g) => (g.repo || g.id).toLowerCase()),
    );

    const discovered = repos
      .filter((repo) => {
        if (!repo || repo.archived || repo.disabled) return false;
        const lowerName = repo.name.toLowerCase();
        if (lowerName === HUB_REPO.toLowerCase()) return false;
        if (featuredRepoNames.has(lowerName)) return false;
        const topics = Array.isArray(repo.topics)
          ? repo.topics.map((t) => t.toLowerCase())
          : [];
        if (!topics.includes(REQUIRED_TOPIC)) return false;
        return Boolean(getRepoUrl(repo));
      })
      .map(mapRepoToGame);

    writeCachedDiscovered(discovered);
    syncDiscoveredCards(discovered);

    if (!activeGameId && location.hash) {
      syncFromHash();
    }
  } catch {
    // Offline or API unavailable — featured games remain fully usable.
  }
}

function openGame(game, { pushHash = false } = {}) {
  if (!game) return;
  activeGameId = game.id;

  stageTitle.textContent = game.title;
  loaderLabel.textContent = `Opening ${game.title}…`;
  openExternalLink.href = game.url;
  gameFrame.title = game.title;

  stageLoader.classList.remove('is-hidden');
  gameStage.classList.add('is-open');
  gameStage.setAttribute('aria-hidden', 'false');
  hub.setAttribute('aria-hidden', 'true');
  document.body.classList.add('stage-open');
  document.title = `${game.title} · Playroom`;

  if (gameFrame.src !== game.url) {
    gameFrame.src = game.url;
  } else {
    stageLoader.classList.add('is-hidden');
  }

  if (pushHash && location.hash !== `#${game.id}`) {
    history.pushState({ gameId: game.id }, '', `#${game.id}`);
  }
}

function getNativeFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    null
  );
}

function applyStageFullscreen(active) {
  isStageFullscreen = Boolean(active);
  gameStage.classList.toggle('is-fullscreen', isStageFullscreen);
  if (fullscreenBtn) {
    fullscreenBtn.setAttribute('aria-pressed', String(isStageFullscreen));
  }
}

async function enterStageFullscreen() {
  if (!activeGameId) return;
  enteredNativeFullscreen = false;
  applyStageFullscreen(true);

  const requestFn =
    gameStage.requestFullscreen ||
    gameStage.webkitRequestFullscreen ||
    gameStage.msRequestFullscreen;

  if (typeof requestFn === 'function') {
    try {
      const result = requestFn.call(gameStage);
      if (result && typeof result.then === 'function') {
        await result;
      }
      if (getNativeFullscreenElement() === gameStage) {
        enteredNativeFullscreen = true;
      }
    } catch {
      // Native Fullscreen API unavailable or blocked; CSS full-viewport mode remains active.
    }
  }
}

function exitStageFullscreen() {
  const shouldExitNative = Boolean(getNativeFullscreenElement());
  enteredNativeFullscreen = false;
  applyStageFullscreen(false);

  if (shouldExitNative) {
    const exitFn =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;
    if (typeof exitFn === 'function') {
      try {
        const result = exitFn.call(document);
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
      } catch {
        // Ignore fullscreen exit errors.
      }
    }
  }
}

function syncNativeFullscreen() {
  const nativeEl = getNativeFullscreenElement();
  if (nativeEl === gameStage) {
    enteredNativeFullscreen = true;
    applyStageFullscreen(true);
  } else if (enteredNativeFullscreen && isStageFullscreen) {
    enteredNativeFullscreen = false;
    applyStageFullscreen(false);
  }
}

function closeGame({ updateHash = false } = {}) {
  if (!activeGameId && !gameStage.classList.contains('is-open')) return;
  activeGameId = null;

  if (isStageFullscreen || getNativeFullscreenElement()) {
    exitStageFullscreen();
  }

  gameStage.classList.remove('is-open');
  gameStage.setAttribute('aria-hidden', 'true');
  hub.removeAttribute('aria-hidden');
  document.body.classList.remove('stage-open');
  document.title = 'Playroom · Games Hub';

  // Unload the iframe after transition so audio stops cleanly.
  window.setTimeout(() => {
    if (!activeGameId) {
      gameFrame.src = 'about:blank';
    }
  }, 240);

  if (updateHash && location.hash) {
    history.pushState({}, '', location.pathname + location.search);
  }

  if (lastTriggerEl) {
    lastTriggerEl.focus({ preventScroll: true });
  }
}

gameFrame.addEventListener('load', () => {
  if (activeGameId) {
    stageLoader.classList.add('is-hidden');
  }
});

backToGamesBtn.addEventListener('click', () => {
  closeGame({ updateHash: true });
});

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    enterStageFullscreen();
  });
}

if (exitFullscreenBtn) {
  exitFullscreenBtn.addEventListener('click', () => {
    exitStageFullscreen();
  });
}

document.addEventListener('fullscreenchange', syncNativeFullscreen);
document.addEventListener('webkitfullscreenchange', syncNativeFullscreen);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeGameId) {
    if (isStageFullscreen) {
      exitStageFullscreen();
    } else {
      closeGame({ updateHash: true });
    }
  }
});

function syncFromHash() {
  const slug = location.hash.replace(/^#/, '');
  const match = games.find((g) => g.id === slug);
  if (match) {
    openGame(match, { pushHash: false });
  } else if (!slug) {
    closeGame({ updateHash: false });
  }
}

window.addEventListener('hashchange', syncFromHash);
window.addEventListener('popstate', syncFromHash);

renderNewGames(FEATURED_GAMES);
syncFromHash();
discoverGitHubGames();
