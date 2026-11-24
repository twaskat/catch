/* PocketLife — main game */
(function () {
  'use strict';
  const S = window.Species;
  const R = window.CreatureRender;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
  const SAVE_KEY = 'pocketlife.save.v1';
  const SETTINGS_KEY = 'pocketlife.settings.v1';

  /* ================== STATE ================== */
  const NAMES = ['Mochi', 'Pip', 'Sprout', 'Nori', 'Juniper', 'Bean', 'Clover', 'Waffle', 'Cosmo', 'Pudding', 'Yuzu', 'Tofu', 'Peach', 'Bramble', 'Fennel', 'Mimosa', 'Saffron', 'Basil', 'Miso', 'Nimbus'];
  const USER_NAMES = ['Starlight', 'Sunbeam', 'Little One', 'Tiny Friend', 'Dreamer', 'Pocket', 'Moonbeam'];

  let state = null;
  let settings = { sound: true, relaxed: false, motion: true, nightDark: true, apiKey: '', apiModel: 'openrouter/auto', aiEnabled: false };
  const ui = { view: 'pet', invTab: 'food', shopCat: 'food', log: [], lastMin: -1, lastAi: 0 };

  /* ================== SOUND ================== */
  let actx = null;
  function audio() {
    if (!settings.sound) return null;
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  const Snd = {
    blip() { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = 660; g.gain.value = .05; o.connect(g); g.connect(a.destination); o.start(); o.frequency.exponentialRampToValueAtTime(880, a.currentTime + .08); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .14); o.stop(a.currentTime + .15); },
    good() { const a = audio(); if (!a) return; [523, 659, 784].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = .06; o.connect(g); g.connect(a.destination); o.start(a.currentTime + i * .07); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + i * .07 + .2); o.stop(a.currentTime + i * .07 + .22); }); },
    coin() { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.setValueAtTime(880, a.currentTime); o.frequency.setValueAtTime(1320, a.currentTime + .06); g.gain.value = .04; o.connect(g); g.connect(a.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .18); o.stop(a.currentTime + .2); },
    bad() { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.value = 200; o.frequency.exponentialRampToValueAtTime(90, a.currentTime + .2); g.gain.value = .05; o.connect(g); g.connect(a.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .22); o.stop(a.currentTime + .24); },
    flip() { Snd.blip(); },
    jump() { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(330, a.currentTime); o.frequency.exponentialRampToValueAtTime(760, a.currentTime + .16); g.gain.value = .035; o.connect(g); g.connect(a.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .2); o.stop(a.currentTime + .22); },
    splash() { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = 500; o.frequency.exponentialRampToValueAtTime(120, a.currentTime + .2); g.gain.value = .05; o.connect(g); g.connect(a.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .25); o.stop(a.currentTime + .26); },
    alert() { const a = audio(); if (!a) return; [880, 1100].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(a.destination); o.start(a.currentTime + i * .1); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + i * .1 + .1); o.stop(a.currentTime + i * .1 + .12); }); },
    dig() { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = 160; o.frequency.exponentialRampToValueAtTime(60, a.currentTime + .12); g.gain.value = .05; o.connect(g); g.connect(a.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .15); o.stop(a.currentTime + .16); },
    level() { const a = audio(); if (!a) return; [392, 523, 659, 784, 1047].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(a.destination); o.start(a.currentTime + i * .09); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + i * .09 + .3); o.stop(a.currentTime + i * .09 + .32); }); }
  };
  window.PocketLife = window.PocketLife || {};
  window.PocketLife.sfx = name => { try { (Snd[name] || Snd.blip)(); } catch (e) {} };

  /* ================== CREATION ================== */
  function newGenome(eggBias) {
    const genes = {};
    for (let i = 0; i < 6; i++) genes[i] = Math.random();
    const hues = ['#a8e6f8', '#b9f0b0', '#ffd1e6', '#d9c8ff', '#ffb07a', '#ffe8a3', '#bde8ff', '#9fe8e0', '#c9b8ff', '#ffc2e0'];
    return {
      genes,
      form: eggBias || 'egg',
      colors: { body: allColors[Math.floor(Math.random() * allColors.length)], accent: '#ffffff', eye: 'warm' },
      pattern: null,
      variant: randi(0, 2),
      element: eggBias || 'mystic',
      genesString: Object.values(genes).map(v => Math.round(v * 15).toString(16)).join('')
    };
  }
  const allColors = ['#a8e6f8', '#b9f0b0', '#ffd1e6', '#d9c8ff', '#ffc4a8', '#ffe8a3', '#bde8ff', '#9fe8e0', '#e0c2ff', '#ffb3d9', '#c2e8a8', '#ffe0f0', '#c8d8ff', '#ffd6b0'];

  function createPet(opts) {
    opts = opts || {};
    const name = opts.name || pick(NAMES);
    const traits = {};
    ['curiosity', 'affection', 'bravery', 'energy', 'social', 'playfulness', 'calmness', 'loveFood', 'neurotic'].forEach(k => traits[k] = clamp(rand(0.15, 0.9), 0, 1));
    const pet = {
      id: 'p' + Date.now(),
      name,
      userNames: [pick(USER_NAMES)],
      species: 'egg',
      eggBias: opts.bias || null,
      bornAt: Date.now(),
      ageDays: 0,
      stageProgress: 0,
      level: 1,
      xp: 0,
      genome: newGenome(opts.bias ? null : null),
      traits,
      lifespan: 1000000000,
      needs: { hunger: 82, thirst: 80, energy: 88, hygiene: 92, happiness: 74, health: 95, social: 62, bladder: 88 },
      emotions: { excited: 12, curious: 40, bored: 5, affectionate: 22, nervous: 8, sadness: 0, pride: 0 },
      hygieneMess: 0,
      sleeping: false,
      sleepSince: 0,
      careScore: 55,
      lifetime: { minutesAlive: 0, feeds: 0, baths: 0, plays: 0, pets: 0, talks: 0, stories: 0, sleeps: 0, exams: 0, gamesPlayed: 0, coinsEarned: 0, coinsSpent: 0, hoursAwake: 0, steps: 0 },
      weekly: [],
      discoveries: {},
      memories: [],
      photos: [],
      achievements: [],
      tricks: [],
      clothes: null,
      roomDecor: [],
      toysOwned: ['ball'],
      favoriteToy: null,
      favoriteItem: null,
      companion: null,
      legendary: 0,
      bias: null,
      stats: { byHour: {} },
      lifetime2: { affection: 0, explorations: 0, foodsEaten: 0, plays: 0, gamesWon: 0, gardenHarvests: 0 },
      adventure: { trips: 0, loot: {}, recent: [] },
      traitsHistory: []
    };
    pet.traitsHistory.push({ t: 0, days: 0, traits: { ...traits } });
    return pet;
  }

  function newState(opts) {
    return {
      version: 1,
      pet: createPet(opts),
      coins: 120,
      inventory: { snack: 3, water: 2, apple: 1, seedBerry: 2, toy: 0 },
      garden: { plots: Array.from({ length: 9 }, (_, i) => ({ unlocked: i < 3 })) },
      dex: ['egg'],
      eggs: [],
      time: 7 * 60 + 30,
      day: 1,
      weather: 'clear',
      weatherUntil: 0,
      event: null,
      eventSeed: randi(0, 999999),
      totalMinutesPlayed: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      lastTickAt: Date.now(),
      chatHistory: [],
      achievements: [],
      counters: { games: 0 },
      log: [],
      startDay: 1,
      dailyShopSeed: randi(0, 999999),
      lastEventDay: 0
    };
  }

  /* ================== SAVE / LOAD ================== */
  function migrate(s) {
    if (!s || !s.pet) return null;
    s.inventory = s.inventory || {};
    s.dex = s.dex || ['egg'];
    s.eggs = s.eggs || [];
    s.garden = s.garden || { plots: Array.from({ length: 9 }, (_, i) => ({ unlocked: i < 3 })) };
    s.pet.genome = s.pet.genome || newGenome();
    s.pet.lifetime2 = s.pet.lifetime2 || { affection: 0, explorations: 0, foodsEaten: 0, plays: 0, gamesWon: 0, gardenHarvests: 0 };
    s.pet.adventure = s.pet.adventure || { trips: 0, loot: {}, recent: [] };
    s.pet.emotions = s.pet.emotions || {};
    Object.assign(s.pet.emotions, { excited: 10, curious: 30, bored: 0, affectionate: 20, nervous: 5, sadness: 0, pride: 0 }, s.pet.emotions);
    s.pet.lifetime = Object.assign({ minutesAlive: 0, feeds: 0, baths: 0, plays: 0, pets: 0, talks: 0, stories: 0, sleeps: 0, gamesPlayed: 0, coinsEarned: 0, coinsSpent: 0 }, s.pet.lifetime);
    s.pet.stats = s.pet.stats || { byHour: {} };
    return s;
  }

  function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const s = migrate(JSON.parse(raw));
      if (!s) return false;
      state = s;
      return true;
    } catch (e) { console.warn('load failed', e); return false; }
  }

  function save() {
    if (!state) return;
    try {
      state.lastTickAt = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      const st = $('#save-status');
      if (st) st.textContent = 'Saved at ' + new Date().toLocaleTimeString();
    } catch (e) { console.warn('save failed', e); }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) Object.assign(settings, JSON.parse(raw));
    } catch (e) {}
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  /* ================== ECONOMY / XP ================== */
  function xpForLevel(l) { return Math.round(40 * Math.pow(l, 1.35)); }
  function levelForXp(xp) { let l = 1, total = 0; while (total + xpForLevel(l) <= xp && l < 60) { total += xpForLevel(l); l++; } return l; }
  function xpToLevel() { const l = state.pet.level; let total = 0; for (let i = 1; i < l; i++) total += xpForLevel(i); return { cur: state.pet.xp - total, need: xpForLevel(l) }; }

  function addXp(n, silent) {
    state.pet.xp += n;
    const nl = levelForXp(state.pet.xp);
    if (nl > state.pet.level) {
      state.pet.level = nl;
      Snd.level();
      toast(`⭐ ${state.pet.name} reached level ${nl}!`, 'gold');
      journal(`Level ${nl}!`);
      confetti();
    } else if (!silent) {
      journal(`+${n} XP`);
    }
    renderHud();
  }

  function addCoins(n, silent) {
    state.coins += n;
    if (n > 0) { state.coinsEarned += n; state.pet.lifetime.coinsEarned += n; state.pet.lifetime2.coinsEarned = (state.pet.lifetime2.coinsEarned || 0) + n; }
    if (!silent) { journal(`🪙 ${n > 0 ? '+' : ''}${n} coins`); if (n > 0) Snd.coin(); }
    renderHud();
    renderInventory();
    checkAchievements();
  }

  function spend(n) {
    if (state.coins < n) { toast('🪙 Not enough coins — try the arcade!', 'bad'); return false; }
    state.coins -= n;
    state.coinsSpent += n;
    state.pet.lifetime.coinsSpent += n;
    renderHud();
    return true;
  }

  function addItem(id, n) {
    state.inventory[id] = (state.inventory[id] || 0) + (n || 1);
    renderInventory();
  }
  function removeItem(id, n) {
    if ((state.inventory[id] || 0) < n) return false;
    state.inventory[id] -= n;
    if (state.inventory[id] <= 0) delete state.inventory[id];
    renderInventory();
    return true;
  }

  function allItems() {
    return [].concat(S.FOODS, S.TOYS, S.SEEDS, S.WEARABLES, S.DECOR, S.KEYS, S.EGGS, S.GAME_ITEMS);
  }
  function itemById(id) { return allItems().find(i => i.id === id); }

  /* ================== NEEDS & TICK ================== */
  function gameHours() { return state.time / 60; }

  function timeOfDay() {
    const h = gameHours();
    if (h >= 5.5 && h < 8) return 'dawn';
    if (h >= 8 && h < 17) return 'day';
    if (h >= 17 && h < 19.5) return 'dusk';
    return 'night';
  }

  function meeting(p) {
    const h = gameHours();
    const sleepingHours = p.sleeping || (h < 6 || h > 21);
    const rate = sleepingHours ? 0.25 : 1;
    const n = p.needs;
    const relaxed = settings.relaxed;
    n.hunger -= 0.55 * rate;
    n.thirst -= 0.62 * rate;
    n.energy -= 0.42 * rate;
    n.hygiene -= 0.32 * rate;
    n.social -= 0.36 * rate;
    n.bladder -= 0.5 * rate;
    if (p.bladder <= 0) { p.bladder = randi(70, 90); n.hygiene -= 18; addPoop(); }
    if (n.hygiene < 20) n.health -= 0.07 * rate;
    else n.health += 0.03;
    if (n.hunger < 15) n.health -= 0.05 * rate;
    if (n.happiness > 60 && n.hunger > 40 && n.hygiene > 40) n.health += 0.05;
    if (n.hunger < 25) n.happiness -= 0.3 * rate;
    if (n.hygiene < 25) n.happiness -= 0.15 * rate;
    if (n.social < 25) n.happiness -= 0.2 * rate;
    if (n.happiness > 70) n.health += 0.02;
    if (relaxed) {
      n.hunger = Math.max(n.hunger, 12); n.thirst = Math.max(n.thirst, 12); n.energy = Math.max(n.energy, 12);
      n.hygiene = Math.max(n.hygiene, 12); n.social = Math.max(n.social, 12); n.health = Math.max(n.health, 25);
      n.happiness = Math.max(n.happiness, 15);
    }
    n.hunger = clamp(n.hunger, relaxed ? 12 : 0, 100);
    n.thirst = clamp(n.thirst, relaxed ? 12 : 0, 100);
    n.energy = clamp(n.energy, relaxed ? 12 : 0, 100);
    n.hygiene = clamp(n.hygiene, 0, 100);
    n.social = clamp(n.social, 0, 100);
    n.happiness = clamp(n.happiness, relaxed ? 15 : 0, 100);
    n.health = clamp(n.health, relaxed ? 25 : 0, 100);
    n.bladder = clamp(n.bladder, 0, 100);

    // emotions drift
    const e = p.emotions;
    e.excited = clamp(e.excited - 0.35 + (n.happiness > 70 ? 0.1 : 0), 0, 100);
    e.curious = clamp(e.curious + 0.12 - (p.lastFedByPlayer > Date.now() - 120000 ? 0.2 : 0), 0, 100);
    e.bored = clamp(e.bored + 0.22 - (n.happiness > 70 ? 0.1 : 0), 0, 100);
    e.affectionate = clamp(e.affectionate - 0.18 + (n.social > 60 ? 0.06 : 0), 0, 100);
    e.nervous = clamp(e.nervous - 0.16 + (state.weather === 'storm' ? 0.5 : 0) + (p.sleeping ? -0.2 : 0), 0, 100);
    e.sadness = clamp(e.sadness - 0.15 + (n.happiness < 30 ? 0.3 : 0), 0, 100);
    e.pride = clamp(e.pride - 0.1, 0, 100);

    p.lifetime.minutesAlive++;
    state.totalMinutesPlayed++;
    if (!p.sleeping) p.lifetime.hoursAwake += 1;

    // care score
    const healthy = n.hunger > 40 && n.thirst > 40 && n.hygiene > 35 && n.energy > 20 && n.happiness > 40;
    p.careScore = clamp(p.careScore + (healthy ? 0.35 : -0.25), 0, 100);

    // sleep
    if (p.sleeping) {
      p.sleepSince++;
      n.energy += 1.5;
      if (n.energy >= 99) { wakeUp(true); }
      if (p.sleepSince > 20 * 60) { wakeUp(true); }
    } else {
      const hh = gameHours();
      const tired = n.energy < 28;
      if (hh >= 22 || hh < 5 || tired) {
        if (Math.random() < 0.04 || tired) putToSleep(true);
      }
    }

    // stats
    const hour = Math.floor(gameHours());
    p.stats.byHour[hour] = (p.stats.byHour[hour] || 0) + 1;

    // messy room
    if (n.hygiene < 50 && Math.random() < 0.02) addPoop();

    p.ageDays = (Date.now() - p.bornAt) / 86400000;
    advanceTime(1);
  }

  function addPoop() {
    state.poop = state.poop || [];
    state.poop.push({ id: 'd' + Math.random(), emoji: '💩' });
    if (state.poop.length > 3) state.poop.shift();
    renderPoop();
  }

  function advanceTime(mins) {
    state.time += mins;
    while (state.time >= 24 * 60) { state.time -= 24 * 60; state.day++; onNewDay(); }
    const weatherEvents = ['clear', 'sunny', 'cloudy', 'rain', 'storm', 'snow', 'aurora', 'fog'];
    const hour = Math.floor(state.time / 60);
    if (hour !== ui.lastMin) {
      ui.lastHour = hour;
      if (Math.random() < 0.22) {
        const w = pick(weatherEvents);
        if (w !== state.weather) {
          state.weather = w;
          journal(`Weather: ${weatherName(w)}`);
          renderScene();
          // creatures react to weather
          if (w === 'storm') { state.pet.emotions.nervous = clamp(state.pet.emotions.nervous + 14, 0, 100); say('Is it loud outside? …I\'ll be brave.'); }
          if (w === 'snow') { state.pet.emotions.excited = clamp(state.pet.emotions.excited + 20, 0, 100); say('Snow! Everything is soft and quiet!'); }
          if (w === 'rain') { say('I like the rain sound. Like a gentle drum.'); }
          if (w === 'aurora') { say('The sky is playing tonight. Isn\'t it beautiful?', 'shiny'); }
          if (w === 'sunny') { say('The light is so warm. Perfect for napping.', 'sunshine'); }
        }
      }
    }
    if (state.pet) {
      // autonomous behaviors
      if (Math.random() < 0.08 && !state.pet.sleeping) autonomousAction();
      if (gameHours() > 23 || gameHours() < 5) { if (state.pet.sleeping && state.pet.sleepSince > 8 * 60) wakeUp(true); }
    }
    if (state.event && state.event.endsAt < Date.now()) { state.event = null; }
  }

  function onNewDay() {
    state.pet.weekly = state.pet.weekly || [];
    state.pet.weekly.unshift({ day: state.day, care: Math.round(state.pet.careScore), happiness: Math.round(state.pet.needs.happiness) });
    if (state.pet.weekly.length > 7) state.pet.weekly.pop();
    state.pet.careScore = clamp(state.pet.careScore + 4, 0, 100);
    state.pet.ageDays = (Date.now() - state.pet.bornAt) / 86400000;
    state.dailyShopSeed = randi(0, 999999);
    state.lastEventDay = state.day;
    dailyEvent();
    checkEvolution();
    takePhoto('A new day begins', '📅', 'sunrise');
    journal(`Day ${state.day} - ${state.pet.name} greeted the morning.`);
    const o = $('#event-status');
    if (o && state.event) o.textContent = `${state.event.emoji} ${state.event.name}: ${state.event.desc}`;
  }

  function dailyEvent() {
    if (state.lastEventDay === state.day && state.event) return;
    const ev = pick(S.EVENTS);
    state.event = { id: ev.id, name: ev.name, emoji: ev.emoji, desc: ev.desc, endsAt: Date.now() + 6 * 3600 * 1000, effect: ev.effect };
    applyEventEffect(ev);
    state.pet.lifetime2.events = (state.pet.lifetime2.events || 0) + 1;
    toast(`${ev.emoji} Daily event: ${ev.name}`, 'gold');
    journal(`${ev.emoji} ${ev.name}`);
  }

  function applyEventEffect(ev) {
    const p = state.pet, n = p.needs, e = p.emotions, f = ev.effect || {};
    if (f.happiness) n.happiness = clamp(n.happiness + f.happiness, 0, 100);
    if (f.curiosity) e.curious = clamp(e.curious + f.curiosity, 0, 100);
    if (f.nervousness) e.nervous = clamp(e.nervous + f.nervousness, 0, 100);
    if (f.energy) n.energy = clamp(n.energy + f.energy, 0, 100);
    if (f.affection) e.affectionate = clamp(e.affectionate + f.affection, 0, 100);
    if (f.social) n.social = clamp(n.social + f.social, 0, 100);
    if (f.coins) addCoins(f.coins, true);
    if (f.gardenBoost) { state.garden.plots.forEach(pl => { if (pl.plant) pl.water = 100; }); }
    if (f.discount) state.shopDiscount = f.discount;
  }

  /* ================== AUTONOMY ================== */
  const AUTONOMY = [
    { key: 'eat', need: p => p.needs.hunger < 45, trying: 'I\'m so hungry… is there anything to eat?', do: p => { const foods = Object.keys(state.inventory).filter(id => { const it = itemById(id); return it && it.sat !== undefined; }); if (!foods.length) return false; const id = pick(foods); removeItem(id, 1); feedItem(id, true); return true; } },
    { key: 'drink', need: p => p.needs.thirst < 45, trying: 'My throat feels dry.', do: p => { if (state.inventory.water) { removeItem('water', 1); feedItem('water', true); return true; } return false; } },
    { key: 'sleep', need: p => p.needs.energy < 35, trying: '*yawns* …maybe just a little nap.', do: p => { putToSleep(false); return true; } },
    { key: 'play', need: p => p.needs.happiness < 45 || p.emotions.bored > 65, trying: 'I\'m a bit bored. I might make my own fun.', do: p => { const t = pick(p.toysOwned || ['ball']); addJoy(6); changeNeeds({ energy: -3 }); say(`*bounces ${t} around the room*`); return true; } },
    { key: 'clean', need: p => p.needs.hygiene < 35, trying: '*grooms itself*', do: p => { changeNeeds({ hygiene: 18 }); return true; } },
    { key: 'social', need: p => p.needs.social < 35, trying: 'Psst. Are you there?', do: p => { changeNeeds({ social: 10 }); say(pick(['Hey. I\'m right here.', 'Don\'t forget about me, okay?', 'I made you a drawing. Well. I thought about one.'])); return true; } },
    { key: 'explore', need: p => p.emotions.curious > 70, trying: 'I wonder what\'s behind the shelf…', do: p => { p.lifetime2.steps = (p.lifetime2.steps || 0) + 1; addJoy(4); p.emotions.bored = clamp(p.emotions.bored - 6, 0, 100); say(pick(['Found a dust bunny. I named it Gerald.', 'The floorboards are warm here.', 'I think I found a secret. I\'ll keep it.'])); return true; } },
    { key: 'stretch', need: p => p.emotions.excited > 65, trying: '*zoomies*', do: p => { addJoy(6); changeNeeds({ energy: -4 }); say('Wheee!'); return true; } }
  ];

  function autonomousAction() {
    const p = state.pet;
    const ers = AUTONOMY.filter(a => { try { return a.need(p); } catch (e) { return false; } });
    if (!ers.length) {
      if (Math.random() < 0.3) {
        const idle = [['I\'m just watching the light on the wall.', 'idle'], ['Do you think clouds have names?', 'idle'], ['I like it when it\'s quiet.', 'idle'], ['*hums a little tune*', 'idle'], ['I wonder if the plants dream.', 'idle']];
        const q = pick(idle);
        say(q[0], q[1] || 'idle', 2600);
        if (Math.random() < 0.25) journal(`🗯️ ${q[0].replace(/\*/g, '')}`);
      }
      return;
    }
    const action = pick(ers);
    if (!settings.motion) return;
    if (Math.random() < 0.6) say(action.trying, 'idle', 2600);
    setTimeout(() => { try { action.do(p); } catch (e) {} onPetChanged(); }, 600);
  }

  /* ================== NEED ACTIONS ================== */
  function changeNeeds(delta) {
    const n = state.pet.needs;
    Object.keys(delta).forEach(k => { if (n[k] !== undefined) n[k] = clamp(n[k] + delta[k], 0, 100); });
    onPetChanged();
  }
  function addJoy(v) {
    const n = state.pet.needs;
    n.happiness = clamp(n.happiness + v, 0, 100);
    state.pet.emotions.pride = clamp(state.pet.emotions.pride + v * 0.2, 0, 100);
    onPetChanged();
  }

  function feedItem(id, auto) {
    const it = itemById(id);
    const p = state.pet;
    if (!it || it.sat === undefined) return false;
    const t = p.discoveries[id] = p.discoveries[id] || { likes: 0, dislikes: 0, name: it.name, emoji: it.emoji };
    const pref = tasteFor(p, id);
    const joyBoost = pref > 0 ? it.joy * 1.6 : pref < 0 ? -it.joy * 0.4 : it.joy;
    changeNeeds({
      hunger: it.sat * (p.traits.loveFood > 0.7 ? 1.1 : 1),
      thirst: it.hyd,
      happiness: joyBoost,
      hygiene: -Math.abs(it.joy) * 0.12
    });
    if (pref > 0) t.likes += 1; else if (pref < 0) t.dislikes += 1;
    p.lifetime.feeds++;
    p.lifetime2.foodsEaten = (p.lifetime2.foodsEaten || 0) + 1;
    p.emotions.excited = clamp(p.emotions.excited + 18, 0, 100);
    p.lastFedByPlayer = Date.now();
    p.favoriteItem = 'food:' + id;
    if (pref > 0 && Math.random() < 0.7) say(pref > 0.5 ? `Mmm… ${it.name}! This is my favourite!` : `Ooh, ${it.name}. I like this a lot.`, 'heart');
    else if (pref < 0) say(`*eats the ${it.name} very slowly* … not my favourite, honestly.`, 'sweat');
    else if (Math.random() < 0.5) say(pick(['Yum!', 'Thank you!', 'Delicious.', 'More? …maybe later.']), 'yum');
    addXp(auto ? 2 : 3, true);
    remember('feed', `${p.name} enjoyed some ${it.name}.`);
    checkAchievements();
    onPetChanged();
    return true;
  }

  function tasteFor(p, id) {
    const g = p.genome.genes;
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
    const v = ((h / 997) + (g ? g[2] * 0.4 : 0.2)) % 1;
    if (v > 0.62) return 0.4 + v * 0.4;
    if (v < 0.22) return -0.6;
    return 0;
  }

  function petting() {
    const p = state.pet;
    const boost = p.traits.affection > 0.6 ? 10 : 7;
    changeNeeds({ happiness: boost, social: 7 });
    p.emotions.affectionate = clamp(p.emotions.affectionate + 16, 0, 100);
    p.lifetime.pets++;
    p.lifetime2.affection = (p.lifetime2.affection || 0) + 1;
    say(pick(['*closes eyes* mmm.', 'That\'s the spot.', 'Again? Please again.', '*purrs softly*', 'I feel so safe right now.']), 'heart');
    fx(['💗', '💕', '✨']);
    addXp(2, true);
    remember('pet', `${p.name} felt safe while being petted.`);
    onPetChanged();
  }

  function cuddle() {
    const p = state.pet;
    changeNeeds({ happiness: 12, social: 12, energy: 4 });
    p.emotions.affectionate = clamp(p.emotions.affectionate + 22, 0, 100);
    p.emotions.nervous = clamp(p.emotions.nervous - 20, 0, 100);
    p.lifetime2.affection = (p.lifetime2.affection || 0) + 1;
    say(pick(['*melts into a warm puddle of happy*', 'I could stay like this forever.', 'You smell like home.', '*snuggles closer*']), 'cuddle');
    fx(['🤗', '💖', '💫']);
    addXp(3, true);
    remember('cuddle', `${p.name} was held close and felt completely at peace.`);
    onPetChanged();
  }

  function bath() {
    const p = state.pet;
    changeNeeds({ hygiene: 55, happiness: p.needs.hygiene < 40 ? 8 : 2 });
    p.lifetime.baths++;
    p.emotions.excited = clamp(p.emotions.excited + 6, 0, 100);
    p.lastFedByPlayer = null;
    setPose('bathing', 2600);
    say(pick(['Bubbles! So many bubbles!', 'I\'m squeaky clean! *squeak*', 'The water is just right. Warm.', 'That tickled.']), 'bubble');
    fx(['🫧', '🫧', '🛁']);
    addXp(4, true);
    remember('bath', `A warm bubble bath made everything feel fresh.`);
    checkAchievements();
    onPetChanged();
  }

  function story(mins) {
    const p = state.pet;
    const texts = ['The Whispering Lantern', 'The Moon Who Lost Her Shine', 'A Very Small Dragon and a Very Large Blanket', 'The Garden That Grew at Night', 'The Star Who Was Afraid of the Dark'];
    const title = pick(texts);
    changeNeeds({ happiness: 9, energy: -6, social: 10 });
    p.emotions.calm = clamp((p.emotions.calm || 0) + 10, 0, 100);
    p.emotions.nervous = clamp(p.emotions.nervous - 15, 0, 100);
    p.lifetime.stories++;
    say(`"${title}"… I'm listening.`, 'story');
    setTimeout(() => say('Was there a happy ending? Good. I like those.', 'heart'), 2200);
    addXp(5, true);
    addMemory(`Bedtime story: "${title}"`, 'story');
    takePhoto(`Story time: ${title}`, '📖', 'night');
    journal(`📖 Read "${title}"`);
    p.emotions.sadness = clamp(p.emotions.sadness - 8, 0, 100);
    onPetChanged();
    return title;
  }

  function putToSleep(narration) {
    const p = state.pet;
    if (p.sleeping) return;
    p.sleeping = true;
    p.sleepSince = 0;
    p.lifetime.sleeps++;
    p.emotions.excited = clamp(p.emotions.excited - 40, 0, 100);
    if (narration) say(pick(['*curls up* goodnight.', 'Sleep with me?', '*soft happy sigh*']), 'zzz');
    setPose('sleeping', 0);
    journal('😴 Went to sleep');
    checkAchievements();
    renderScene();
    onPetChanged();
  }

  function wakeUp(auto) {
    const p = state.pet;
    if (!p.sleeping) return;
    p.sleeping = false;
    p.sleepSince = 0;
    p.emotions.curious = clamp(p.emotions.curious + 25, 0, 100);
    p.needs.energy = clamp(p.needs.energy + (auto ? 0 : 10), 0, 100);
    say(pick(['Good morning!', '*stretches* Slept so well.', '*blinks* Where was I? Oh. Right here.']), 'sunshine');
    addMemory('Woke up feeling rested.', 'sleep');
    journal('☀️ Woke up');
    renderScene();
    onPetChanged();
  }

  /* ================== MEMORY ================== */
  function remember(kind, text) {
    const p = state.pet;
    const entry = { id: 'm' + Date.now() + randi(0, 999), kind, text, at: Date.now(), day: state.day };
    p.memories.unshift(entry);
    if (p.memories.length > 80) p.memories.pop();
    renderProfile();
  }

  function addMemory(text, pose) {
    const p = state.pet;
    const emojis = { story: '📖', sunset: '🌅', sunrise: '🌄', night: '🌙', day: '☀️', play: '🎈', love: '💖', nature: '🌿', game: '🎮', rare: '✨' };
    const em = pose || pick(['🌟', '💫', '🌸', '🍀', '🌙']);
    p.photos.unshift({ id: 'ph' + Date.now() + randi(0, 999), caption: text, emoji: emojis[em] || em, at: Date.now(), day: state.day, colors: pick([['#c3a6ff', '#8ff7d5'], ['#ff9ecf', '#ffe8a3'], ['#8fd3ff', '#d9c8ff'], ['#ffe8a3', '#ff9ecf'], ['#8fe39c', '#8fd3ff']]), pose: em });
    if (p.photos.length > 40) p.photos.pop();
    if (Math.random() < 0.9) remember('photo', text);
    renderProfile();
    checkAchievements();
  }

  function takePhoto(caption, emoji, pose) {
    addMemory(caption + ' — Day ' + state.day, pose || emoji);
  }

  /* ================== EVOLUTION ================== */
  function checkEvolution() {
    const p = state.pet;
    const hatchIn = 2 * 60; // game minutes
    if (p.species === 'egg') {
      if (p.lifetime.minutesAlive >= hatchIn) hatchEgg();
      else p.stageProgress = Math.min(100, (p.lifetime.minutesAlive / hatchIn) * 100);
      return;
    }
    const sp = S.byId(p.species);
    const minutes = p.lifetime.minutesAlive + (p.xp || 0) * 0.6;
    const stageReqs = { baby: 60 * 8, child: 60 * 20, adult: 60 * 48, evolved: 60 * 120 };
    if (sp.stage === 'legendary') return;
    const req = stageReqs[sp.stage];
    if (!req) return;
    if (p.stageProgress === undefined) p.stageProgress = 0;
    if (p.stageStartAt == null && p.stageAge) p.stageStartAt = p.lifetime.minutesAlive - p.stageAge;
    if (p.stageStartAt == null) p.stageAge = (p.stageAge || 0) + 1;
    const careOk = p.careScore > 30 || settings.relaxed;
    const ageSince = p.stageStartAt ?? (p.lifetime.minutesAlive - (p.stageAge || 0));
    const ageMins = Math.max(0, minutes - ageSince);
    p.stageProgress = Math.min(100, (ageMins / req) * 100);
    if (ageMins >= req - 0.001 && careOk) {
      const before = p.species;
      evolve();
      if (p.species === before && p.stageProgress >= 100) {
        p.wantsToEvolve = true;
        p.stageStartAt = minutes - req + 1;
      }
    }
    if (ageMins > req * 3 && !careOk && settings.relaxed === false) {
      p.wantsToEvolve = true;
    }
  }

  function hatchEgg() {
    const p = state.pet;
    const bias = p.eggBias || (p.genome && p.genome.element && p.genome.element !== 'mystic' ? p.genome.element : null);
    const opts = S.evolutionOptions(p);
    let next;
    if (bias) {
      const elMap = { nature: ['sprout', 'budling'], water: ['blob', 'finny'], fire: ['budling'], shadow: ['glim'], light: ['glim'], storm: ['glim'], ice: ['finny'], mystic: ['glim'] };
      const prefs = elMap[bias] || [];
      const match = opts.find(o => prefs.includes(o.id));
      next = match || pick(opts);
    } else {
      next = pick(opts);
    }
    applySpecies(next);
    p.lifetime2.pets = (p.lifetime2.pets || 0) + 1;
    p.emotions.excited = clamp(p.emotions.excited + 50, 0, 100);
    showModal({
      emoji: '🥚✨',
      title: `Welcome, ${next.name}!`,
      body: `The egg cracks open in soft light. A tiny ${next.name} blinks up at you for the very first time.`,
      rows: [[`Name (hint)`, p.name], [`Stage`, next.stage.toUpperCase()], [`Element`, next.element], [`Personality`, topTrait(p)]],
      ok: 'Hello, little one'
    });
    Snd.level();
    confetti();
    addMemory(`${next.name} hatched today!`, 'size');
    journal(`🥚 Hatched into ${next.name}!`);
    checkAchievements();
    renderAll();
  }

  function evolve() {
    const p = state.pet;
    if (p.species === 'egg') return;
    const choice = S.chooseEvolution(p);
    if (!choice) return;
    const next = choice.species;
    // genetics bias
    const g = p.genome.genes || {};
    const elBias = { water: g[0], fire: g[1], nature: g[2], ice: g[3], storm: g[4], light: g[5] };
    const el = next.element;
    let colorShift = elBias[el] ? 0.12 : 0;
    applySpecies(next);
    p.bias = choice.bias;
    p.lifetime2.evolutions = (p.lifetime2.evolutions || 0) + 1;
    p.stageStartAt = p.lifetime.minutesAlive;
    p.stageAge = 0;
    p.emotions.pride = clamp(p.emotions.pride + 40, 0, 100);
    p.emotions.excited = clamp(p.emotions.excited + 60, 0, 100);
    p.needs.health = clamp(p.needs.health + 10, 0, 100);
    addXp(40, true);
    showModal({
      emoji: choice.bias === 'wild' ? '🌿' : choice.bias === 'affection' ? '💖' : choice.bias === 'play' ? '🎈' : '☕',
      title: `Evolution! ${p.name} → ${next.name}`,
      body: choice.bias === 'wild' ? `Your shared exploring shaped ${p.name}. It grew a wilder, braver heart.` : choice.bias === 'affection' ? `All that love changed ${p.name} into something even softer and brighter.` : choice.bias === 'play' ? `Years of playtime molded ${p.name} into a joyful, lively ${next.name}.` : `A cozy, well-fed, well-rested life grew ${p.name} into a calm ${next.name}.`,
      rows: [['New form', next.name], ['Stage', next.stage.toUpperCase()], ['Element', next.element], ['Evolution style', choice.bias]],
      ok: 'Amazing!'
    });
    Snd.level();
    confetti(60);
    addMemory(`Evolved into ${next.name}!`, 'size');
    journal(`🌟 Evolved into ${next.name}`);
    if (p.stage === 'adult') p.lifetime2.adults = 1;
    checkAchievements();
    renderAll();
  }

  function applySpecies(sp) {
    const p = state.pet;
    p.species = sp.id;
    const col = R.mix(sp.body, p.genome.colors.body, 0.3);
    p.genome.colors.body = col;
    p.genome.pattern = sp.pattern;
    p.genome.limit = sp.limit;
    p.genome.element = sp.element;
    addDex(sp.id);
  }

  function topTrait(p) {
    const t = p.traits;
    const labels = { curiosity: 'Curious', affection: 'Affectionate', bravery: 'Brave', energy: 'Energetic', social: 'Social', playfulness: 'Playful', calmness: 'Calm', loveFood: 'Foodie', neurotic: 'Sensitive' };
    const top = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
    return (labels[top[0]] || top[0]) + ` (${Math.round(top[1] * 100)}%)`;
  }

  function addDex(id) {
    if (!state.dex.includes(id)) {
      state.dex.push(id);
      const sp = S.byId(id);
      if (sp) {
        journal(`📖 Encyclopedia: discovered ${sp.name}`);
        checkAchievements();
      }
    }
  }

  /* ================== ACHIEVEMENTS ================== */
  function achieve(id) {
    if (state.achievements.includes(id)) return;
    state.achievements.push(id);
    const a = S.ACHIEVEMENTS.find(x => x.id === id);
    if (a) {
      toast(`${a.emoji} Achievement: ${a.name}`, 'gold');
      journal(`🏆 ${a.name}`);
      addCoins(20, true);
      confetti(30);
    }
    renderProfile();
  }

  function checkAchievements() {
    if (!state) return;
    const p = state.pet, L = p.lifetime, L2 = p.lifetime2;
    if (L.feeds >= 1) achieve('firstFeed');
    if (L.baths >= 1) achieve('firstBath');
    if (L.sleeps >= 1) achieve('firstSleep');
    if (p.species !== 'egg') achieve('hatch');
    if (L2.evolutions >= 1) achieve('firstEvolve');
    if ((S.byId(p.species) || {}).stage === 'adult') achieve('adult');
    if ((S.byId(p.species) || {}).stage === 'legendary') achieve('legend');
    if (L.talks >= 10) achieve('talk10');
    if (p.tricks.length >= 5) achieve('trick5');
    if ((state.counters.games || 0) >= 6) achieve('gamer');
    if (state.coins >= 100) achieve('coins100');
    if (state.coins >= 500) achieve('coins500');
    if ((L2.gardenHarvests || 0) >= 3) achieve('gardener');
    if ((L2.explorations || 0) >= 3) achieve('explorer');
    if (state.dex.length >= 10) achieve('collector');
    if (state.dex.length >= 20) achieve('dex20');
    if (p.photos.length >= 5) achieve('photo5');
    if ((p.emotions.affectionate || 0) >= 99) achieve('loved');
    if (p.needs.happiness >= 99 && (L2.happyHours || 0) >= 60) achieve('bestFriend');
    if ((L2.events || 0) >= 5) achieve('event5');
    if (p.needs.happiness >= 99) L2.happyHours = (L2.happyHours || 0) + 1;
  }

  /* ================== UI: TOASTS / MODAL / FX ================== */
  function toast(msg, kind) {
    const host = $('#toast-host');
    const d = document.createElement('div');
    d.className = 'toast' + (kind ? ' ' + kind : '');
    d.innerHTML = msg;
    host.appendChild(d);
    setTimeout(() => d.remove(), 3800);
  }

  function confetti(n) {
    if (!settings.motion) return;
    const colors = ['#ff9ecf', '#8ff7d5', '#ffe8a3', '#c3a6ff', '#8fd3ff'];
    for (let i = 0; i < (n || 40); i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = rand(5, 95) + 'vw';
      c.style.top = rand(-10, 20) + 'vh';
      c.style.background = pick(colors);
      c.style.animationDelay = rand(0, 0.4) + 's';
      c.style.transform = `rotate(${rand(0, 360)}deg)`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 2200);
    }
  }

  function showModal(opts) {
    const host = $('#modal-host');
    const m = $('#modal');
    const rows = (opts.rows || []).map(r => `<div class="m-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
    m.innerHTML = `<div class="m-emoji">${opts.emoji || '✨'}</div><h3>${opts.title || ''}</h3>${opts.body ? `<p>${opts.body}</p>` : ''}${rows ? `<div class="m-list">${rows}</div>` : ''}${opts.input ? `<input class="m-input" id="modal-input" value="${opts.input.value || ''}" placeholder="${opts.input.placeholder || ''}" />` : ''}${opts.tags ? `<div class="m-tags">${opts.tags.map(t => `<button class="m-tag${t.on ? ' on' : ''}" data-tag="${t.id}">${t.label}</button>`).join('')}</div>` : ''}<div class="m-actions">${(opts.actions || [{ label: opts.ok || 'Okay', kind: 'ok' }]).map((a, i) => `<button class="${a.kind || ''}" data-act="${i}">${a.label}</button>`).join('')}</div>`;
    host.hidden = false;
    let selectedTag = (opts.tags || []).find(t => t.on) ? (opts.tags || []).find(t => t.on).id : null;
    $$('.m-tag', m).forEach(b => b.addEventListener('click', () => {
      $$('.m-tag', m).forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      selectedTag = b.dataset.tag;
    }));
    $$('.m-actions button', m).forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.act;
      const input = $('#modal-input', m);
      const val = input ? input.value : null;
      host.hidden = true;
      const act = (opts.actions || [{}])[i];
      if (act && act.onClick) act.onClick(val, selectedTag);
      else if (opts.onClose) opts.onClose(val, selectedTag);
    }));
    if (opts.input) setTimeout(() => { const el = $('#modal-input'); if (el) { el.focus(); el.select(); } }, 60);
    m.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { const ok = $('.m-actions button', m); if (ok) ok.click(); e.stopPropagation(); } });
  }

  /* ================== UI: RENDER ================== */
  function say(text, emote, ms) {
    const el = $('#speech');
    el.textContent = text;
    el.classList.add('show');
    const e = $('#emote');
    if (emote) {
      const map = { heart: '💗', zzz: '💤', bubble: '🫧', yum: '😋', shiny: '✨', sunshine: '☀️', sweat: '💧', story: '📖', cuddle: '🤗', idle: '', rain: '☔', sad: '💧', sleep: '💤', star: '⭐' };
      e.textContent = map[emote] ?? emote;
      if (emote) e.classList.add('show'); else e.classList.remove('show');
    }
    clearTimeout(say._t);
    say._t = setTimeout(() => { el.classList.remove('show'); if (emote) e.classList.remove('show'); }, ms || 3200);
  }

  function fx(list) {
    const host = $('#fx');
    if (!host || !settings.motion) return;
    const map = { '💗': '💗', '💕': '💕', '✨': '✨', '🫧': '🫧', '🛁': '🫧', '🤗': '💛', '💖': '💖', '💫': '⭐', '☁️': '☁️', '🍎': '🍎' };
    list.forEach((e, i) => {
      const p = document.createElement('span');
      p.className = 'particle';
      p.textContent = map[e] || e;
      p.style.setProperty('--dx', rand(-40, 40) + 'px');
      p.style.animationDelay = (i * 0.12) + 's';
      p.style.left = rand(30, 70) + '%';
      host.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    });
  }

  let poseTimer = null;
  function setPose(pose, ms) {
    const wrap = $('#pet-wrap');
    if (!wrap) return;
    ['happy', 'sleeping', 'eating', 'bathing', 'sad', 'walking'].forEach(c => wrap.classList.remove(c));
    wrap.classList.remove('happy');
    if (pose) wrap.classList.add(pose);
    clearTimeout(poseTimer);
    if (ms) poseTimer = setTimeout(() => { wrap.classList.remove(pose); renderScene(); }, ms);
  }

  function expression() {
    const p = state.pet, e = p.emotions, n = p.needs;
    if (p.sleeping) return 'sleep';
    if (p.species === 'egg') return 'idle';
    const ranked = [['excited', e.excited], ['curious', e.curious], ['affectionate', e.affectionate], ['nervous', e.nervous], ['bored', e.bored], ['sad', e.sadness]];
    const top = ranked.sort((a, b) => b[1] - a[1])[0];
    if (n.happiness < 25) return 'sad';
    if (top[1] > 62) return { excited: 'excited', curious: 'curious', affectionate: 'happy', nervous: 'nervous', bored: 'bored', sad: 'sad' }[top[0]];
    if (n.happiness > 70) return 'happy';
    return 'content';
  }

  function weatherName(w) {
    return ({ clear: 'Clear sky', sunny: 'Sunny', cloudy: 'Cloudy', rain: 'Gentle rain', storm: 'Thunderstorm', snow: 'Snowfall', aurora: 'Aurora', fog: 'Foggy' })[w] || w;
  }
  function weatherEmoji(w) {
    return ({ clear: '🌤️', sunny: '☀️', cloudy: '☁️', rain: '🌧️', storm: '⛈️', snow: '🌨️', aurora: '🌌', fog: '🌫️' })[w] || '🌤️';
  }

  function renderPetSVG(blink) {
    const p = state.pet;
    const sp = S.byId(p.species) || S.byId('egg');
    const expr = expression();
    const wrap = $('#pet-wrap');
    if (wrap) {
      wrap.classList.toggle('sleeping', !!p.sleeping);
      wrap.classList.toggle('sad', expr === 'sad' && !p.sleeping);
      wrap.classList.toggle('happy', (expr === 'happy' || expr === 'excited') && !p.sleeping);
    }
    const html = R.render({
      form: sp.form,
      colors: { body: p.genome.colors.body, accent: p.genome.colors.accent === '#ffffff' ? R.shade(p.genome.colors.body, 55) : p.genome.colors.accent, eye: p.genome.colors.eye },
      pattern: sp.pattern || p.genome.pattern,
      limit: sp.limit || p.genome.limit,
      expression: expr,
      blink: !!blink,
      id: 'petg'
    });
    const svg = $('#pet-svg');
    if (svg) {
      svg.innerHTML = html + (p.clothes ? outfitSVG(p.clothes, sp) : '');
    }
  }

  const OUTFIT_POS = {
    hat_bow: [100, 60, 1], hat_crown: [100, 54, 1.15], hat_sunhat: [100, 58, 1.15], flower: [100, 62, 1],
    hat_scarf: [100, 150, 1], hat_scarf_g: [100, 150, 1], glasses: [100, 112, 1],
    cape: [100, 168, 1.2], wings: [100, 140, 2.2]
  };
  function outfitSVG(id, sp) {
    const it = itemById(id);
    if (!it) return '';
    const [x, y, scale] = OUTFIT_POS[id] || [100, 60, 1];
    const size = 26 * scale;
    return `<foreignObject x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" style="pointer-events:none;overflow:visible"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${size}px;line-height:1;text-align:center;display:flex;align-items:center;justify-content:center;width:100%;height:100%;filter:drop-shadow(0 3px 4px rgba(0,0,0,.4))">${it.emoji}</div></foreignObject>`;
  }
  function renderScene() {
    const scene = $('#scene');
    if (!scene) return;
    const p = state.pet;
    const tod = timeOfDay();
    scene.dataset.day = tod;
    scene.dataset.weather = state.weather || 'clear';
    scene.classList.toggle('dark', settings.nightDark && (tod === 'night' || tod === 'dusk'));
    scene.classList.toggle('verydark', settings.nightDark && tod === 'night' && gameHours() >= 23);

    // sun / moon
    const sun = $('#sun-moon');
    const h = gameHours();
    const isNight = h >= 19 || h < 5;
    sun.classList.toggle('moon', isNight);
    const progress = ((h - 6 + 24) % 24) / 12;
    const x = clamp(isNight ? ((h >= 19 ? (h - 19) : (h + 5)) / 10) * 100 : clamp((h - 6) / 13, 0, 1) * 100, 4, 96);
    const y = isNight ? 10 + Math.abs(50 - x) * 0.2 : 14 - Math.sin((x / 100) * Math.PI) * 6;
    sun.style.setProperty('--sun-x', x + '%');
    sun.style.setProperty('--sun-y', y + '%');

    // stars
    const stars = $('#stars');
    const showStars = isNight;
    if (showStars && !stars.children.length) {
      let html = '';
      for (let i = 0; i < 50; i++) html += `<span class="star" style="left:${rand(0, 100)}%;top:${rand(0, 60)}%;animation-delay:${rand(0, 3)}s;opacity:${rand(0.3, 1)}"></span>`;
      stars.innerHTML = html;
    }
    stars.classList.toggle('on', showStars);

    // clock
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    const clock = $('#clock-chip');
    if (clock) clock.textContent = `D${state.day} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${weatherEmoji(state.weather)}`;

    // weather FX
    const sfxHost = $('#scene-fx');
    if (sfxHost) {
      const w = state.weather;
      let html = '';
      if (!settings.motion) { sfxHost.innerHTML = ''; }
      else if (w === 'rain' || w === 'storm') {
        for (let i = 0; i < 40; i++) html += `<span class="drop" style="left:${rand(0, 100)}%;top:${rand(-20, 0)}%;animation-duration:${rand(0.5, 1)}s;animation-delay:${rand(0, 1)}s"></span>`;
        if (w === 'storm') for (let i = 0; i < 6; i++) html += `<span class="drop" style="left:${rand(0, 100)}%;top:${rand(-20, 0)}%;width:6px;height:6px;border-radius:50%;animation-duration:1.6s"></span>`;
        sfxHost.innerHTML = html;
      } else if (w === 'snow') {
        for (let i = 0; i < 26; i++) html += `<span class="flake" style="left:${rand(0, 100)}%;top:${rand(-20, 0)}%;animation-duration:${rand(3, 7)}s;animation-delay:${rand(0, 4)}s">❄</span>`;
        sfxHost.innerHTML = html;
      } else if (w === 'aurora') {
        for (let i = 0; i < 14; i++) html += `<span class="sparkle" style="left:${rand(0, 100)}%;top:${rand(0, 60)}%;animation-delay:${rand(0, 2)}s">✨</span>`;
        sfxHost.innerHTML = html;
      } else if (w === 'fog') {
        sfxHost.innerHTML = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(220,230,255,.18),rgba(220,230,255,.02));backdrop-filter:blur(1px)"></div>`;
      } else {
        sfxHost.innerHTML = '';
      }
    }

    renderRoomItems();
    renderPoop();
    renderPetSVG();
    if (p.sleeping) setPose('sleeping', 0);
  }

  function renderRoomItems() {
    const host = $('#room-items');
    if (!host) return;
    const decor = state.pet.roomDecor || [];
    host.innerHTML = decor.map(id => {
      const it = itemById(id);
      if (!it) return '';
      const [x, y] = it.pos || [30, 60];
      return `<span class="room-item" title="${it.name}" style="left:${x}%;top:${y}%;animation-delay:${(id.length % 3) * 0.4}s">${it.emoji}</span>`;
    }).join('');
  }

  function renderPoop() {
    const host = $('#poop-layer');
    if (!host) return;
    const arr = state.poop || [];
    host.innerHTML = arr.map((d, i) => `<span style="left:${18 + i * 26}%;top:${82 + (i % 2) * 4}%">${d.emoji}</span>`).join('');
  }

  function needColor(v) {
    if (v > 60) return ['#6fe9c6', '#8ff7d5'];
    if (v > 35) return ['#ffd46e', '#ffe8a3'];
    if (v > 15) return ['#ffb07a', '#ffc4a8'];
    return ['#ff7d94', '#ff9ecf'];
  }

  function renderNeeds() {
    const host = $('#needs');
    if (!host) return;
    const n = state.pet.needs;
    const rows = [['🍱', 'hunger', 'Food'], ['💧', 'thirst', 'Water'], ['⚡', 'energy', 'Energy'], ['🫧', 'hygiene', 'Clean'], ['😊', 'happiness', 'Happy'], ['💖', 'health', 'Health'], ['🫂', 'social', 'Social']];
    host.innerHTML = rows.map(([ic, k, label]) => {
      const v = Math.round(n[k]);
      const [c1, c2] = needColor(v);
      return `<div class="need" title="${label}: ${v}%"><span class="ni">${ic}</span><div class="bar"><i style="width:${v}%;--c1:${c1};--c2:${c2}"></i></div><b>${v}</b></div>`;
    }).join('');
    const p = state.pet;
    const sp = S.byId(p.species) || { name: 'Egg' };
    $('#pet-name').textContent = p.name;
    $('#pet-stage').textContent = (sp.stage || 'egg').toUpperCase();
    const stateText = p.sleeping ? 'Zzz… sleeping peacefully.' : describeState();
    $('#pet-state').textContent = stateText;
    const mood = moodLabel();
    $('#mood-chip').textContent = mood;
    $('#weather-widget').textContent = `${weatherEmoji(state.weather)} ${weatherName(state.weather)}`;
  }

  function describeState() {
    const p = state.pet, n = p.needs, e = p.emotions;
    if (p.species === 'egg') return 'The egg is warm and quiet… it will hatch soon.';
    if (e.nervous > 60) return 'Feels jumpy and startled by small noises.';
    if (n.hunger < 25) return 'Tummy is rumbling loudly!';
    if (n.thirst < 25) return 'Getting very thirsty.';
    if (n.energy < 25) return 'Nearly falling asleep standing up.';
    if (n.hygiene < 30) return 'A bit grubby — a bath would help.';
    if (n.social < 30) return 'Feeling a little lonely. Wants company.';
    if (e.excited > 65) return 'Bouncing with excitement!';
    if (e.bored > 65) return 'Looking for something fun to do.';
    if (n.happiness > 75) return 'Content, warm, and very loved.';
    return 'Calm and curious about the world.';
  }

  function moodLabel() {
    const p = state.pet, e = p.emotions, n = p.needs;
    if (p.sleeping) return '😴 sleepy';
    const k = [
      ['😝 excited', e.excited], ['🤔 curious', e.curious], ['🥰 affectionate', e.affectionate],
      ['🥱 bored', e.bored], ['😰 nervous', e.nervous], ['😔 sad', e.sadness], ['😌 content', n.happiness + 10]
    ].sort((a, b) => b[1] - a[1])[0];
    return k[0];
  }

  function renderHud() {
    $('#hud-coins').textContent = state.coins;
    $('#hud-level').textContent = state.pet.level;
    $('#led').style.background = state.pet.sleeping ? 'radial-gradient(circle at 35% 35%, #ffe8a3, #ffb347)' : 'radial-gradient(circle at 35% 35%, #d6fff2, #3fe0b0)';
    $('#led').style.boxShadow = state.pet.sleeping ? '0 0 12px #ffb347, 0 0 22px rgba(255,179,71,.6)' : '';
    renderNextGoal();
  }

  function renderInventory() {
    const grid = $('#inv-grid');
    if (!grid) return;
    const tab = ui.invTab;
    const ids = Object.keys(state.inventory).filter(id => {
      const it = itemById(id);
      if (!it) return false;
      if (tab === 'food') return it.sat !== undefined;
      if (tab === 'toy') return it.kind === 'toy';
      if (tab === 'seed') return it.id.startsWith('seed');
      if (tab === 'wearable') return it.kind === 'wearable' || it.kind === 'decor';
      if (tab === 'key') return it.kind === 'key' || it.kind === 'egg' || it.kind === 'trinket';
      return true;
    });
    $('#inv-count').textContent = ids.length + ' items';
    if (!ids.length) {
      grid.innerHTML = `<div class="empty-note">Nothing here yet.<br>Visit the boutERK… <b>Boutique</b> or the arcade!</div>`;
      return;
    }
    grid.innerHTML = ids.map(id => {
      const it = itemById(id);
      return `<button class="inv-item" data-item="${id}" title="${it.name} — ${it.desc || ''}">${it.emoji}<span class="qty">${state.inventory[id]}</span></button>`;
    }).join('');
  }

  function useItem(id) {
    const it = itemById(id);
    if (!it) return;
    if (it.sat !== undefined) { if (removeItem(id, 1)) feedItem(id); return; }
    if (it.kind === 'toy') { playWithToy(id); return; }
    if (it.id.startsWith('seed')) return;
    if (it.kind === 'wearable') { wearItem(id); return; }
    if (it.kind === 'decor') {
      if (state.pet.roomDecor.includes(id)) { toast(`${it.emoji} Already in the room.`); return; }
      state.pet.roomDecor.push(id);
      addJoy(it.joy || 2);
      renderScene();
      journal(`Placed ${it.name} in the room`);
      toast(`${it.emoji} ${it.name} placed in the room!`);
      return;
    }
    if (it.kind === 'egg') { hatchOwnEgg(id); return; }
    if (it.kind === 'key') { toast(`${it.emoji} Unlocks a new expedition area!`); switchView('adventure'); return; }
    if (it.kind === 'trinket') { toast(`${it.emoji} A treasured keepsake.`); return; }
    if (it.kind === 'trinket') return;
  }

  function wearItem(id) {
    const p = state.pet;
    if (p.clothes === id) { p.clothes = null; toast('Removed accessory.'); }
    else { p.clothes = id; addJoy(3); toast(`Wearing ${itemById(id).name}!`); }
    renderPetSVG();
  }

  function playWithToy(id) {
    const it = itemById(id);
    const p = state.pet;
    p.favoriteToy = id;
    changeNeeds({ happiness: it.joy + 4, energy: it.en - 2, hygiene: -3 });
    p.emotions.excited = clamp(p.emotions.excited + 22, 0, 100);
    p.emotions.bored = clamp(p.emotions.bored - 30, 0, 100);
    p.lifetime.plays++;
    p.lifetime2.plays = (p.lifetime2.plays || 0) + 1;
    const t = p.discoveries[id] = p.discoveries[id] || { likes: 0, dislikes: 0, name: it.name, emoji: it.emoji };
    t.likes += 1;
    setPose('happy', 2600);
    say(pick([`*chases the ${it.name} around*`, `Wheee, the ${it.name}! Again!`, `This is my favourite thing now.`]), 'heart');
    fx(['✨', '🎈', '💫']);
    addXp(3, true);
    remember('play', `${p.name} had great fun with the ${it.name}.`);
    onPetChanged();
  }

  function hatchOwnEgg(id) {
    const egg = state.eggs.find(e => e.id === id) || { id, bias: (itemById(id) || {}).bias };
    const variant = egg.variant || (itemById(id) || {}).bias;
    const curName = state.pet.name;
    showModal({
      emoji: '🥚',
      title: 'Hatch a new egg?',
      body: `This egg holds a new little life with its own genetics and personality. Starting it will let you raise a brand new creature. Your current ` + `companion, ${curName}, will move to a place of honor as a "past friend" with all its memories kept.`,
      rows: [['Egg', itemById(id) ? itemById(id).name : 'Egg'], ['Genetic bias', variant || 'mystic'], ['Eggs held', state.eggs.length]],
      actions: [
        { label: 'Hatch!', kind: 'ok', onClick: () => {
          removeItem(id, 1);
          state.eggs = state.eggs.filter(e => e.id !== id);
          state.pastPets = state.pastPets || [];
          state.pastPets.push({ species: state.pet.species, name: state.pet.name, photos: state.pet.photos.slice(0, 5), days: Math.round(state.pet.ageDays), level: state.pet.level, care: Math.round(state.pet.careScore) });
          const ns = newState({ bias: variant, name: pick(NAMES) });
          ns.dex = state.dex;
          ns.achievements = state.achievements;
          ns.coins = state.coins;
          ns.garden = state.garden;
          ns.pastPets = state.pastPets;
          ns.chatHistory = [];
          ns.totalMinutesPlayed = state.totalMinutesPlayed;
          ns.counters = state.counters;
          ns.counters.hatches = (ns.counters.hatches || 0) + 1;
          ns.inventory = state.inventory;
          ns.eggs = state.eggs;
          ns.day = state.day;
          ns.eventSeed = state.eventSeed;
          state = ns;
          renderAll();
          save();
          toast('🥚 A new egg appears! Raise it well.', 'gold');
          journal(`A new egg began to glow…`);
        } },
        { label: 'Keep in bag', kind: '' }
      ]
    });
  }

  function renderJournal() {
    const host = $('#journal');
    if (!host) return;
    host.innerHTML = ui.log.slice(0, 14).map(l => `<div class="j-item"><span>${l.msg}</span><span class="jt">D${l.day} ${l.time}</span></div>`).join('');
  }

  function journal(msg) {
    const h = Math.floor(state.time / 60), m = Math.floor(state.time % 60);
    ui.log.unshift({ msg, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, day: state.day });
    if (ui.log.length > 40) ui.log.pop();
    renderJournal();
  }

  function renderNextGoal() {
    const host = $('#next-goal');
    if (!host) return;
    const p = state.pet;
    let title = '', desc = '', pct = 0;
    if (p.species === 'egg') {
      const left = Math.max(0, 2 * 60 - p.lifetime.minutesAlive);
      title = 'The egg will hatch soon';
      desc = `Keep it warm. It needs ~${Math.ceil(left / 60)} more game-hours of love.`;
      pct = clamp(100 - (left / (2 * 60)) * 100, 0, 100);
    } else {
      const sp = S.byId(p.species);
      const next = S.evolutionOptions(p);
      const req = { baby: 60 * 8, child: 60 * 20, adult: 60 * 48, evolved: 60 * 120 }[sp.stage];
      if (next.length) {
        title = `Grow toward ${next.map(n => n.name).join(' / ')}`;
        const mins = p.lifetime.minutesAlive - (p.stageStartAt ?? (p.lifetime.minutesAlive - (p.stageAge || 0)));
        pct = clamp((mins / req) * 100, 0, 100);
        desc = `${Math.round(pct)}% grown. ${next.length > 1 ? 'Your care style decides which one!' : 'Almost there!'}`;
      } else {
        title = `${sp.name} is fully evolved`;
        desc = 'A legendary bond. Enjoy every day together.';
        pct = 100;
      }
    }
    const xp = xpToLevel();
    host.innerHTML = `<b>${title}</b><div class="gbar"><i style="width:${pct}%"></i></div>${desc}<div style="margin-top:8px;font-size:11px;color:#6b5f86">LV ${p.level} · ${xp.cur}/${xp.need} XP</div>`;
  }

  function renderCare() {
    const host = $('#care-grid');
    if (!host) return;
    const items = [
      { t: '🍎', n: 'Feed a treat', d: 'Pick from your bag', fn: () => { ui.invTab = 'food'; renderInventory(); $('#inv-tabs').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === 'food')); toast('Choose a treat from the Pocket Bag.'); } },
      { t: '💧', n: 'Moon water', d: 'Quench thirst', fn: () => { if (state.inventory.water) { removeItem('water', 1); feedItem('water'); } else { toast('No water! Buy some in the Boutique.', 'bad'); } } },
      { t: '🛁', n: 'Warm bath', d: 'Fresh & clean', fn: bath },
      { t: '🧸', n: 'Play together', d: 'Toys & fun', fn: () => { if (state.pet.sleeping) return toast('Zzz… asleep right now.'); const toys = Object.keys(state.inventory).filter(i => (itemById(i) || {}).kind === 'toy'); if (!toys.length) return toast('No toys yet — get one at the Boutique!', 'bad'); playWithToy(pick(toys)); } },
      { t: '📖', n: 'Bedtime story', d: 'Calm & sleepy', fn: () => { story(); switchView('talk'); } },
      { t: '🤚', n: 'Gentle pets', d: 'Affection boost', fn: petting },
      { t: '🤗', n: 'Cozy cuddle', d: 'Warm & safe', fn: cuddle },
      { t: '😴', n: state.pet.sleeping ? 'Wake up' : 'Tuck in', d: 'Rest & recover', fn: () => { state.pet.sleeping ? wakeUp() : putToSleep(true); } },
      { t: '🧼', n: 'Clean room', d: 'Remove messes', fn: () => { const had = (state.poop || []).length; state.poop = []; renderPoop(); changeNeeds({ hygiene: 10 }); toast(had ? `🧼 Tidy again! (${had} mess cleaned)` : '🧼 The room is already tidy.'); } },
      { t: '💊', n: 'Vitamin gel', d: 'Restore health', fn: () => { changeNeeds({ health: 22 }); say('That tasted like mint and sunlight.', 'yum'); toast('💊 Health restored a little.'); } },
      { t: '🎓', n: 'Teach a trick', d: 'Learn & grow', fn: teachTrick },
      { t: '🎮', n: 'Play a mini-game', d: 'Earn coins', fn: () => switchView('games') }
    ];
    host.innerHTML = items.map((it, i) => `<button class="care-btn" data-care="${i}"><span class="t">${it.t}</span><span class="n">${it.n}</span><span class="d">${it.d}</span></button>`).join('');
    $$('.care-btn', host).forEach(b => b.addEventListener('click', () => items[+b.dataset.care].fn()));
    const tr = $('#trick-list');
    if (tr) {
      tr.innerHTML = TRICKS.map(t => `<span class="chip ${state.pet.tricks.includes(t.id) ? '' : 'locked'}">${state.pet.tricks.includes(t.id) ? t.emoji : '🔒'} ${t.name}</span>`).join('');
      $('#trick-count').textContent = `${state.pet.tricks.length}/${TRICKS.length} learned`;
    }
  }

  const TRICKS = [
    { id: 'spin', name: 'Spin', emoji: '🌀', text: '*spins in a delighted circle*', cost: 3 },
    { id: 'wave', name: 'Wave', emoji: '👋', text: '*waves a tiny paw*', cost: 3 },
    { id: 'fetch', name: 'Fetch', emoji: '🎾', text: '*fetches it back — slightly chewed*', cost: 4 },
    { id: 'highfive', name: 'High Five', emoji: '🙌', text: '*slaps your hand with maximum enthusiasm*', cost: 4 },
    { id: 'rollover', name: 'Roll Over', emoji: '🔄', text: '*rolls over, gets stuck, wiggles free*', cost: 5 },
    { id: 'dance', name: 'Dance', emoji: '💃', text: '*shimmies — it is objectively adorable*', cost: 6 },
    { id: 'bow', name: 'Elegant Bow', emoji: '🎩', text: '*bows with surprising grace*', cost: 6 },
    { id: 'count', name: 'Count to 3', emoji: '🔢', text: '*taps the floor: one… two… three!*', cost: 7 },
    { id: 'jump', name: 'Super Jump', emoji: '🚀', text: '*launches surprisingly high*', cost: 8 },
    { id: 'joke', name: 'Tell a Joke', emoji: '😂', text: '"Why did the cloud stay home? It was feeling under the weather!"', cost: 8 },
    { id: 'juggle', name: 'Juggle', emoji: '🤹', text: '*juggles three berries. Mostly.*', cost: 9 },
    { id: 'sing', name: 'Sing', emoji: '🎶', text: '*sings a wobbly, wonderful song*', cost: 10 }
  ];

  function teachTrick() {
    const p = state.pet;
    const avail = TRICKS.filter(t => !p.tricks.includes(t.id));
    if (!avail.length) return toast('🎓 All tricks learned! You have a prodigy.');
    const t = pick(avail);
    const ok = Math.random() < 0.62 + (p.traits.curiosity + p.traits.playfulness) * 0.1;
    setPose('happy', 2000);
    if (ok) {
      p.tricks.push(t.id);
      p.lifetime2.tricks = (p.lifetime2.tricks || 0) + 1;
      p.emotions.pride = clamp(p.emotions.pride + 25, 0, 100);
      addJoy(5);
      addXp(6, true);
      say(`I learned ${t.name}! ${t.text}`, 'star');
      toast(`🎓 Learned ${t.name}!`);
      remember('teach', `${p.name} learned the "${t.name}" trick.`);
      fx(['⭐', '✨', '🎉']);
    } else {
      p.needs.energy = clamp(p.needs.energy - 3, 0, 100);
      say(`*tries ${t.name}* …hmm. Can we try again when I'm not so tired?`);
      toast('Not quite yet — maybe later!');
    }
    renderCare();
    renderProfile();
    checkAchievements();
    onPetChanged();
  }

  function renderGames() {
    const host = $('#game-grid');
    if (!host) return;
    const G = window.PocketGames.GAMES;
    host.innerHTML = Object.values(G).map(g => `<button class="game-tile" data-game="${g.id}" style="--g1:${g.gradient[0]};--g2:${g.gradient[1]}"><span class="gt">${g.emoji}</span><span class="gn">${g.name}</span><span class="gd">${g.desc}</span></button>`).join('');
    $$('.game-tile', host).forEach(b => b.addEventListener('click', () => {
      if (state.pet.sleeping) { toast('😴 Your creature is asleep — let it rest or wake it first.'); return; }
      if (state.pet.needs.energy < 10) { toast('⚡ Too tired to play right now.'); return; }
      window.PocketGames.start(b.dataset.game, { petEmoji: (S.byId(state.pet.species) || {}).form ? emojiForPet() : '🐣' });
    }));
    $('#games-sub').textContent = `Best scores are saved. Coins: ${state.coins} 🪙`;
  }

  function emojiForPet() {
    const sp = S.byId(state.pet.species) || {};
    return ({ water: '🐬', fire: '🔥', nature: '🌿', ice: '❄️', storm: '⚡', light: '✨', shadow: '🌙', mystic: '🔮', egg: '🥚' })[sp.element] || '🐣';
  }

  window.PocketLife.gameResult = function (res) {
    const p = state.pet;
    state.counters.games = (state.counters.games || 0) + 1;
    const coins = Math.max(1, Math.round(res.coins || 0));
    addCoins(coins);
    addXp(res.xp || 8, true);
    changeNeeds({ happiness: 10, energy: -8, hygiene: -3 });
    p.emotions.excited = clamp(p.emotions.excited + 18, 0, 100);
    p.emotions.bored = clamp(p.emotions.bored - 40, 0, 100);
    p.lifetime.gamesPlayed++;
    p.lifetime2.gamesWon = (p.lifetime2.gamesWon || 0) + 1;
    p.bestScores = p.bestScores || {};
    if (!p.bestScores[res.game] || res.score > p.bestScores[res.game]) p.bestScores[res.game] = Math.round(res.score);
    let extra = '';
    if (res.item && itemById(res.item)) {
      addItem(res.item, 1);
      extra = ` Found ${itemById(res.item).emoji} ${itemById(res.item).name}!`;
    }
    toast(`🎮 ${res.game}: score ${Math.round(res.score)} · +${coins}🪙${extra}`, 'gold');
    journal(`🎮 ${res.game} — ${Math.round(res.score)} pts`);
    if (res.line) say(res.line, 'happy');
    Snd.level();
    remember('game', `We played ${res.game} together and had a great time.`);
    checkAchievements();
    renderAll();
  };

  /* ================== GARDEN ================== */
  function plotSeed(seedId, idx) {
    const seed = S.SEEDS.find(s => s.id === seedId);
    if (!seed) return;
    const plot = state.garden.plots[idx];
    if (!plot || !plot.unlocked) return;
    if (plot.plant) return toast('That plot already has a plant!', 'bad');
    if (!state.inventory[seedId]) return toast('No seeds of that kind.', 'bad');
    removeItem(seedId, 1);
    plot.plant = seed.plant;
    plot.emoji = seed.emoji;
    plot.name = seed.name.replace(' Seeds', '');
    plot.grow = 0;
    plot.water = 60;
    plot.growTime = seed.growTime;
    journal(`🌱 Planted ${seed.name}`);
    Snd.blip();
    renderGarden();
  }

  function renderGarden() {
    const host = $('#garden-grid');
    if (!host) return;
    const plots = state.garden.plots;
    host.innerHTML = plots.map((pl, i) => {
      if (!pl.unlocked) return `<div class="plot locked" data-plot="${i}">🔒<br>${i >= 6 ? 260 : 150}🪙</div>`;
      if (!pl.plant) return `<div class="plot" data-plot="${i}" style="align-items:center;justify-content:center;color:#e8d4b6;font-size:11px">🪴<br>empty</div>`;
      const growth = clamp(pl.grow, 0, 100);
      const emoji = growth < 25 ? '🌱' : growth < 60 ? '🌿' : growth < 99 ? '🌾' : pl.plant === 'daisy' ? '🌼' : pl.plant === 'pumpkin' ? '🎃' : pl.plant === 'glowcap' ? '🍄' : pl.plant === 'starfruit' ? '🌟' : '🍓';
      return `<div class="plot" data-plot="${i}"><span class="pstat">${Math.round(growth)}%</span><span class="plant" style="transform:scale(${0.7 + growth / 200})">${emoji}</span><div class="pbar"><i style="width:${growth}%"></i></div></div>`;
    }).join('');
    $$('.plot', host).forEach(el => el.addEventListener('click', () => {
      const i = +el.dataset.plot;
      const pl = plots[i];
      if (!pl.unlocked) {
        const cost = i >= 6 ? 260 : 150;
        if (spend(cost)) { pl.unlocked = true; journal('🌻 Unlocked a new garden plot'); renderGarden(); toast('New garden plot unlocked!'); }
        return;
      }
      if (!pl.plant) { toast('Choose a seed below to plant here.'); return; }
      if (pl.grow >= 100) { harvest(i); return; }
      if (pl.water < 40) {
        pl.water = 100;
        pl.grow += 6;
        Snd.splash();
        toast('💧 Watered!');
      } else { toast('Growing steadily… check back soon.'); }
      renderGarden();
    }));
    const sky = $('#garden-sky');
    if (sky) {
      const h = gameHours();
      const night = h >= 20 || h < 6;
      sky.classList.toggle('night', night);
      if (!sky.dataset.built) {
        sky.dataset.built = '1';
        sky.innerHTML = `<span class="gsun"></span><span class="gcloud">☁️</span><span class="gcloud" style="top:52%;left:55%;animation-duration:60s;font-size:11px">☁️</span>`;
      }
      const sun = sky.querySelector('.gsun');
      if (sun) sun.style.opacity = night ? '0.25' : '1';
    }
    const seedRow = $('#seed-row');
    if (seedRow) {
      const seeds = Object.keys(state.inventory).filter(id => id.startsWith('seed'));
      seedRow.innerHTML = seeds.length ? seeds.map(id => {
        const s = S.SEEDS.find(x => x.id === id);
        if (!s) return '';
        return `<button class="seed-btn" data-seed="${id}">${s.emoji} ${s.name} ×${state.inventory[id]}</button>`;
      }).join('') : '<span style="font-size:11.5px;color:#b7a9d9">No seeds. Buy some in the Boutique.</span>';
      $$('.seed-btn', seedRow).forEach(b => b.addEventListener('click', () => {
        const empty = state.garden.plots.findIndex(p => p.unlocked && !p.plant);
        if (empty < 0) return toast('No empty plots — unlock one or harvest!', 'bad');
        plotSeed(b.dataset.seed, empty);
      }));
    }
  }

  function harvest(i) {
    const pl = state.garden.plots[i];
    const seed = S.SEEDS.find(s => s.plant === pl.plant);
    if (!seed) return;
    const loot = [];
    seed.items.forEach(([id, n]) => { const cnt = randi(1, n); addItem(id, cnt); const it = itemById(id); loot.push(`${it.emoji} ${it.name} ×${cnt}`); });
    pl.plant = null;
    pl.grow = 0;
    pl.water = 0;
    state.pet.lifetime2.gardenHarvests = (state.pet.lifetime2.gardenHarvests || 0) + 1;
    addCoins(randi(6, 16), true);
    addXp(6, true);
    changeNeeds({ happiness: 6 });
    Snd.good();
    showModal({ emoji: '🧺', title: 'Harvest!', body: `You gathered: ${loot.join(', ')}.`, ok: 'Lovely' });
    journal(`🧺 Harvested ${seed.name.replace(' Seeds', '')}`);
    checkAchievements();
    renderGarden();
    onPetChanged();
  }

  /* ================== SHOP ================== */
  function shopItems(cat) {
    const discount = state.event && state.event.effect.discount ? state.event.effect.discount : 1;
    const price = (p) => Math.max(1, Math.round(p * discount));
    if (cat === 'food') return { items: S.FOODS.map(f => ({ ...f, price: price(f.price) })), type: 'food' };
    if (cat === 'toy') return { items: S.TOYS.map(f => ({ ...f, price: price(f.price) })), type: 'toy' };
    if (cat === 'seed') return { items: S.SEEDS.map(f => ({ ...f, price: price(f.price) })), type: 'seed' };
    if (cat === 'wearable') return { items: S.WEARABLES.map(f => ({ ...f, price: price(f.price) })), type: 'wearable' };
    if (cat === 'decor') return { items: S.DECOR.map(f => ({ ...f, price: price(f.price) })), type: 'decor' };
    if (cat === 'egg') return { items: S.EGGS.map(f => ({ ...f, price: price(f.price) })), type: 'egg' };
    return { items: [], type: cat };
  }

  function renderShop() {
    const host = $('#shop-grid');
    if (!host) return;
    const { items } = shopItems(ui.shopCat);
    host.innerHTML = items.map(it => {
      const owned = it.kind === 'decor' && state.pet.roomDecor.includes(it.id) ? ' ✓' : '';
      return `<button class="shop-item${it.rare ? ' rare' : ''}" data-shop="${it.id}"><span class="si">${it.emoji}</span><span class="sn">${it.name}${owned}</span><span class="sd">${it.desc || ('Unlocks ' + (S.AREAS[it.area] ? S.AREAS[it.area].name : 'something new'))}</span><span class="sp">🪙 ${it.price}</span></button>`;
    }).join('');
    $$('.shop-item', host).forEach(b => b.addEventListener('click', () => buy(b.dataset.shop)));
  }

  function buy(id) {
    const all = [].concat(S.FOODS, S.TOYS, S.SEEDS, S.WEARABLES, S.DECOR, S.KEYS, S.EGGS);
    const it = all.find(i => i.id === id);
    if (!it) return;
    const discount = state.event && state.event.effect.discount ? state.event.effect.discount : 1;
    const price = Math.max(1, Math.round(it.price * discount));
    if (it.kind === 'decor' && state.pet.roomDecor.includes(id)) { toast('Already decorated with that!'); return; }
    if (!spend(price)) return;
    Snd.coin();
    if (it.kind === 'decor') {
      state.pet.roomDecor.push(id);
      addJoy(it.joy || 2);
      journal(`🛍️ Bought ${it.name}`);
      toast(`${it.emoji} ${it.name} added to the room!`);
      renderScene();
    } else if (it.kind === 'egg') {
      state.eggs.push({ id: it.id, bias: it.bias, boughtAt: Date.now() });
      addItem('egg_' + it.id, 0);
      toast(`🥚 ${it.name} added to your bag. Use it to hatch a new life!`, 'gold');
      journal(`🥚 Bought ${it.name}`);
    } else {
      addItem(id, 1);
      toast(`🛍️ Bought ${it.name}!`);
      journal(`🛍️ Bought ${it.name}`);
    }
    state.pet.lifetime2.spends = (state.pet.lifetime2.spends || 0) + 1;
    renderShop();
    renderInventory();
    onPetChanged();
  }

  /* ================== ADVENTURE ================== */
  function unlockedAreas() {
    return Object.values(S.AREAS).filter(a => !a.unlock || state.inventory[a.unlock] || state.unlockedAreas && state.unlockedAreas.includes(a.id) || state.pet.lifetime2.explorations > 5);
  }

  function renderAdventure() {
    const host = $('#adv-card');
    if (!host) return;
    const areas = unlockedAreas();
    const pickArea = state.adventureArea || areas[0].id;
    const area = S.AREAS[pickArea] || areas[0];
    state.adventureArea = area.id;
    const p = state.pet;
    const loot = Object.entries(p.adventure.loot || {}).map(([k, v]) => `${({ coins: '🪙', xp: '✨', item: '🎁' })[k] || k}: ${v}`).join(' · ') || 'Nothing found yet';
    host.innerHTML = `<div class="adv-banner" style="--ab1:${area.colors[0]};--ab2:${area.colors[1]}">
        <h3>${area.emoji} ${area.name}</h3>
        <p>${area.desc}</p>
        <span class="emoji">${area.emoji}</span>
      </div>
      <div class="row" style="margin-bottom:8px">${areas.map(a => `<button class="${a.id === area.id ? 'primary' : ''}" data-area="${a.id}">${a.emoji} ${a.name.split(' ')[0]}</button>`).join('')}</div>
      <div class="row"><button class="primary" id="go-explore">🚶 Set out (15 min)</button><button id="quick-explore">⚡ Quick peek (5 min)</button></div>
      <div class="hint small">Trips cost game time and a little energy. Your creature learns about the world and brings back loot, XP and sometimes rare items.</div>
      <div class="adv-events" id="adv-events">${(p.adventure.recent || []).length ? p.adventure.recent.map(e => `<div class="adv-event">${e}</div>`).join('') : '<div class="adv-event">Prepare a little bag and step outside…</div>'}</div>
      <div class="card-title" style="margin-top:10px"><span>TRAVEL LOG</span><span class="tiny">${p.lifetime2.explorations || 0} trips</span></div>
      <div class="hint small">${loot}</div>
      <div class="card-title" style="margin-top:10px"><span>AREA KEYS</span></div>
      <div class="chips">${Object.values(S.AREAS).filter(a => a.unlock).map(a => `<span class="chip ${state.inventory[a.unlock] ? '' : 'locked'}">${state.inventory[a.unlock] ? '🔑' : '🔒'} ${a.name}</span>`).join('')}</div>`;
    $$('[data-area]', host).forEach(b => b.addEventListener('click', () => { state.adventureArea = b.dataset.area; renderAdventure(); }));
    $('#go-explore', host).addEventListener('click', () => explore(15, false));
    $('#quick-explore', host).addEventListener('click', () => explore(5, true));
  }

  function explore(mins, quick) {
    const p = state.pet;
    if (p.sleeping) return toast('😴 Asleep — wake it before setting out.');
    if (p.needs.energy < 12) return toast('⚡ Too tired to explore. Let it rest.');
    const area = S.AREAS[state.adventureArea] || S.AREAS.forest;
    const events = [];
    const scenes = [
      ['🍃', 'A little wind catches the leaves and they spin like dancers.'],
      ['🌼', 'A quiet clearing full of tiny glowing flowers.'],
      ['🦊', 'A curious animal watches from a bush, then decides you are ok.'],
      ['🪨', 'An old carved stone. It seems to hum when your creature touches it.'],
      ['🌈', 'A sudden rainbow after the briefest drizzle.'],
      ['🏞️', 'A stream that runs uphill. No one knows how.'],
      ['🐦', 'A bird teaches your creature a four-note whistle.'],
      ['🌙', 'The path curves under a huge, ancient tree.']
    ];
    const tripCount = quick ? 2 : 4;
    let coins = 0;
    const shuffled = shuffle(scenes);
    for (let i = 0; i < tripCount; i++) {
      const [e, t] = shuffled[i % shuffled.length];
      events.push(`${e} ${t}`);
    }
    coins = quick ? randi(4, 12) : randi(10, 28);
    addCoins(coins, true);
    addXp(quick ? 6 : 14, true);
    changeNeeds({ energy: quick ? -4 : -10, happiness: quick ? 3 : 7, hygiene: quick ? -4 : -8, thirst: -3 });
    p.emotions.excited = clamp(p.emotions.excited + 20, 0, 100);
    p.emotions.curious = clamp(p.emotions.curious + 15, 0, 100);
    p.lifetime2.explorations = (p.lifetime2.explorations || 0) + 1;
    p.lifetime2.steps = (p.lifetime2.steps || 0) + (quick ? 300 : 900);
    p.lifetime.exams++;
    p.adventure.trips = (p.adventure.trips || 0) + 1;
    const itemsFound = [];
    if (Math.random() < 0.6) {
      const findPool = [['trinket_shell', 'Sea Shell'], ['trinket_feather', 'Sky Feather'], ['trinket_stone', 'Lucky Stone']];
      const [id, name] = pick(findPool);
      addItem(id, 1);
      itemsFound.push(`🎁 Found a ${name}!`);
    }
    if (Math.random() < 0.25) { const n = randi(1, 3); const foodId = pick(state.inventory && Object.keys(state.inventory).filter(id => (itemById(id) || {}).sat !== undefined)) || pick(['snack', 'water', 'apple']); addItem(foodId, n); itemsFound.push(`🎁 Found ${itemById(foodId).emoji} ${itemById(foodId).name} ×${n}`); }
    if (Math.random() < 0.4) {
      const seedId = pick(S.SEEDS.map(s => s.id));
      removeItem(seedId, 0);
      addItem(seedId, 1);
      itemsFound.push(`🎁 Found ${S.SEEDS.find(s => s.id === seedId).emoji} seeds`);
    }
    if (Math.random() < 0.15) {
      const eggType = pick(S.EGGS);
      addItem(eggType.id, 1);
      state.eggs.push({ id: eggType.id, bias: eggType.bias });
      itemsFound.push(`🥚 Discovered a ${eggType.name}!`);
    }
    const recent = [`${area.emoji} Explored ${area.name}${quick ? ' briefly' : ''}. +${coins}🪙 +${quick ? 6 : 14}✨`].concat(events.map(e => `&nbsp;${e[0]} ${e[1]}`), itemsFound);
    p.adventure.recent = recent;
    p.adventure.loot.coins = (p.adventure.loot.coins || 0) + coins;
    p.adventure.loot.xp = (p.adventure.loot.xp || 0) + (quick ? 6 : 14);
    p.adventure.loot.item = (p.adventure.loot.item || 0) + itemsFound.length;
    state.time += mins;
    while (state.time >= 1440) { state.time -= 1440; state.day++; onNewDay(); }
    journal(`🗺️ Explored ${area.name}`);
    addMemory(`Expedition to ${area.name}`, pick(['🗺️', '🌿', '✨']));
    say(pick(['That was the best trip!', 'I saw so many things. I\'ll remember.', 'My feet are tired but my heart is full.']), 'heart');
    Snd.good();
    checkAchievements();
    renderAdventure();
    renderScene();
    onPetChanged();
    toast(`🗺️ Back from ${area.name}! +${coins}🪙`);
  }

  /* ================== ENCYCLOPEDIA ================== */
  function renderDex() {
    const host = $('#dex-grid');
    if (!host) return;
    const p = state.pet;
    const current = p.species;
    host.innerHTML = S.SPECIES.map(sp => {
      const known = state.dex.includes(sp.id);
      const isCurrent = sp.id === current;
      const svg = R.svg({
        form: sp.form,
        colors: { body: known ? sp.body : '#5a4d7a', accent: knowableAccent(sp), eye: 'warm' },
        pattern: sp.pattern,
        limit: sp.limit,
        expression: 'happy',
        id: 'dex' + sp.id
      }, '');
      return `<button class="dex-cell ${known ? '' : 'unknown'} ${isCurrent ? 'current' : ''}" data-dex="${sp.id}" title="${known ? sp.desc : 'Undiscovered'}">
        ${svg}
        <span class="dn">${known ? sp.name : '???'}</span>
        <span class="ds">${known ? sp.stage.toUpperCase() + ' · ' + sp.element : 'Undiscovered'}</span>
        <span class="seenline">${known ? (isCurrent ? '★ CURRENT' : 'found') : '· · ·'}</span>
      </button>`;
    }).join('');
    $('#dex-progress').textContent = `${state.dex.length}/30 discovered`;
    $$('.dex-cell', host).forEach(b => b.addEventListener('click', () => {
      const sp = S.byId(b.dataset.dex);
      const known = state.dex.includes(sp.id);
      const evoTo = S.SPECIES.filter(s => s.parents.includes(sp.id)).map(s => s.name).join(', ');
      const evoFrom = sp.parents.map(id => (S.byId(id) || {}).name).filter(Boolean).join(' / ');
      showModal({
        emoji: R.svg({ form: sp.form, colors: { body: known ? sp.body : '#5a4d7a', accent: knowableAccent(sp) }, pattern: sp.pattern, limit: sp.limit, expression: 'happy', id: 'mdx' + sp.id }).replace(/^<svg[^>]*>|<\/svg>$/g, '') ? '' : '📖',
        title: known ? sp.name : 'Undiscovered',
        body: known ? sp.desc : 'You have not met this creature yet.',
        rows: known ? [
          ['Stage', sp.stage.toUpperCase()],
          ['Element', sp.element],
          ['Evolves from', evoFrom || '—'],
          ['Can evolve into', evoTo || '—']
        ] : [['Hint', sp.stage === 'legendary' ? 'A legendary bond may reveal it.' : 'Raise stages with different care styles.']],
        ok: 'Close'
      });
    }));
  }
  function knowableAccent(sp) { return R.shade(sp.body, 50); }

  /* ================== PROFILE ================== */
  function renderProfile() {
    const p = state.pet;
    const g = p.genome;
    $('#genome-species').textContent = (S.byId(p.species) || {}).name || 'Egg';
    const gl = [];
    Object.entries(g.genes || {}).forEach(([k, v], i) => {
      const col = R.mix('#c3a6ff', '#8ff7d5', v);
      gl.push(`<div class="ge" style="background:${col}" title="Gene ${+k + 1}: ${(v * 100).toFixed(0)}%">${Math.round(v * 15).toString(16).toUpperCase()}</div>`);
    });
    $('#genome').innerHTML = gl.join('');
    const labels = { curiosity: 'Curiosity', affection: 'Affection', bravery: 'Bravery', energy: 'Energy', social: 'Social', playfulness: 'Playfulness', calmness: 'Calmness', loveFood: 'Foodie', neurotic: 'Sensitivity' };
    $('#traits').innerHTML = Object.entries(p.traits).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `<span class="trait-pill">${labels[k]} ${Math.round(v * 100)}%</span>`).join('');
    const bars = (host, obj, labelsMap, color) => {
      host.innerHTML = Object.entries(obj).filter(([k]) => k !== 'calm').slice(0, 9).map(([k, v]) => `<div class="brow"><span>${labelsMap[k] || k}</span><div class="bb"><i style="width:${Math.round(v)}%;background:${color}"></i></div><span>${Math.round(v)}</span></div>`).join('');
    };
    bars($('#trait-bars'), Object.fromEntries(Object.entries(p.traits).map(([k, v]) => [k, v * 100])), labels, 'linear-gradient(90deg,#c3a6ff,#8ff7d5)');
    bars($('#emotion-bars'), { excited: p.emotions.excited, curious: p.emotions.curious, bored: p.emotions.bored, affectionate: p.emotions.affectionate, nervous: p.emotions.nervous, sadness: p.emotions.sadness, pride: p.emotions.pride }, { excited: 'Excited', curious: 'Curious', bored: 'Bored', affectionate: 'Affectionate', nervous: 'Nervous', sadness: 'Sadness', pride: 'Pride' }, 'linear-gradient(90deg,#ffd46e,#ff9ecf)');
    const likes = Object.entries(p.discoveries || {}).filter(([, v]) => v.likes || v.dislikes).sort((a, b) => (b[1].likes + b[1].dislikes) - (a[1].likes + a[1].dislikes));
    $('#likes').innerHTML = likes.length ? likes.slice(0, 10).map(([id, v]) => {
      const it = itemById(id) || { emoji: '•', name: v.name || id };
      const pref = v.likes > v.dislikes ? '<b>Loves it</b>' : v.dislikes > v.likes ? 'Dislikes it' : 'Neutral';
      return `<div class="like-row"><span>${it.emoji} ${it.name}</span><span>${pref}</span></div>`;
    }).join('') : '<div class="hint small">Offer different foods and toys to discover preferences.</div>';
    $('#memory-count').textContent = p.memories.length;
    $('#memory-list').innerHTML = p.memories.length ? p.memories.slice(0, 24).map(m => `<div class="mem-item"><span>${m.text}</span><time>D${m.day}</time></div>`).join('') : '<div class="hint small">No memories yet.</div>';
    $('#album').innerHTML = p.photos.length ? p.photos.slice(0, 12).map(ph => `<div class="photo"><div class="ph-scene" style="--p1:${ph.colors[0]};--p2:${ph.colors[1]}"><span class="ph-bg">${weatherEmoji(state.weather)}</span><span class="ph-emoji">${ph.emoji}</span></div><div class="ph-cap">${ph.caption}<small>Day ${ph.day}</small></div></div>`).join('') : '<div class="hint small">Photos appear as you care for your creature.</div>';
    $('#ach-count').textContent = `${state.achievements.length}/${S.ACHIEVEMENTS.length}`;
    $('#ach-grid').innerHTML = S.ACHIEVEMENTS.map(a => `<div class="ach ${state.achievements.includes(a.id) ? 'done' : ''}"><span class="ai">${state.achievements.includes(a.id) ? a.emoji : '🔒'}</span><span><span class="at">${a.name}</span><span class="ad">${a.desc}</span></span></div>`).join('');
    const L = p.lifetime, L2 = p.lifetime2;
    const stats = [
      ['Days together', Math.max(1, Math.round(p.ageDays) + '/' + state.day)],
      ['Level', p.level],
      ['Feeds', L.feeds], ['Baths', L.baths], ['Pets', L.pets], ['Games played', L.gamesPlayed],
      ['Stories read', L.stories], ['Talks', L.talks], ['Tricks', p.tricks.length],
      ['Expeditions', L2.explorations || 0], ['Harvests', L2.gardenHarvests || 0], ['Games won', L2.gamesWon || 0],
      ['Care score', Math.round(p.careScore)], ['Coins earned', state.coinsEarned], ['Coin balance', state.coins],
      ['Total play time', state.totalMinutesPlayed + 'm']
    ];
    $('#stats-grid').innerHTML = stats.map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('');
  }

  /* ================== TALK ================== */
  function renderChat() {
    const host = $('#chat');
    if (!host) return;
    if (!state.chatHistory.length) {
      state.chatHistory.push({ from: 'pet', text: `Hi! I'm ${state.pet.name}. I like it when you're here. What should we talk about?` });
    }
    host.innerHTML = state.chatHistory.slice(-40).map(h => `<div class="msg ${h.from}"><span class="who">${h.from === 'me' ? 'YOU' : state.pet.name.toUpperCase()}</span>${escapeHtml(h.text)}</div>`).join('');
    host.scrollTop = host.scrollHeight;
    updateAiBadge();
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function updateAiBadge() {
    const b = $('#ai-badge');
    if (!b) return;
    b.innerHTML = settings.aiEnabled && settings.apiKey ? `🤖 Connected via OpenRouter (${settings.apiModel || 'openrouter/auto'}) — a real LLM writes replies.` : `🧠 Offline personality engine active — fully playable. Add an OpenRouter key in Settings for richer conversations.`;
  }

  async function sendChat(text) {
    const p = state.pet;
    state.chatHistory.push({ from: 'me', text });
    renderChat();
    p.lifetime.talks++;
    changeNeeds({ social: 8, happiness: 3 });
    p.emotions.affectionate = clamp(p.emotions.affectionate + 6, 0, 100);
    const typing = document.createElement('div');
    typing.className = 'msg pet typing';
    typing.innerHTML = `<span class="dots"><span>·</span><span>·</span><span>·</span></span>`;
    $('#chat').appendChild(typing);
    $('#chat').scrollTop = $('#chat').scrollHeight;
    const cfg = { key: settings.apiKey, model: settings.apiModel, enabled: settings.aiEnabled };
    const history = state.chatHistory.slice(-9, -1);
    try {
      const res = await window.PocketBrain.reply(p, text, cfg, history);
      typing.remove();
      state.chatHistory.push({ from: 'pet', text: res.text });
      if (res.source === 'llm') {
        p.traits.social = clamp(p.traits.social + 0.01, 0, 1);
      }
      addXp(2, true);
      remember('talk', `We talked about "${text.slice(0, 40)}".`);
      journal(`💬 Chatted with ${p.name}`);
      say(res.text.length > 90 ? res.text.slice(0, 90) + '…' : res.text, 'heart', 4000);
    } catch (e) {
      typing.remove();
      state.chatHistory.push({ from: 'pet', text: '*tilts head* Sorry, I got a bit lost. Can you say that again?' });
    }
    renderChat();
    checkAchievements();
    onPetChanged();
  }

  /* ================== VIEWS ================== */
  function switchView(view) {
    ui.view = view;
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if (view !== 'games') window.PocketGames.stop();
    if (view === 'care') renderCare();
    if (view === 'games') renderGames();
    if (view === 'talk') renderChat();
    if (view === 'garden') renderGarden();
    if (view === 'shop') renderShop();
    if (view === 'adventure') renderAdventure();
    if (view === 'dex') renderDex();
    if (view === 'profile') renderProfile();
    if (view === 'settings') renderSettings();
    if (view === 'pet') { renderScene(); renderNeeds(); }
  }

  function renderSettings() {
    $('#api-key').value = settings.apiKey || '';
    $('#api-model').value = settings.apiModel || 'openrouter/auto';
    $('#opt-sound').checked = !!settings.sound;
    $('#opt-relaxed').checked = !!settings.relaxed;
    $('#opt-motion').checked = !!settings.motion;
    $('#opt-nightdark').checked = !!settings.nightDark;
    const ev = $('#event-status');
    if (ev) ev.innerHTML = state.event ? `${state.event.emoji} <b>${state.event.name}</b> — ${state.event.desc}` : 'No event active today. Events arrive each morning.';
  }

  /* ================== HANDLERS ================== */
  const ACTIONS = {
    pet: () => petting(),
    cuddle: () => cuddle(),
    talk: () => switchView('talk'),
    story: () => { story(); switchView('talk'); },
    bath: () => bath(),
    play: () => { const toys = Object.keys(state.inventory).filter(i => (itemById(i) || {}).kind === 'toy').concat(['ball']); playWithToy(pick(toys)); },
    teach: () => teachTrick(),
    care: () => switchView('care'),
    games: () => switchView('games')
  };

  function bind() {
    $('#nav').addEventListener('click', e => {
      const b = e.target.closest('.nav-btn');
      if (b) switchView(b.dataset.view);
    });
    $('#action-bar').addEventListener('click', e => {
      const b = e.target.closest('.act');
      if (!b) return;
      ensureRunning();
      ACTIONS[b.dataset.act]();
    });
    $$('.hard-btn').forEach(b => b.addEventListener('click', () => { ensureRunning(); const a = b.dataset.hard; if (a === 'games') switchView('games'); else ACTIONS[a](); }));
    $('#inv-tabs').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      ui.invTab = b.dataset.tab;
      $$('#inv-tabs button').forEach(x => x.classList.toggle('on', x === b));
      renderInventory();
    });
    $('#inv-grid').addEventListener('click', e => {
      const b = e.target.closest('.inv-item');
      if (b) useItem(b.dataset.item);
    });
    $('#sleep-toggle').addEventListener('click', () => { ensureRunning(); state.pet.sleeping ? wakeUp() : putToSleep(true); });
    $('#scene').addEventListener('click', e => {
      ensureRunning();
      if (state.pet.species === 'egg') { toast('🥚 The egg is warm. It will hatch soon…'); return; }
      petting();
    });
    $('#chat-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#chat-input');
      const v = input.value.trim();
      if (!v) return;
      input.value = '';
      sendChat(v);
    });
    $('#quick-asks').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) sendChat(b.textContent);
    });
    $('#shop-tabs').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      ui.shopCat = b.dataset.cat;
      $$('#shop-tabs button').forEach(x => x.classList.toggle('on', x === b));
      renderShop();
    });
    $('#game-close').addEventListener('click', () => { window.PocketGames.stop(); $('#game-stage').hidden = true; });
    $('#api-save').addEventListener('click', () => {
      settings.apiKey = $('#api-key').value.trim();
      settings.apiModel = $('#api-model').value.trim() || 'openrouter/auto';
      settings.aiEnabled = !!settings.apiKey;
      saveSettings();
      $('#api-status').textContent = settings.apiKey ? '✅ Saved. AI replies enabled.' : 'Saved. AI disabled (offline mode).';
      updateAiBadge();
    });
    $('#api-test').addEventListener('click', async () => {
      const key = $('#api-key').value.trim();
      const model = $('#api-model').value.trim() || 'openrouter/auto';
      if (!key) return $('#api-status').textContent = 'Add a key first.';
      $('#api-status').textContent = 'Connecting…';
      try {
        const res = await window.PocketBrain.llmReply(state.pet, 'Say hello in one short sentence.', { key, model }, []);
        $('#api-status').textContent = '✅ Connected! Reply: ' + res.slice(0, 80);
      } catch (e) { $('#api-status').textContent = '❌ Failed: ' + e.message; }
    });
    $('#opt-sound').addEventListener('change', e => { settings.sound = e.target.checked; saveSettings(); });
    $('#opt-relaxed').addEventListener('change', e => {
      settings.relaxed = e.target.checked; saveSettings();
      toast(settings.relaxed ? '🫶 Relaxed care mode on — no harsh penalties.' : 'Care mode back to standard gentleness.');
    });
    $('#opt-motion').addEventListener('change', e => { settings.motion = e.target.checked; document.body.classList.toggle('no-motion', !settings.motion); saveSettings(); });
    $('#opt-nightdark').addEventListener('change', e => { settings.nightDark = e.target.checked; saveSettings(); renderScene(); });
    $('#save-now').addEventListener('click', () => { save(); toast('💾 Saved!'); });
    $('#export-save').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `pocketlife-${state.pet.name}-day${state.day}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#import-save').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const s = migrate(JSON.parse(rd.result));
          if (!s) throw new Error('bad file');
          state = s;
          renderAll();
          save();
          toast('📂 Save imported!');
        } catch (err) { toast('That file could not be read.', 'bad'); }
      };
      rd.readAsText(f);
    });
    $('#reset-save').addEventListener('click', () => {
      showModal({
        emoji: '🥚', title: 'Begin a new life?', body: 'This will erase your current creature, its memories and progress, and start a fresh egg. Consider exporting your save first!',
        actions: [{ label: 'Cancel' }, { label: 'Start fresh', kind: 'bad', onClick: () => { state = newState({}); renderAll(); save(); toast('🥚 A new egg waits for you.'); } }]
      });
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  }

  /* ================== GAME LOOP ================== */
  let running = false;
  let lastFrame = 0;
  let idleMs = 0;
  function ensureRunning() { running = true; }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (!state) return;
    const dt = ts - (lastFrame || ts);
    lastFrame = ts;
    if (dt > 400) return;
    if (!running) return;
    window.PocketLife._acc = (window.PocketLife._acc || 0) + dt;
    if (window.PocketLife._acc >= 5000) {
      window.PocketLife._acc = 0;
      meeting(state.pet);
      onPetChanged();
      if (Math.random() < 0.15) checkEvolution();
      checkAchievements();

    }
    // passive player idle
    if (ui.view === 'pet') {
      if (dt < 200) { /* nothing */ }
    }
    // blink
    if (!state.pet.sleeping && Math.random() < 0.004) renderPetSVG(true);
  }

  let blinkTimer = setInterval(() => { if (state && !state.pet.sleeping) renderPetSVG(true); }, 3800);

  function onPetChanged() {
    if (!state) return;
    renderNeeds();
    renderHud();
    renderNextGoal();
    renderScoreDependent();
    if (ui.view === 'garden') renderGarden();
  }

  function renderScoreDependent() {
    const st = $('#pet-state');
    const sp = S.byId(state.pet.species) || { stage: 'egg' };
    $('#pet-stage').textContent = (sp.stage || 'egg').toUpperCase();
  }

  function renderAll() {
    renderHud();
    renderNeeds();
    renderInventory();
    renderScene();
    renderJournal();
    renderNextGoal();
    const v = ui.view;
    if (v === 'care') renderCare();
    if (v === 'games') renderGames();
    if (v === 'talk') renderChat();
    if (v === 'garden') renderGarden();
    if (v === 'shop') renderShop();
    if (v === 'adventure') renderAdventure();
    if (v === 'dex') renderDex();
    if (v === 'profile') renderProfile();
    if (v === 'settings') renderSettings();
    updateAiBadge();
  }

  /* ================== START ================== */
  function firstRun() {
    state = newState({});
    journal('An egg appeared on your doorstep…');
    toast('🥚 Welcome to PocketLife! Care for the egg until it hatches.', 'gold');
  }

  function init() {
    loadSettings();
    if (!settings.motion) document.body.classList.add('no-motion');
    if (!load()) firstRun();
    else {
      state.pet.genome = state.pet.genome || newGenome();
      // offline catch-up: cap at 2 game-hours
      tierAhead(state.pet);
    }
    bind();
    renderAll();
    switchView('pet');
    state.time = state.time % 1440;
    if (!state.event) dailyEvent();
    save();
    setInterval(() => save(), 15000);
    requestAnimationFrame(loop);
    // ensure first egg progress
    if (state.pet.species === 'egg') checkEvolution();
    const st = $('#save-status');
    if (st) st.textContent = 'Loaded · autosaves every 15s';
  }

  function tierAhead(p) {
    // gentle offline catch-up so returning players aren't punished hard
    const away = (Date.now() - (state.lastTickAt || Date.now())) / 60000;
    const capped = Math.min(180, away);
    for (let i = 0; i < capped; i += 5) {
      meeting(p);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  window.PocketLife.debug = () => state;
  window.PocketLife.test = {
    meeting, checkEvolution, evolve, hatchEgg, feedItem, petting, bath, playWithToy,
    plotSeed, harvest, buy, explore, teachTrick, story, putToSleep, wakeUp,
    runMinutes(n) { for (let i = 0; i < n; i++) { meeting(state.pet); checkEvolution(); checkAchievements(); } },
    pauseTimers() { clearInterval(blinkTimer); },
    setState(s) { state = s; },
    newState, renderAll, switchView, useItem, cuddle, addCoins, addItem, removeItem
  };
})();
