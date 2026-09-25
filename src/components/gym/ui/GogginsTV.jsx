import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LAYER, useInputLayer } from '../engine/input';
import '../gym-tv.css';

/**
 * The lobby TV: David Goggins in his own voice, from official uploads only —
 * each id was checked against YouTube's oEmbed record for its publisher.
 * Everything plays in YouTube's own player (nothing is drawn over it, as the
 * YouTube terms require); the TV set around it is ours.
 */
export const GOGGINS_CLIPS = [
  { id: 'byym9Inpn4A', title: "There's No Magic Pill to Success", channel: 'Huberman Lab Clips' },
  { id: 'PLiWjL5O2rE', title: 'What It Takes to Be Great', channel: 'Huberman Lab Clips' },
  { id: 'CuzL1qxUyHw', title: 'Controlling the Voices in Your Head', channel: 'Huberman Lab' },
  { id: 'ls386kh2FiQ', title: 'How David Goggins Studies & Learns', channel: 'Huberman Lab Clips' },
  { id: '9iVh87XtL_4', title: 'Navy SEAL Lives with Hawks Owner as Trainer', channel: 'CBS Mornings' },
];

let apiPromise = null;

/** Loads the YouTube IFrame API once, on first use. */
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        apiPromise = null;
        reject(new Error('YouTube could not be reached'));
      };
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

const PLAYING = 1;
const ENDED = 0;
const PAUSED = 2;

export default function GogginsTV({ input, audio, onClose, startIndex = 0 }) {
  const [channel, setChannel] = useState(startIndex % GOGGINS_CLIPS.length);
  // 'warming' → 'tuning' → 'live' | 'paused' | 'nosignal' | 'tap'
  const [state, setState] = useState('warming');
  const [powering, setPowering] = useState('on');
  const mount = useRef(null);
  const player = useRef(null);
  const tapTimer = useRef(0);
  const channelRef = useRef(channel);
  const readyRef = useRef(false);
  const clip = GOGGINS_CLIPS[channel];

  useEffect(() => {
    channelRef.current = channel;
  }, [channel]);

  const closing = useRef(false);
  const closeTimer = useRef(0);
  const powerOff = useCallback(() => {
    // B, Esc and the clip ending can all arrive together; close once.
    if (closing.current) return;
    closing.current = true;
    setPowering('off');
    closeTimer.current = setTimeout(onClose, 380);
  }, [onClose]);

  // The game's own music and blips pause while he talks.
  useEffect(() => {
    audio?.suspend('tv');
    return () => {
      clearTimeout(closeTimer.current);
      audio?.resume('tv');
    };
  }, [audio]);

  // Clicking the video moves focus into YouTube's frame, where our keys can't
  // reach. Take focus back so B, Esc and the arrows keep working.
  const offButton = useRef(null);
  useEffect(() => {
    const onBlur = () =>
      setTimeout(() => {
        if (document.activeElement?.tagName === 'IFRAME') offButton.current?.focus();
      }, 0);
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Blocked by an extension, a firewall or an embedding policy, the player
    // never reports ready. Say so instead of showing static forever.
    const giveUp = setTimeout(() => {
      if (!cancelled && !readyRef.current) setState('nosignal');
    }, 9000);
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mount.current) return;
        player.current = new YT.Player(mount.current, {
          host: 'https://www.youtube-nocookie.com',
          videoId: GOGGINS_CLIPS[channelRef.current].id,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              readyRef.current = true;
              event.target.playVideo();
              setState('tuning');
              // Autoplay with sound can be refused if the tap that opened the
              // TV has gone stale; offer a play prompt instead of a dead set.
              clearTimeout(tapTimer.current);
              tapTimer.current = setTimeout(() => {
                if (player.current?.getPlayerState?.() !== PLAYING) setState('tap');
              }, 1800);
            },
            onStateChange: (event) => {
              if (event.data === PLAYING) setState('live');
              else if (event.data === PAUSED) setState('paused');
              else if (event.data === ENDED) powerOff();
            },
            onError: () => setState('nosignal'),
          },
        });
      })
      .catch(() => !cancelled && setState('nosignal'));
    return () => {
      cancelled = true;
      clearTimeout(giveUp);
      clearTimeout(tapTimer.current);
      player.current?.destroy?.();
      player.current = null;
    };
    // The player is created once; channel changes go through loadVideoById.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tune = (delta) => {
    if (closing.current) return;
    const next = (channel + delta + GOGGINS_CLIPS.length) % GOGGINS_CLIPS.length;
    setChannel(next);
    // Without a working player there is nothing to tune; keep the link on screen.
    if (!readyRef.current) return;
    setState('tuning');
    player.current?.loadVideoById?.(GOGGINS_CLIPS[next].id);
  };

  const togglePlay = () => {
    if (closing.current) return;
    const p = player.current;
    if (!p?.getPlayerState) return;
    if (p.getPlayerState() === PLAYING) p.pauseVideo();
    else p.playVideo();
  };

  useInputLayer(
    input,
    {
      onPress(button) {
        if (button === 'left') tune(-1);
        else if (button === 'right') tune(1);
        else if (button === 'a') togglePlay();
        else if (button === 'b' || button === 'start') powerOff();
      },
    },
    LAYER.dialog + 5
  );

  const live = state === 'live' || state === 'paused';

  return (
    <div className="gym-overlay gym-tv-room" role="dialog" aria-label="Goggins TV" onClick={powerOff}>
      <div className={`gym-tv ${powering === 'off' ? 'is-off' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="gym-tv-case">
          <div className="gym-tv-screen">
            {/* YouTube's player, untouched. Hidden (not covered) until it plays. */}
            <div className={`gym-tv-player ${live ? 'is-live' : ''}`}>
              <div ref={mount} />
            </div>
            {!live && (
              <div className={`gym-tv-static ${state === 'nosignal' ? 'is-nosignal' : ''}`} aria-live="polite">
                {state === 'nosignal' ? (
                  <a
                    className="gym-tv-nosignal px-font"
                    href={`https://www.youtube.com/watch?v=${clip.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NO SIGNAL · WATCH ON YOUTUBE ↗
                  </a>
                ) : state === 'tap' ? (
                  <button type="button" className="gym-tv-tap px-font" onClick={togglePlay}>
                    ▶ PLAY
                  </button>
                ) : (
                  <span className="px-font">CH {String(channel + 1).padStart(2, '0')}</span>
                )}
              </div>
            )}
          </div>
          <div className="gym-tv-bezel">
            <span className="gym-tv-brand px-font">GOGGINS TV</span>
            <span className="gym-tv-led px-font" aria-label={`Channel ${channel + 1}`}>
              {String(channel + 1).padStart(2, '0')}
            </span>
            <span className="gym-tv-grille" aria-hidden="true" />
          </div>
        </div>

        <div className="gym-tv-info">
          <p className="gym-tv-title">{clip.title}</p>
          <p className="gym-tv-meta">
            {clip.channel} · on YouTube ·{' '}
            <a href={`https://www.youtube.com/watch?v=${clip.id}`} target="_blank" rel="noopener noreferrer">
              open ↗
            </a>
          </p>
        </div>

        <div className="gym-tv-controls">
          <button type="button" className="px-box px-font" onClick={() => tune(-1)} aria-label="Previous channel">
            ◀ CH
          </button>
          <button type="button" className="px-box px-font" onClick={togglePlay} aria-label={state === 'live' ? 'Pause' : 'Play'}>
            {state === 'live' ? '❚❚' : '▶'}
          </button>
          <button type="button" className="px-box px-font" onClick={() => tune(1)} aria-label="Next channel">
            CH ▶
          </button>
          <button type="button" ref={offButton} className="px-box px-font gym-tv-off" onClick={powerOff}>
            OFF
          </button>
        </div>
      </div>
    </div>
  );
}
