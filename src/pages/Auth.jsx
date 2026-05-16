import { Eye, EyeOff, LogIn, Mail, UserPlus, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import Button from "../components/Button.jsx";
import CopyrightBadge from "../components/CopyrightBadge.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginWithEmail, registerWithEmail, signInWithGoogle } from "../lib/firebase.js";
import { getReadableFirebaseError } from "../utils/firebaseErrors.js";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await loginWithEmail(form.email.trim(), form.password);
        toast.success("Signed in.");
      } else {
        await registerWithEmail({
          name: form.name,
          email: form.email.trim(),
          password: form.password
        });
        toast.success("Account created.");
      }
      navigate("/");
    } catch (error) {
      toast.error(getReadableFirebaseError(error, "Could not authenticate."));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in.");
      navigate("/");
    } catch (error) {
      toast.error(getReadableFirebaseError(error, "Google sign-in failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-5 text-zinc-50 sm:px-6 lg:px-10">
      <nav className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-zinc-800/80 bg-panel/80 px-2.5 py-2.5 shadow-glow backdrop-blur sm:gap-3 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <BrandMark className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <div className="min-w-0">
            <p className="truncate text-xl font-black leading-6 tracking-normal sm:text-2xl sm:leading-7">Ystream</p>
            <p className="truncate text-xs leading-4 text-muted sm:text-sm sm:leading-5">Sign in to start watching together</p>
          </div>
        </div>
        <ThemeToggle />
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_27rem] lg:gap-8">
        <div className="space-y-4 text-center lg:text-left">
          <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-6xl xl:text-7xl">
            Ystream
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8 lg:mx-0">
            Sign in once, then create private synchronized YouTube rooms, queue videos, chat, and control playback across devices.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-panel p-4 shadow-glow sm:p-6">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-zinc-950 p-1">
            <button
              className={`h-10 rounded-md text-sm font-bold transition ${
                mode === "login"
                  ? "bg-gradient-to-r from-sky-300 to-brand text-zinc-950 shadow-[0_8px_22px_rgba(56,189,248,0.16)]"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`h-10 rounded-md text-sm font-bold transition ${
                mode === "signup"
                  ? "bg-gradient-to-r from-sky-300 to-brand text-zinc-950 shadow-[0_8px_22px_rgba(56,189,248,0.16)]"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <input
                className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-white outline-none transition focus:border-brand"
                placeholder="Display name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-white outline-none transition focus:border-brand"
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </div>
            <div className="relative">
              <input
                className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 pr-12 text-white outline-none transition focus:border-brand"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                onClick={() => setShowPassword((value) => !value)}
                title={showPassword ? "Hide password" : "Show password"}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button className="w-full" disabled={busy || loading} type="submit">
              {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {mode === "login" ? "Login" : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted">
            <span className="h-px flex-1 bg-zinc-800" />
            or
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="space-y-3">
            <Button className="w-full" disabled={busy || loading} variant="ghost" onClick={handleGoogle}>
              <UserRound size={18} /> Continue with Google
            </Button>
          </div>
        </div>
      </section>
      <CopyrightBadge />
    </main>
  );
}
