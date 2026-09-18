import React from 'react';

/**
 * Catches render/lifecycle errors anywhere below it so a single failing widget
 * (a WebGL canvas on an unsupported GPU, a lazy chunk that 404s after a deploy)
 * degrades to a readable screen instead of an empty white page.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.handleReset);
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <p className="netflix-font text-6xl tracking-widest text-red-600">OOPS</p>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
          Something went wrong playing this title
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/60">
          An unexpected error stopped this page from rendering. Reloading usually
          fixes it — if it doesn&apos;t, head back to the profile picker.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-6 max-w-xl overflow-auto rounded-lg bg-white/5 p-4 text-left text-xs text-red-300">
            {error.message}
          </pre>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-600 px-6 py-3 font-semibold transition-colors hover:bg-red-700"
          >
            Reload
          </button>
          <a
            href="/"
            className="rounded-md border border-white/30 bg-white/10 px-6 py-3 font-semibold transition-colors hover:bg-white/20"
          >
            Back to profiles
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
