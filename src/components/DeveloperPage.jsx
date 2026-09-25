import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import GymGame from './gym/GymGame';
import { EXERCISES, LOG, formatDate, formatSet } from './gym/gameData';
import { RUNS, TOTALS as RUN_TOTALS, formatKm } from '@/lib/strava';

/**
 * /browse/developer — PR Quest, a walk-around pixel gym built from the Hevy log
 * in src/data/workouts.csv and the Strava summary in src/data/strava.json. The game is canvas and pixel UI; the hidden summary
 * below carries the same records as plain text for screen readers and search.
 */
export default function DeveloperPage() {
  useEffect(() => {
    const { style } = document.body;
    const previous = { overflow: style.overflow, overscroll: style.overscrollBehavior };
    style.overflow = 'hidden';
    style.overscrollBehavior = 'none';
    return () => {
      style.overflow = previous.overflow;
      style.overscrollBehavior = previous.overscroll;
    };
  }, []);

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600&family=Press+Start+2P&display=swap"
        />
      </Helmet>

      <section className="gym-sr" aria-label="Training records">
        <h1>PR Quest — a pixel gym built from Sreevallabh&apos;s training logs</h1>
        <p>
          {LOG.totals.sessions} sessions logged in Hevy between {formatDate(LOG.totals.firstDate)} and{' '}
          {formatDate(LOG.totals.lastDate)}: {LOG.totals.sets} sets, {LOG.totals.reps} reps,{' '}
          {Math.round(LOG.totals.volume).toLocaleString('en-US')} kg lifted, plus {RUNS.length} runs ({formatKm(RUN_TOTALS.byType.Run?.distance || 0, 1)}) synced
          from Strava. Each machine in the gym replays
          the sessions logged on it; the best set for every lift is below.
        </p>
        <table>
          <thead>
            <tr>
              <th scope="col">Exercise</th>
              <th scope="col">Best set</th>
              <th scope="col">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {EXERCISES.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{formatSet(e, e.best)}</td>
                <td>{e.sessionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <GymGame />
    </>
  );
}
