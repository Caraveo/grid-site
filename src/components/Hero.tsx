export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5"
    >
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />

      {/* Soft horizon */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 horizon" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <p className="section-label animate-fade-up">
          Phase 1 · Ignition
        </p>

        <h1 className="mt-6 animate-fade-up delay-1 text-[clamp(3.5rem,12vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
          GRID
        </h1>

        <p className="mt-6 max-w-xl animate-fade-up delay-2 text-lg text-white/70 sm:text-xl sm:leading-relaxed">
          Run a node. Do real work. Earn GRID.
          <br className="hidden sm:block" />
          <span className="text-white/45">
            {" "}
            The planetary supercomputer is not a building —
            it is the mesh we build together.
          </span>
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 animate-fade-up delay-3 sm:flex-row">
          <a href="#download" className="btn-primary min-w-[200px]">
            Download
          </a>
          <a href="#mission" className="btn-ghost min-w-[200px]">
            Explore
          </a>
        </div>

        <p className="mt-10 animate-fade-up delay-4 font-mono text-[0.65rem] tracking-[0.22em] text-white/35 uppercase">
          Bitcoin · Transact Security Layer
        </p>
      </div>

      {/* Scroll cue */}
      <a
        href="#mission"
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition hover:text-white/70"
        aria-label="Scroll to mission"
      >
        <span className="text-[0.6rem] tracking-[0.25em] uppercase">Scroll</span>
        <span className="scroll-line h-10 w-px origin-top bg-white/60" />
      </a>
    </section>
  );
}
