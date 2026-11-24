/* Six mini-games. Each: PocketGames.start(id, {area, api}) where api = {onDone, onScore, creatureEmoji, petName, areaEmoji} */
(function () {
  const G = {};
  let current = null;
  const stageEl = () => document.getElementById('game-stage');
  const areaEl = () => document.getElementById('game-area');
  const overlayEl = () => document.getElementById('game-overlay');
  const titleEl = () => document.getElementById('game-title');
  const scoreEl = () => document.getElementById('game-score');
  const infoEl = () => document.getElementById('game-info');
  const reduceMotion = () => document.body.classList.contains('no-motion');

  function clearStage() {
    if (current && current.cleanup) {
      try { current.cleanup(); } catch (e) {}
    }
    current = null;
    const a = areaEl();
    if (a) a.innerHTML = '';
    const o = overlayEl();
    if (o) { o.innerHTML = ''; o.classList.remove('show'); }
  }

  function setOverlay(html) {
    const o = overlayEl();
    o.innerHTML = html;
    o.classList.add('show');
  }

  function setScore(v) { const s = scoreEl(); if (s) s.textContent = 'Score ' + Math.round(v); }
  function setInfo(v) { const s = infoEl(); if (s) s.textContent = v || ''; }

  function endGame(payload) {
    if (!current) return;
    const cb = current.onDone;
    const score = current.score || 0;
    if (current.cleanup) { try { current.cleanup(); } catch (e) {} }
    current = null;
    let results = score;
    try { results = cb ? (cb(score) || score) : score; } catch (e) { console.error(e); }
    if (results && typeof results === 'object') {
      window.PocketLife.gameResult(results);
    } else {
      window.PocketLife.gameResult({ score: results || 0, game: titleEl().textContent });
    }
    if (payload && payload.keepStage) {
      clearStage();
      document.getElementById('game-stage').hidden = true;
    }
  }

  function petEmoji() { return (current && current.petEmoji) || '🐣'; }

  // keyboard handling
  let keyHandler = null;
  function listenKeys(handler) {
    keyHandler = handler;
    window.addEventListener('keydown', handler);
    if (current) current.cleanup = (orig => () => {
      window.removeEventListener('keydown', handler);
      if (orig) orig();
    })(current.cleanup);
  }

  /* ================= RHYTHM ================= */
  function rhythm(opts) {
    const lanes = 4;
    const colors = ['#8ff7d5', '#ffd46e', '#ff9ecf', '#c3a6ff'];
    const keys = ['a', 's', 'd', 'f'];
    const area = areaEl();
    area.innerHTML = `<div class="rhythm-board">${[0, 1, 2, 3].map(i => `<div class="rlane" data-lane="${i}" style="grid-column:${i + 1}"><span class="hit">${'🎶⭐🔔💜'[i]}</span></div>`).join('')}</div><div class="rline"></div><div class="pad-row">${[0, 1, 2, 3].map(i => `<div class="rpad" data-pad="${i}" style="grid-column:${i + 1}">${keys[i].toUpperCase()}</div>`).join('')}</div>`;
    const board = area.querySelector('.rhythm-board');

    const state = { score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, notes: [], notesHit: 0, t: 0, time: 0, duration: 36000, sp: 180, speed: 0.9, running: true, lastSpawn: 0, spawnEvery: 380 };
    let raf = null;
    let start = performance.now();

    const laneNotes = [[], [], [], []];

    function spawnNote() {
      const lane = Math.floor(Math.random() * lanes);
      const el = document.createElement('div');
      el.className = 'rnote';
      el.style.setProperty('--nc', colors[lane]);
      const laneEl = board.querySelectorAll('.rlane')[lane];
      laneEl.appendChild(el);
      laneNotes[lane].push({ el, y: -20, lane });
    }

    function judge(lane) {
      const lineY = board.clientHeight - 40;
      const list = laneNotes[lane];
      let best = null, bestDist = 1e9;
      for (const n of list) {
        const d = Math.abs(n.y - lineY);
        if (d < bestDist) { bestDist = d; best = n; }
      }
      if (!best || bestDist > 70) {
        showJudge('MISS');
        state.misses++;
        state.combo = 0;
        return;
      }
      const kind = bestDist < 22 ? 'PERFECT' : bestDist < 45 ? 'GREAT' : 'GOOD';
      const pts = kind === 'PERFECT' ? 300 : kind === 'GREAT' ? 200 : 100;
      state.combo++;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      state.hits++;
      state.notesHit++;
      state.score += pts + state.combo * 5;
      setScore(state.score);
      showJudge(kind + (state.combo > 2 ? `  x${state.combo}` : ''));
      best.el.style.transition = 'transform .12s, opacity .12s';
      best.el.style.transform = 'translateX(-50%) scale(1.8)';
      best.el.style.opacity = '0';
      setTimeout(() => best.el.remove && best.el.remove(), 130);
      list.splice(list.indexOf(best), 1);
      flashPad(lane);
      window.PocketLife.sfx(kind === 'PERFECT' ? 'good' : 'blip');
    }

    function showJudge(txt) {
      let j = area.querySelector('.rjudge');
      if (!j) { j = document.createElement('div'); j.className = 'rjudge'; area.appendChild(j); }
      j.textContent = txt;
      j.style.opacity = '1';
      j.style.transition = 'none';
      requestAnimationFrame(() => { j.style.transition = 'opacity .5s, transform .5s'; j.style.transform = 'translateX(-50%) scale(1.25)'; });
      setTimeout(() => { if (j.textContent === txt) j.style.opacity = '0'; }, 320);
    }

    function flashPad(lane) {
      const p = area.querySelector(`.rpad[data-pad="${lane}"]`);
      if (!p) return;
      p.classList.add('hitpad');
      setTimeout(() => p.classList.remove('hitpad'), 90);
    }

    const padEls = () => area.querySelectorAll('.rpad');
    padEls().forEach(p => p.addEventListener('pointerdown', e => { e.preventDefault(); judge(+p.dataset.pad); }));

    function loop(now) {
      if (!state.running) return;
      const dt = Math.min(64, now - (state.last || now));
      state.last = now;
      state.time += dt;
      state.lastSpawn += dt;
      const spawnEvery = Math.max(210, 360 - state.time / 120);
      if (state.lastSpawn > spawnEvery) {
        state.lastSpawn = 0;
        spawnNote();
      }
      state.speed = Math.min(2.4, 0.9 + state.time / 26000);
      const step = state.speed * dt / 16.6;
      laneNotes.forEach(list => {
        for (let i = list.length - 1; i >= 0; i--) {
          const n = list[i];
          n.y += step;
          n.el.style.top = n.y + 'px';
          if (n.y > board.clientHeight + 10) {
            n.el.remove();
            list.splice(i, 1);
            state.misses++;
            state.combo = 0;
            showJudge('MISS');
          }
        }
      });
      setInfo(`⏱ ${Math.ceil((state.duration - state.time) / 1000)}s · combo ×${state.combo}`);
      if (state.time >= state.duration) {
        state.running = false;
        setInfo('Song over!');
        state.score = Math.round(state.score + state.maxCombo * 20 + (state.hits - state.misses) * 25);
        endGame();
        return;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    listenKeys(e => {
      const k = e.key.toLowerCase();
      const i = keys.indexOf(k);
      if (i >= 0) { e.preventDefault(); judge(i); }
    });
    current = {
      score: 0, petEmoji: opts.petEmoji,
      cleanup() { state.running = false; cancelAnimationFrame(raf); },
      onDone(score) {
        return {
          game: 'Rhythm', score: Math.max(0, score), coins: Math.round(score / 4), xp: 16 + Math.round(score / 30),
          item: state.maxCombo >= 15 ? 'trinket_rhythm' : null,
          line: 'You played a song together!'
        };
      }
    };
  }

  /* ================= MEMORY ================= */
  function memory(opts) {
    const pool = ['🍓', '🌸', '⭐', '🐠', '🍀', '🌙', '🍄', '💧', '🔮', '🍰', '🌻', '🦋'];
    const pairs = 6;
    const chosen = pool.sort(() => Math.random() - 0.5).slice(0, pairs);
    const cards = chosen.concat(chosen).map((s, i) => ({ s, id: i })).sort(() => Math.random() - 0.5);
    const area = areaEl();
    area.innerHTML = `<div class="mem-grid" style="grid-template-columns:repeat(4,1fr)">${cards.map(c => `<button class="mem-card" data-i="${c.id}">?</button>`).join('')}</div>`;
    const grid = area.querySelector('.mem-grid');
    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    const state = { open: null, lock: false, moves: 0, matched: 0, score: 0, running: true };
    const buttons = [...grid.querySelectorAll('.mem-card')];

    buttons.forEach(b => b.addEventListener('click', () => {
      if (state.lock || b.classList.contains('up') || b.classList.contains('matched')) return;
      const card = cards.find(c => c.id === +b.dataset.i);
      b.textContent = card.s;
      b.classList.add('up');
      window.PocketLife.sfx('flip');
      if (!state.open) { state.open = { b, card }; return; }
      state.moves++;
      if (state.open.card.id !== card.id && state.open.card.s === card.s) {
        b.classList.add('matched'); state.open.b.classList.add('matched');
        state.matched++;
        window.PocketLife.sfx('good');
        state.open = null;
        if (state.matched === pairs) {
          state.running = false;
          state.score = Math.max(200, 1400 - state.moves * 60 - Math.round(performance.now() % 1000));
          endGame();
        }
      } else {
        state.lock = true;
        const a = state.open;
        state.open = null;
        setTimeout(() => {
          a.b.classList.remove('up'); a.b.textContent = '?';
          b.classList.remove('up'); b.textContent = '?';
          state.lock = false;
        }, 620);
      }
      setInfo(`${state.matched}/${pairs} pairs · ${state.moves} moves`);
    }));
    setInfo(`0/${pairs} pairs · 0 moves`);
    current = {
      petEmoji: opts.petEmoji,
      cleanup() { state.running = false; },
      onDone(score) {
        return { game: 'Memory', score, coins: Math.round(14 + state.matched * 4), xp: 14, item: state.matched === pairs ? null : null, line: 'A memory game finished!' };
      }
    };
    current.score = 0;
  }

  /* ================= FISHING ================= */
  function fishing(opts) {
    const area = areaEl();
    area.innerHTML = `<div class="fish-scene">
      <div class="fish-wave"></div>
      <div class="fish-bobber" style="left:50%;top:44%">🎣</div>
      <div class="fish-meter"><i style="height:0%"></i></div>
    </div>`;
    const scene = area.querySelector('.fish-scene');
    const bob = area.querySelector('.fish-bobber');
    const meter = area.querySelector('.fish-meter i');
    const state = { phase: 'idle', charge: 0, score: 0, casts: 0, bites: 0, running: true, fish: [], t: 0 };
    let raf = null;
    let biteTimer = null;
    let biteDeadline = 0;

    function addFish() {
      const f = document.createElement('div');
      f.className = 'fish-sprite';
      f.textContent = '🐟';
      f.style.left = '-40px';
      f.style.top = (34 + Math.random() * 50) + '%';
      f.style.animationDuration = (6 + Math.random() * 4) + 's';
      f.style.fontSize = (14 + Math.random() * 10) + 'px';
      scene.appendChild(f);
      state.fish.push(f);
      if (state.fish.length > 6) state.fish.shift().remove();
    }
    addFish();

    function cast() {
      if (state.phase !== 'idle') return;
      state.phase = 'wait';
      state.casts++;
      window.PocketLife.sfx('splash');
      bob.style.transition = 'top .5s';
      bob.style.top = '52%';
      setInfo('Wait for the bite…');
      biteTimer = setTimeout(() => {
        if (!state.running || state.phase !== 'wait') return;
        state.phase = 'bite';
        biteDeadline = performance.now() + 1200;
        window.PocketLife.sfx('alert');
        setInfo('❗ BITE — tap now!');
        bob.style.top = '62%';
        setTimeout(() => { bob.style.top = '52%'; }, 150);
      }, 900 + Math.random() * 1800);
    }

    function attempt() {
      if (state.phase === 'wait') { setInfo('Too early! Wait for the "!"'); window.PocketLife.sfx('bad'); state.phase = 'idle'; state.casts = Math.max(0, state.casts - 1); return; }
      if (state.phase === 'bite') {
        const remain = biteDeadline - performance.now();
        const quality = Math.max(0, Math.min(1, remain / 1200));
        state.bites++;
        const fish = quality > 0.7 ? '🐠' : quality > 0.4 ? '🐟' : '🥾';
        const pts = Math.round(120 * quality + 60);
        state.score += pts;
        setScore(state.score);
        state.phase = 'idle';
        window.PocketLife.sfx(quality > 0.6 ? 'good' : 'blip');
        const cap = document.createElement('div');
        cap.className = 'fish-catch show';
        cap.textContent = fish;
        scene.appendChild(cap);
        setInfo(`Caught ${fish} +${pts}`);
        setTimeout(() => cap.remove(), 700);
        return;
      }
    }

    bob.style.top = '38%';
    scene.addEventListener('pointerdown', e => { e.preventDefault(); if (state.phase === 'idle') cast(); else attempt(); });
    listenKeys(e => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); if (state.phase === 'idle') cast(); else attempt(); } });

    const endAt = performance.now() + 30000;
    function loop(now) {
      if (!state.running) return;
      if (now > endAt) { state.running = false; endGame(); return; }
      if (Math.random() < 0.006) addFish();
      setInfo(prev => prev);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    setInfo('Tap the water to cast. Wait for the ❗ then tap again.');
    listenKeys(e => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); if (state.phase === 'idle') cast(); else attempt(); } });

    current = {
      petEmoji: opts.petEmoji, score: 0,
      cleanup() { state.running = false; cancelAnimationFrame(raf); clearTimeout(biteTimer); },
      onDone(score) {
        const coins = Math.round(score / 3) + state.bites * 2;
        return { game: 'Fishing', score, coins, xp: 12 + state.bites * 2, item: state.bites >= 3 ? 'trinket_shell' : null, line: 'A relaxed afternoon by the water.' };
      }
    };
  }

  /* ================= TREASURE ================= */
  function treasure(opts) {
    const cols = 5, rows = 4;
    const total = cols * rows;
    const digs = 10;
    const golds = [Math.floor(Math.random() * total), Math.floor(Math.random() * total)];
    while (golds[1] === golds[0]) golds[1] = Math.floor(Math.random() * total);
    const bombs = [Math.floor(Math.random() * total), Math.floor(Math.random() * total)];
    while (bombs.some(b => b === golds[0] || b === golds[1]) || bombs[0] === bombs[1]) {
      bombs[0] = Math.floor(Math.random() * total); bombs[1] = Math.floor(Math.random() * total);
    }
    const area = areaEl();
    area.innerHTML = `<div class="treasure-grid">${Array.from({ length: total }, (_, i) => `<button class="tcell" data-i="${i}">🪏</button>`).join('')}</div><div class="heat"><i style="width:0%"></i></div>`;
    const state = { left: digs, score: 0, running: true, found: 0 };
    const heat = area.querySelector('.heat i');
    const cells = [...area.querySelectorAll('.tcell')];
    function heatFor(i) {
      let best = 0;
      golds.forEach(g => {
        const dx = Math.abs((i % cols) - (g % cols)), dy = Math.abs(Math.floor(i / cols) - Math.floor(g / cols));
        const d = dx + dy;
        best = Math.max(best, d === 0 ? 1.2 : d === 1 ? 0.72 : d === 2 ? 0.36 : 0.12);
      });
      return Math.min(1, best);
    }
    function endIfDone() {
      if (state.left <= 0 || state.found >= 2) {
        state.running = false;
        setTimeout(() => endGame(), 400);
      }
    }
    cells.forEach(c => c.addEventListener('click', () => {
      if (!state.running) return;
      const i = +c.dataset.i;
      if (c.dataset.done) return;
      c.dataset.done = '1';
      state.left--;
      if (c.classList.contains('found') || c.classList.contains('boom')) return;
      if (golds.includes(i)) {
        c.textContent = '💰'; c.classList.add('found'); state.found++; state.score += 500;
        window.PocketLife.sfx('coin');
      } else if (bombs.includes(i)) {
        c.textContent = '💥'; c.classList.add('boom'); state.score = Math.max(0, state.score - 120);
        window.PocketLife.sfx('bad');
        area.classList.add('shake'); setTimeout(() => area.classList.remove('shake'), 400);
      } else {
        const h = heatFor(i);
        const cls = h > 0.6 ? 'close' : h > 0.3 ? 'cold' : '';
        c.textContent = h > 0.6 ? '🔥' : h > 0.3 ? '✨' : '·';
        if (cls) c.classList.add(cls);
        window.PocketLife.sfx('dig');
      }
      setScore(state.score);
      setInfo(`${state.left} digs left · ${state.found}/2 found`);
      heat.style.width = (heatFor(i) * 100) + '%';
      endIfDone();
    }));
    setInfo(`${digs} digs left · 0/2 found`);
    current = {
      petEmoji: opts.petEmoji, score: 0,
      cleanup() { state.running = false; },
      onDone(score) {
        return { game: 'Treasure', score, coins: 10 + Math.round(score / 12), xp: 12, item: state.found >= 2 ? 'trinket_crown' : null, line: 'Dug up something shiny.' };
      }
    };
    current.score = 0;
  }

  /* ================= OBSTACLE ================= */
  function obstacle(opts) {
    const area = areaEl();
    area.innerHTML = `<div class="obstacle-stage">
      <div class="obstacle-ground"></div>
      <div class="ob-cloud" style="top:12%;left:10%">☁️</div>
      <div class="ob-cloud" style="top:22%;right:20%">☁️</div>
      <div class="ob-pet">${opts.petEmoji || '🐣'}</div>
      <div class="ob-scoreboard">Score 0</div>
    </div>`;
    const scene = area.querySelector('.obstacle-stage');
    scene.style.background = 'linear-gradient(180deg, #2d1f57, #4a2c6e 70%, #6b3f7e)';
    const petEl = area.querySelector('.ob-pet');
    const scoreEl2 = area.querySelector('.ob-scoreboard');
    const state = { y: 0, vy: 0, score: 0, speed: 5.2, t: 0, rocks: [], running: true, chances: 3, alive: true, lastSpawn: 0 };
    let raf = null;
    let last = 0;
    const groundY = () => scene.clientHeight * 0.22;

    function jump() {
      if (!state.running || !state.alive) return;
      if (state.y <= 0.1) { state.vy = 13.5; window.PocketLife.sfx('jump'); }
    }
    area.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
    listenKeys(e => { if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'Enter') { e.preventDefault(); jump(); } });

    function spawnRock() {
      const r = document.createElement('div');
      r.className = 'ob-rock';
      const type = Math.random() < 0.3 && state.score > 250 ? '🪨🪨' : '🪨';
      r.textContent = type;
      r.style.left = scene.clientWidth + 'px';
      r.dataset.x = scene.clientWidth;
      scene.appendChild(r);
      state.rocks.push(r);
    }

    function loop(now) {
      if (!state.running) return;
      const dt = Math.min(48, now - (last || now));
      last = now;
      state.t += dt;
      if (state.alive) state.score += dt * 0.06;
      state.speed = 4.6 + state.t / 9000;
      scoreEl2.textContent = 'Score ' + Math.round(state.score) + ' · ♥'.repeat(Math.max(0, state.chances));
      petEl.style.bottom = (20 + state.y) + '%';
      state.vy -= 0.62;
      state.y = Math.max(0, state.y + state.vy);
      if (state.y <= 0) state.vy = Math.min(0, state.vy);

      state.lastSpawn += dt;
      const every = Math.max(700, 1400 - state.t / 40);
      if (state.alive && state.lastSpawn > every) { state.lastSpawn = 0; spawnRock(); }

      const petX = scene.clientWidth * 0.18;
      state.rocks.forEach(r => {
        let x = +r.dataset.x - state.speed * dt / 16.6;
        r.dataset.x = x;
        r.style.left = x + 'px';
        const rockW = r.textContent.length * 24;
        if (!r.dataset.hit && x < petX + 24 && x + rockW * 0.55 > petX - 4 && state.y < 34) {
          r.dataset.hit = '1';
          state.chances--;
          window.PocketLife.sfx('bad');
          scene.classList.add('shake');
          setTimeout(() => scene.classList.remove('shake'), 380);
          if (state.chances <= 0) { state.alive = false; setTimeout(() => { state.running = false; endGame(); }, 500); }
        }
        if (x < -60) { r.remove(); }
      });
      state.rocks = state.rocks.filter(r => r.dataset.x >= -60);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    setInfo('Space / tap to jump over the rocks');

    current = {
      petEmoji: opts.petEmoji, score: 0,
      cleanup() { state.running = false; cancelAnimationFrame(raf); },
      onDone(score) { return { game: 'Obstacle', score: Math.round(score), coins: 8 + Math.round(score / 20), xp: 14, item: Math.round(score) > 400 ? 'trinket_feather' : null, line: 'A proper adventure run!' }; }
    };
  }

  /* ================= PUZZLE ================= */
  function puzzle(opts) {
    const area = areaEl();
    const size = 5;
    const walls = new Set();
    for (let i = 0; i < 5; i++) {
      walls.add(`${Math.floor(Math.random() * size)},${Math.floor(Math.random() * size)}`);
      walls.add(`${Math.floor(Math.random() * size)},${Math.floor(Math.random() * size)}`);
    }
    let px = 0, py = size - 1;
    walls.delete(`${px},${py}`);
    let gx = size - 1, gy = 0;
    walls.delete(`${gx},${gy}`);
    let ex = size - 1, ey = size - 1;
    walls.delete(`${ex},${ey}`);
    if (px === gx && py === gy) gx = size - 2;

    const state = { moves: 0, score: 0, got: false, dead: false, running: true };
    area.innerHTML = `<div class="puzzle-wrap"><div class="puzzle-grid" style="grid-template-columns:repeat(${size},1fr)"></div></div>`;
    const grid = area.querySelector('.puzzle-grid');
    function draw() {
      let h = '';
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const k = `${x},${y}`;
        let cls = 'pcell';
        if (walls.has(k)) cls += ' wall';
        if (x === ex && y === ey) cls += ' exit';
        if (x === px && y === py) cls += ' player';
        let inner = '';
        if (x === gx && y === gy && !state.got) inner = '💎';
        else if (x === ex && y === ey) inner = state.got ? '🌟' : '🌀';
        else if (cls.includes('player')) inner = state.got ? '🚪' : '';
        else if (cls.includes('wall')) inner = '';
        h += `<div class="${cls}">${inner}</div>`;
      }
      grid.innerHTML = h;
    }
    draw();
    const dt = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd'];
    function move(dx, dy) {
      if (!state.running) return;
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) return;
      if (walls.has(`${nx},${ny}`)) {
        window.PocketLife.sfx('bad');
        grid.classList.add('shake'); setTimeout(() => grid.classList.remove('shake'), 300);
        return;
      }
      px = nx; py = ny; state.moves++;
      if (px === gx && py === gy && !state.got) {
        state.got = true;
        window.PocketLife.sfx('coin');
        setInfo('Gem collected! Reach the portal 🌟');
      }
      if (state.got && px === ex && py === ey) {
        state.score = Math.max(150, 900 - state.moves * 25);
        endGame();
        return;
      }
      draw();
      setInfo(`Moves: ${state.moves} · ${state.got ? 'go to the portal' : 'find the gem 💎'}`);
    }
    listenKeys(e => {
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w') { e.preventDefault(); move(0, -1); }
      else if (k === 'ArrowDown' || k === 's') { e.preventDefault(); move(0, 1); }
      else if (k === 'ArrowLeft' || k === 'a') { e.preventDefault(); move(-1, 0); }
      else if (k === 'ArrowRight' || k === 'd') { e.preventDefault(); move(1, 0); }
    });
    setInfo('Moves: 0 · find the gem 💎');
    current = {
      petEmoji: opts.petEmoji, score: 0,
      cleanup() { state.running = false; },
      onDone(score) { return { game: 'Puzzle', score, coins: 12 + Math.round(score / 15), xp: 15, item: state.got ? 'trinket_stone' : null, line: 'Solved a tricky little puzzle.' }; }
    };
  }

  const GAMES = {
    rhythm: { id: 'rhythm', name: 'Star Rhythm', emoji: '🎹', desc: 'Tap the beat. Build combos with your creature.', gradient: ['rgba(143,247,213,.22)', 'rgba(195,166,255,.12)'], start: rhythm },
    memory: { id: 'memory', name: 'Memory Garden', emoji: '🧠', desc: 'Find all the matching pairs.', gradient: ['rgba(255,232,163,.22)', 'rgba(255,158,207,.12)'], start: memory },
    fishing: { id: 'fishing', name: 'Gentle Fishing', emoji: '🎣', desc: 'Wait, react, and reel in a catch.', gradient: ['rgba(143,211,255,.22)', 'rgba(143,247,213,.12)'], start: fishing },
    treasure: { id: 'treasure', name: 'Treasure Hunt', emoji: '🗺️', desc: 'Dig for treasure. Avoid the bombs.', gradient: ['rgba(255,158,207,.22)', 'rgba(255,232,163,.12)'], start: treasure },
    obstacle: { id: 'obstacle', name: 'Obstacle Dash', emoji: '🏃', desc: 'Jump the rocks. Keep running.', gradient: ['rgba(195,166,255,.22)', 'rgba(255,125,148,.12)'], start: obstacle },
    puzzle: { id: 'puzzle', name: 'Path Puzzle', emoji: '🧩', desc: 'Collect the gem and reach the portal.', gradient: ['rgba(143,247,213,.22)', 'rgba(255,232,163,.12)'], start: puzzle }
  };

  function start(id, opts) {
    const g = GAMES[id];
    if (!g) return;
    clearStage();
    const stage = stageEl();
    stage.hidden = false;
    document.getElementById('game-title').textContent = g.name.toUpperCase();
    document.getElementById('game-score').textContent = 'Score 0';
    document.getElementById('game-info').textContent = '';
    stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    g.start(opts || {});
    if (current) { current.game = g.name; current.petEmoji = opts && opts.petEmoji; }
  }

  function stop() { clearStage(); }

  window.PocketGames = { GAMES, start, stop };
})();
