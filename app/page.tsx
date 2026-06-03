"use client";

import { useState } from "react";

interface RoastResult {
  roast: string;

  profile: {
    name: string;
    username: string;
    followers: number;
    publicRepos: number;
    accountAge: number;
  };
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (!result) return;
    const text = `My GitHub Performance Review by an AI Senior Engineer\n\n${result.roast}\n\n— gitroast.dev`;
    navigator.clipboard.writeText(text);
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white font-mono">
      {/* Header */}
      <div className="border-b border-[#30363d] px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <span className="text-xl font-bold text-white">GitRoast</span>
        <span className="text-[#8b949e] text-sm ml-2 hidden sm:block">
          Your GitHub, reviewed by a senior engineer who hates everything
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Get your GitHub{" "}
            <span className="text-[#f85149]">roasted</span>
          </h1>
          <p className="text-[#8b949e] text-lg">
            Enter any GitHub username. Get a brutally honest performance review
            based on your actual repos, commit messages, and code history.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-12">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="github-username"
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-8 pr-4 py-3 text-white placeholder-[#484f58] focus:outline-none focus:border-[#388bfd] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="bg-[#f85149] hover:bg-[#da3633] disabled:bg-[#6e7681] disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? "Roasting..." : "Roast Me"}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="border border-[#30363d] rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <p className="text-[#8b949e]">
              Reading your commits... preparing the verdict...
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-[#f85149] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border border-[#f85149] bg-[#f8514918] rounded-lg p-4 text-[#f85149]">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="border border-[#30363d] rounded-lg overflow-hidden">
            {/* Review Header */}
            <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8b949e] mb-1 tracking-widest">
                  ANNUAL PERFORMANCE REVIEW — CONFIDENTIAL
                </div>
                <div className="font-bold text-white">
                  {result.profile.name}{" "}
                  <span className="text-[#8b949e] font-normal">
                    @{result.profile.username}
                  </span>
                </div>
                <div className="text-xs text-[#484f58] mt-1">
                  {result.profile.publicRepos} repos ·{" "}
                  {result.profile.followers} followers ·{" "}
                  {result.profile.accountAge}y on GitHub
                </div>
              </div>
              <div className="text-4xl">📋</div>
            </div>

            {/* Review Body */}
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-[#c9d1d9] leading-relaxed font-mono">
                {result.roast}
              </pre>
            </div>

            {/* Actions */}
            <div className="border-t border-[#30363d] px-6 py-4 flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 border border-[#30363d] hover:border-[#8b949e] text-[#8b949e] hover:text-white py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Copy for LinkedIn
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setUsername("");
                }}
                className="border border-[#30363d] hover:border-[#8b949e] text-[#8b949e] hover:text-white py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Roast someone else
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="border-t border-[#30363d] py-6 text-center text-[#484f58] text-xs">
        GitRoast · Powered by Claude AI · Open Source on GitHub
      </div>
    </main>
  );
}
