import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LAYER, useInputLayer } from './engine/input';
import { makeCanvas, painter, rng } from './engine/pixel';
import { enemySprite } from './engine/battleSprites';
import { MINIGAME_INFO } from './engine/minigames';
import { GROUPS, formatKg, levelForXp, xpForLevel } from './gameData';
import Menu from './ui/Menu';
import MinigamePanel from './ui/MinigamePanel';
import TouchControls from './ui/TouchControls';

const STAGE_W = 240;
const STAGE_H = 112;
const MAX_STAMINA = 100;
const BASE_DIFFICULTY = [0, 0.14, 0.36, 0.6];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const easeOut = (t) => 1 - (1 - t) ** 3;

function computeLayout() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const portrait = H > W * 1.1;
  if (portrait) return { portrait, px: Math.min(W / STAGE_W, 3.2) };
  return { portrait, px: Math.max(1.4, Math.min(W / STAGE_W, H / 160, 4.5)) };
}

/** The battle backdrop, tinted by the muscle group being trained. */
function paintBackdrop(accent) {
  const [canvas, ctx] = makeCanvas(STAGE_W, STAGE_H);
  const p = painter(ctx);
  const rand = rng(99);
  for (let y = 0; y < 58; y++) {
    const t = y / 58;
    const c = Math.round(14 + t * 10);
    p.h(0, y, STAGE_W, `rgb(${c},${c + 2},${c + 9})`);
  }
  // back wall: mirror panels and a strip of the accent colour
  for (let x = 6; x < STAGE_W; x += 58) {
    p.r(x, 8, 50, 30, '#1f2533');
    p.r(x + 1, 9, 48, 28, '#263049');
    p.line(x + 8, 34, x + 20, 10, '#34405c');
    p.line(x + 12, 34, x + 24, 10, '#2d3852');
  }
  p.r(0, 44, STAGE_W, 2, accent);
  ctx.globalAlpha = 0.35;
  p.r(0, 46, STAGE_W, 3, accent);
  ctx.globalAlpha = 1;
  p.r(0, 49, STAGE_W, 9, '#101218');
  // floor with perspective seams
  for (let y = 58; y < STAGE_H; y++) {
    const t = (y - 58) / (STAGE_H - 58);
    const c = Math.round(22 + t * 10);
    p.h(0, y, STAGE_W, `rgb(${c},${c + 2},${c + 8})`);
  }
  for (let i = -6; i <= 6; i++) p.line(120 + i * 12, 58, 120 + i * 60, STAGE_H, 'rgba(0,0,0,0.25)');
  for (let i = 0; i < 260; i++) {
    p.p(Math.floor(rand() * STAGE_W), 58 + Math.floor(rand() * 54), rand() > 0.5 ? '#2b2f3a' : '#15171d');
  }
  // light cone
  const g = ctx.createLinearGradient(0, 0, 0, STAGE_H);
  g.addColorStop(0, 'rgba(255,240,210,0.16)');
  g.addColorStop(1, 'rgba(255,240,210,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(202, 0);
  ctx.lineTo(236, 74);
  ctx.lineTo(116, 74);
  ctx.fill();
  // platforms
  const platform = (cx, cy, rx, ry) => {
    p.ellipse(cx, cy + 2, rx, ry, 'rgba(0,0,0,0.45)');
    p.ellipse(cx, cy, rx, ry, '#2b303c');
    p.ellipse(cx, cy - 1, rx - 3, ry - 2, '#353b49');
    p.ellipse(cx, cy - 1, rx - 10, ry - 4, '#3d4453');
  };
  platform(176, 66, 50, 9);
  platform(62, 108, 58, 11);
  return canvas;
}

export default function Battle({ config, assets, input, audio, touch, onFinish }) {
  const { team, boss } = config;
  const [layout, setLayout] = useState(computeLayout);
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [repsLeft, setRepsLeft] = useState(team[0].challenge.reps);
  const [stamina, setStamina] = useState(MAX_STAMINA);
  const [xpShown, setXpShown] = useState(config.xpBefore);
  const [mode, setMode] = useState('intro');
  const [text, setText] = useState({ value: '', wait: false, id: 0 });
  const [typed, setTyped] = useState(0);
  const [lift, setLift] = useState(null);
  const [items, setItems] = useState({
    chalk: 2 + (config.chalkBonus || 0),
    pre: 1,
    salts: 1,
  });
  const [buffs, setBuffs] = useState({
    chalkRounds: 0,
    pre: false,
    focus: false,
  });
  const [popups, setPopups] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const [showEnemyCard, setShowEnemyCard] = useState(!boss);
  const [encounter, setEncounter] = useState(true);

  const alive = useRef(true);
  const waiters = useRef({});
  const live = useRef({
    stamina: MAX_STAMINA,
    items,
    buffs,
    hyped: false,
    missed: false,
    perfects: 0,
  });
  const anim = useRef({
    tweens: {},
    values: {
      enemyX: 150,
      enemyY: 0,
      enemyA: 1,
      playerX: -110,
      playerY: 0,
      playerA: 1,
      coachX: 150,
      coachA: 0,
      shake: 0,
      flash: 0,
      flashColor: '#fff',
    },
  });
  const stageRef = useRef(null);
  const sprites = useRef({});
  const idRef = useRef(0);

  const current = team[Math.min(enemyIndex, team.length - 1)];
  const { exercise, challenge } = current;
  const accent = GROUPS[exercise.group].color;

  useEffect(() => {
    const onResize = () => setLayout(computeLayout());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ---------------------------------------------------------- stage */

  useEffect(() => {
    sprites.current.backdrop = paintBackdrop(accent);
    sprites.current.enemy = enemySprite(exercise, challenge.weight || 0);
  }, [exercise, challenge, accent]);

  const animate = useCallback((key, to, ms = 300) => {
    const a = anim.current;
    a.tweens[key] = { from: a.values[key], to, start: performance.now(), ms };
    return sleep(ms);
  }, []);

  useEffect(() => {
    const canvas = stageRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const draw = (now) => {
      const a = anim.current;
      for (const [key, tw] of Object.entries(a.tweens)) {
        const t = Math.min(1, (now - tw.start) / tw.ms);
        a.values[key] = tw.from + (tw.to - tw.from) * easeOut(t);
        if (t >= 1) delete a.tweens[key];
      }
      const v = a.values;
      const shake = reduced ? 0 : v.shake;
      const sx = shake ? Math.round((Math.random() - 0.5) * shake * 2) : 0;
      const sy = shake ? Math.round((Math.random() - 0.5) * shake) : 0;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, STAGE_W, STAGE_H);
      if (sprites.current.backdrop) ctx.drawImage(sprites.current.backdrop, sx, sy);
      const bob = reduced ? 0 : Math.round(Math.sin(now / 420) * 1);

      // enemy (or the coach, before the first lift of a boss fight)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, STAGE_W, 68);
      ctx.clip();
      if (v.coachA > 0) {
        const coach = assets.chars.coach.down[0];
        ctx.globalAlpha = v.coachA;
        ctx.drawImage(coach, Math.round(176 - 24 + v.coachX) + sx, 66 - 60 + sy + bob, 48, 60);
      }
      const enemy = sprites.current.enemy;
      if (enemy && v.enemyA > 0) {
        const scale = enemy.width * 2 <= 128 && enemy.height * 2 <= 66 ? 2 : 1;
        const w = enemy.width * scale;
        const h = enemy.height * scale;
        ctx.globalAlpha = v.enemyA;
        ctx.drawImage(
          enemy,
          Math.round(178 - w / 2 + v.enemyX) + sx,
          Math.round(64 - h + v.enemyY + bob) + sy,
          w,
          h
        );
      }
      ctx.restore();

      // player, from behind
      const back = assets.chars.sreeBack;
      ctx.globalAlpha = v.playerA;
      ctx.drawImage(
        back,
        Math.round(62 - back.width + v.playerX) + sx,
        Math.round(STAGE_H - 58 + v.playerY) + sy,
        back.width * 2,
        back.height * 2
      );
      ctx.globalAlpha = 1;

      if (v.flash > 0.01) {
        ctx.globalAlpha = v.flash;
        ctx.fillStyle = v.flashColor;
        ctx.fillRect(0, 0, STAGE_W, STAGE_H);
        ctx.globalAlpha = 1;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [assets]);

  const flash = (color, strength = 0.6, ms = 260) => {
    anim.current.values.flashColor = color;
    anim.current.values.flash = strength;
    animate('flash', 0, ms);
  };

  const shake = (strength = 3, ms = 320) => {
    anim.current.values.shake = strength;
    animate('shake', 0, ms);
  };

  const popup = (value, color) => {
    const id = ++idRef.current;
    setPopups((list) => [...list, { id, value, color }]);
    setTimeout(() => alive.current && setPopups((list) => list.filter((p) => p.id !== id)), 1000);
  };

  /* ------------------------------------------------------- narration */

  useEffect(() => {
    if (!text.value) return undefined;
    let n = 0;
    const timer = setInterval(() => {
      n = Math.min(text.value.length, n + 2);
      // Functional update so a skip (typed = full length) isn't undone.
      setTyped((t) => Math.max(t, n));
      if (n % 6 < 2) audio?.play('blip');
      if (n >= text.value.length) clearInterval(timer);
    }, 22);
    return () => clearInterval(timer);
  }, [text, audio]);

  useEffect(() => {
    if (mode !== 'text' || text.wait || typed < text.value.length || !text.value) return undefined;
    const t = setTimeout(() => waiters.current.text?.(), 650);
    return () => clearTimeout(t);
  }, [mode, text, typed]);

  const narrate = useCallback(
    (value, { wait = true } = {}) =>
      new Promise((resolve) => {
        waiters.current.text = () => {
          waiters.current.text = null;
          resolve();
        };
        setMode('text');
        setTyped(0);
        setText({ value, wait, id: ++idRef.current });
      }),
    []
  );

  useInputLayer(
    input,
    {
      onPress(button) {
        if (mode !== 'text') return;
        if (button !== 'a' && button !== 'b') return;
        if (typed < text.value.length) setTyped(text.value.length);
        else if (text.wait) {
          audio?.play('blip');
          waiters.current.text?.();
        }
      },
    },
    LAYER.battle
  );

  const chooseCommand = () =>
    new Promise((resolve) => {
      waiters.current.command = resolve;
      setMode('command');
    });

  const chooseItem = () =>
    new Promise((resolve) => {
      waiters.current.item = resolve;
      setMode('bag');
    });

  const runRep = (params) =>
    new Promise((resolve) => {
      waiters.current.rep = resolve;
      setLift({ ...params, key: ++idRef.current });
      setMode('lift');
    });

  /* ---------------------------------------------------------- script */

  const setLiveStamina = (value) => {
    live.current.stamina = Math.max(0, Math.min(MAX_STAMINA, value));
    setStamina(live.current.stamina);
  };

  const describeLoad = (e, c) =>
    e.weighted
      ? `Loaded to ${formatKg(c.weight)} KG. ${c.reps} rep${c.reps === 1 ? '' : 's'} for the PR.`
      : `${c.reps} reps for the PR.`;

  async function fight(index) {
    const { exercise: e, challenge: c } = team[index];
    const total = c.reps;
    const chunk = Math.max(1, Math.ceil(total / 10));
    const rounds = Math.ceil(total / chunk);
    let left = total;
    let round = 0;
    setRepsLeft(left);

    for (;;) {
      const command = await chooseCommand();
      if (!alive.current) return 'abort';

      if (command === 'bail') {
        await narrate('SREE re-racked the bar.');
        await narrate('No shame in it. Live to lift another day.');
        return 'bail';
      }

      if (command === 'hype') {
        live.current.hyped = true;
        live.current.buffs = { ...live.current.buffs, focus: true };
        setBuffs(live.current.buffs);
        audio?.play('buff');
        flash('#ffcc3d', 0.25);
        await narrate('SREE queued up the playlist. FOCUS rose!');
        continue;
      }

      if (command === 'bag') {
        const item = await chooseItem();
        if (!alive.current) return 'abort';
        if (!item) continue;
        const nextItems = {
          ...live.current.items,
          [item]: live.current.items[item] - 1,
        };
        live.current.items = nextItems;
        setItems(nextItems);
        if (item === 'chalk') {
          live.current.buffs = { ...live.current.buffs, chalkRounds: 3 };
          setBuffs(live.current.buffs);
          audio?.play('buff');
          flash('#ffffff', 0.35);
          await narrate('SREE chalked up. Bigger targets for the next 3 reps!');
        } else if (item === 'pre') {
          live.current.buffs = { ...live.current.buffs, pre: true };
          setBuffs(live.current.buffs);
          audio?.play('buff');
          await narrate('SREE downed a PRE-WORKOUT. Everything slows down…');
        } else if (item === 'salts') {
          setLiveStamina(live.current.stamina + 35);
          audio?.play('heal');
          flash('#3ee08f', 0.3);
          await narrate('SREE cracked the SMELLING SALTS. Stamina +35!');
        }
        continue;
      }

      // LIFT: keep going until the set is done or a rep is missed.
      while (left > 0) {
        // Difficulty climbs with reps completed, not attempts, so a miss
        // doesn't make the retry harder.
        const done = Math.round((total - left) / chunk);
        const progress = rounds > 1 ? Math.min(1, done / (rounds - 1)) : 0.4;
        const difficulty = BASE_DIFFICULTY[c.stars] + progress * 0.26;
        const b = live.current.buffs;
        const mods = {
          zone: (b.chalkRounds > 0 ? 1.3 : 1) * (b.focus ? 1.15 : 1),
          speed: b.pre ? 0.82 : 1,
        };
        const result = await runRep({
          kind: e.minigame,
          difficulty,
          mods,
          round,
          rounds,
          label: left - chunk <= 0 ? 'LAST REP' : `REP ${Math.min(total, total - left + chunk)}/${total}`,
        });
        if (!alive.current) return 'abort';
        if (b.chalkRounds > 0) {
          live.current.buffs = {
            ...live.current.buffs,
            chalkRounds: b.chalkRounds - 1,
          };
          setBuffs(live.current.buffs);
        }
        round += 1;

        if (result.grade === 'miss') {
          const cost = Math.round(22 + 14 * Math.min(1, difficulty));
          setLiveStamina(live.current.stamina - cost);
          shake(4);
          flash('#ff3b4c', 0.35);
          popup('MISS', '#ff3b4c');
          await animate('playerY', 6, 120);
          animate('playerY', 0, 260);
          if (!live.current.missed) {
            live.current.missed = true;
            await narrate(`LACTIC ACID used BURN! It's super effective!`);
          } else {
            await narrate(result.note ? `${result.note}! The rep stalled.` : 'The rep stalled!');
          }
          if (live.current.stamina <= 0) return 'lose';
          await narrate(`SREE lost ${cost} stamina.`, { wait: false });
          break;
        }

        const perfect = result.grade === 'perfect';
        if (perfect) live.current.perfects += 1;
        left = Math.max(0, left - chunk);
        setRepsLeft(left);
        setLiveStamina(
          live.current.stamina - Math.max(perfect ? 2 : 3, Math.round((perfect ? 40 : 64) / rounds))
        );
        audio?.play('rep');
        popup(perfect ? 'PERFECT' : 'GOOD', perfect ? '#ffcc3d' : '#3ee08f');
        if (perfect) flash('#ffffff', 0.22, 180);
        animate('playerY', 4, 90).then(() => animate('playerY', 0, 180));
        await animate('enemyY', -9, 140);
        await animate('enemyY', 0, 200);
        if (left <= 0) return 'win';
        await sleep(160);
      }
    }
  }

  async function run() {
    await sleep(matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 900);
    if (!alive.current) return;
    setEncounter(false);
    audio?.music('battle');

    if (boss) {
      anim.current.values.coachX = 150;
      anim.current.values.coachA = 1;
      anim.current.values.enemyA = 0;
      animate('coachX', 0, 520);
    } else animate('enemyX', 0, 520);
    await animate('playerX', 0, 520);
    setShowCards(true);

    if (boss) {
      await narrate('COACH wants to battle!');
      await narrate('COACH: The Big Three. One stamina bar. Show me.');
      animate('coachX', 150, 420);
      await animate('coachA', 0, 420);
      setShowEnemyCard(true);
    }

    for (let i = 0; i < team.length; i++) {
      const { exercise: e, challenge: c } = team[i];
      if (i > 0) {
        setEnemyIndex(i);
        setRepsLeft(c.reps);
        anim.current.values.enemyY = 0;
        anim.current.values.enemyX = 150;
        anim.current.values.enemyA = 1;
      }
      if (boss) {
        anim.current.values.enemyA = 1;
        anim.current.values.enemyX = 150;
        animate('enemyX', 0, 420);
        await narrate(`COACH sent out ${e.short}!`);
      } else {
        await narrate(`A wild ${e.short} appeared!`);
      }
      await narrate(describeLoad(e, c));
      if (i === 0) await narrate('Go, SREE!', { wait: false });

      const outcome = await fight(i);
      if (!alive.current || outcome === 'abort') return;
      if (outcome === 'bail') return finish('bail');
      if (outcome === 'lose') {
        audio?.music(null);
        audio?.play('faint');
        animate('playerA', 0, 700);
        await animate('playerY', 50, 700);
        await narrate('SREE ran out of gas!');
        await narrate('The bar wins this one. Eat, sleep, come back.');
        return finish('lose');
      }
      // Won this lift.
      audio?.play('rep');
      animate('enemyA', 0, 520);
      await animate('enemyY', 40, 520);
      if (i < team.length - 1) {
        await narrate(`${e.short} is down!`);
        setLiveStamina(live.current.stamina + 40);
        audio?.play('heal');
        await narrate('SREE rests three minutes. Stamina +40.');
      }
    }

    audio?.music(null);
    audio?.play('pr');
    flash('#ffcc3d', 0.4, 500);
    const main = team[team.length - 1];
    if (boss) {
      await narrate('COACH: …Yeah. That is a real lifter.');
      await narrate('SREE beat COACH and the Big Three!');
    } else {
      const set = main.exercise.weighted
        ? `${formatKg(main.challenge.weight)} KG × ${main.challenge.reps}`
        : `${main.challenge.reps} REPS`;
      await narrate(
        config.repeat
          ? `PR matched again: ${main.exercise.short}, ${set}.`
          : `NEW PR! ${main.exercise.short}: ${set}!`
      );
    }
    audio?.play('victory');
    await narrate(`SREE gained ${config.xpGain.toLocaleString('en-US')} XP!`, {
      wait: false,
    });
    // count the XP bar up, one level at a time
    const from = config.xpBefore;
    const to = config.xpBefore + config.xpGain;
    const start = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1300);
        setXpShown(Math.round(from + (to - from) * easeOut(t)));
        if (t < 1 && alive.current) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const before = levelForXp(from);
    const after = levelForXp(to);
    if (after > before) {
      audio?.play('levelUp');
      flash('#35c2ff', 0.3, 400);
      await narrate(`SREE grew to Lv${after}!`);
    } else {
      await sleep(500);
    }
    return finish('win');
  }

  const finish = (outcome) => {
    if (!alive.current) return;
    setMode('done');
    onFinish({ outcome, perfects: live.current.perfects });
  };

  useEffect(() => {
    // Deferred a tick so StrictMode's mount-unmount-mount in development
    // cancels the first run instead of starting two scripts.
    alive.current = true;
    const start = setTimeout(run, 0);
    return () => {
      clearTimeout(start);
      alive.current = false;
    };
    // The script runs once per battle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------- render */

  const { px, portrait } = layout;
  const level = levelForXp(xpShown);
  const into = xpShown - xpForLevel(level);
  const span = xpForLevel(level + 1) - xpForLevel(level);
  const staminaPct = (stamina / MAX_STAMINA) * 100;
  const repsPct = (repsLeft / challenge.reps) * 100;
  const staminaTone = staminaPct > 50 ? 'is-high' : staminaPct > 20 ? 'is-mid' : 'is-low';
  const info = MINIGAME_INFO[exercise.minigame];

  const commandItems = [
    { label: 'LIFT', key: 'lift' },
    { label: 'BAG', key: 'bag' },
    { label: 'HYPE', key: 'hype', disabled: live.current.hyped },
    { label: 'BAIL', key: 'bail' },
  ];
  const bagItems = [
    {
      label: 'CHALK',
      key: 'chalk',
      detail: `×${items.chalk}`,
      disabled: items.chalk <= 0,
    },
    {
      label: 'PRE-WORKOUT',
      key: 'pre',
      detail: `×${items.pre}`,
      disabled: items.pre <= 0 || buffs.pre,
    },
    {
      label: 'SALTS',
      key: 'salts',
      detail: `×${items.salts}`,
      disabled: items.salts <= 0 || stamina >= MAX_STAMINA,
    },
    { label: 'BACK', key: 'back' },
  ];

  const buffTags = [
    buffs.chalkRounds > 0 && `CHALK ${buffs.chalkRounds}`,
    buffs.pre && 'PRE',
    buffs.focus && 'FOCUS',
  ].filter(Boolean);

  return (
    <div
      className={`gym-battle ${portrait ? 'is-portrait' : 'is-landscape'}`}
      style={{ '--px': `${px}px`, '--accent': accent }}
      role="region"
      aria-label={`PR attempt: ${exercise.name}`}
    >
      <div className="gym-battle-frame">
        <div className="gym-stage">
          <canvas
            ref={stageRef}
            width={STAGE_W}
            height={STAGE_H}
            className="gym-canvas gym-stage-canvas"
            aria-hidden="true"
          />
          {showCards && (
            <>
              {showEnemyCard && (
                <div className="gym-bcard is-enemy">
                  <div className="gym-bcard-row">
                    <span className="gym-bcard-name">{exercise.short}</span>
                    <span className="gym-bcard-lv">
                      {exercise.weighted ? `${formatKg(challenge.weight)}KG` : 'BW'}
                    </span>
                  </div>
                  <div className="gym-hp">
                    <span className="gym-hp-label">REPS</span>
                    <span className="gym-hp-track">
                      <span className="gym-hp-fill is-reps" style={{ width: `${repsPct}%` }} />
                    </span>
                  </div>
                  <div className="gym-bcard-foot">
                    <span>{'★'.repeat(challenge.stars)}</span>
                    <span>
                      {repsLeft} OF {challenge.reps} LEFT
                    </span>
                  </div>
                </div>
              )}
              <div className="gym-bcard is-player">
                <div className="gym-bcard-row">
                  <span className="gym-bcard-name">SREE</span>
                  <span className="gym-bcard-lv">Lv{level}</span>
                </div>
                <div className="gym-hp">
                  <span className="gym-hp-label">STA</span>
                  <span className="gym-hp-track">
                    <span className={`gym-hp-fill ${staminaTone}`} style={{ width: `${staminaPct}%` }} />
                  </span>
                </div>
                <div className="gym-bcard-foot">
                  <span className="gym-bcard-buffs">{buffTags.join(' · ')}</span>
                  <span>
                    {stamina}/{MAX_STAMINA}
                  </span>
                </div>
                <div className="gym-xp" aria-hidden="true">
                  <span
                    style={{
                      width: `${Math.max(0, Math.min(100, (into / span) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}
          {mode === 'lift' && lift && !portrait && (
            <div className="gym-rep-tag">
              <span className="px-font">{lift.label}</span>
              {/* The how-to line only on the first rep, so it stops covering the lifter. */}
              {lift.round === 0 && <span>{touch ? info.touch : info.hint}</span>}
            </div>
          )}
          <div className="gym-popups" aria-live="polite">
            {popups.map((p) => (
              <span key={p.id} className="gym-popup px-font" style={{ color: p.color }}>
                {p.value}
              </span>
            ))}
          </div>
        </div>

        <div className="gym-panel">
          {mode === 'lift' && lift ? (
            <div className="gym-panel-lift">
              {portrait && (
                <div className="gym-rep-inline">
                  <span className="px-font">{lift.label}</span>
                  <span>{touch ? info.touch : info.hint}</span>
                </div>
              )}
              <MinigamePanel
                key={lift.key}
                kind={lift.kind}
                difficulty={lift.difficulty}
                mods={lift.mods}
                audio={audio}
                input={input}
                width={portrait ? 200 : 240}
                onResult={(result) => waiters.current.rep?.(result)}
              />
            </div>
          ) : mode === 'command' || mode === 'bag' ? (
            <div className="gym-panel-split">
              <p className="gym-panel-text">
                {mode === 'bag'
                  ? 'CHALK widens targets for 3 reps. PRE slows the set. SALTS restore stamina.'
                  : `What will SREE do?`}
              </p>
              <div className="gym-panel-menu">
                {mode === 'command' ? (
                  <Menu
                    key="command"
                    items={commandItems}
                    columns={2}
                    input={input}
                    audio={audio}
                    priority={LAYER.battle + 1}
                    onSelect={(item) => waiters.current.command?.(item.key)}
                    label="Command"
                  />
                ) : (
                  <Menu
                    key="bag"
                    items={bagItems}
                    columns={2}
                    input={input}
                    audio={audio}
                    priority={LAYER.battle + 1}
                    onSelect={(item) => waiters.current.item?.(item.key === 'back' ? null : item.key)}
                    onCancel={() => waiters.current.item?.(null)}
                    label="Bag"
                  />
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="gym-panel-text is-narration"
              onClick={() => {
                if (typed < text.value.length) setTyped(text.value.length);
                else if (text.wait) waiters.current.text?.();
              }}
            >
              <span className="gym-narration">
                {text.value.slice(0, typed)}
                <span className="gym-ghost" aria-hidden="true">
                  {text.value.slice(typed)}
                </span>
              </span>
              {mode === 'text' && text.wait && typed >= text.value.length && (
                <span className="gym-dialog-next" aria-hidden="true">
                  ▼
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {encounter && <div className="gym-encounter" aria-hidden="true" />}
      {touch && <TouchControls input={input} compact={!portrait} />}
    </div>
  );
}
