/* Species data, evolution graph, items catalog. */
(function () {
  const SPECIES = [
    // ---- EGG ----
    { id: 'egg', name: 'Mystery Egg', stage: 'egg', element: 'mystic', form: 'egg', body: '#ffe8a3', accent: '#fff6d8', eye: 'warm', pattern: 'egg', limit: 16, parents: [], desc: 'A glowing shell that hums quietly. Something is dreaming inside.' },

    // ---- BABY (5) ----
    { id: 'blob', name: 'Blobble', stage: 'baby', element: 'water', form: 'blob', body: '#a8e6f8', accent: '#e3f9ff', eye: 'kind', pattern: 'spots', limit: 18, parents: ['egg'], desc: 'A wobbling droplet of curiosity. It bounces toward anything new.' },
    { id: 'sprout', name: 'Sprigg', stage: 'baby', element: 'nature', form: 'sprout', body: '#b9f0b0', accent: '#e8ffd9', eye: 'gentle', pattern: 'belly', limit: 17, parents: ['egg'], desc: 'A tiny sprout with a leaf that tilts toward light — and toward you.' },
    { id: 'budling', name: 'Budle', stage: 'baby', element: 'nature', form: 'budling', body: '#ffd1e6', accent: '#fff0f8', eye: 'sweet', pattern: 'spots', limit: 19, parents: ['egg'], desc: 'A shy bud with petals that blush pink when it is praised.' },
    { id: 'glim', name: 'Glim', stage: 'baby', element: 'mystic', form: 'glimmer', body: '#d9c8ff', accent: '#f4eeff', eye: 'curious', pattern: 'stars', limit: 20, parents: ['egg'], desc: 'A star-chaser. Glim leaves tiny sparkles wherever it hops.' },
    { id: 'finny', name: 'Finny', stage: 'baby', element: 'water', form: 'finlet', body: '#9fd6ff', accent: '#e2f4ff', eye: 'playful', pattern: 'scales', limit: 21, parents: ['egg'], desc: 'All fin, all fun. Finny splashes anyone who gets close enough.' },

    // ---- CHILD (12) ----
    { id: 'starbud', name: 'Starlet', stage: 'child', element: 'light', form: 'sparkle', body: '#ffc2e0', accent: '#fff0f8', eye: 'sweet', pattern: 'hearts', limit: 21, parents: ['budling', 'sprout'], desc: 'A joy-spark with a blush that lights up the whole room.' },
    { id: 'floofkin', name: 'Floofkin', stage: 'child', element: 'nature', form: 'floof', body: '#ffe2b8', accent: '#fff6e3', eye: 'warm', pattern: 'fur', limit: 22, parents: ['sprout', 'budling'], desc: 'A warm, furry hug with legs. Floofkin purrs when the room is cozy.' },
    { id: 'leaflet', name: 'Leaflet', stage: 'child', element: 'nature', form: 'sproutling', body: '#a9e88f', accent: '#e6ffd6', eye: 'gentle', pattern: 'belly', limit: 21, parents: ['sprout'], desc: 'Zoomies and leaf-tips. Leaflet is the gardener of the group.' },
    { id: 'glimmer', name: 'Glimwen', stage: 'child', element: 'mystic', form: 'glimmer', body: '#c8b2ff', accent: '#efe6ff', eye: 'curious', pattern: 'stars', limit: 22, parents: ['glim', 'blob'], desc: 'A star-chaser who has grown steadier. Collects shiny secrets.' },
    { id: 'finwick', name: 'Finwick', stage: 'child', element: 'water', form: 'finlet', body: '#7cc4f2', accent: '#d6f1ff', eye: 'playful', pattern: 'scales', limit: 23, parents: ['finny', 'blob'], desc: 'A confident swimmer who hums to the rhythm of rain.' },
    { id: 'bubblo', name: 'Bubblo', stage: 'child', element: 'water', form: 'bubblet', body: '#9fe8e0', accent: '#e3fffb', eye: 'goofy', pattern: 'bubbles', limit: 21, parents: ['finny'], desc: 'Bubbles follow Bubblo everywhere. It finds this hilarious.' },
    { id: 'frostpip', name: 'Frostpip', stage: 'child', element: 'ice', form: 'frostling', body: '#bde8ff', accent: '#f0fbff', eye: 'calm', pattern: 'ice', limit: 22, parents: ['finny', 'blob'], desc: 'Quiet and cool-headed, and very funny once it thaws.' },
    { id: 'emberling', name: 'Emberling', stage: 'child', element: 'fire', form: 'flamelet', body: '#ffb07a', accent: '#ffe1c4', eye: 'bold', pattern: 'flame', limit: 22, parents: ['budling', 'glim'], desc: 'A brave little flame that thinks everything is a challenge to win.' },
    { id: 'nyxkit', name: 'Nyxkit', stage: 'child', element: 'shadow', form: 'duskit', body: '#7b7fb0', accent: '#d5d8f7', eye: 'shy', pattern: 'moon', limit: 22, parents: ['glim'], desc: 'A quiet moon-watcher who is braver than anyone realizes.' },
    { id: 'voltik', name: 'Voltik', stage: 'child', element: 'storm', form: 'stormling', body: '#c9b8ff', accent: '#f1ecff', eye: 'bold', pattern: 'bolt', limit: 21, parents: ['glim', 'budling'], desc: 'A crackling ball of energy that zaps when nervous.' },
    { id: 'auriel', name: 'Auriel', stage: 'child', element: 'light', form: 'auralis', body: '#ffd7ee', accent: '#fff2fa', eye: 'dreamy', pattern: 'aurora', limit: 21, parents: ['budling', 'glim'], desc: 'A dreamweaver who paints the ceiling with soft colors at night.' },
    { id: 'quillup', name: 'Quillup', stage: 'child', element: 'nature', form: 'ferraquill', body: '#d9b38c', accent: '#f8e9d2', eye: 'shy', pattern: 'scales', limit: 21, parents: ['sprout', 'budling'], desc: 'Under all those quills is the softest heart in the greenhouse.' },

    // ---- ADULT (7) ----
    { id: 'blobking', name: 'Blobble King', stage: 'adult', element: 'water', form: 'blobking', body: '#7fd4f0', accent: '#d8f6ff', eye: 'kind', pattern: 'spots', limit: 26, parents: ['blob', 'glimmer'], desc: 'Royally squishy. Rules a kingdom of puddles with enormous kindness.' },
    { id: 'etchette', name: 'Etchette', stage: 'adult', element: 'fire', form: 'etcher', body: '#ff9d6a', accent: '#ffe0cc', eye: 'bold', pattern: 'flame', limit: 24, parents: ['emberling'], desc: 'A fierce dancer of embers who loves an audience of one.' },
    { id: 'crystelle', name: 'Crystelle', stage: 'adult', element: 'ice', form: 'crystalo', body: '#a6dcff', accent: '#eefbff', eye: 'calm', pattern: 'ice', limit: 24, parents: ['frostpip'], desc: 'Elegant and composed, with a laugh like cracking ice in spring.' },
    { id: 'aquareon', name: 'Aquareon', stage: 'adult', element: 'water', form: 'aquaros', body: '#6fb6f2', accent: '#d2ecff', eye: 'calm', pattern: 'scales', limit: 24, parents: ['finwick', 'bubblo'], desc: 'A tide-tender who shapes the weather by breathing.' },
    { id: 'solaria', name: 'Solaria', stage: 'adult', element: 'fire', form: 'solara', body: '#ffc773', accent: '#fff0cc', eye: 'warm', pattern: 'flame', limit: 24, parents: ['emberling', 'auriel'], desc: 'A sun-crowned guardian who radiates absolute comfort.' },
    { id: 'spectra', name: 'Spectra', stage: 'adult', element: 'shadow', form: 'spectrix', body: '#9a8fd6', accent: '#e8e3ff', eye: 'mystic', pattern: 'stars', limit: 24, parents: ['nyxkit'], desc: 'Half here, half elsewhere. Spectra remembers things that never happened.' },
    { id: 'stellark', name: 'Stellark', stage: 'adult', element: 'light', form: 'stellark', body: '#ffeac4', accent: '#fff8e6', eye: 'dreamy', pattern: 'stars', limit: 24, parents: ['auriel', 'starbud'], desc: 'A wishing stranger who grants small kindnesses to careful friends.' },

    // ---- EVOLVED (3) ----
    { id: 'gluon', name: 'Gluon', stage: 'evolved', element: 'nature', form: 'gluon', body: '#a8e6a8', accent: '#e6ffe6', eye: 'gentle', pattern: 'fur', limit: 26, parents: ['floofkin', 'leaflet', 'quillup'], desc: 'A guardian of gardens. Where Gluon naps, flowers grow.' },
    { id: 'novarus', name: 'Novarus', stage: 'evolved', element: 'light', form: 'nova', body: '#ffe8a3', accent: '#fffbeb', eye: 'warm', pattern: 'stars', limit: 26, parents: ['stellark', 'solaria'], desc: 'A newborn star in soft form. Its love is warm and impossible to ignore.' },
    { id: 'titania', name: 'Titania', stage: 'evolved', element: 'shadow', form: 'titan', body: '#c0a6e0', accent: '#efe6ff', eye: 'mystic', pattern: 'scales', limit: 28, parents: ['spectra', 'crystelle'], desc: 'A great hearth-keeper of legends. Gentle to those it loves.' },

    // ---- LEGENDARY (2) ----
    { id: 'starlight', name: 'Starlight', stage: 'legendary', element: 'light', form: 'starlight', body: '#fff0c2', accent: '#fffbe8', eye: 'warm', pattern: 'aurora', limit: 28, parents: ['novarus', 'gluon'], desc: 'Ascended. Starlight remembers every day you spent together.' },
    { id: 'starliminal', name: 'Starliminal', stage: 'legendary', element: 'mystic', form: 'starling', body: '#d7f0ff', accent: '#f2fbff', eye: 'dreamy', pattern: 'stars', limit: 28, parents: ['novarus', 'titania'], desc: 'The rarest form — a creature of both this world and the next.' }
  ];


  const byId = (id) => SPECIES.find(s => s.id === id);

  const STAGE_ORDER = { egg: 0, baby: 1, child: 2, adult: 3, evolved: 4, legendary: 5 };

  function resolveStage(species) {
    if (!species) return 'egg';
    return species.stage;
  }

  // Evolution logic: given current species & care metrics, picks a next stage species.
  function evolutionOptions(pet) {
    const sp = byId(pet.species) || byId('egg');
    const stageRank = STAGE_ORDER[sp.stage] || 0;
    let nextStage;
    if (sp.stage === 'egg') nextStage = 'baby';
    else if (sp.stage === 'baby') nextStage = 'child';
    else if (sp.stage === 'child') nextStage = 'adult';
    else if (sp.stage === 'adult') nextStage = 'evolved';
    else if (sp.stage === 'evolved') nextStage = 'legendary';
    else return [];
    return SPECIES.filter(s => s.stage === nextStage && (s.parents.includes(sp.id) || s.parents.includes('hell')));
  }

  function chooseEvolution(pet) {
    const opts = evolutionOptions(pet);
    if (!opts.length) return null;
    const T = pet.traits;
    const nature = T.nature ?? T.curiosity;
    const social = T.social;
    const energy = T.energy;
    const compete = T.bravery;
    const L2 = pet.lifelong2 || pet.lifelong || {};
    const aff = L2.affection || 0;
    const explore = L2.explorations || 0;
    const appetite = L2.foodsEaten || 0;
    const play = L2.plays || 0;
    const careScore = pet.careScore || 0;
    let bias = 'balanced';
    if (aff >= 10 && social >= 0.5) bias = 'affection';
    else if (explore >= 3 && nature >= 0.5) bias = 'wild';
    else if (play >= 15 || compete >= 0.6) bias = 'play';
    else if (appetite >= 10 && energy >= 0.5) bias = 'cosy';

    const scores = opts.map(s => {
      let sc = 1;
      const el = s.element;
      if (bias === 'affection' && (el === 'light' || el === 'nature')) sc += 3;
      if (bias === 'wild' && (el === 'nature' || el === 'storm')) sc += 3;
      if (bias === 'play' && (el === 'water' || el === 'fire')) sc += 3;
      if (bias === 'cosy' && (el === 'ice' || el === 'nature')) sc += 3;
      if (careScore > 60 && (el === 'light' || el === 'mystic')) sc += 1;
      sc += nature * 0.4 + Math.random() * 0.8;
      return { s, sc };
    });
    scores.sort((a, b) => b.sc - a.sc);
    return { species: scores[0].s, bias, options: opts };
  }

  const ELEMENTS = {
    water: { emoji: '💧', color: '#8fd3ff' },
    fire: { emoji: '🔥', color: '#ffb07a' },
    nature: { emoji: '🌿', color: '#8fe39c' },
    ice: { emoji: '❄️', color: '#bde8ff' },
    storm: { emoji: '⚡', color: '#c9b8ff' },
    light: { emoji: '✨', color: '#ffe8a3' },
    shadow: { emoji: '🌙', color: '#9a8fd6' },
    mystic: { emoji: '🔮', color: '#e0c8ff' }
  };

  // ============ ITEMS ============
  const FOODS = [
    { id: 'snack', name: 'Berry Snack', emoji: '🍓', price: 6, sat: 16, hyd: 4, joy: 2, desc: 'A bright little berry. Hard to dislike.' },
    { id: 'apple', name: 'Sky Apple', emoji: '🍎', price: 10, sat: 30, hyd: 6, joy: 4, desc: 'Crisp, sweet, dependable. A favourite comfort.' },
    { id: 'carrot', name: 'Crunch Carrot', emoji: '🥕', price: 9, sat: 24, hyd: 2, joy: 3, desc: 'Crunchy and healthy. A little boring, honestly.' },
    { id: 'cake', name: 'Celebration Cake', emoji: '🍰', price: 22, sat: 20, hyd: 0, joy: 16, desc: 'Pure joy in pastry form. Spoils a meal a bit.' },
    { id: 'milk', name: 'Warm Milk', emoji: '🥛', price: 7, sat: 12, hyd: 40, joy: 6, desc: 'Warm and cosy. Perfect before bedtime.' },
    { id: 'soup', name: 'Hearty Soup', emoji: '🍲', price: 15, sat: 40, hyd: 30, joy: 8, desc: 'Soul-warming. Makes any day feel safer.' },
    { id: 'pizza', name: 'Tiny Pizza', emoji: '🍕', price: 19, sat: 36, hyd: 4, joy: 14, desc: 'A whole pizza, exactly its size. Miraculous.' },
    { id: 'donut', name: 'Galaxy Donut', emoji: '🍩', price: 13, sat: 18, hyd: 2, joy: 18, desc: 'Iridescent glaze. Leaves sparkling crumbs.' },
    { id: 'sushi', name: 'Cloud Sushi', emoji: '🍣', price: 21, sat: 34, hyd: 12, joy: 11, desc: 'Pillowy rice. Delicate and interesting.' },
    { id: 'water', name: 'Moon Water', emoji: '💧', price: 4, sat: 0, hyd: 45, joy: 2, desc: 'Cool, clear, gathered at night.' },
    { id: 'cactus', name: 'Prickly Pear', emoji: '🌵', price: 11, sat: 14, hyd: 20, joy: 7, desc: 'Spiky on the outside. Sweet once you get through.' },
    { id: 'honey', name: 'Star Honey', emoji: '🍯', price: 17, sat: 22, hyd: 6, joy: 15, desc: 'Slow golden sweetness. Tastes like sunlight.' },
    { id: 'noodle', name: 'Noodle Nest', emoji: '🍜', price: 18, sat: 42, hyd: 22, joy: 12, desc: 'Slurpy comfort in a bowl of broth.' },
    { id: 'melon', name: 'Aurora Melon', emoji: '🍈', price: 14, sat: 20, hyd: 30, joy: 9, desc: 'Shifts colours as it ripens. Very refreshing.' }
  ];

  const TOYS = [
    { id: 'ball', name: 'Bouncy Orb', emoji: '🎾', price: 20, kind: 'toy', joy: 12, en: -6, desc: 'Bounces unpredictably. Endlessly fun.' },
    { id: 'wand', name: 'Wand of Wishes', emoji: '🪄', price: 42, kind: 'toy', joy: 16, en: -4, desc: 'Sparkles when waved. Teaches patience.' },
    { id: 'blocks', name: 'Puzzle Blocks', emoji: '🧱', price: 32, kind: 'toy', joy: 10, en: -3, desc: 'Smart play. Sharpens curiosity.' },
    { id: 'plush', name: 'Comfy Plush', emoji: '🧸', price: 48, kind: 'toy', joy: 14, en: 3, desc: 'Soft companion for nap time. Cuddle-friendly.' },
    { id: 'kite', name: 'Wind Kite', emoji: '🪁', price: 50, kind: 'toy', joy: 18, en: -8, desc: 'Needs a brave hand and a windy day.' },
    { id: 'bubbles', name: 'Bubble Wand', emoji: '🫧', price: 26, kind: 'toy', joy: 13, en: -2, desc: 'Bubbles everywhere. Simple, perfect joy.' },
    { id: 'drum', name: 'Tiny Drum', emoji: '🥁', price: 38, kind: 'toy', joy: 15, en: -5, desc: 'Loud. Beloved. Possibly regrettable.' },
    { id: 'skate', name: 'Mini Skates', emoji: '🛼', price: 66, kind: 'toy', joy: 22, en: -10, desc: 'Adds serious speed — and serious spills.' },
    { id: 'harmonica', name: 'Cloud Harmonica', emoji: '🎼', price: 44, kind: 'toy', joy: 17, en: -2, desc: 'Sings the weather. Delights musicians.' },
    { id: 'rocket', name: 'Toy Rocket', emoji: '🚀', price: 58, kind: 'toy', joy: 19, en: -6, desc: 'Goes "woooosh". Inspires grand adventures.' }
  ];

  const SEEDS = [
    { id: 'seedBerry', name: 'Berry Seeds', emoji: '🌱', price: 8, plant: 'strawberry', growTime: 30, items: [['snack', 2], ['honey', 1]] },
    { id: 'seedDaisy', name: 'Sunny Daisy Seeds', emoji: '🌼', price: 12, plant: 'daisy', growTime: 40, items: [['cake', 1], ['water', 2]] },
    { id: 'seedPumpkin', name: 'Orb Pumpkin Seeds', emoji: '🎃', price: 18, plant: 'pumpkin', growTime: 60, items: [['soup', 2], ['melon', 1]] },
    { id: 'seedGlow', name: 'Glowcap Spores', emoji: '🍄', price: 24, plant: 'glowcap', growTime: 80, items: [['donut', 1], ['noodle', 1]] },
    { id: 'seedStar', name: 'Starfruit Seeds', emoji: '🌟', price: 30, plant: 'starfruit', growTime: 100, items: [['pizza', 1], ['sushi', 1], ['honey', 1]] }
  ];

  const WEARABLES = [
    { id: 'hat_bow', name: 'Silk Bow', emoji: '🎀', price: 30, kind: 'wearable', joy: 3 },
    { id: 'hat_crown', name: 'Paper Crown', emoji: '👑', price: 80, kind: 'wearable', joy: 6 },
    { id: 'hat_sunhat', name: 'Sun Hat', emoji: '👒', price: 26, kind: 'wearable', joy: 3 },
    { id: 'hat_scarf', name: 'Cozy Scarf', emoji: '🧣', price: 34, kind: 'wearable', joy: 4 },
    { id: 'hat_scarf_g', name: 'Mint Scarf', emoji: '🧣', price: 40, kind: 'wearable', joy: 4 },
    { id: 'glasses', name: 'Star Glasses', emoji: '🕶️', price: 52, kind: 'wearable', joy: 5 },
    { id: 'cape', name: 'Hero Cape', emoji: '🦸', price: 70, kind: 'wearable', joy: 7 },
    { id: 'wings', name: 'Butterfly Wings', emoji: '🦋', price: 90, kind: 'wearable', joy: 8 },
    { id: 'flower', name: 'Flower Crown', emoji: '🌸', price: 44, kind: 'wearable', joy: 5 }
  ];

  const DECOR = [
    { id: 'plant', name: 'Potted Friend', emoji: '🪴', price: 28, kind: 'decor', joy: 2, pos: [12, 70] },
    { id: 'lamp', name: 'Mushroom Lamp', emoji: '🍄', price: 38, kind: 'decor', joy: 3, pos: [86, 74], glow: true },
    { id: 'lava', name: 'Lava Lamp', emoji: '🛋️', price: 55, kind: 'decor', joy: 4, pos: [74, 84] },
    { id: 'cactus', name: 'Little Cactus', emoji: '🌵', price: 20, kind: 'decor', joy: 2, pos: [20, 82] },
    { id: 'poster', name: 'Star Poster', emoji: '🖼️', price: 46, kind: 'decor', joy: 3, pos: [40, 26] },
    { id: 'clock', name: 'Wall Clock', emoji: '🕰️', price: 36, kind: 'decor', joy: 2, pos: [93, 30] },
    { id: 'fishbowl', name: 'Fish Bowl', emoji: '🐠', price: 60, kind: 'decor', joy: 5, pos: [14, 58] },
    { id: 'balloon', name: 'Balloon Cluster', emoji: '🎈', price: 26, kind: 'decor', joy: 4, pos: [90, 48] },
    { id: 'teddy', name: 'Giant Teddy', emoji: '🧸', price: 58, kind: 'decor', joy: 5, pos: [18, 78] },
    { id: 'windowcat', name: 'Window Garden', emoji: '🌷', price: 32, kind: 'decor', joy: 2, pos: [30, 30] },
    { id: 'rug2', name: 'Cloud Rug', emoji: '☁️', price: 70, kind: 'decor', joy: 6, pos: [80, 90] },
    { id: 'rainbow', name: 'Rainbow Shelves', emoji: '🌈', price: 84, kind: 'decor', joy: 5, pos: [62, 30] }
  ];

  const KEYS = [
    { id: 'key_beach', name: 'Seaside Key', emoji: '🔑', price: 60, kind: 'key', area: 'seaside' },
    { id: 'key_cave', name: 'Crystal Key', emoji: '🔑', price: 90, kind: 'key', area: 'crystalCave' },
    { id: 'key_cloud', name: 'Cloud Key', emoji: '🔑', price: 130, kind: 'key', area: 'cloudSea' },
    { id: 'key_ember', name: 'Ember Key', emoji: '🔑', price: 170, kind: 'key', area: 'emberPeak' }
  ];

  const EGGS = [
    { id: 'egg_meadow', name: 'Meadow Egg', emoji: '🥚', price: 140, rare: false, bias: 'nature', desc: 'Warm, speckled with green. Smells like rain on leaves.' },
    { id: 'egg_tide', name: 'Tide Egg', emoji: '🥚', price: 160, rare: false, bias: 'water', desc: 'Smooth and cool. You can hear a far-off tide.' },
    { id: 'egg_ember', name: 'Ember Egg', emoji: '🥚', price: 180, rare: false, bias: 'fire', desc: 'Faintly warm to the touch, with a flicker of light.' },
    { id: 'egg_dusk', name: 'Dusk Egg', emoji: '🥚', price: 220, rare: true, bias: 'shadow', desc: 'Dark shell with a faint moon pattern.' },
    { id: 'egg_zephyr', name: 'Zephyr Egg', emoji: '🥚', price: 240, rare: true, bias: 'storm', desc: 'Light enough to feel like a held breath.' },
    { id: 'egg_aurora', name: 'Aurora Egg', emoji: '🥚', price: 300, rare: true, bias: 'light', desc: 'Iridescent shell, constantly shifting hues.' }
  ];

  const GAME_ITEMS = [
    { id: 'trinket_shell', name: 'Sea Shell', emoji: '🐚', price: 0, kind: 'trinket' },
    { id: 'trinket_feather', name: 'Sky Feather', emoji: '🪶', price: 0, kind: 'trinket' },
    { id: 'trinket_stone', name: 'Lucky Stone', emoji: '🪨', price: 0, kind: 'trinket' },
    { id: 'trinket_rhythm', name: 'Golden Drum', emoji: '🥇', price: 0, kind: 'trinket' },
    { id: 'trinket_memory', name: 'Memory Crystal', emoji: '🔮', price: 0, kind: 'trinket' },
    { id: 'trinket_crown', name: 'Tiny Crown', emoji: '👑', price: 0, kind: 'trinket' }
  ];

  const AREAS = {
    forest: { id: 'forest', name: 'Whisper Woods', emoji: '🌳', colors: ['#2e5b3e', '#4d8d5c'], desc: 'Soft moss, curious beetles, and paths that rearrange at night.' },
    seaside: { id: 'seaside', name: 'Glass Tide Shore', emoji: '🏖️', colors: ['#1f5f8b', '#3fb8c9'], desc: 'Waves like blown glass. Something sparkles under the sand.', unlock: 'key_beach' },
    crystalCave: { id: 'crystalCave', name: 'Crystal Hollows', emoji: '💎', colors: ['#3b2a6e', '#8a5cf1'], desc: 'Singing crystals and a billion tiny echoes.', unlock: 'key_cave' },
    cloudSea: { id: 'cloudSea', name: 'Cloud Sea', emoji: '☁️', colors: ['#5a6fb0', '#bfe0ff'], desc: 'Floating islands held up by nothing at all.', unlock: 'key_cloud' },
    emberPeak: { id: 'emberPeak', name: 'Ember Peak', emoji: '🌋', colors: ['#6e2a2a', '#ff8a5c'], desc: 'Warm stone and drifting embers that never quite land.', unlock: 'key_ember' },
    starfield: { id: 'starfield', name: 'Fallen Starfield', emoji: '🌠', colors: ['#1d1533', '#7a5cff'], desc: 'Where a star fell and quietly kept glowing.' }
  };

  const EVENTS = [
    { id: 'meteor', name: 'Meteor Shower', emoji: '🌠', desc: 'The sky fills with light. Wishes feel possible.', effect: { happiness: 6, curiosity: 8 } },
    { id: 'bloom', name: 'Great Bloom', emoji: '🌺', desc: 'Every flower in the house opens at once.', effect: { happiness: 5, gardenBoost: 1 } },
    { id: 'static', name: 'Static Storm', emoji: '🌩️', desc: 'The air hums. Your creature is jumpy and electric.', effect: { nervousness: 10, energy: -5 } },
    { id: 'peaceful', name: 'Lullaby Wind', emoji: '🎶', desc: 'A soft wind hums an old song.', effect: { energy: 8, nervousness: -15 } },
    { id: 'treasure', name: 'Backyard Find', emoji: '🗝️', desc: 'Something glints between the floorboards.', effect: { coins: 25 } },
    { id: 'bird', name: 'Wandering Bird', emoji: '🐦', desc: 'A tiny bird visits the window and sings to your pet.', effect: { happiness: 4, social: 8 } },
    { id: 'rainbow', name: 'Double Rainbow', emoji: '🌈', desc: 'Luck feels closer today.', effect: { happiness: 8 } },
    { id: 'fog', name: 'Foggy Morning', emoji: '🌫️', desc: 'The world is soft and muffled. Good for naps.', effect: { energy: 5, curiosity: -5 } },
    { id: 'letters', name: 'Penned Letters', emoji: '✉️', desc: 'Letters arrive from creatures it has never met.', effect: { affection: 6, social: 6 } },
    { id: 'harvest', name: 'Harvest Time', emoji: '🍂', desc: 'The garden is unusually generous today.', effect: { gardenBoost: 2 } },
    { id: 'sale', name: 'Boutique Sale', emoji: '🏷️', desc: 'Everything at the boutique is marked down!', effect: { discount: 0.6 } },
    { id: 'comet', name: 'Comet Trail', emoji: '☄️', desc: 'A slow, impossible comet. Your creature is mesmerized.', effect: { curiosity: 15, happiness: 3 } }
  ];

  const ACHIEVEMENTS = [
    { id: 'firstFeed', name: 'First Bite', emoji: '🍎', desc: 'Feed your creature for the first time.' },
    { id: 'firstBath', name: 'Squeaky Clean', emoji: '🛁', desc: 'Give your creature a bath.' },
    { id: 'firstSleep', name: 'Sweet Dreams', emoji: '😴', desc: 'Tuck your creature into bed.' },
    { id: 'hatch', name: 'Hello, World', emoji: '🥚', desc: 'Hatch your egg.' },
    { id: 'firstEvolve', name: 'Growth Spurt', emoji: '🌟', desc: 'Evolve your creature for the first time.' },
    { id: 'adult', name: 'All Grown Up', emoji: '🎓', desc: 'Reach the adult stage.' },
    { id: 'legend', name: 'Living Legend', emoji: '👑', desc: 'Reach the legendary stage.' },
    { id: 'talk10', name: 'Conversationalist', emoji: '💬', desc: 'Have 10 conversations.' },
    { id: 'trick5', name: 'Trickster', emoji: '🎓', desc: 'Teach 5 tricks.' },
    { id: 'gamer', name: 'Arcade Regular', emoji: '🎮', desc: 'Play 6 mini-games.' },
    { id: 'coins100', name: 'Pocket Money', emoji: '🪙', desc: 'Hold 100 coins at once.' },
    { id: 'coins500', name: 'Tycoon', emoji: '💰', desc: 'Hold 500 coins at once.' },
    { id: 'gardener', name: 'Green Thumb', emoji: '🌻', desc: 'Harvest 3 plants.' },
    { id: 'explorer', name: 'Pathfinder', emoji: '🗺️', desc: 'Complete 3 expeditions.' },
    { id: 'collector', name: 'Collector', emoji: '📚', desc: 'Discover 10 forms in the encyclopedia.' },
    { id: 'dex20', name: 'Scholar', emoji: '🔍', desc: 'Discover 20 forms in the encyclopedia.' },
    { id: 'photo5', name: 'Photographer', emoji: '📸', desc: 'Collect 5 photos.' },
    { id: 'loved', name: 'Soul Bond', emoji: '💖', desc: 'Reach maximum affection.' },
    { id: 'bestFriend', name: 'Best Friends', emoji: '🤗', desc: 'Spend a whole day together at max happiness.' },
    { id: 'event5', name: 'Four Seasons', emoji: '🌦️', desc: 'Experience 5 daily events.' }
  ];

  window.Species = {
    SPECIES, byId, ELEMENTS, evolutionOptions, chooseEvolution, STAGE_ORDER,
    FOODS, TOYS, SEEDS, WEARABLES, DECOR, KEYS, EGGS, GAME_ITEMS, AREAS, EVENTS, ACHIEVEMENTS
  };
})();
