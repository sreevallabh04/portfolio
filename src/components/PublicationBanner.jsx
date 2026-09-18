import React from 'react';
import { BookOpen, ExternalLink, Award } from 'lucide-react';
import { PUBLICATIONS } from '@/data/portfolio';

/**
 * Peer-reviewed work, given its own band on the dashboard.
 *
 * It used to be reachable only by opening the research-internship card and
 * reading to the bottom of the modal, which buried the strongest credential on
 * the page behind two clicks.
 */
const PublicationBanner = () => {
  if (PUBLICATIONS.length === 0) return null;

  return (
    <section className="py-6" aria-labelledby="publications-heading">
      <h2 id="publications-heading" className="mb-4 text-xl font-bold text-white sm:text-2xl">
        Published Research
      </h2>

      <ul className="space-y-4">
        {PUBLICATIONS.map((paper) => (
          <li
            key={paper.doi}
            className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/50 via-zinc-900 to-zinc-900"
          >
            {/* Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(229,9,20,0.22) 0%, transparent 70%)',
              }}
            />

            <div className="relative p-5 sm:p-7 md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  <BookOpen size={12} />
                  Peer reviewed
                </span>
                {paper.firstAuthor && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                    <Award size={12} />
                    First author
                  </span>
                )}
                <span className="text-xs text-white/45">
                  {paper.venue} &middot; {paper.date}
                </span>
              </div>

              <h3 className="max-w-3xl text-lg font-bold leading-snug text-white sm:text-xl md:text-2xl">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-red-300 focus-visible:outline-none focus-visible:underline"
                >
                  {paper.title}
                </a>
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
                {paper.summary}
              </p>

              <p className="mt-4 text-xs leading-relaxed text-white/40">
                {paper.authors.map((author, index) => (
                  <React.Fragment key={author}>
                    <span className={index === 0 ? 'font-semibold text-white/70' : undefined}>
                      {author}
                    </span>
                    {index < paper.authors.length - 1 && ', '}
                  </React.Fragment>
                ))}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {paper.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] text-white/60"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ExternalLink size={16} />
                  Read the paper
                </a>
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-white/40 transition-colors hover:text-white/70"
                >
                  DOI: {paper.doi}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PublicationBanner;
