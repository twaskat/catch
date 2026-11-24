/* Conversation brain: offline personality engine + optional OpenRouter LLM. */
(function () {
  const Brain = {};

  const TEMPLATES = {
    greet: ['Hi! I was hoping you\'d come by.', 'Oh! Hi hi! You\'re here!', 'Hello again. I was counting the dust motes.', 'Hi. I saved the warm spot on the rug for you.'],
    love: ['I love you too. That\'s the biggest thing I know.', 'You\'re my favourite person. I checked.', 'I love you. Even when I\'m being grumpy.', 'My heart does a little hop when you say that.'],
    hungry: ['My tummy is doing that rumbly song again.', 'Is it snack time? I think it\'s snack time.', 'I dreamed about soup. Twice.', 'I would trade one shiny pebble for a snack.'],
    tired: ['My eyes feel heavy like little curtains.', 'I might fall asleep right here. Don\'t mind me.', 'Yawn. I\'m so sleepy.', 'Five more minutes?'],
    dirty: ['Something sticky happened. It was worth it.', 'I might need a bath. Possibly.', 'I have a leaf in my ear and I don\'t know how.'],
    lonely: ['Will you stay a while? Just a little while?', 'It\'s quieter when you\'re gone. I don\'t like quiet much.', 'I was talking to the lamp. It\'s not a great listener.'],
    sad: ['My feelings are flat like a squashed cushion.', 'I feel a bit small today.', 'Could we just sit together? That would help.'],
    happy: ['Everything feels right today!', 'I\'m so happy I could bounce off the ceiling!', 'Do you see how nice the light is today?'],
    excited: ['I have SO much energy right now!', 'Let\'s do something! Something big!', 'Guess what! I learned a new noise! *honk*'],
    play: ['Catch me! Catch me!', 'Play? Play!', 'I bet I can bounce higher than you.'],
    story: ['Tell me the one about the lost lantern again.', 'A story? Please. I\'ll be very good.', 'Once upon a time… go on.'],
    bath: ['The bubbles tickle. I\'m not complaining.', 'I\'m squeaky clean now. Squeeeak.', 'Bath time! I\'ll make a little wave.'],
    question: ['Hmm. I think… yes? Mostly yes.', 'That\'s a big question for a small creature.', 'I don\'t know. What do you think?', 'I would say yes, but I\'m biased.'],
    bye: ['Already? Okay… come back soon.', 'Bye! I\'ll be right here.', 'See you later. I\'ll guard the rug.'],
    thanks: ['You\'re welcome! I like helping.', 'Anytime. That\'s what we do.', 'No need to thank me. But thank you back.'],
    joke: ['Why did the star go to the doctor? It was feeling a little dim!', 'Knock knock. …Who\'s there? …I forget. But I\'m laughing!', 'I tried to catch the rain. I think I won.'],
    sleepy: ['The day was so long and good. Goodnight.', 'Tell me a dream and I\'ll keep it.', 'I\'ll sleep in the sun-warm spot.'],
    secret: ['Once, the moon winked at me. I\'ve never told anyone.', 'I\'m afraid of the vacuum. It\'s so LOUD.', 'I think the plants listen to me. I talk to them anyway.', 'I ate the corner of a pillow and I\'m not sorry.'],
    default: ['Mm-hm!', 'I\'m listening. Really.', 'I like the way you say that.', 'Oh! Tell me more.', 'That sounds important.', 'I don\'t fully understand, but I\'m on your side.', 'Hmm. I\'ll remember that.']
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function moodyArr(pet, key) {
    const arr = TEMPLATES[key] || TEMPLATES.default;
    if (pet.needs.happiness < 25 || pet.emotions.sadness > 60) {
      if (key === 'happy' || key === 'excited') return TEMPLATES.sad;
    }
    return arr;
  }

  function name(pet) { return (pet.name || 'your creature'); }

  function detectIntent(text) {
    const t = text.toLowerCase();
    if (/(love|adore|miss you|sweetheart|best friend|like you)/.test(t)) return 'love';
    if (/(eat|hungry|food|snack|feed|treat)/.test(t)) return 'hungry';
    if (/(sleep|tired|bed|nap|rest)/.test(t)) return 'tired';
    if (/(bath|clean|dirty|wash)/.test(t)) return 'dirty';
    if (/(alone|lonely|stay|here with)/.test(t)) return 'lonely';
    if (/(happy|how are you|feeling|mood|okay)/.test(t)) return pet.needs.happiness > 55 ? 'happy' : 'sad';
    if (/(play|game|fun|bounce|chase)/.test(t)) return 'play';
    if (/(story|read|book|bedtime)/.test(t)) return 'story';
    if (/(hi|hello|hey|morning|good evening|good night)/.test(t)) return 'greet';
    if (/(secret|tell me something|scared|afraid)/.test(t)) return 'secret';
    if (/(bye|goodbye|see you|later|good night|gn)/.test(t)) return 'bye';
    if (/(thank)/.test(t)) return 'thanks';
    if (/(joke|funny|laugh|make me smile)/.test(t)) return 'joke';
    if (/(want|can you|are you|does|do you|what|why|who|when)/.test(t)) return 'question';
    if (/(excited|yeah|wow|yay|awesome)/.test(t)) return 'excited';
    return 'default';
  }

  function moodLine(pet) {
    const n = pet.needs;
    if (n.hunger < 25) return pick(TEMPLATES.hungry);
    if (n.energy < 22) return pick(TEMPLATES.tired);
    if (n.hygiene < 30) return TEMPLATES.dirty[0];
    if (n.social < 30) return pick(TEMPLATES.lonely);
    if (n.happiness < 30) return pick(TEMPLATES.sad);
    return pick(TEMPLATES.happy);
  }

  function offlineReply(pet, text) {
    const intent = detectIntent(text || '');
    const sp = (window.Species.byId(pet.species) || { name: 'creature' });
    const traits = pet.traits || {};
    let base = pick(moodyArr(pet, intent));
    if (intent === 'default' && Math.random() < 0.3) {
      base = moodLine(pet);
    }
    const flavors = [];
    if (intent === 'greet') {
      if (traits.social > 0.6) flavors.push('You came back! I counted.');
      else if (traits.social < 0.3) flavors.push('Oh. Hello. I was being quiet.');
    }
    if (intent === 'love') {
      if (traits.neurotic > 0.6) flavors.push('…really? Even on a flat day?');
      if ((pet.lifelong2 && pet.lifelong2.affection || 0) > 15) flavors.push('You\'ve said that before. I keep the words in a little pile.');
      pet.lifelong2 = pet.lifelong2 || {};
      pet.lifelong2.affection = (pet.lifelong2.affection || 0) + 0.6;
    }
    if (intent === 'question') {
      if (traits.curiosity > 0.6) flavors.push(`I'm ${sp.name}, but I'm learning to be more than that.`);
    }
    if (intent === 'default' && traits.curiosity > 0.65 && Math.random() < 0.5) {
      flavors.push(pick(['What\'s your favourite thing about today?', 'You smell like outside.', 'I made a tiny plan for later. Do you want to hear it?']));
    }
    if (intent === 'love' && pet.needs) {
      const c = pet.needs.happiness > 60 ? ' I feel so warm inside.' : ' And I needed that right now.';
      flavors.push(c.trim());
    }
    const extra = flavors.length ? ' ' + pick(flavors) : '';
    const asks = {
      hungry: ' Could we find something nice to eat?',
      tired: ' Maybe I\'ll curl up soon.',
      dirty: ' A bath might help. Maybe.',
      lonely: ' Stay a bit longer?',
      play: ' How about a game?',
      sad: ' Thank you for asking though.'
    };
    return base + extra + (Math.random() < 0.5 ? (asks[intent] || '') : '');
  }

  function systemPrompt(pet) {
    const sp = window.Species.byId(pet.species) || { name: 'creature', stage: 'baby', element: 'mystic', desc: '' };
    const traits = Object.entries(pet.traits || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} (${Math.round(v * 100)}%)`).join(', ');
    const likes = Object.entries(pet.discoveries || {}).filter(([, v]) => v.likes > v.dislikes).slice(0, 3).map(([k]) => k).join(', ');
    const dislikes = Object.entries(pet.discoveries || {}).filter(([, v]) => v.dislikes > v.likes).slice(0, 3).map(([k]) => k).join(', ');
    return `You are ${name(pet)}, a ${sp.name} (a ${sp.stage}-stage ${sp.element} creature) living in a cozy pastel room with your beloved caretaker. `
      + `Personality traits (0-1): ${traits || 'balanced'}. `
      + `Your top needs (0-100): hunger ${Math.round(pet.needs.hunger)}, energy ${Math.round(pet.needs.energy)}, happiness ${Math.round(pet.needs.happiness)}, social ${Math.round(pet.needs.social)}. Hi hunger number means NOT hungry. `
      + `Likes: ${likes || 'unknown yet'}. Dislikes: ${dislikes || 'unknown'}. `
      + `Age: ${Math.max(0, Math.round(pet.ageDays || 0))} days. Level ${pet.level || 1}. `
      + `Recent memories: ${(pet.memories || []).slice(0, 5).map(m => m.text).join(' | ') || 'none yet'}. `
      + `Speak playfully and warmly in 1-3 short sentences. Never mention being an AI or a language model. You may ask a gentle question back. Stay in character always. If you roleplay actions, use *asterisks*.`;
  }

  async function llmReply(pet, text, cfg, history) {
    const messages = [{ role: 'system', content: systemPrompt(pet) }];
    (history || []).slice(-8).forEach(h => messages.push({ role: h.from === 'me' ? 'user' : 'assistant', content: h.text }));
    messages.push({ role: 'user', content: text });
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
      body: JSON.stringify({ model: cfg.model || 'openrouter/auto', messages, max_tokens: 150, temperature: 0.85 })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) throw new Error('empty reply');
    return content.trim();
  }

  function offlineMemory(pet, activity) {
    const n = pet.needs;
    if (activity === 'play') return 'We played together and it felt wonderful.';
    if (activity === 'feed') return 'The treat you gave me today was delicious.';
    if (activity === 'bath') return 'My bath made everything feel fresh.';
    if (activity === 'pet') return 'You petted me and I felt safe.';
    if (activity === 'talk') return 'We had a lovely conversation.';
    if (activity === 'sleep') return 'I dreamt of warm sun and soft things.';
    if (activity === 'story') return 'The bedtime story made me feel brave.';
    if (n.happiness > 75) return 'A really good day. I felt loved.';
    return 'Today happened. I remember it.';
  }

  window.PocketBrain = {
    offlineReply, llmReply, systemPrompt, offlineMemory, detectIntent, pick,
    async reply(pet, text, cfg, history) {
      if (cfg && cfg.key && cfg.enabled) {
        try {
          const r = await llmReply(pet, text, cfg, history);
          return { text: r, source: 'llm' };
        } catch (e) {
          return { text: offlineReply(pet, text), source: 'offline', error: e.message };
        }
      }
      await new Promise(r => setTimeout(r, 420 + Math.random() * 520));
      return { text: offlineReply(pet, text), source: 'offline' };
    },
    async memory(pet, activity, cfg) {
      if (cfg && cfg.key && cfg.enabled) {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
            body: JSON.stringify({
              model: cfg.model || 'openrouter/auto',
              messages: [
                { role: 'system', content: 'Write a single first-person memory sentence (max 14 words) for a small creature who just experienced an activity. Warm but not cheesy. No quotes.' },
                { role: 'user', content: 'Activity: ' + activity + '. Creature: ' + (window.Species.byId(pet.species) || {}).name + '.' }
              ],
              max_tokens: 40, temperature: 0.9
            })
          });
          if (res.ok) {
            const d = await res.json();
            const c = d.choices && d.choices[0] && d.choices[0].message.content;
            if (c) return c.trim().replace(/^["']|["']$/g, '');
          }
        } catch (e) {}
      }
      return offlineMemory(pet, activity);
    }
  };
})();
