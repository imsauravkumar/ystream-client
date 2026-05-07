export default function Avatar({ user, size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base"
  };
  const name = user?.name || user?.displayName || "Y";

  return (
    <div className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-zinc-800 font-bold text-brand`}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
