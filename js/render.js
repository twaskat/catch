/* Procedural creature SVG renderer. Pure SVG so it can be used inline and inside the encyclopedia. */
(function () {
  const round = n => Math.round(n * 10) / 10;

  const FORM = {
    egg:      { w: 74, h: 92, top: 20, bot: 46, eye: 10, eyeY: 52, eyeGap: 15, nose: false, tail: null, horns: null, pattern: 'egg', limit: 16, arms: false, feet: false, headTop: 0 },
    blob:     { w: 98, h: 88, top: 32, bot: 44, eye: 13, eyeY: 46, eyeGap: 21, nose: true, tail: null, horns: null, pattern: 'spots', limit: 18, arms: true, feet: true, headTop: 0 },
    sprout:   { w: 90, h: 104, top: 40, bot: 26, eye: 13, eyeY: 50, eyeGap: 20, nose: true, tail: null, horns: 'sprout', pattern: 'belly', limit: 17, arms: true, feet: true, headTop: 0 },
    sproutling:{w: 92, h: 110, top: 44, bot: 24, eye: 13, eyeY: 54, eyeGap: 21, nose: true, tail: 'leaf', horns: 'leaf', pattern: 'belly', limit: 18, arms: true, feet: true, headTop: 0 },
    budling:  { w: 96, h: 100, top: 36, bot: 30, eye: 13, eyeY: 48, eyeGap: 21, nose: true, tail: null, horns: 'bud', pattern: 'spots', limit: 19, arms: true, feet: true, headTop: 0 },
    floof:    { w: 106, h: 102, top: 30, bot: 34, eye: 13, eyeY: 50, eyeGap: 22, nose: true, tail: 'fluff', horns: 'ears', pattern: 'fur', limit: 22, arms: true, feet: true, headTop: 0 },
    glimmer:  { w: 100, h: 104, top: 32, bot: 32, eye: 14, eyeY: 50, eyeGap: 23, nose: true, tail: 'curl', horns: 'antenna', pattern: 'stars', limit: 20, arms: true, feet: true, headTop: 0, glow: true },
    finlet:   { w: 104, h: 100, top: 30, bot: 34, eye: 13, eyeY: 50, eyeGap: 22, nose: true, tail: 'fin', horns: 'fin', pattern: 'scales', limit: 21, arms: true, feet: true, headTop: 0 },
    sproutix: { w: 100, h: 120, top: 40, bot: 22, eye: 14, eyeY: 56, eyeGap: 23, nose: true, tail: 'leaf', horns: 'blossom', pattern: 'belly', limit: 20, arms: true, feet: true, headTop: 0 },
    flamelet: { w: 100, h: 118, top: 34, bot: 30, eye: 14, eyeY: 58, eyeGap: 23, nose: true, tail: 'flame', horns: 'flame', pattern: 'flame', limit: 21, arms: true, feet: true, headTop: 0, glow: true },
    frostling:{ w: 104, h: 106, top: 32, bot: 34, eye: 13, eyeY: 52, eyeGap: 22, nose: true, tail: 'ice', horns: 'crystal', pattern: 'ice', limit: 22, arms: true, feet: true, headTop: 0 },
    stormling:{ w: 98, h: 112, top: 34, bot: 34, eye: 14, eyeY: 50, eyeGap: 23, nose: true, tail: 'bolt', horns: 'hammer', pattern: 'bolt', limit: 20, arms: true, feet: true, headTop: 0 },
    auralis:  { w: 100, h: 112, top: 34, bot: 30, eye: 14, eyeY: 52, eyeGap: 22, nose: true, tail: 'wisp', horns: 'tiara', pattern: 'aurora', limit: 21, arms: true, feet: true, headTop: 0, glow: true },
    bubblet:  { w: 100, h: 100, top: 34, bot: 32, eye: 13, eyeY: 52, eyeGap: 22, nose: true, tail: 'bubble', horns: 'bubbles', pattern: 'bubbles', limit: 21, arms: true, feet: true, headTop: 0 },
    ferraquill:{ w: 102, h: 94, top: 30, bot: 38, eye: 12, eyeY: 50, eyeGap: 21, nose: true, tail: 'spike', horns: 'spikes', pattern: 'scales', limit: 21, arms: true, feet: true, headTop: 0 },
    duskit:   { w: 100, h: 116, top: 32, bot: 30, eye: 14, eyeY: 52, eyeGap: 24, nose: true, tail: 'wisp', horns: 'horns', pattern: 'moon', limit: 22, arms: true, feet: true, headTop: 0 },
    sparkle:  { w: 98, h: 106, top: 32, bot: 32, eye: 14, eyeY: 54, eyeGap: 23, nose: true, tail: 'bow', horns: 'bow', pattern: 'hearts', limit: 21, arms: true, feet: true, headTop: 0, glow: true },
    tincan:   { w: 96, h: 104, top: 20, bot: 18, eye: 13, eyeY: 50, eyeGap: 22, nose: false, tail: 'spring', horns: 'antenna', pattern: 'bolts', limit: 20, arms: true, feet: true, headTop: 0, metal: true },
    blobking: { w: 118, h: 100, top: 30, bot: 40, eye: 14, eyeY: 52, eyeGap: 26, nose: true, tail: null, horns: 'ears', pattern: 'spots', limit: 26, arms: true, feet: true, headTop: 0, crown: true },
    etcher:   { w: 100, h: 124, top: 40, bot: 20, eye: 14, eyeY: 56, eyeGap: 24, nose: true, tail: 'flame', horns: 'plume', pattern: 'flame', limit: 20, arms: true, feet: true, headTop: 0, glow: true },
    crystalo: { w: 108, h: 112, top: 32, bot: 30, eye: 14, eyeY: 54, eyeGap: 24, nose: true, tail: 'ice', horns: 'crystal', pattern: 'ice', limit: 23, arms: true, feet: true, headTop: 0, crown: true },
    aquaros:  { w: 110, h: 104, top: 30, bot: 34, eye: 14, eyeY: 52, eyeGap: 24, nose: true, tail: 'fin', horns: 'crown', pattern: 'scales', limit: 23, arms: true, feet: true, headTop: 0, crown: true },
    solara:   { w: 106, h: 110, top: 32, bot: 32, eye: 14, eyeY: 54, eyeGap: 24, nose: true, tail: 'flame', horns: 'crown', pattern: 'flame', limit: 22, arms: true, feet: true, headTop: 0, glow: true, crown: true },
    spectrix: { w: 104, h: 112, top: 32, bot: 32, eye: 14, eyeY: 54, eyeGap: 24, nose: true, tail: 'wisp', horns: 'moon', pattern: 'stars', limit: 22, arms: true, feet: true, headTop: 0, crown: true },
    stellark: { w: 108, h: 108, top: 30, bot: 32, eye: 15, eyeY: 54, eyeGap: 25, nose: true, tail: 'comet', horns: 'crown', pattern: 'stars', limit: 23, arms: true, feet: true, headTop: 0, glow: true, crown: true },
    gluon:    { w: 104, h: 112, top: 30, bot: 36, eye: 14, eyeY: 52, eyeGap: 24, nose: true, tail: 'fluff', horns: 'blossom', pattern: 'fur', limit: 22, arms: true, feet: true, headTop: 0, crown: true },
    nova:     { w: 110, h: 108, top: 30, bot: 32, eye: 15, eyeY: 54, eyeGap: 25, nose: true, tail: 'comet', horns: 'flame', pattern: 'stars', limit: 23, arms: true, feet: true, headTop: 0, glow: true, crown: true },
    titan:    { w: 120, h: 112, top: 28, bot: 40, eye: 14, eyeY: 54, eyeGap: 27, nose: true, tail: 'spike', horns: 'horns', pattern: 'scales', limit: 28, arms: true, feet: true, headTop: 0, crown: true },
    starlight:{ w: 112, h: 114, top: 28, bot: 32, eye: 15, eyeY: 54, eyeGap: 26, nose: true, tail: 'comet', horns: 'crown', pattern: 'aurora', limit: 24, arms: true, feet: true, headTop: 0, glow: true, crown: true },
    starling: { w: 110, h: 110, top: 30, bot: 34, eye: 15, eyeY: 54, eyeGap: 25, nose: true, tail: 'comet', horns: 'crown', pattern: 'stars', limit: 23, arms: true, feet: true, headTop: 0, glow: true, crown: true }
  };

  function shade(hex, amt) {
    const n = parseInt(hex.replace('#', ''), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, r + amt));
    g = Math.max(0, Math.min(255, g + amt));
    b = Math.max(0, Math.min(255, b + amt));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function mix(a, b, t) {
    const x = parseInt(a.replace('#', ''), 16), y = parseInt(b.replace('#', ''), 16);
    const ch = s => Math.round((((x >> s) & 255) * (1 - t)) + (((y >> s) & 255) * t));
    return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0');
  }

  function uniqueId(prefix) {
    return prefix + Math.random().toString(36).slice(2, 8);
  }

  function pattern(p, f, w, h, top, bot, colors) {
    const { body, light, dark } = colors;
    switch (p) {
      case 'spots': {
        if (f.limit < 16) return '';
        return `<ellipse cx="0" cy="${round(f.eyeY + 12)}" rx="${round(w * 0.42)}" ry="${round(w * 0.26)}" fill="#fff" opacity=".14"/><circle cx="${round(-w * 0.3)}" cy="${round(top * 0.55)}" r="${round(w * 0.09)}" fill="${dark}" opacity=".5"/><circle cx="${round(w * 0.32)}" cy="${round(top * 0.7)}" r="${round(w * 0.07)}" fill="${dark}" opacity=".45"/>`;
      }
      case 'belly': {
        return `<ellipse cx="0" cy="${round(f._bodyCy + f.eye * 2.2)}" rx="${round(w * 0.28)}" ry="${round(w * 0.18)}" fill="${light}" opacity=".8"/><ellipse cx="0" cy="${round(f._headCy - f.eye * 0.4)}" rx="${round(w * 0.07)}" ry="${round(w * 0.04)}" fill="${light}" opacity=".5"/>`;
      }
      case 'fur': {
        if (f.limit < 18) return '';
        let s = '';
        for (let i = 0; i < 5; i++) {
          const a = -0.5 + i * 0.22;
          s += `<path d="M${round(Math.sin(a) * w * 0.42)} ${round(top + (a + 0.5) * (h - top - bot))} q3 -4 6 0 q-3 2 -6 0z" fill="${light}" opacity=".5"/>`;
        }
        return s;
      }
      case 'stars':
        return `<path d="M${round(-w * 0.28)} ${round(top * 0.62)} l2.4 5 5.4 .6 -4 3.7 1.1 5.3 -4.9 -2.7 -4.9 2.7 1.1 -5.3 -4 -3.7 5.4 -.6z" fill="#fff" opacity=".8"/><ellipse cx="${round(w * 0.3)}" cy="${round(top * 0.5)}" rx="2" ry="2" fill="#fff" opacity=".9"/><ellipse cx="${round(-w * 0.04)}" cy="${round(top * 0.34)}" rx="1.6" ry="1.6" fill="#fff" opacity=".7"/>`;
      case 'scales':
        return `<path d="M${round(-w * 0.3)} ${round(top * 0.7)} q6 -6 12 0 M${round(w * 0.3)} ${round(top * 0.7)} q6 -6 12 0" stroke="${dark}" stroke-width="2" fill="none" opacity=".5"/><ellipse cx="0" cy="${round(top * 0.55)}" rx="${round(w * 0.12)}" ry="${round(w * 0.03)}" fill="${dark}" opacity=".3"/>`;
      case 'ice':
        return `<path d="M${round(-w * 0.25)} ${round(h - bot - 6)} l-6 12 l6 -4 l6 4z M${round(w * 0.18)} ${round(h - bot - 8)} l-5 10 l5 -3 l5 3z" fill="${light}" opacity=".85"/><ellipse cx="0" cy="${round(h - bot - 14)}" rx="${round(w * 0.28)}" ry="${round(w * 0.16)}" fill="${light}" opacity=".35"/>`;
      case 'flame':
        return `<path d="M${round(-w * 0.24)} ${round(h - bot - 6)} q8 -14 12 0 q6 -10 10 2 q7 -12 12 2" fill="${light}" opacity=".25" stroke="${light}" stroke-width="2"/>`;
      case 'bolt':
        return `<path d="M-2 ${round(top * 0.5)} l6 12 l-4 0 l5 12 l10 -16 l-5 0 l4 -8z" fill="${light}" opacity=".6"/>`;
      case 'aurora':
        return `<path d="M${round(-w * 0.34)} ${round(f.eyeY + 14)} q${round(w * 0.2)} -10 ${round(w * 0.34)} 0 t${round(w * 0.34)} 0" stroke="${light}" stroke-width="3" fill="none" opacity=".6"/><path d="M${round(-w * 0.26)} ${round(f.eyeY + 26)} q${round(w * 0.16)} -8 ${round(w * 0.26)} 0 t${round(w * 0.26)} 0" stroke="${colors.dark}" stroke-width="2" fill="none" opacity=".45"/>`;
      case 'bubbles':
        return `<circle cx="${round(-w * 0.26)}" cy="${round(top * 0.7)}" r="4" fill="${light}" opacity=".7"/><circle cx="${round(w * 0.22)}" cy="${round(top * 0.5)}" r="3" fill="#fff" opacity=".8"/><circle cx="${round(w * 0.1)}" cy="${round(top * 0.85)}" r="2.4" fill="${light}" opacity=".7"/>`;
      case 'moon':
        return `<path d="M${round(w * 0.25)} ${round(top * 0.42)} a9 9 0 1 0 9 12 a11 11 0 1 1 -9 -12z" fill="${light}" opacity=".75"/>`;
      case 'hearts':
        return `<path d="M${round(-w * 0.26)} ${round(top * 0.68)} c-3 -4 -9 1 0 7 c9 -6 3 -11 0 -7z" fill="${light}" opacity=".8"/><path d="M${round(w * 0.26)} ${round(f.eyeY + 18)} c-2 -3 -7 1 0 5 c7 -4 2 -8 0 -5z" fill="${light}" opacity=".7"/>`;
      case 'bolts':
        return `<circle cx="${round(-w * 0.3)}" cy="${round(top * 0.72)}" r="3" fill="${dark}"/><circle cx="${round(w * 0.3)}" cy="${round(top * 0.72)}" r="3" fill="${dark}"/><circle cx="0" cy="${round(top * 0.5)}" r="2.4" fill="${dark}"/>`;
      case 'egg':
        return '';
      default: return '';
    }
  }

  function hornsSVG(f, w, top, colors, id) {
    const { light, dark } = colors;
    switch (f.horns) {
      case 'sprout': return `<path d="M0 ${top} q0 -16 2 -20" stroke="#5fbf78" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M2 ${round(top - 18)} q-14 -4 -16 -14 q16 0 18 12z" fill="#8fe39c"/><path d="M2 ${round(top - 18)} q14 -4 16 -14 q-16 0 -18 12z" fill="#6fd58a"/>`;
      case 'leaf': return `<path d="M0 ${top} q0 -18 2 -24" stroke="#4fae6a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M2 ${round(top - 14)} q-16 -2 -20 -16 q18 0 22 12z" fill="#8fe39c"/><path d="M2 ${round(top - 22)} q16 -2 20 -16 q-18 0 -22 12z" fill="#6fd58a"/>`;
      case 'bud': return `<path d="M0 ${top} q0 -14 2 -18" stroke="#5fbf78" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M2 ${round(top - 16)} q-12 -14 0 -24 q12 10 0 24z" fill="#ffb3d9"/><path d="M2 ${round(top - 14)} q-6 -8 0 -14 q6 6 0 14z" fill="#ffe8a3"/>`;
      case 'blossom': return `<path d="M0 ${top} q2 -16 4 -22" stroke="#5fbf78" stroke-width="4" fill="none" stroke-linecap="round"/>${[0,72,144,216,288].map(a => `<ellipse cx="${round(4 + Math.cos(a * Math.PI / 180) * 9)}" cy="${round(top - 22 + Math.sin(a * Math.PI / 180) * 9)}" rx="7" ry="9" transform="rotate(${a} ${round(4 + Math.cos(a * Math.PI / 180) * 9)} ${round(top - 22 + Math.sin(a * Math.PI / 180) * 9)})" fill="${a % 144 ? '#ffb3d9' : '#ff8fbf'}"/>`,).join('')}<circle cx="4" cy="${round(top - 22)}" r="4" fill="#ffe8a3"/>`;
      case 'ears': return `<path d="M${round(-w * 0.3)} ${top + 6} l-6 -24 l18 12z" fill="${dark}"/><path d="M${round(w * 0.3)} ${top + 6} l6 -24 l-18 12z" fill="${dark}"/>`;
      case 'antenna': return `<path d="M${round(-w * 0.18)} ${top + 4} q-6 -14 0 -22" stroke="${dark}" stroke-width="2.4" fill="none"/><path d="M${round(w * 0.18)} ${top + 4} q6 -14 0 -22" stroke="${dark}" stroke-width="2.4" fill="none"/><circle cx="${round(-w * 0.16)}" cy="${round(top - 19)}" r="4" fill="#ffe8a3"/><circle cx="${round(w * 0.16)}" cy="${round(top - 19)}" r="4" fill="#ffe8a3"/>`;
      case 'crown': return `<path d="M${round(-w * 0.26)} ${top + 8} l4 -22 l10 10 l${round(w * 0.06)} -16 l${round(w * 0.06)} 16 l10 -10 l4 22z" fill="${light}" stroke="${dark}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${round(-w * 0.14)}" cy="${round(top - 8)}" r="2.4" fill="#ff9ecf"/><circle cx="0" cy="${round(top - 14)}" r="2.6" fill="#8ff7d5"/><circle cx="${round(w * 0.14)}" cy="${round(top - 8)}" r="2.4" fill="#8fd3ff"/>`;
      case 'crystal': return `<path d="M${round(-w * 0.24)} ${top + 6} l-4 -18 l8 -2 l2 18z" fill="#cdeeff" stroke="#8fd3ff" stroke-width="1"/><path d="M${round(w * 0.24)} ${top + 6} l4 -18 l-8 -2 l-2 18z" fill="#e8f9ff" stroke="#8fd3ff" stroke-width="1"/><path d="M0 ${top - 2} l-5 -16 l10 0z" fill="#fff" stroke="#8fd3ff" stroke-width="1"/>`;
      case 'tiara': return `<path d="M${round(-w * 0.2)} ${top + 4} q${round(w * 0.2)} -16 ${round(w * 0.2)} -4 q0 -14 ${round(w * 0.2)} -6" stroke="#ffe8a3" stroke-width="2.4" fill="none"/><path d="M${round(w * 0.2)} ${round(top - 14)} l2 4 l4 0 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 0z" fill="#fff"/>`;
      case 'bubbles': return `<circle cx="${round(-w * 0.26)}" cy="${round(top - 6)}" r="5" fill="#fff" opacity=".55"/><circle cx="${round(w * 0.2)}" cy="${round(top - 12)}" r="4" fill="#fff" opacity=".45"/><circle cx="0" cy="${round(top - 18)}" r="3" fill="#fff" opacity=".5"/>`;
      case 'spikes': return `${[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => `<path d="M${round(w * x)} ${top + 8} l4 -${12 + (i % 2) * 6} l4 0 l0 ${12 + (i % 2) * 6}z" fill="${light}" stroke="${dark}" stroke-width="1"/>`).join('')}`;
      case 'horns': return `<path d="M${round(-w * 0.3)} ${top + 8} q-10 -10 -6 -22 q10 4 12 18z" fill="${light}" stroke="${dark}" stroke-width="1.4"/><path d="M${round(w * 0.3)} ${top + 8} q10 -10 6 -22 q-10 4 -12 18z" fill="${light}" stroke="${dark}" stroke-width="1.4"/>`;
      case 'hammer': return `<path d="M${round(-w * 0.28)} ${top + 6} l-6 -16 l10 0 l4 14z" fill="#ffd166" stroke="${dark}" stroke-width="1.4"/><path d="M${round(w * 0.28)} ${top + 6} l6 -16 l-10 0 l-4 14z" fill="#ffd166" stroke="${dark}" stroke-width="1.4"/>`;
      case 'fin': return `<path d="M0 ${top + 2} q-14 -26 0 -22 q14 -4 0 22z" fill="${light}" opacity=".9"/>`;
      case 'flame': return `<path d="M0 ${top + 4} q-12 -10 -4 -22 q2 8 6 4 q-2 -12 8 -18 q0 14 6 20 q6 8 -4 16z" fill="#ffb347" opacity=".95"/><path d="M2 ${top + 2} q-6 -8 0 -14 q2 6 6 2 q0 10 -6 12z" fill="#ffe8a3"/>`;
      case 'plume': return `<path d="M0 ${top + 2} q-10 -14 -2 -26 q3 8 6 2 q1 -12 8 -14 q-1 14 6 22 q5 8 -6 16z" fill="${light}" opacity=".9"/><path d="M2 ${top} q-5 -10 0 -16 q3 8 6 0 q1 10 -6 16z" fill="${dark}" opacity=".6"/>`;
      case 'bow': return `<path d="M0 ${top + 6} l-14 -8 l0 16z" fill="#ff9ecf"/><path d="M0 ${top + 6} l14 -8 l0 16z" fill="#ff9ecf"/><circle cx="0" cy="${top + 6}" r="4" fill="#ffd1e6"/>`;
      case 'moon': return `<path d="M${round(-w * 0.22)} ${top + 4} a8 8 0 1 0 8 10 a10 10 0 1 1 -8 -10z" fill="#ffe8a3"/>`;
      default: return '';
    }
  }

  function tailSVG(f, w, h, top, bot, colors) {
    const { body, light, dark } = colors;
    const y = (top - h * 0.45) + (h - top - bot) * 0.55;
    switch (f.tail) {
      case 'leaf': return `<path d="M${round(w * 0.36)} ${round(y)} q22 -6 26 -20 q-18 4 -26 20z" fill="#6fd58a"/>`;
      case 'fluff': return `<circle cx="${round(w * 0.46)}" cy="${round(y)}" r="${round(w * 0.14)}" fill="${light}"/><circle cx="${round(w * 0.52)}" cy="${round(y - 8)}" r="${round(w * 0.1)}" fill="${light}" opacity=".8"/>`;
      case 'curl': return `<path d="M${round(w * 0.36)} ${round(y)} q16 4 18 -8 q2 -10 -8 -8 q-6 2 -2 8" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      case 'fin': return `<path d="M${round(w * 0.36)} ${round(y)} l20 -14 l-4 14 l12 10 l-26 -2z" fill="${light}" opacity=".9"/>`;
      case 'flame': return `<path d="M${round(w * 0.36)} ${round(y)} q18 -2 22 -16 q-4 10 4 12 q-8 8 -26 6z" fill="#ffb347" opacity=".9"/>`;
      case 'ice': return `<path d="M${round(w * 0.36)} ${round(y)} l16 -10 l-2 8 l10 6 l-14 0z" fill="#cdeeff" opacity=".9"/>`;
      case 'bolt': return `<path d="M${round(w * 0.36)} ${round(y)} l10 -12 l2 8 l8 -4 l-12 14z" fill="#ffd166"/>`;
      case 'wisp': return `<path d="M${round(w * 0.36)} ${round(y)} q20 0 24 -10 q-2 8 4 10 q-10 8 -28 4z" fill="${light}" opacity=".55"/>`;
      case 'bubble': return `<circle cx="${round(w * 0.5)}" cy="${round(y)}" r="7" fill="#fff" opacity=".4"/><circle cx="${round(w * 0.6)}" cy="${round(y - 6)}" r="4" fill="#fff" opacity=".3"/>`;
      case 'spike': return `<path d="M${round(w * 0.36)} ${round(y)} l16 -6 l-4 8 l14 2 l-12 8 l4 8 l-16 -6z" fill="${dark}" opacity=".8"/>`;
      case 'bow': return `<path d="M${round(w * 0.4)} ${round(y)} l-8 -8 l0 14z" fill="#ff9ecf"/><path d="M${round(w * 0.4)} ${round(y)} l8 -8 l0 14z" fill="#ff9ecf"/>`;
      case 'spring': return `<path d="M${round(w * 0.36)} ${round(y)} q10 -6 14 2 q4 8 -6 8" stroke="#c9c0d6" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'comet': return `<path d="M${round(w * 0.36)} ${round(y)} q22 0 30 -8 q-6 10 -4 14 q-16 4 -26 -6z" fill="${light}" opacity=".7"/>`;
      default: return '';
    }
  }

  function eyesSVG(f, w, mode, blink) {
    const ex = f.eyeGap;
    const ey = f._eyeY != null ? f._eyeY : f.eyeY;
    const r = f.eye;
    const eyes = [-1, 1].map(s => {
      const cx = s * ex;
      if (mode === 'happy' || mode === 'excited') {
        return `<path d="M${round(cx - r)} ${round(ey + 2)} q${r} ${round(-r * 1.1)} ${round(r * 2)} 0" stroke="#241a3d" stroke-width="${Math.max(2.4, r * 0.28)}" fill="none" stroke-linecap="round"/>`;
      }
      if (mode === 'sleep') {
        return `<path d="M${round(cx - r)} ${round(ey)} q${r} ${round(r * 0.75)} ${round(r * 2)} 0" stroke="#241a3d" stroke-width="${Math.max(2.4, r * 0.28)}" fill="none" stroke-linecap="round"/>`;
      }
      if (mode === 'sad') {
        return `<ellipse cx="${round(cx)}" cy="${round(ey + 1)}" rx="${round(r * 0.85)}" ry="${round(r * 0.75)}" fill="${'#2b2145'}"/><circle cx="${round(cx - r * 0.35)}" cy="${round(ey - r * 0.2)}" r="${round(r * 0.34)}" fill="#fff" opacity=".95"/>`;
      }
      if (blink) {
        return `<path d="M${round(cx - r)} ${round(ey)} q${r} ${round(r * 0.5)} ${round(r * 2)} 0" stroke="#241a3d" stroke-width="${Math.max(2.4, r * 0.28)}" fill="none" stroke-linecap="round"/>`;
      }
      const ry = mode === 'excited' ? r * 1.12 : r;
      return `<ellipse cx="${round(cx)}" cy="${round(ey)}" rx="${round(r)}" ry="${round(ry)}" fill="#2b2145"/><ellipse cx="${round(cx)}" cy="${round(ey + r * 0.55)}" rx="${round(r * 0.8)}" ry="${round(r * 0.4)}" fill="${'#5c4a8e'}" opacity=".55"/><circle cx="${round(cx - r * 0.36)}" cy="${round(ey - r * 0.36)}" r="${round(r * 0.36)}" fill="#fff"/><circle cx="${round(cx + r * 0.3)}" cy="${round(ey + r * 0.34)}" r="${round(r * 0.16)}" fill="#fff" opacity=".85"/>`;
    }).join('');
    return eyes + (f.nose ? `<path d="M-2.4 ${round(ey + (mode === 'sleep' ? 10 : 10))} q2.4 2.4 4.8 0" stroke="#5b3f63" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".75"/>` : '');
  }

  function faceCommon(f, mode, w) {
    const my = (f._eyeY != null ? f._eyeY : f.eyeY) + f.eye * 1.75;
    switch (mode) {
      case 'happy': return `<path d="M${round(-f.eyeGap * 0.5)} ${round(my)} q${round(f.eyeGap * 0.5)} ${round(f.eye * 0.62)} ${round(f.eyeGap)} 0" stroke="#5b3f63" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      case 'excited': return `<path d="M${round(-f.eyeGap * 0.6)} ${round(my - 1)} q${round(f.eyeGap * 0.6)} ${round(f.eye * 0.8)} ${round(f.eyeGap * 1.2)} 0 q-${round(f.eyeGap * 0.6)} ${round(f.eye * 0.35)} -${round(f.eyeGap * 1.2)} 0z" fill="#5b3f63" opacity=".85"/>`;
      case 'sad': return `<path d="M${round(-f.eyeGap * 0.45)} ${round(my + 3)} q${round(f.eyeGap * 0.45)} -${round(f.eye * 0.5)} ${round(f.eyeGap * 0.9)} 0" stroke="#5b3f63" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      case 'sleep': return `<path d="M${round(-f.eyeGap * 0.3)} ${round(my)} q${round(f.eyeGap * 0.3)} ${round(f.eye * 0.4)} ${round(f.eyeGap * 0.6)} 0" stroke="#5b3f63" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      default: return `<path d="M${round(-f.eyeGap * 0.28)} ${round(my)} q${round(f.eyeGap * 0.28)} ${round(f.eye * 0.4)} ${round(f.eyeGap * 0.56)} 0" stroke="#5b3f63" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    }
  }

  function cheeks(f, colors) {
    const cy = (f._eyeY != null ? f._eyeY : f.eyeY) + f.eye * 1.15;
    return `<ellipse cx="${round(-f.eyeGap - 8)}" cy="${round(cy)}" rx="6" ry="3.6" fill="#ff9ecf" opacity=".55"/><ellipse cx="${round(f.eyeGap + 8)}" cy="${round(cy)}" rx="6" ry="3.6" fill="#ff9ecf" opacity=".55"/>`;
  }

  /**
   * render({form, colors:{body,accent,eye}, pattern, limit, expression, blink, id})
   */
  function render(o) {
    const f = Object.assign({}, FORM[o.form] || FORM.blob, { limit: o.limit || (FORM[o.form] || FORM.blob).limit });
    const w = f.w, h = f.h;
    const top = f.top, bot = f.bot;
    const colors = {
      body: o.colors.body,
      light: o.colors.accent || shade(o.colors.body, 40),
      dark: shade(o.colors.body, -40)
    };
    const id = o.id || uniqueId('cr');
    const mode = o.expression || 'idle';
    const exprMap = { happy: 'happy', excited: 'excited', sad: 'sad', sleep: 'sleep', curious: 'idle', bored: 'idle', nervous: 'idle', content: 'idle', idle: 'idle', sick: 'sad' };
    const eyeMode = exprMap[mode] || 'idle';
    const blink = !!o.blink && eyeMode === 'idle';
    let s = '';

    // Local coordinates. f.top = head segment radius vertically, f.bot = body segment radius.
    const headR = Math.max(16, Math.min(top, w * 0.5));
    const headCy = -h * 0.5 + headR;
    const bodyH = Math.max(20, h - top - bot);
    const bodyCy = headCy + headR + bodyH * 0.5 - headR * 0.2;
    const bodyRx = w * 0.5;
    const bodyRy = Math.max(14, (h - top - bot) * 0.5 + headR * 0.15);
    let d;
    if (f.pattern === 'egg') {
      d = `M0 ${round(-h * 0.5)} C${round(-w * 0.56)} ${round(-h * 0.5)} ${round(-w * 0.56)} ${round(h * 0.5)} 0 ${round(h * 0.5)} C${round(w * 0.56)} ${round(h * 0.5)} ${round(w * 0.56)} ${round(-h * 0.5)} 0 ${round(-h * 0.5)}Z`;
    } else {
      // one seamless bean: head circle blended into a wider, softer body ellipse
      const hk = 1.12;
      d = `M0 ${round(headCy - headR)}`;
      d += ` C${round(headR * 0.82)} ${round(headCy - headR)} ${round(headR * hk)} ${round(headCy - headR * 0.45)} ${round(headR * hk)} ${round(headCy + headR * 0.1)}`;
      d += ` C${round(headR * hk)} ${round(headCy + headR * 0.8)} ${round(bodyRx * 0.94)} ${round(bodyCy - bodyRy * 0.7)} ${round(bodyRx)} ${round(bodyCy)}`;
      d += ` C${round(bodyRx)} ${round(bodyCy + bodyRy * 0.62)} ${round(bodyRx * 0.58)} ${round(bodyCy + bodyRy)} 0 ${round(bodyCy + bodyRy)}`;
      d += ` C${round(-bodyRx * 0.58)} ${round(bodyCy + bodyRy)} ${round(-bodyRx)} ${round(bodyCy + bodyRy * 0.62)} ${round(-bodyRx)} ${round(bodyCy)}`;
      d += ` C${round(-bodyRx * 0.94)} ${round(bodyCy - bodyRy * 0.7)} ${round(-headR * hk)} ${round(headCy + headR * 0.8)} ${round(-headR * hk)} ${round(headCy + headR * 0.1)}`;
      d += ` C${round(-headR * hk)} ${round(headCy - headR * 0.45)} ${round(-headR * 0.82)} ${round(headCy - headR)} 0 ${round(headCy - headR)}Z`;
    }
    f._headCy = headCy;
    f._eyeY = f.pattern === 'egg' ? 0 : Math.round(headCy + headR * 0.18);
    f._footY = (headCy + headR + (f.pattern === 'egg' ? h * 0.5 : bodyCy + Math.max(14, (h - top - bot) * 0.5 + headR * 0.15))) / 2 + 2;
    f._bodyCy = (headCy + headR + (f.pattern === 'egg' ? 0 : bodyCy)) / 2;

    const glow = f.glow ? `<ellipse cx="0" cy="0" rx="${round(w * 0.62)}" ry="${round(h * 0.55)}" fill="${o.colors.body}" opacity=".22" filter="url(#${id}blur)"/>` : '';

    s += `<defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="${shade(o.colors.body, 30)}"/>
        <stop offset="0.55" stop-color="${o.colors.body}"/>
        <stop offset="1" stop-color="${shade(o.colors.body, -28)}"/>
      </linearGradient>
      <radialGradient id="${id}hi" cx="0.32" cy="0.22" r="0.62">
        <stop offset="0" stop-color="#fff" stop-opacity=".75"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity=".12"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <filter id="${id}blur"><feGaussianBlur stdDeviation="10"/></filter>
      <filter id="${id}soft"><feGaussianBlur stdDeviation="2.5"/></filter>
      <clipPath id="${id}clip"><path d="${d}"/></clipPath>
    </defs>`;

    s += `<g transform="translate(100 118)">`;
    s += glow;

    // feet
    if (f.feet && f.form !== 'egg') {
      const fy = round(f._bodyCy + Math.max(12, (h - top - bot) * 0.5 + 4));
      s += `<ellipse cx="${round(-w * 0.22)}" cy="${fy}" rx="${round(w * 0.13)}" ry="7" fill="${colors.dark}" opacity=".9"/><ellipse cx="${round(w * 0.22)}" cy="${fy}" rx="${round(w * 0.13)}" ry="7" fill="${colors.dark}" opacity=".9"/>`;
    }
    // tail
    s += tailSVG(f, w, h, top, bot, colors);
    // arms
    if (f.arms && f.form !== 'egg') {
      const ay = round(f._bodyCy - 2);
      s += `<ellipse cx="${round(-w * 0.49)}" cy="${ay}" rx="7" ry="10" transform="rotate(-18 ${round(-w * 0.49)} ${ay})" fill="${colors.body}"/><ellipse cx="${round(w * 0.49)}" cy="${ay}" rx="7" ry="10" transform="rotate(18 ${round(w * 0.49)} ${ay})" fill="${colors.body}"/>`;
    }
    // horns behind body
    if (f.horns) s += hornsSVG(f, w, round(f._headCy - Math.max(16, Math.min(top, w * 0.5))), colors, id);

    // body
    s += `<path d="${d}" fill="url(#${id}g)" stroke="${colors.dark}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<g clip-path="url(#${id}clip)">`;
    s += pattern(f.pattern, f, w, h, top, bot, colors);
    s += `</g>`;
    s += `<path d="${d}" fill="url(#${id}hi)" opacity="${f.metal ? .9 : .7}"/>`;

    if (f.pattern === 'egg') {
      // magical cracks + speckles
      s += `<path d="M-14 -12 l6 8 l-4 6 l8 8 M18 -22 l-6 10 l6 6" stroke="${colors.dark}" stroke-width="1.4" fill="none" opacity=".55"/>`;
      s += `<circle cx="-20" cy="-30" r="2.4" fill="${colors.light}" opacity=".8"/><circle cx="16" cy="-4" r="2" fill="${colors.light}" opacity=".8"/><circle cx="-8" cy="20" r="1.8" fill="${colors.light}" opacity=".8"/><circle cx="24" cy="16" r="2.6" fill="${colors.light}" opacity=".7"/>`;
      s += `<ellipse cx="0" cy="-30" rx="10" ry="5" fill="#fff" opacity=".28"/>`;
      return s + `</g>`;
    }

    s += eyesSVG(f, w, eyeMode, blink);
    s += faceCommon(f, eyeMode, w);
    s += cheeks(f, colors);
    s += `</g>`;
    return s;
  }

  function svg(o, cls) {
    const id = o.id || uniqueId('cr');
    return `<svg class="${cls || 'pet-svg'}" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${render(Object.assign({ id }, o))}</svg>`;
  }

  window.CreatureRender = { render, svg, shade, mix, FORM, uniqueId };
})();
