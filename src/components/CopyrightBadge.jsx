export default function CopyrightBadge() {
  return (
    <footer className="mx-auto mt-6 flex w-full max-w-6xl justify-center px-3 pb-2">
      <button
        className="max-w-full truncate rounded-full border border-zinc-800 bg-panel/80 px-4 py-2 text-xs font-semibold text-muted shadow-glow backdrop-blur transition hover:border-sky-400/50 hover:text-zinc-100"
        type="button"
        title="Designed and built by Saurav Kumar"
      >
        &copy; {new Date().getFullYear()} Saurav Kumar
      </button>
    </footer>
  );
}
