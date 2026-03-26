import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  onClose: () => void;
}

type Tab = "signin" | "signup";

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (tab === "signin") {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-slate-800 p-5 shadow-2xl sm:p-8">
        <div className="mb-6 flex rounded-xl bg-slate-700 p-1">
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === "signin" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
            }`}
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              tab === "signup" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
            }`}
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Username</label>
            <input
              className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-600 focus:ring-indigo-500"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {tab === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
              <input
                type="email"
                className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-600 focus:ring-indigo-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Password</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-600 focus:ring-indigo-500"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {submitting ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          {tab === "signin" ? (
            <>
              No account?{" "}
              <button className="text-indigo-400 hover:underline" onClick={() => setTab("signup")} type="button">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="text-indigo-400 hover:underline" onClick={() => setTab("signin")} type="button">
                Sign in
              </button>
            </>
          )}
        </p>

        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-slate-500 hover:text-white"
          aria-label="Close"
        >
          x
        </button>
      </div>
    </div>
  );
}
