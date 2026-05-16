import { Lock, Plus, Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "./Button.jsx";
import { searchVideos } from "../lib/api.js";

export default function SearchPanel({ onAdd, hasCurrentVideo = false, adding = false, canAdd = true }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  async function handleSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await searchVideos(query.trim());
      setResults(data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Server connection failed. Check your backend URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-panel/80 p-4">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-950/90 pl-10 pr-4 text-white outline-none transition focus:border-brand"
            placeholder="Search YouTube"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button className="w-full sm:w-32" disabled={loading}>{loading ? "Searching" : "Search"}</Button>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {results.map((video) => (
          <article key={video.videoId} className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/70 transition hover:border-zinc-700">
            <button
              className="relative block w-full overflow-hidden text-left disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={adding || !canAdd}
              onClick={() => onAdd(video)}
              title={canAdd ? (hasCurrentVideo ? "Add to queue" : "Play now") : "Host locked"}
            >
              <img className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105" src={video.thumbnail} alt={video.title} loading="lazy" />
              <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950/90 px-3 py-2 text-xs font-bold text-zinc-100">
                  {canAdd ? <Plus size={14} /> : <Lock size={14} />}
                  {canAdd ? (hasCurrentVideo ? "Add to queue" : "Play now") : "Host locked"}
                </span>
              </span>
            </button>
            <div className="space-y-3 p-3">
              <div>
                <h3 className="line-clamp-2 min-h-10 text-sm font-bold">{video.title}</h3>
                <p className="mt-1 truncate text-xs text-muted">{video.channelTitle}</p>
              </div>
              <Button className="w-full" variant={canAdd ? "subtle" : "ghost"} disabled={adding || !canAdd} onClick={() => onAdd(video)}>
                <Plus size={16} /> {!canAdd ? "Host locked" : adding ? "Working..." : hasCurrentVideo ? "Add to queue" : "Play now"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
