import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildAssets } from './engine/assets';
import { createAudio } from './engine/audio';
import { createInput, LAYER } from './engine/input';
import { World } from './engine/world';
import { EXERCISE_BY_ID, FRESH_PR_STATIONS, TYPICAL_START, exercisesAt } from './gameData';
import { freshSave, loadSave, writeSave } from './save';
import { GOGGINS_NAME, gogginsBark, gogginsLine, gogginsSay, gogginsSession } from './goggins';
import { focusLabel, introLines, runInteraction } from './scripts';
import Showcase from './Showcase';
import Credits from './ui/Credits';
import Dialog from './ui/Dialog';
import GogginsTV from './ui/GogginsTV';
import HowToPlay from './ui/HowToPlay';
import Hud from './ui/Hud';
import LiftDex from './ui/LiftDex';
import Menu from './ui/Menu';
import RunLog from './ui/RunLog';
import Title from './ui/Title';
import TouchControls from './ui/TouchControls';
import TrainerCard from './ui/TrainerCard';
import TrainingLog from './ui/TrainingLog';
import './gym.css';

const TOUCH_SAFE_AREA = 176;

const coarsePointer = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export default function GymGame() {
  const navigate = useNavigate();
  const [assets] = useState(buildAssets);
  const [input] = useState(createInput);
  const [save, setSave] = useState(loadSave);
  const saveRef = useRef(save);
  const [audio] = useState(() => createAudio({ muted: save.muted, music: save.music }));

  // title → play ⇄ showcase / credits
  const [phase, setPhase] = useState('title');
  const [dialog, setDialog] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [showcase, setShowcase] = useState(null);
  const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState(null);
  const [touch, setTouch] = useState(coarsePointer);
  const [hint, setHint] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const busy = useRef(false);
  const handlers = useRef({});
  const toastTimer = useRef(0);
  // GOGGINS says his piece walking in the doors once per session, not every time.
  const gogginsGreeted = useRef(false);
  const phaseRef = useRef(phase);
  useLayoutEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* ------------------------------------------------------------- save */

  const commit = useCallback((patch) => {
    const prev = saveRef.current;
    const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
    saveRef.current = next;
    writeSave(next);
    setSave(next);
    return next;
  }, []);

  /* ----------------------------------------------------------- dialog */

  const dialogRef = useRef(null);
  const dialogSeq = useRef(0);
  const openDialog = useCallback(
    (pages, { speaker, choices } = {}) =>
      new Promise((resolve) => {
        const entry = {
          id: ++dialogSeq.current,
          pages: [].concat(pages).filter(Boolean),
          speaker,
          choices,
          resolve: (value) => {
            resolve(value);
            // Close on the next tick unless another line was queued straight away,
            // which keeps the box on screen between consecutive messages.
            setTimeout(() => {
              if (dialogRef.current === entry) {
                dialogRef.current = null;
                setDialog(null);
              }
            }, 0);
          },
        };
        dialogRef.current = entry;
        setDialog(entry);
      }),
    []
  );
  const say = useCallback((pages, opts) => openDialog(pages, opts), [openDialog]);
  const ask = useCallback((text, choices, opts) => openDialog(text, { ...opts, choices }), [openDialog]);

  const showToast = useCallback((text) => {
    clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  /* --------------------------------------------------------- showcase */

  /** Opens a machine: the replay of its lifts, starting from `exercise`. */
  const openShowcase = useCallback(
    (stationId, exercise) => {
      const exercises = exercisesAt(stationId);
      if (!exercises.length) return;
      audio.play('select');
      setOverlay(null);
      setShowcase({ stationId, exercises, exercise: exercise || exercises[0], key: Date.now() });
      setPhase('showcase');
    },
    [audio]
  );

  const closeShowcase = useCallback(() => {
    setShowcase(null);
    setPhase('play');
  }, []);

  // Goggins' commentary in the showcase: a line when it opens, then only when
  // the timeline lands somewhere worth a word (the best, the first session,
  // a comeback, a new heaviest). Ordinary sessions stay quiet.
  const showcaseLine = useCallback((context, { exercise, session } = {}) => {
    if (context === 'showcase') return gogginsSay('showcase', { exercise });
    const line = gogginsSession(exercise, session.index);
    return line.context === 'showcase' ? null : line;
  }, []);

  /* ------------------------------------------------------------ world */

  const map = () => worldRef.current?.map?.id;

  const api = useMemo(
    () => ({
      say,
      ask,
      save: () => saveRef.current,
      commit,
      audio,
      navigate,
      map,
      get world() {
        return worldRef.current;
      },
      open: (name) => setOverlay(name),
      openStation: (id) => openShowcase(id),
      credits: () => setPhase('credits'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say, ask, commit, audio, navigate, openShowcase]
  );

  const onInteract = async (target) => {
    if (busy.current || phaseRef.current !== 'play') return;
    busy.current = true;
    try {
      await runInteraction(target, api);
    } finally {
      busy.current = false;
    }
  };

  const onTrigger = async (trigger) => {
    const world = worldRef.current;
    setTransitioning(true);
    audio.play('door');
    await world.fadeTo(1, 0.26);
    world.setMap(trigger.to, trigger.spawn);
    audio.music(world.map.music);
    await world.fadeTo(0, 0.32);
    setTransitioning(false);
    showToast(world.map.name);
    if (trigger.to !== 'gym') return;
    const greet = !saveRef.current.metDesk;
    const hype = !gogginsGreeted.current;
    if (!greet && !hype) return;
    busy.current = true;
    if (greet) await say(['Hey, SREE! Over here. Front desk.'], { speaker: 'FRONT DESK' });
    if (hype) {
      gogginsGreeted.current = true;
      await say([gogginsLine('enterGym')], { speaker: GOGGINS_NAME });
    }
    busy.current = false;
  };

  const onZone = (zone) => showToast(zone.name);

  const onWorldPress = (button) => {
    if (phaseRef.current !== 'play' || !worldRef.current || worldRef.current.paused) return;
    setHint(false);
    if (button === 'a') worldRef.current.interact();
    else if (button === 'start') {
      audio.play('select');
      setOverlay('menu');
    }
  };

  // The world calls back through this ref, so it always reaches the latest closures.
  useLayoutEffect(() => {
    handlers.current = { interact: onInteract, trigger: onTrigger, zone: onZone, worldPress: onWorldPress };
  });

  useEffect(() => {
    input.attach();
    const world = new World({
      canvas: canvasRef.current,
      maps: assets.maps,
      chars: assets.chars,
      input,
      audio,
      hooks: {
        onInteract: (t) => handlers.current.interact?.(t),
        onTrigger: (t) => handlers.current.trigger?.(t),
        onZone: (z) => handlers.current.zone?.(z),
        onFocus: (t) => setFocus(t),
      },
    });
    worldRef.current = world;
    world.setMap('street');
    world.start();
    const removeLayer = input.pushLayer({ onPress: (b) => handlers.current.worldPress?.(b) }, LAYER.world);
    const offSource = input.onSource((source) => setTouch(source === 'touch'));
    const onVisibility = () => (document.hidden ? audio.suspend() : audio.resume());
    document.addEventListener('visibilitychange', onVisibility);
    const onPointer = (event) => {
      if (event.pointerType === 'touch') input.setSource('touch');
      else if (event.pointerType === 'mouse') input.setSource('mouse');
    };
    window.addEventListener('pointerdown', onPointer, true);
    return () => {
      world.stop();
      removeLayer();
      offSource();
      input.detach();
      audio.close();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointerdown', onPointer, true);
      clearTimeout(toastTimer.current);
    };
  }, [assets, audio, input]);

  // Canvas size follows the viewport; the scale stays an integer.
  useEffect(() => {
    const wrap = wrapRef.current;
    const world = worldRef.current;
    if (!wrap || !world) return undefined;
    const fit = () => {
      const { width, height } = wrap.getBoundingClientRect();
      const out = world.resize(width, height, touch && phase === 'play' ? TOUCH_SAFE_AREA : 0);
      const canvas = canvasRef.current;
      canvas.style.width = `${out.width}px`;
      canvas.style.height = `${out.height}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [touch, phase]);

  // Development-only handle for driving the game from the console or a test.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__gym = { world: worldRef.current, openShowcase, commit, setOverlay, setPhase, EXERCISE_BY_ID };
    return () => {
      delete window.__gym;
    };
  }, [openShowcase, commit]);

  const paused = phase !== 'play' || !!dialog || !!overlay || transitioning;
  useEffect(() => {
    if (worldRef.current) worldRef.current.hidden = phase === 'showcase' || phase === 'credits';
  }, [phase]);
  useEffect(() => {
    worldRef.current?.setPaused(paused);
  }, [paused]);

  // Markers: a gold star over machines where a new best was set in the last
  // week of the log, and a "!" over the desk until you've checked in.
  useEffect(() => {
    const status = Object.fromEntries(FRESH_PR_STATIONS.map((id) => [id, 'done']));
    if (!save.metDesk) status['npc:desk'] = 'new';
    worldRef.current?.setStatus(status);
  }, [save.metDesk]);

  useEffect(() => {
    if (phase !== 'play' || !hint) return undefined;
    const t = setTimeout(() => setHint(false), 14000);
    return () => clearTimeout(t);
  }, [phase, hint]);

  /* ------------------------------------------------------------ title */

  const starting = useRef(false);
  const begin = useCallback(
    async (fresh) => {
      // One choice per title screen: a second press during the fade would
      // otherwise start a new game on top of a continue.
      if (starting.current) return;
      starting.current = true;
      audio.unlock();
      const world = worldRef.current;
      if (fresh) {
        const keep = { muted: saveRef.current.muted, music: saveRef.current.music };
        commit({ ...freshSave(), ...keep, started: true });
        world.setMap('street');
        setPhase('play');
        audio.music('street');
        busy.current = true;
        await say(introLines(TYPICAL_START));
        await say([gogginsLine('street')], { speaker: GOGGINS_NAME });
        busy.current = false;
        return;
      }
      await world.fadeTo(1, 0.2);
      world.setMap('gym');
      audio.music('gym');
      setPhase('play');
      await world.fadeTo(0, 0.3);
      showToast('THE GYM');
      // Continuing drops you straight onto the floor: a bark, not a dialog,
      // so you can walk off the moment the screen fades in.
      world.bark(gogginsBark('enterGym'));
    },
    [audio, commit, say, showToast]
  );

  /* ------------------------------------------------------------- menu */

  const toggleSound = () => {
    const muted = !saveRef.current.muted;
    commit({ muted });
    audio.setMuted(muted);
    if (!muted) {
      audio.unlock();
      audio.play('select');
    }
  };

  const toggleMusic = () => {
    const music = !saveRef.current.music;
    commit({ music });
    audio.setMusic(music);
  };

  const menuItems = [
    { label: 'LIFTDEX', key: 'dex', detail: 'EVERY LIFT' },
    { label: 'RUN CLUB', key: 'runs', detail: 'STRAVA' },
    { label: 'TRAINER CARD', key: 'card' },
    { label: 'TRAINING LOG', key: 'log' },
    { label: 'GOGGINS TV', key: 'tv' },
    { label: 'HOW IT WORKS', key: 'help' },
    { label: 'SOUND', key: 'sound', detail: save.muted ? 'OFF' : 'ON' },
    { label: 'MUSIC', key: 'music', detail: save.music ? 'ON' : 'OFF' },
    { label: 'LEAVE GYM', key: 'exit' },
  ];

  const onMenu = (item) => {
    if (item.key === 'sound') return toggleSound();
    if (item.key === 'music') return toggleMusic();
    if (item.key === 'exit') return navigate('/');
    return setOverlay(item.key);
  };

  const closeOverlay = () => setOverlay(null);

  /* ----------------------------------------------------------- render */

  const label = phase === 'play' && !paused ? focusLabel(focus) : null;

  return (
    <div
      className="gym-root"
      data-phase={phase}
      data-touch={touch && phase === 'play' ? 'true' : 'false'}
      onClickCapture={(e) => {
        if (input.isGhostClick() && !e.target.closest('.gym-touch')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={wrapRef}
        className="gym-viewport"
        onPointerDown={(e) => {
          if (phase !== 'play' || paused || e.target !== canvasRef.current) return;
          setHint(false);
          worldRef.current?.pointer(e.clientX, e.clientY);
        }}
      >
        <canvas ref={canvasRef} className="gym-canvas gym-world" aria-label="The gym. Use the arrow keys to walk around." />
      </div>

      {phase === 'play' && (
        <Hud
          save={save}
          focusLabel={label}
          toast={toast}
          touch={touch}
          showHint={hint && !dialog}
          onMenu={() => !paused && setOverlay('menu')}
          onCard={() => !paused && setOverlay('card')}
          onToggleSound={toggleSound}
        />
      )}

      {phase === 'play' && touch && !overlay && <TouchControls input={input} />}

      {phase === 'title' && (
        <Title
          active={!overlay}
          input={input}
          audio={audio}
          hasSave={save.started}
          onNew={() => begin(true)}
          onContinue={() => begin(false)}
          onHelp={() => setOverlay('help')}
          onExit={() => navigate('/')}
        />
      )}

      {overlay === 'menu' && (
        <div className="gym-overlay is-side" onClick={closeOverlay}>
          <div className="gym-startmenu px-box" onClick={(e) => e.stopPropagation()}>
            <Menu items={menuItems} input={input} audio={audio} onSelect={onMenu} onCancel={closeOverlay} label="Menu" />
          </div>
        </div>
      )}
      {overlay === 'dex' && (
        <LiftDex input={input} audio={audio} onClose={closeOverlay} onOpen={(e) => openShowcase(e.station, e)} />
      )}
      {overlay === 'runs' && <RunLog input={input} audio={audio} onClose={closeOverlay} />}
      {overlay === 'tv' && <GogginsTV input={input} audio={audio} onClose={closeOverlay} />}
      {overlay === 'card' && (
        <TrainerCard input={input} audio={audio} onClose={closeOverlay} sprite={assets.chars.sree.flex} />
      )}
      {overlay === 'log' && <TrainingLog input={input} audio={audio} onClose={closeOverlay} />}
      {overlay === 'help' && <HowToPlay input={input} audio={audio} onClose={closeOverlay} touch={touch} />}

      {dialog && (
        <Dialog
          key={dialog.id}
          dialog={dialog}
          input={input}
          audio={audio}
          onClose={(value) => dialog.resolve(value)}
        />
      )}

      {phase === 'showcase' && showcase && (
        <Showcase
          key={showcase.key}
          stationId={showcase.stationId}
          exercises={showcase.exercises}
          initialExercise={showcase.exercise}
          assets={assets}
          input={input}
          audio={audio}
          touch={touch}
          onLine={showcaseLine}
          onClose={closeShowcase}
        />
      )}

      {phase === 'credits' && (
        <Credits
          input={input}
          audio={audio}
          onClose={() => {
            audio.music(worldRef.current?.map?.music || 'gym');
            setPhase('play');
          }}
        />
      )}
    </div>
  );
}
