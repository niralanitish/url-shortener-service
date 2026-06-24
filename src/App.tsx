import React, { useState, useEffect } from "react";
import { 
  Link2, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UrlMapping } from "./types";

export default function App() {
  // Input fields and loading states
  const [originalUrl, setOriginalUrl] = useState("");
  const [errorInput, setErrorInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMapping, setSuccessMapping] = useState<UrlMapping | null>(null);

  // Database listing history state
  const [urlHistory, setUrlHistory] = useState<UrlMapping[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Copy tracking states for specific rows
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Backend Toggle Configuration
  // "local" uses our live local Express backend (Port 3000)
  // "custom" connects directly to user's Spring Boot deployed on Render/local
  const [apiMode, setApiMode] = useState<"local" | "custom">("local");
  const [customApiUrl, setCustomApiUrl] = useState("http://localhost:8080");

  // Determine active API Url
  const activeApiUrl = apiMode === "local" ? "" : customApiUrl;

  // Retrieve current shortened list from active backend on load or when API configuration changes
  const fetchUrlHistory = async () => {
    setIsFetchingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(`${activeApiUrl}/api/urls`);
      if (!response.ok) {
        throw new Error(`Failed to load history (HTTP ${response.status})`);
      }
      const data = await response.json();
      setUrlHistory(data);
    } catch (err: any) {
      console.error(err);
      setHistoryError(
        apiMode === "custom"
          ? `Could not reach your Spring Boot backend at ${customApiUrl}. Please ensure it is running and CORS is configured.`
          : "Could not retrieve link history."
      );
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchUrlHistory();
  }, [apiMode, customApiUrl]);

  // Form submit to shorten URLs
  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput(null);
    setSuccessMapping(null);

    // Initial validation
    if (!originalUrl.trim()) {
      setErrorInput("Please provide a valid URL destination");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${activeApiUrl}/api/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: originalUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setSuccessMapping(data);
      setOriginalUrl("");
      // Refresh history list
      fetchUrlHistory();
    } catch (err: any) {
      setErrorInput(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clipboard copy handler with cross-origin sandboxed standard fallback
  const copyToClipboard = (text: string, key: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopiedKey(key);
            setTimeout(() => {
              setCopiedKey(null);
            }, 2000);
          })
          .catch(() => {
            fallbackCopyText(text, key);
          });
      } else {
        fallbackCopyText(text, key);
      }
    } catch {
      fallbackCopyText(text, key);
    }
  };

  // Fallback copying function using document.execCommand
  const fallbackCopyText = (text: string, key: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // Prevent screen scrolling on selection jump
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (successful) {
        setCopiedKey(key);
        setTimeout(() => {
          setCopiedKey(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Fallback clipboard mechanism failed:", err);
    }
  };

  // Convert date format elegantly
  const formatDate = (isoString: string) => {
    if (!isoString) return "Just now";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-800">
      
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        
        {/* Navigation / Header */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SwiftLink</span>
          </div>
          <span className="text-xs text-slate-400 font-medium tracking-wide">Instant URL shortening</span>
        </nav>

        {/* Shortener Submission Hero Area */}
        <section className="flex flex-col items-center gap-8 py-8 md:py-12 text-center">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Shorten Your Connections
            </h1>
            <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto">
              Generate highly portable, secure, and compact links. Perfect for documents, social profiles, and presentations.
            </p>
          </div>
          
          <form onSubmit={handleShorten} className="w-full max-w-3xl">
            <div className="w-full bg-white p-2 border border-slate-200 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2">
              <div className="pl-4 pr-1 hidden md:block">
                <Link2 className="w-6 h-6 text-slate-300" />
              </div>
              <input
                type="text"
                placeholder="Paste your long URL here (e.g. https://github.com/alex-dev/project)..."
                value={originalUrl}
                onChange={(e) => {
                  setOriginalUrl(e.target.value);
                  if (errorInput) setErrorInput(null);
                }}
                disabled={isLoading}
                className="flex-1 w-full md:w-auto py-3.5 px-4 md:px-2 text-base md:text-lg outline-none bg-transparent placeholder-slate-400 text-slate-800"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Shortening...
                  </>
                ) : (
                  <>
                    Shorten URL
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {errorInput && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-rose-600 text-xs px-2 mt-3 font-medium justify-center"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorInput}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Show success panel when shortened URL is returned */}
          <AnimatePresence>
            {successMapping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl text-left p-5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm mt-4"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 w-full overflow-hidden">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Success</span>
                    <h4 className="text-sm font-bold text-slate-950 mt-1">Shortened link active</h4>
                    
                    <div className="mt-3 flex items-center justify-between bg-white border border-emerald-200/80 rounded-xl px-4 py-2.5 shadow-sm w-full overflow-hidden">
                      <span className="font-mono text-sm font-semibold text-emerald-800 truncate select-all">
                        {successMapping.shortUrl}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyToClipboard(successMapping.shortUrl, "success")}
                          className="text-slate-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Copy to clipboard"
                        >
                          {copiedKey === "success" ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={successMapping.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Open original link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate pt-2">
                      Original URL: <span className="font-mono">{successMapping.originalUrl}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Recent generated links table section (Centered and Full Width) */}
        <section className="w-full max-w-3xl mx-auto mt-12">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/75 border-b border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recently Shortened Links</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">({urlHistory.length} mappings)</span>
                <button 
                  onClick={fetchUrlHistory} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                  title="Refresh List"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingHistory ? 'animate-spin text-blue-500' : ''}`} />
                </button>
              </div>
            </div>

            {isFetchingHistory && urlHistory.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center">
                <span className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin inline-block"></span>
                <p className="text-xs font-medium">Synchronizing mappings database...</p>
              </div>
            ) : historyError ? (
              <div className="p-6 m-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 text-rose-800 text-xs text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Connection Sync Error</span>
                  <p className="mt-1 leading-relaxed opacity-90">{historyError}</p>
                </div>
              </div>
            ) : urlHistory.length === 0 ? (
              <div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-6">
                <Link2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">No shortened links found.</p>
                <p className="text-[11px] text-slate-400">Paste a long destination URL above to generate a shortened link.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-150">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Original Destination</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Short Link</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {urlHistory.map((row) => (
                      <tr key={row.shortKey} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-xs md:max-w-md">
                            <span className="text-sm font-semibold text-slate-800 truncate select-all" title={row.originalUrl}>
                              {row.originalUrl}
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5">
                              Created {formatDate(row.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-blue-600 font-semibold select-all mb-0">
                          <div className="flex items-center gap-1.5">
                            <span>{row.shortKey}</span>
                            <a
                              href={row.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-300 hover:text-blue-700 transition-colors"
                              title="Visit redirection link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => copyToClipboard(row.shortUrl, row.shortKey)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border cursor-pointer transition-all ${
                              copiedKey === row.shortKey
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            {copiedKey === row.shortKey ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                COPIED
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                COPY
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Clean Consumer Footer */}
      <footer className="mt-24 border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} SwiftLink. All rights reserved.</p>
      </footer>
    </div>
  );
}
