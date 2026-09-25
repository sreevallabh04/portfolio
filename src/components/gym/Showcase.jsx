import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LAYER, useInputLayer } from './engine/input';
import { makeCanvas, painter, rng } from './engine/pixel';
import { enemySprite } from './engine/battleSprites';
import { C, PLATE_COLORS } from './engine/props';
import { GROUPS, STATIONS, formatDate, formatKg, formatVolume, platesPerSide } from './gameData';
import TouchControls from './ui/TouchControls';
import './gym-showcase.css';

/*
 * The lift showcase: what a machine opens. Nothing to win — it replays the
 * lift as it was logged. The bar is loaded with that session's real plates,
 * the reps of the top set play out, and the timeline steps through every
 * session so you can watch the weight climb.
 */

const STAGE_W = 240;
const STAGE_H = 112;
const RIG_X = 178;
const RIG_Y = 40;

// Plate size in the showcase rig, [thickness, height], in native pixels.
const RIG_PLATES = { 25: [3, 20], 20: [3, 20], 15: [3, 17], 10: [2, 14], 5: [2, 11], 2.5: [2, 9], 1.25: [1, 8] };
const BARBELL_KINDS = new Set(['barbell', 'smith', 'ezbar']);

const easeOut = (t) => 1 - (1 - t) ** 3;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Starts a tween on the animation ref; resolves when it ends. */
function tweenOn(animRef, key, to, ms) {
  const a = animRef.current;
  a.tweens[key] = { from: a[key], to, start: performance.now(), ms };
  return sleep(ms);
}

function computeLayout() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const portrait = H > W * 1.1;
  if (portrait) return { portrait, px: Math.min(W / STAGE_W, 3.2) };
  return { portrait, px: Math.max(1.4, Math.min(W / STAGE_W, H / 170, 4.5)) };
}

function paintBackdrop(accent) {
  const [canvas, ctx] = makeCanvas(STAGE_W, STAGE_H);
  const p = painter(ctx);
  const rand = rng(99);
  for (let y = 0; y < 58; y++) {
    const c = Math.round(14 + (y / 58) * 10);
    p.h(0, y, STAGE_W, `rgb(${c},${c + 2},${c + 9})`);
  }
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
  for (let y = 58; y < STAGE_H; y++) {
    const c = Math.round(22 + ((y - 58) / (STAGE_H - 58)) * 10);
    p.h(0, y, STAGE_W, `rgb(${c},${c + 2},${c + 8})`);
  }
  for (let i = -6; i <= 6; i++) p.line(120 + i * 12, 58, 120 + i * 60, STAGE_H, 'rgba(0,0,0,0.25)');
  for (let i = 0; i < 260; i++) {
    p.p(Math.floor(rand() * STAGE_W), 58 + Math.floor(rand() * 54), rand() > 0.5 ? '#2b2f3a' : '#15171d');
  }
  const g = ctx.createLinearGradient(0, 0, 0, STAGE_H);
  g.addColorStop(0, 'rgba(255,240,210,0.16)');
  g.addColorStop(1, 'rgba(255,240,210,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(150, 0);
  ctx.lineTo(206, 0);
  ctx.lineTo(238, 76);
  ctx.lineTo(118, 76);
  ctx.fill();
  // lifting platform under the rig, rubber mat under the lifter
  p.r(118, 60, 120, 8, '#15161b');
  p.r(120, 60, 116, 6, C.wood);
  p.h(120, 60, 116, C.woodHi);
  for (let x = 124; x < 234; x += 14) p.v(x, 60, 6, C.woodLo);
  p.ellipse(62, 108, 58, 11, 'rgba(0,0,0,0.45)');
  p.ellipse(62, 106, 56, 10, '#2b303c');
  p.ellipse(62, 105, 50, 8, '#353b49');
  return canvas;
}

/** Sets of one session, in the order they were done. */
const setsOf = (exercise, sessionId) =>
  exercise.sets.filter((s) => s.sessionId === sessionId && !s.outlier && s.type !== 'warmup');

/**
 * Session-by-session view of a lift, with the running record marked the way
 * a training app marks it: the first time, and every session that beat
 * everything before it.
 */
function buildTimeline(exercise) {
  let best = null;
  return exercise.history.map((h, index) => {
    const value = exercise.weighted ? [h.topWeight, h.topReps] : [h.topReps, 0];
    const isRecord = !best || value[0] > best[0] || (value[0] === best[0] && value[1] > best[1]);
    if (isRecord) best = value;
    return {
      ...h,
      index,
      isFirst: index === 0,
      isRecord: isRecord && index > 0,
      isBest:
        exercise.weighted
          ? h.topWeight === exercise.best.weight && h.topReps === exercise.best.reps
          : h.topReps === exercise.best.reps,
      sets: setsOf(exercise, h.sessionId),
    };
  });
}

/** Draws a loaded barbell with plates that can slide on and off. */
function drawRig(ctx, rig, lift, now, kind) {
  const s = 2; // native → stage pixels
  const sleeve = 16;
  const inner = 30;
  const half = inner / 2 + sleeve;
  const cy = RIG_Y - lift;
  ctx.save();
  ctx.translate(RIG_X, cy);
  const px = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x * s), Math.round(y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
  };
  if (kind === 'smith') {
    px(-half + sleeve - 3, -26 + lift / s, 2, 60, C.chromeLo);
    px(half - sleeve + 1, -26 + lift / s, 2, 60, C.chromeLo);
  }
  // bar
  px(-half - 1, -1.5, half * 2 + 2, 3, '#0b0c10');
  px(-half, -1, half * 2, 2, C.chrome);
  px(-half, -1, half * 2, 1, C.chromeHi);
  if (kind === 'ezbar') {
    for (let i = -2; i <= 2; i++) px(i * 4 - 2, i % 2 ? 0 : -1, 4, 2, C.chrome);
  } else {
    for (let x = -12; x < 12; x += 2) px(x, 0, 1, 1, C.chromeLo);
  }
  // collars
  px(-inner / 2 - 2, -3, 2, 6, C.steelLo);
  px(inner / 2, -3, 2, 6, C.steelLo);
  // plates: each has an x offset animated from the sleeve end
  for (const plate of rig.plates) {
    const t = Math.max(0, Math.min(1, (now - plate.start) / plate.duration));
    const k = plate.leaving ? easeOut(t) : 1 - easeOut(t);
    const alpha = plate.leaving ? 1 - t : Math.min(1, t * 3);
    if (alpha <= 0) continue;
    const [w, h] = RIG_PLATES[plate.kg] || [2, 10];
    const [base, hi, lo] = PLATE_COLORS[plate.kg] || PLATE_COLORS[5];
    const travel = 18 * k;
    ctx.globalAlpha = alpha;
    for (const dir of [-1, 1]) {
      const x = dir < 0 ? -inner / 2 - 2 - plate.offset - w - travel : inner / 2 + 2 + plate.offset + travel;
      px(x - 0.5, -h / 2 - 0.5, w + 1, h + 1, '#0b0c10');
      px(x, -h / 2, w, h, base);
      px(dir < 0 ? x : x + w - 1, -h / 2 + 1, 1, h - 3, hi);
      px(x, h / 2 - 1, w, 1, lo);
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export default function Showcase({ stationId, initialExercise, exercises, assets, input, audio, touch, onClose, onLine }) {
  const [layout, setLayout] = useState(computeLayout);
  const [exerciseIndex, setExerciseIndex] = useState(() =>
    Math.max(0, exercises.findIndex((e) => e.id === initialExercise?.id))
  );
  const exercise = exercises[exerciseIndex] || exercises[0];
  const timeline = useMemo(() => buildTimeline(exercise), [exercise]);
  const bestIndex = Math.max(0, timeline.findIndex((t) => t.isBest));
  const [sessionIndex, setSessionIndex] = useState(bestIndex);
  const session = timeline[Math.min(sessionIndex, timeline.length - 1)];
  const [repShown, setRepShown] = useState(0);
  const [bubble, setBubble] = useState(null);
  const [intro, setIntro] = useState(true);

  const stageRef = useRef(null);
  const anim = useRef({ lift: 0, dip: 0, tweens: {} });
  const rig = useRef({ plates: [] });
  const sprite = useRef(null);
  const backdrop = useRef(null);
  const playToken = useRef(0);
  const bubbleTimer = useRef(0);
  const plateTimers = useRef([]);
  const barbell = BARBELL_KINDS.has(exercise.kind);
  const accent = GROUPS[exercise.group].color;
  const station = STATIONS[stationId];

  useEffect(() => {
    const onResize = () => setLayout(computeLayout());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const say = useCallback(
    (context, ctx) => {
      const line = onLine?.(context, ctx);
      if (!line) return;
      const text = typeof line === 'string' ? line : line.text;
      clearTimeout(bubbleTimer.current);
      setBubble({ text, key: Date.now() });
      anim.current.speakingUntil = performance.now() + 1400;
      if (typeof line === 'object' && line.stinger) audio?.play('stayHard');
      bubbleTimer.current = setTimeout(() => setBubble(null), 4200);
    },
    [onLine, audio]
  );

  // Nothing queued by this scene may fire after it closes.
  useEffect(() => {
    const timers = plateTimers;
    const bubble = bubbleTimer;
    return () => {
      clearTimeout(bubble.current);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  /** Loads the bar for a session: old plates slide off, new ones slide on. */
  const loadSession = useCallback(
    (entry, { instant = false } = {}) => {
      const now = performance.now();
      backdrop.current = backdrop.current || paintBackdrop(accent);
      if (!barbell) {
        sprite.current = enemySprite(exercise, exercise.weighted ? entry.topWeight : 0);
        return;
      }
      const leaving = rig.current.plates
        .filter((p) => !p.leaving)
        .map((p) => ({ ...p, leaving: true, start: now, duration: instant ? 1 : 180 }));
      const plates = entry.topWeight >= 20 ? platesPerSide(entry.topWeight) : [];
      let offset = 0;
      const arriving = plates.map((kg, i) => {
        const [w] = RIG_PLATES[kg] || [2];
        const plate = { kg, offset, start: now + (instant ? 0 : 180 + i * 90), duration: instant ? 1 : 220, leaving: false };
        offset += w + 1;
        return plate;
      });
      rig.current.plates = [...leaving, ...arriving];
      if (!instant) {
        plateTimers.current = arriving.map((_, i) => setTimeout(() => audio?.play('tick'), 180 + i * 90 + 200));
      }
    },
    [accent, audio, barbell, exercise]
  );

  // Bumping the token makes any set still playing stop at its next rep, and
  // the plate clicks queued for the last reload are dropped.
  const stopPlayback = () => {
    playToken.current += 1;
    plateTimers.current.forEach(clearTimeout);
    plateTimers.current = [];
  };

  /** Plays the top set of the current session, rep by rep. */
  const playSet = useCallback(
    async (entry) => {
      const token = ++playToken.current;
      setRepShown(0);
      await sleep(barbell ? 420 + (platesPerSide(entry.topWeight).length || 0) * 90 : 300);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const reps = Math.min(entry.topReps, 40);
      // Long sets play faster so a 33-rep curl doesn't take a minute.
      const beat = reps > 15 ? 0.45 : reps > 8 ? 0.7 : 1;
      for (let r = 1; r <= reps; r++) {
        if (playToken.current !== token) return;
        if (!reduced) {
          tweenOn(anim, 'dip', 3, 120 * beat);
          await tweenOn(anim, 'lift', 12, 260 * beat);
          tweenOn(anim, 'dip', 0, 200 * beat);
          await tweenOn(anim, 'lift', 0, 300 * beat);
        } else await sleep(260);
        if (playToken.current !== token) return;
        audio?.play('rep');
        setRepShown(r);
      }
    },
    [audio, barbell]
  );

  // New lift or session → reload and replay.
  useEffect(() => {
    if (!session) return undefined;
    const start = setTimeout(() => {
      loadSession(session, { instant: intro });
      playSet(session);
      if (intro) {
        setIntro(false);
        say('showcase', { exercise, session });
      } else {
        if (session.isBest) audio?.play('pr');
        say('session', { exercise, session });
      }
    }, 0);
    return () => {
      clearTimeout(start);
      stopPlayback();
    };
    // Only a change of session or lift should replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id, sessionIndex]);

  // Stage loop.
  useEffect(() => {
    const canvas = stageRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let frame = 0;
    const draw = (now) => {
      const a = anim.current;
      for (const [key, tw] of Object.entries(a.tweens)) {
        const t = Math.min(1, (now - tw.start) / tw.ms);
        a[key] = tw.from + (tw.to - tw.from) * easeOut(t);
        if (t >= 1) delete a.tweens[key];
      }
      ctx.clearRect(0, 0, STAGE_W, STAGE_H);
      if (backdrop.current) ctx.drawImage(backdrop.current, 0, 0);
      // apparatus
      if (barbell) drawRig(ctx, rig.current, a.lift, now, exercise.kind);
      else if (sprite.current) {
        const sp = sprite.current;
        const scale = sp.width * 2 <= 128 && sp.height * 2 <= 66 ? 2 : 1;
        ctx.drawImage(sp, Math.round(RIG_X - (sp.width * scale) / 2), Math.round(62 - sp.height * scale - a.lift), sp.width * scale, sp.height * scale);
      }
      // Goggins in the corner, then SREE from behind
      // Goggins in your corner, behind SREE; he shouts while he has the floor.
      const corner = assets.chars.gogginsCorner;
      const pose = corner && (a.speakingUntil > now ? corner.shout : corner.idle);
      if (pose) ctx.drawImage(pose, 2, STAGE_H - pose.height * 2 + 2, pose.width * 2, pose.height * 2);
      const back = assets.chars.sreeBack;
      ctx.drawImage(back, Math.round(62 - back.width), Math.round(STAGE_H - 58 + a.dip), back.width * 2, back.height * 2);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [assets, barbell, exercise.kind]);

  // Changing lift at the same station starts from its best session.
  const switchExercise = (delta) => {
    if (exercises.length < 2) return;
    const next = (exerciseIndex + delta + exercises.length) % exercises.length;
    const nextTimeline = buildTimeline(exercises[next]);
    backdrop.current = null;
    rig.current.plates = [];
    audio?.play('select');
    setExerciseIndex(next);
    setSessionIndex(Math.max(0, nextTimeline.findIndex((t) => t.isBest)));
    setIntro(true);
  };

  const step = (delta) => {
    const next = Math.max(0, Math.min(timeline.length - 1, sessionIndex + delta));
    if (next === sessionIndex) {
      audio?.play('bump');
      return;
    }
    audio?.play('move');
    setSessionIndex(next);
  };

  useInputLayer(
    input,
    {
      onPress(button) {
        if (button === 'left') step(-1);
        else if (button === 'right') step(1);
        else if (button === 'up') switchExercise(-1);
        else if (button === 'down') switchExercise(1);
        else if (button === 'a') {
          audio?.play('select');
          playSet(session);
        } else if (button === 'b' || button === 'start') {
          audio?.play('back');
          onClose();
        }
      },
    },
    LAYER.battle
  );

  const { px, portrait } = layout;
  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const maxValue = Math.max(...timeline.map((t) => (exercise.weighted ? t.e1rm : t.topReps)));
  const minValue = Math.min(...timeline.map((t) => (exercise.weighted ? t.e1rm : t.topReps)));
  const change = exercise.weighted ? session.topWeight - first.topWeight : session.topReps - first.topReps;
  const setLabel = (s) => (exercise.weighted ? `${formatKg(s.weight)}×${s.reps}` : `${s.reps}`);
  const topSet = exercise.weighted ? `${formatKg(session.topWeight)} KG × ${session.topReps}` : `${session.topReps} REPS`;
  // What the strip says when Goggins doesn't: the day in one line.
  const caption = session.isBest
    ? 'The best set ever logged on this lift.'
    : session.isRecord
      ? 'A new heaviest set at the time.'
      : session.isFirst
        ? 'The first time this lift shows up in the log.'
        : `${session.sets.length} set${session.sets.length === 1 ? '' : 's'} that day, top set ${topSet.toLowerCase()}.`;

  const liftCard = (
    <div className="gym-sc-card is-lift">
      <div className="gym-sc-row">
        <span className="gym-sc-name">{exercise.short}</span>
        {session.isBest ? (
          <span className="gym-sc-ribbon is-best">★ BEST</span>
        ) : session.isRecord ? (
          <span className="gym-sc-ribbon">PR</span>
        ) : session.isFirst ? (
          <span className="gym-sc-ribbon is-first">FIRST</span>
        ) : null}
      </div>
      <div className="gym-sc-set px-font">{topSet}</div>
      <div className="gym-sc-sub">
        {formatDate(session.date)} · SESSION {session.index + 1}/{timeline.length}
      </div>
    </div>
  );

  const statsCard = (
    <div className="gym-sc-card is-stats">
      <dl className="gym-sc-stats">
        {exercise.weighted && (
          <div>
            <dt>EST. 1RM</dt>
            <dd>{formatKg(session.e1rm)} KG</dd>
          </div>
        )}
        <div>
          <dt>{exercise.weighted ? 'VOLUME' : 'REPS'}</dt>
          <dd>{exercise.weighted ? formatVolume(session.volume) : session.sets.reduce((n, s) => n + s.reps, 0)}</dd>
        </div>
        <div>
          <dt>SINCE FIRST</dt>
          <dd className={change > 0 ? 'is-up' : ''}>
            {session.isFirst ? '—' : `${change > 0 ? '+' : ''}${exercise.weighted ? `${formatKg(change)} KG` : `${change} REPS`}`}
          </dd>
        </div>
      </dl>
      <div className="gym-sc-sets" aria-label="Sets that session">
        {session.sets.map((s, i) => (
          <span key={i} className={s.weight === session.topWeight && s.reps === session.topReps ? 'is-top' : ''}>
            {setLabel(s)}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`gym-battle gym-showcase ${portrait ? 'is-portrait' : 'is-landscape'}`}
      style={{ '--px': `${px}px`, '--accent': accent }}
      role="region"
      aria-label={`${exercise.name}: logged sessions`}
    >
      <div className="gym-battle-frame">
        <div className="gym-stage">
          <canvas ref={stageRef} width={STAGE_W} height={STAGE_H} className="gym-canvas gym-stage-canvas" aria-hidden="true" />
          {!portrait && liftCard}
          {!portrait && statsCard}
          <div className="gym-sc-reps" aria-live="polite">
            {repShown > 0 && (
              <span key={repShown} className={`px-font ${repShown === session.topReps ? 'is-final' : ''}`}>
                {repShown === session.topReps && session.topReps > 1 ? `×${repShown}` : repShown}
              </span>
            )}
          </div>
          <button type="button" className="gym-sc-close px-font" onClick={onClose} aria-label="Back to the gym">
            ✕
          </button>
        </div>

        <div className="gym-panel gym-sc-panel">
          {portrait && (
            <div className="gym-sc-cards">
              {liftCard}
              {statsCard}
            </div>
          )}
          <p className={`gym-sc-voice ${bubble ? 'is-goggins' : ''}`} role="status" aria-live="polite">
            {bubble ? (
              <>
                <span className="gym-sc-voice-name px-font">GOGGINS</span>
                <span key={bubble.key} className="gym-sc-voice-text">
                  {bubble.text}
                </span>
              </>
            ) : (
              <span className="gym-sc-voice-text">{caption}</span>
            )}
          </p>
          <div className="gym-sc-timeline">
            <div className="gym-sc-timeline-head">
              <span>
                {station?.name} · {exercise.sessionCount} SESSION{exercise.sessionCount === 1 ? '' : 'S'}
              </span>
              <span className="gym-muted">
                {exercise.weighted ? 'EST. 1RM' : 'TOP SET'} PER SESSION · <span className="gym-sc-key">■</span> RECORD
              </span>
            </div>
            <div className="gym-sc-bars" role="listbox" aria-label="Sessions">
              {timeline.map((t) => {
                const value = exercise.weighted ? t.e1rm : t.topReps;
                const pct = maxValue === minValue ? 100 : 28 + ((value - minValue) / (maxValue - minValue)) * 72;
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={t.index === sessionIndex}
                    key={t.sessionId}
                    className={`gym-sc-bar ${t.index === sessionIndex ? 'is-active' : ''} ${t.isBest ? 'is-best' : ''} ${t.isRecord ? 'is-record' : ''}`}
                    onClick={() => {
                      audio?.play('move');
                      setSessionIndex(t.index);
                    }}
                    aria-label={`${formatDate(t.date)}: ${exercise.weighted ? `${formatKg(t.topWeight)} kg for ${t.topReps}` : `${t.topReps} reps`}`}
                  >
                    <span style={{ height: `${pct}%` }} />
                  </button>
                );
              })}
            </div>
            <div className="gym-sc-axis">
              <span>{formatDate(first.date)}</span>
              {timeline.length > 1 && <span>{formatDate(last.date)}</span>}
            </div>
          </div>
          <p className="gym-sc-hint">
            {touch ? (
              'TAP A BAR TO LOAD THAT SESSION · A REPLAYS THE SET'
            ) : (
              <>
                <b>◀ ▶</b> SESSIONS · <b>A</b> REPLAY{exercises.length > 1 && <> · <b>▲ ▼</b> OTHER LIFTS</>} · <b>B</b> BACK
              </>
            )}
          </p>
        </div>
      </div>
      {touch && <TouchControls input={input} compact={!portrait} />}
    </div>
  );
}
