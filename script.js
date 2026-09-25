/**
 * HADES' POMEGRANATES — Interactive Experience Logic
 * Vanilla JavaScript (No frameworks, pure GitHub Pages static compatibility)
 * characters.json is the authoritative Single Source of Truth
 */

(function () {
  'use strict';

  // --- Roman Numerals Reference for 30 Pomegranates ---
  const ROMAN_NUMERALS = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
    'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'
  ];

  // --- State Management ---
  let charactersData = [];
  let characterByFruitMap = new Map(); // pomegranateId -> Character
  let characterByIdMap = new Map();    // characterId -> Character
  let visitedPomegranates = new Set();
  let isAnimating = false;
  let activeView = 'garden'; // 'garden' | 'profile' | 'archive'
  let previousView = 'garden';

  // --- Background Atmospheric Audio Management ---
  const AUDIO_SOURCES = [
    'assets/music.mp3',
    'assets/music/A Quiet Little Promise.mp3',
    './assets/music.mp3',
    './assets/music/A Quiet Little Promise.mp3'
  ];
  let currentAudioSourceIndex = 0;
  const bgMusic = new Audio(AUDIO_SOURCES[currentAudioSourceIndex]);
  bgMusic.loop = true;
  bgMusic.volume = 0.25;
  let isMusicPlaying = false;

  bgMusic.addEventListener('error', (e) => {
    console.warn(`[Audio] Failed loading: ${AUDIO_SOURCES[currentAudioSourceIndex]}`, e);
    if (currentAudioSourceIndex < AUDIO_SOURCES.length - 1) {
      currentAudioSourceIndex++;
      console.log(`[Audio] Trying fallback source: ${AUDIO_SOURCES[currentAudioSourceIndex]}`);
      bgMusic.src = AUDIO_SOURCES[currentAudioSourceIndex];
      if (isMusicPlaying) {
        bgMusic.play().catch((err) => console.warn('[Audio] Fallback playback prevented:', err));
      }
    }
  });

  // DOM Elements
  const gardenView = document.getElementById('garden-view');
  const profileView = document.getElementById('profile-view');
  const archiveView = document.getElementById('archive-view');
  const treeStage = document.getElementById('tree-stage');

  const navGarden = document.getElementById('nav-garden');
  const navArchive = document.getElementById('nav-archive');
  const brandLink = document.getElementById('brand-link');
  const musicToggle = document.getElementById('music-toggle');

  const profileEyebrow = document.getElementById('profile-eyebrow');
  const profileName = document.getElementById('profile-name');
  const profileAge = document.getElementById('profile-age');
  const profileRole = document.getElementById('profile-role');
  const profileBio = document.getElementById('profile-bio');
  const tasteCta = document.getElementById('taste-cta');
  const returnBtn = document.getElementById('return-btn');
  const profileClose = document.getElementById('profile-close');

  const archiveSearch = document.getElementById('archive-search');
  const archiveFilters = document.getElementById('archive-filters');
  const archiveGrid = document.getElementById('archive-grid');
  const archiveEmpty = document.getElementById('archive-empty');

  // --- 1. Background Music Toggle ---
  function setupMusicControl() {
    if (!musicToggle) return;

    musicToggle.addEventListener('click', () => {
      toggleMusic();
    });
  }

  function toggleMusic() {
    if (!musicToggle) return;

    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
      musicToggle.classList.remove('playing');
      musicToggle.setAttribute('aria-label', 'Turn music on');
    } else {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isMusicPlaying = true;
          musicToggle.classList.add('playing');
          musicToggle.setAttribute('aria-label', 'Turn music off');
        }).catch((err) => {
          console.warn('[Audio] Primary playback failed, trying alternative audio source:', err);
          if (currentAudioSourceIndex < AUDIO_SOURCES.length - 1) {
            currentAudioSourceIndex++;
            bgMusic.src = AUDIO_SOURCES[currentAudioSourceIndex];
            bgMusic.play().then(() => {
              isMusicPlaying = true;
              musicToggle.classList.add('playing');
              musicToggle.setAttribute('aria-label', 'Turn music off');
            }).catch((e) => console.warn('[Audio] Fallback path also failed:', e));
          }
        });
      }
    }
  }

  // --- 2. Data Loading (Single Source of Truth: characters.json with offline file:// fallback) ---
  function populateCharacterMaps(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    charactersData = data;
    characterByFruitMap.clear();
    characterByIdMap.clear();

    charactersData.forEach((char) => {
      if (char.pomegranateId) {
        characterByFruitMap.set(char.pomegranateId, char);
      }
      if (char.id) {
        characterByIdMap.set(char.id, char);
      }
    });
    return true;
  }

  // Pre-load from embedded fallback synchronously so fruit clicks work instantly even on local file:// preview
  const fallbackEl = document.getElementById('characters-fallback-data');
  if (fallbackEl && fallbackEl.textContent.trim()) {
    try {
      const fallbackData = JSON.parse(fallbackEl.textContent);
      populateCharacterMaps(fallbackData);
    } catch (e) {
      console.warn('[Hades] Fallback data parse error:', e);
    }
  }

  async function loadCharacters() {
    try {
      const response = await fetch('./characters.json');
      if (response.ok) {
        const networkData = await response.json();
        if (populateCharacterMaps(networkData)) {
          console.info('[Hades] Loaded authoritative data via fetch(characters.json)');
          initializePomegranates();
          setupArchive();
        }
      }
    } catch (err) {
      console.warn('[Hades] Fetch characters.json skipped/failed (expected on local file:// protocol). Using embedded dataset.', err);
    }
  }

  // --- 3. Deterministic Pomegranate Initialization ---
  function initializePomegranates() {
    const fruitElements = document.querySelectorAll('.pomegranate-interactive');

    fruitElements.forEach((fruitEl) => {
      const fruitId = fruitEl.getAttribute('data-id');
      const character = characterByFruitMap.get(fruitId);

      if (character) {
        fruitEl.setAttribute('aria-label', `Pomegranate of ${character.name} — ${character.role}`);
      }

      if (fruitEl.dataset.initialized === 'true') {
        return;
      }
      fruitEl.dataset.initialized = 'true';

      // Unified Pointer & Touch Activation
      const onFruitActivate = (e) => {
        if (e.cancelable) {
          e.preventDefault();
        }
        handlePomegranateClick(fruitId, fruitEl);
      };

      fruitEl.addEventListener('click', onFruitActivate);
      fruitEl.addEventListener('touchend', onFruitActivate, { passive: false });

      // Keyboard Accessibility (Enter or Space)
      fruitEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePomegranateClick(fruitId, fruitEl);
        }
      });
    });
  }

  // --- 4. Click Animation & Physics Flow ---
  function handlePomegranateClick(fruitId, fruitEl) {
    if (isAnimating || activeView === 'profile') return;

    let character = characterByFruitMap.get(fruitId);
    if (!character) {
      const fallbackScript = document.getElementById('characters-fallback-data');
      if (fallbackScript && fallbackScript.textContent.trim()) {
        try {
          const list = JSON.parse(fallbackScript.textContent);
          character = list.find((c) => c.pomegranateId === fruitId);
          if (character) {
            populateCharacterMaps(list);
          }
        } catch (_) {}
      }
    }

    if (!character) {
      console.warn(`[Hades] No character mapped to pomegranate id "${fruitId}".`);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      visitedPomegranates.add(fruitId);
      fruitEl.classList.add('already-tasted');
      showCharacterProfile(character, true);
      return;
    }

    // Start physical interactive sequence
    isAnimating = true;
    visitedPomegranates.add(fruitId);
    fruitEl.classList.add('already-tasted');

    // Step 1: Gentle tremble/shake on branch
    fruitEl.classList.add('fruit-shake');

    setTimeout(() => {
      // Step 2 & 3: Detach and fall downward with gravitational curve
      fruitEl.classList.remove('fruit-shake');
      fruitEl.classList.add('fruit-falling');

      // Soften/dim the tree scene in background
      if (treeStage) {
        treeStage.classList.add('soft-dim');
      }

      // Step 4: Cinematic transition to character profile
      setTimeout(() => {
        isAnimating = false;
        showCharacterProfile(character, true);
      }, 950);
    }, 380);
  }

  // --- 5. Character Profile Rendering (Pure Editorial Text) ---
  function showCharacterProfile(character, animateFromTree = false) {
    if (!character) return;

    // Populate editorial fields
    profileName.textContent = character.name || 'Unknown Soul';
    profileAge.textContent = character.age ? `Age — ${character.age}` : 'Age — Unknown';
    profileRole.textContent = character.role ? `Role — ${character.role}` : 'Role — Dweller';
    profileBio.textContent = character.bio || '';

    // Subtle eyebrow location indicator
    if (character.pomegranateId) {
      const fruitIndex = parseInt(character.pomegranateId.replace('pomegranate-', ''), 10) - 1;
      const roman = (fruitIndex >= 0 && ROMAN_NUMERALS[fruitIndex]) ? ROMAN_NUMERALS[fruitIndex] : character.pomegranateId;
      profileEyebrow.textContent = `The Underworld Bough — Fruit ${roman}`;
    } else {
      profileEyebrow.textContent = `Preserved in the Underworld`;
    }

    // Setup THE EXCLUSIVE CTA: "Taste them."
    // Direct hyperlink to Google AI Studio in a new tab
    if (character.googleAIStudioUrl) {
      tasteCta.href = character.googleAIStudioUrl;
      tasteCta.setAttribute('target', '_blank');
      tasteCta.setAttribute('rel', 'noopener noreferrer');
      tasteCta.style.display = 'inline-flex';
    } else {
      tasteCta.href = '#';
      tasteCta.style.display = 'none';
    }

    // Switch view
    previousView = activeView === 'profile' ? previousView : activeView;
    activeView = 'profile';

    profileView.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus "Taste them." for immediate keyboard accessibility
    setTimeout(() => {
      tasteCta.focus();
    }, 400);

    // Update URL hash without reload
    window.location.hash = `character-${character.id}`;
  }

  // --- 6. Return to Garden & View Navigation ---
  function returnToGarden() {
    profileView.classList.remove('active');
    document.body.style.overflow = '';

    // Reset falling animation state on fruits so fruit remains visible on branch with tasted badge
    const fallingFruits = document.querySelectorAll('.fruit-falling');
    fallingFruits.forEach((f) => {
      f.classList.remove('fruit-falling');
    });

    // Un-dim tree
    if (treeStage) {
      treeStage.classList.remove('soft-dim');
    }

    // Show garden
    switchView('garden');
    window.location.hash = 'garden';
  }

  function switchView(viewName) {
    activeView = viewName;

    if (viewName === 'garden') {
      profileView.classList.remove('active');
      archiveView.classList.remove('active');
      gardenView.classList.add('active');

      navGarden.classList.add('active');
      navArchive.classList.remove('active');
      document.body.style.overflow = '';

      if (treeStage) {
        treeStage.classList.remove('soft-dim');
      }
    } else if (viewName === 'archive') {
      profileView.classList.remove('active');
      gardenView.classList.remove('active');
      archiveView.classList.add('active');

      navGarden.classList.remove('active');
      navArchive.classList.add('active');
      document.body.style.overflow = '';
    }
  }

  // --- 7. Archive View (Search & Filter — Pure Text Editorial) ---
  function setupArchive() {
    buildRoleFilterChips();
    renderArchiveCards(charactersData);

    // Search input
    archiveSearch.addEventListener('input', () => {
      filterArchive();
    });
  }

  function buildRoleFilterChips() {
    const roles = Array.from(new Set(charactersData.map((c) => c.role).filter(Boolean)));
    
    // Clear dynamic chips (keep "All Souls")
    archiveFilters.innerHTML = '<button class="filter-chip active" data-filter="all" type="button">All Souls</button>';

    roles.forEach((role) => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.type = 'button';
      btn.setAttribute('data-filter', role);
      btn.textContent = role;
      archiveFilters.appendChild(btn);
    });

    archiveFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      archiveFilters.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      filterArchive();
    });
  }

  function filterArchive() {
    const query = archiveSearch.value.trim().toLowerCase();
    const activeChip = archiveFilters.querySelector('.filter-chip.active');
    const selectedFilter = activeChip ? activeChip.getAttribute('data-filter') : 'all';

    const filtered = charactersData.filter((char) => {
      const matchesQuery =
        !query ||
        char.name.toLowerCase().includes(query) ||
        (char.role && char.role.toLowerCase().includes(query)) ||
        (char.bio && char.bio.toLowerCase().includes(query));

      const matchesRole =
        selectedFilter === 'all' || (char.role && char.role === selectedFilter);

      return matchesQuery && matchesRole;
    });

    renderArchiveCards(filtered);
  }

  function renderArchiveCards(list) {
    archiveGrid.innerHTML = '';

    if (list.length === 0) {
      archiveEmpty.style.display = 'block';
      return;
    }
    archiveEmpty.style.display = 'none';

    list.forEach((char) => {
      const card = document.createElement('article');
      card.className = 'archive-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View story of ${char.name}, ${char.role}`);

      const fruitIndex = char.pomegranateId ? parseInt(char.pomegranateId.replace('pomegranate-', ''), 10) - 1 : -1;
      const fruitLabel = (fruitIndex >= 0 && ROMAN_NUMERALS[fruitIndex]) ? `Pomegranate ${ROMAN_NUMERALS[fruitIndex]}` : 'Garden Soul';

      card.innerHTML = `
        <div class="archive-card-header">
          <span class="archive-card-fruit-ref">${fruitLabel}</span>
          <span class="archive-card-tag">${char.age ? `Age — ${char.age}` : 'Immortal'}</span>
        </div>
        <h3 class="archive-card-name">${char.name}</h3>
        <p class="archive-card-role">${char.role || 'Orchard Dweller'}</p>
        <p class="archive-card-snippet">${char.bio || ''}</p>
        <div class="archive-card-footer">
          <span class="archive-card-prompt">Taste their story →</span>
        </div>
      `;

      // Open character profile when card is clicked or triggered by Enter/Space
      const selectCard = () => {
        showCharacterProfile(char, false);
      };

      card.addEventListener('click', selectCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard();
        }
      });

      archiveGrid.appendChild(card);
    });
  }

  // --- 8. Routing & Event Listeners ---
  function handleInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'garden') {
      switchView('garden');
    } else if (hash === 'archive') {
      switchView('archive');
    } else if (hash.startsWith('character-')) {
      const charId = hash.replace('character-', '');
      const character = characterByIdMap.get(charId);
      if (character) {
        showCharacterProfile(character, false);
      } else {
        switchView('garden');
      }
    }
  }

  window.addEventListener('hashchange', () => {
    handleInitialRoute();
  });

  navGarden.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  navArchive.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('archive');
    window.location.hash = 'archive';
  });

  returnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  profileClose.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  // ESC key to return from profile
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeView === 'profile') {
      returnToGarden();
    }
  });

  // --- 9. Ambient Golden Spores & Mist Particle Canvas ---
  function initAmbientParticles() {
    const canvas = document.getElementById('ambient-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const count = 28; // Subtle and restrained

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.radius = Math.random() * 1.8 + 0.8;
        this.speedY = Math.random() * 0.28 + 0.12;
        this.speedX = (Math.random() - 0.5) * 0.18;
        this.opacity = Math.random() * 0.35 + 0.15;
        this.color = Math.random() > 0.4 ? '184, 155, 104' : '201, 143, 146'; // Gold & dusty rose
        this.oscillationSpeed = Math.random() * 0.02 + 0.01;
        this.oscillationDistance = Math.random() * 20 + 10;
        this.seed = Math.random() * 100;
      }

      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.seed) * 0.35 + this.speedX;
        this.seed += this.oscillationSpeed;

        if (this.y < -15 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${this.color}, 0.4)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function animate() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
      }
      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- Initialize when DOM is ready ---
  function initializeApp() {
    setupMusicControl();

    // Step 1: Pre-load from embedded fallback synchronously so fruit clicks work instantly
    const fallbackEl = document.getElementById('characters-fallback-data');
    if (fallbackEl && fallbackEl.textContent.trim()) {
      try {
        const fallbackData = JSON.parse(fallbackEl.textContent);
        populateCharacterMaps(fallbackData);
      } catch (e) {
        console.warn('[Hades] Fallback data parse error:', e);
      }
    }

    // Step 2: Immediately activate interactive pomegranates, archive, and routing
    initializePomegranates();
    setupArchive();
    handleInitialRoute();
    initAmbientParticles();

    // Step 3: Fetch live characters.json in background (for GitHub Pages / live web servers)
    loadCharacters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
