import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import GymGame from './gym/GymGame';
import { EXERCISES, LOG, formatDate, formatSet } from './gym/gameData';

/**
 * /browse/developer — PR Quest, a gym RPG built from the Hevy training log in
 * src/data/workouts.csv. The game is canvas and pixel UI; the hidden summary
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
        <h1>PR Quest — a gym RPG built from Sreevallabh&apos;s training log</h1>
        <p>
          {LOG.totals.sessions} sessions logged in Hevy between {formatDate(LOG.totals.firstDate)} and{' '}
          {formatDate(LOG.totals.lastDate)}: {LOG.totals.sets} sets, {LOG.totals.reps} reps,{' '}
          {Math.round(LOG.totals.volume).toLocaleString('en-US')} kg lifted. Each machine in the game holds
          the best set below; the game asks you to beat it.
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
