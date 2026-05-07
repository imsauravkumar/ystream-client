export default function Button({ className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-brand text-zinc-950 hover:bg-green-400",
    danger: "bg-accent text-white hover:bg-red-500",
    ghost: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800",
    subtle: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
