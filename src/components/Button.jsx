export default function Button({ className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-gradient-to-r from-sky-300 to-brand text-zinc-950 shadow-[0_10px_28px_rgba(56,189,248,0.18)] hover:from-sky-200 hover:to-sky-300",
    danger: "bg-accent text-white shadow-[0_10px_28px_rgba(244,63,94,0.16)] hover:bg-rose-500",
    ghost: "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-sky-400/50 hover:bg-zinc-800",
    subtle: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-300/40 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
