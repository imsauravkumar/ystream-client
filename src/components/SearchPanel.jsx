import { Plus, Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "./Button.jsx";
import { searchVideos } from "../lib/api.js";

export default function SearchPanel({ onAdd, hasCurrentVideo = false }) {
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
      toast.error(error.response?.data?.message || "YouTube search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-3">
      <form className="flex gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-white outline-none transition focus:border-brand"
            placeholder="Search YouTube"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button disabled={loading}>{loading ? "..." : "Search"}</Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((video) => (
          <article key={video.videoId} className="overflow-hidden rounded-lg border border-zinc-800 bg-panel">
            <img className="aspect-video w-full object-cover" src={video.thumbnail} alt={video.title} loading="lazy" />
            <div className="space-y-3 p-3">
              <div>
                <h3 className="line-clamp-2 min-h-10 text-sm font-bold">{video.title}</h3>
                <p className="mt-1 truncate text-xs text-muted">{video.channelTitle}</p>
              </div>
              <Button className="w-full" variant="subtle" onClick={() => onAdd(video)}>
                <Plus size={16} /> {hasCurrentVideo ? "Add to queue" : "Play now"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
