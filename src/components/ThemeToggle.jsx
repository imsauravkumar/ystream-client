import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(() => localStorage.getItem("ystream-theme") === "light");

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("ystream-theme", light ? "light" : "dark");
  }, [light]);

  return (
    <button
      className="grid h-11 w-11 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 transition hover:bg-zinc-800"
      onClick={() => setLight((value) => !value)}
      title="Toggle theme"
      type="button"
    >
      {light ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
