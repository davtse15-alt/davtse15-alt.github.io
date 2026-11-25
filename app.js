const GAMES = [
  {
    id: 'drum-smash',
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
    title: 'Flex Paint',
    description: 'Draw with rainbow brushes, symmetry, drum stamps, and letter tracing.',
    url: 'https://davtse15-alt.github.io/felixpaint/',
    image: 'assets/flex-paint.jpg',
    imageAlt: 'Wooden paint palette and smiling paintbrush making a rainbow arc',
    accent: '#3d84b8',
    accentDeep: '#2b6794',
  },
  {
    id: 'sound-steps',
    title: 'Sound Steps',
    description: 'Listen to sounds, tap letters, and practice early phonics step by step.',
    url: 'https://davtse15-alt.github.io/learningapp/',
    image: 'assets/sound-steps.jpg',
    imageAlt: 'Pastel wooden blocks and a smiling sage flower with golden sound waves',
    accent: '#5c9178',
    accentDeep: '#43705b',
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
const openExternalLink = document.getElementById('openExternal');

let activeGameId = null;
let lastTriggerEl = null;

function renderCards() {
  const fragment = document.createDocumentFragment();

  for (const game of GAMES) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-card';
    card.id = `card-${game.id}`;
    card.style.setProperty('--accent', game.accent);
    card.style.setProperty('--accent-deep', game.accentDeep);
    card.setAttribute('aria-label', `Play ${game.title}`);

    card.innerHTML = `
      <div class="card-art">
        <img src="${game.image}" alt="${game.imageAlt}" loading="eager" decoding="async" />
      </div>
      <div class="card-body">
        <h2 class="card-title">${game.title}</h2>
        <p class="card-desc">${game.description}</p>
        <span class="card-action" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.67-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14z"/></svg>
          Play
        </span>
      </div>
    `;

    card.addEventListener('click', () => {
      lastTriggerEl = card;
      openGame(game, { pushHash: true });
    });

    fragment.appendChild(card);
  }

  gamesGrid.appendChild(fragment);
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

function closeGame({ updateHash = false } = {}) {
  if (!activeGameId && !gameStage.classList.contains('is-open')) return;
  activeGameId = null;

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

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeGameId) {
    closeGame({ updateHash: true });
  }
});

function syncFromHash() {
  const slug = location.hash.replace(/^#/, '');
  const match = GAMES.find((g) => g.id === slug);
  if (match) {
    openGame(match, { pushHash: false });
  } else {
    closeGame({ updateHash: false });
  }
}

window.addEventListener('hashchange', syncFromHash);
window.addEventListener('popstate', syncFromHash);

renderCards();
syncFromHash();
