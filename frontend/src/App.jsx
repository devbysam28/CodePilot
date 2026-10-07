import { useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const starterCode = `def divide(a, b):
    return a / b

password = "admin123"

print(divide(10, 0))`;

const severityStyles = {
  CRITICAL: "border-red-500/30 bg-red-500/10 text-red-300",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  MEDIUM: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  LOW: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

function App() {
  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState("python");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const issueCounts = useMemo(() => {
    const counts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    result?.issues?.forEach((issue) => {
      if (counts[issue.severity] !== undefined) {
        counts[issue.severity]++;
      }
    });

    return counts;
  }, [result]);

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          repository_url: repositoryUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Review failed.");
      }

      setResult(data);

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to CodePilot. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyReview = async () => {
    if (!result) return;

    const text = `
CodePilot AI Code Review

Score: ${result.score}/100

Summary:
${result.summary}

Strengths:
${result.strengths.map((item) => `- ${item}`).join("\n")}

Issues:
${result.issues
  .map(
    (issue) =>
      `[${issue.severity}] ${issue.title}
Category: ${issue.category}
Problem: ${issue.problem}
Why it matters: ${issue.why_it_matters}
Suggested fix: ${issue.suggested_fix}`
  )
  .join("\n\n")}

Recommendations:
${result.recommendations.map((item) => `- ${item}`).join("\n")}
`.trim();

    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReview = () => {
    if (!result) return;

    const text = `
CodePilot AI Code Review
========================

Score: ${result.score}/100

SUMMARY
${result.summary}

STRENGTHS
${result.strengths.map((item) => `- ${item}`).join("\n")}

ISSUES
${result.issues
  .map(
    (issue) =>
      `[${issue.severity}] ${issue.title}
Category: ${issue.category}
Problem: ${issue.problem}
Why it matters: ${issue.why_it_matters}
Suggested fix: ${issue.suggested_fix}`
  )
  .join("\n\n")}

RECOMMENDATIONS
${result.recommendations.map((item) => `- ${item}`).join("\n")}
`.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "codepilot-review.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-[-300px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
              <span className="text-lg font-black">C</span>
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">CodePilot</h1>
              <p className="text-xs text-slate-500">AI Code Review</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#review" className="transition hover:text-white">
              Review
            </a>
            <a href="#results" className="transition hover:text-white">
              Results
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pb-16 pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Powered by Gemini AI
          </div>

          <h2 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Ship better code.
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Faster.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            CodePilot analyzes your source code with AI to uncover bugs,
            security vulnerabilities, performance issues and code smells before
            they reach production.
          </p>

          <a
            href="#review"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Start reviewing
            <span>↓</span>
          </a>
        </div>
      </section>

      {/* Review */}
      <main id="review" className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-5 sm:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-bold">Review your code</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Paste a file or snippet and let CodePilot find the problems.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                ● AI analysis ready
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px]">
            {/* Editor */}
            <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-green-400/80" />
                  <span className="ml-3 font-mono text-xs text-slate-500">
                    code.{language === "javascript" ? "js" : language}
                  </span>
                </div>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-400"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="go">Go</option>
                  <option value="php">PHP</option>
                </select>
              </div>

              <div className="flex min-h-[430px]">
                <div className="hidden w-12 select-none border-r border-white/5 bg-black/10 py-5 text-right font-mono text-xs leading-6 text-slate-700 sm:block">
                  {code.split("\n").map((_, index) => (
                    <div key={index} className="pr-3">
                      {index + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                  className="min-h-[430px] w-full resize-none bg-transparent p-5 font-mono text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-700"
                  placeholder="Paste your code here..."
                />
              </div>
            </div>

            {/* Settings */}
            <div className="bg-black/10 p-6">
              <h4 className="font-semibold">Repository</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Optional GitHub repository URL for additional context.
              </p>

              <input
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="mt-4 w-full rounded-xl border border-white/10 bg-[#080c19] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60"
              />

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  What CodePilot checks
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-400">
                  {[
                    "Security vulnerabilities",
                    "Bugs & reliability",
                    "Performance problems",
                    "Code quality & smells",
                    "Maintainability",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={analyzeCode}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.01] hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing code..." : "Analyze Code →"}
              </button>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Results */}
      {result && (
        <section
          id="results"
          className="relative z-10 mx-auto max-w-7xl scroll-mt-10 px-6 pb-24"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                Analysis complete
              </p>
              <h2 className="mt-2 text-3xl font-bold">Review results</h2>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyReview}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10"
              >
                {copied ? "✓ Copied" : "Copy review"}
              </button>

              <button
                onClick={downloadReview}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Download
              </button>
            </div>
          </div>

          {/* Score + Summary */}
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-8">
              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#6366f1 ${result.score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#080c19]">
                  <span className="text-4xl font-black">{result.score}</span>
                  <span className="text-xs text-slate-500">out of 100</span>
                </div>
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-300">
                Code quality score
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <h3 className="text-lg font-bold">Executive summary</h3>
              <p className="mt-4 leading-7 text-slate-400">{result.summary}</p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(issueCounts).map(([severity, count]) => (
                  <div
                    key={severity}
                    className={`rounded-2xl border p-4 ${severityStyles[severity]}`}
                  >
                    <p className="text-xs font-medium opacity-70">{severity}</p>
                    <p className="mt-1 text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <h3 className="text-lg font-bold">What looks good</h3>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {result.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm leading-6 text-slate-300"
                >
                  <span className="text-emerald-400">✓</span>
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          <div className="mt-6">
            <div className="mb-5">
              <h3 className="text-lg font-bold">Issues found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Problems ranked by severity and impact.
              </p>
            </div>

            <div className="space-y-4">
              {result.issues.length === 0 ? (
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
                  <div className="text-3xl">✓</div>
                  <h4 className="mt-3 font-bold">No issues detected</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    CodePilot didn't identify any significant problems.
                  </p>
                </div>
              ) : (
                result.issues.map((issue, index) => (
                  <article
                    key={index}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${severityStyles[issue.severity] || severityStyles.LOW}`}
                          >
                            {issue.severity}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
                            {issue.category}
                          </span>
                        </div>

                        <h4 className="mt-3 text-lg font-bold">
                          {issue.title}
                        </h4>
                      </div>

                      <span className="text-xs text-slate-600">
                        Issue #{index + 1}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Problem
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {issue.problem}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Why it matters
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {issue.why_it_matters}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Suggested fix
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {issue.suggested_fix}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-7">
            <h3 className="text-lg font-bold">Recommended next steps</h3>

            <div className="mt-5 space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-xl border border-white/5 bg-black/10 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-300">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-6 text-slate-300">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-slate-600 sm:flex-row">
          <span>© 2026 CodePilot</span>
          <span>AI-powered code quality analysis</span>
        </div>
      </footer>
    </div>
  );
}

export default App;