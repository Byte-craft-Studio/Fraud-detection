import { useState } from "react";
import { scanMessage, submitFeedback, getFeedbackLog } from "./api";

const VERDICT_COPY = {
  safe: { label: "Looks safe", color: "text-safe", bg: "bg-safe-dim", bar: "bg-safe" },
  suspicious: { label: "Suspicious", color: "text-suspicious", bg: "bg-suspicious-dim", bar: "bg-suspicious" },
  scam: { label: "Likely scam", color: "text-scam", bg: "bg-scam-dim", bar: "bg-scam" },
};

function Header({ onShowLog, logCount }) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-line">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-safe" />
        <span className="font-semibold text-paper tracking-tight">Fraud Shield</span>
      </div>
      <button onClick={onShowLog} className="text-sm text-muted hover:text-paper transition-colors font-mono">
        corrections ({logCount})
      </button>
    </header>
  );
}

function InputScreen({ message, setMessage, onScan, error }) {
  return (
    <div className="px-5 py-8 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-paper">Check a message</h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          Paste a text, WhatsApp, or email message below. We'll tell you if it looks like a scam and why.
        </p>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste the message here..."
        rows={7}
        className="w-full rounded-lg bg-surface border border-line text-paper placeholder:text-muted/60 p-4 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-safe/40 focus:border-safe/40 resize-none"
      />
      {error && (
        <p className="text-sm text-scam font-mono">
          {error === "empty_message" ? "Paste a message first." : "Couldn't analyze that message. Try again."}
        </p>
      )}
      <button
        onClick={onScan}
        disabled={!message.trim()}
        className="w-full rounded-lg bg-paper text-ink font-semibold py-3.5 text-[15px] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99] transition-all"
      >
        Check this message
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="px-5 py-20 flex flex-col items-center gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-line border-t-paper animate-spin" />
      <p className="text-sm text-muted font-mono">analyzing message...</p>
    </div>
  );
}

function ResultScreen({ message, result, onNewScan, onFeedback, feedbackGiven }) {
  const copy = VERDICT_COPY[result.verdict];
  const confidencePct = Math.round(result.confidence * 100);
  return (
    <div className="flex flex-col">
      <div className={`${copy.bg} px-5 py-8 border-b border-line`}>
        <p className={`text-xs font-mono uppercase tracking-wide ${copy.color} opacity-80`}>verdict</p>
        <h2 className={`text-3xl font-bold mt-1 ${copy.color}`}>{copy.label}</h2>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-1.5 rounded-full bg-black/20 overflow-hidden">
            <div className={`h-full rounded-full ${copy.bar}`} style={{ width: `${confidencePct}%` }} />
          </div>
          <span className={`text-sm font-mono ${copy.color}`}>{confidencePct}%</span>
        </div>
      </div>
      <div className="px-5 py-6 flex flex-col gap-5">
        <div className="rounded-lg bg-surface border border-line p-4">
          <p className="text-xs font-mono uppercase tracking-wide text-muted mb-2">message checked</p>
          <p className="text-sm text-paper/80 leading-relaxed line-clamp-3">{message}</p>
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wide text-muted mb-2">why</p>
          <ul className="flex flex-col gap-2">
            {result.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-paper/90 leading-relaxed">
                <span className={`mt-1.5 w-1 h-1 rounded-full ${copy.bar} shrink-0`} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-xs font-mono uppercase tracking-wide text-muted mb-3">was this right?</p>
          {feedbackGiven ? (
            <p className="text-sm text-safe">Thanks — logged.</p>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => onFeedback(result.verdict)} className="flex-1 rounded-lg border border-line py-2.5 text-sm text-paper hover:border-safe/50 hover:text-safe transition-colors">
                This was right
              </button>
              <button onClick={() => onFeedback(result.verdict === "scam" ? "safe" : "scam")} className="flex-1 rounded-lg border border-line py-2.5 text-sm text-paper hover:border-scam/50 hover:text-scam transition-colors">
                This was wrong
              </button>
            </div>
          )}
        </div>
        <button onClick={onNewScan} className="w-full rounded-lg bg-surface border border-line text-paper font-medium py-3 hover:bg-surface-raised transition-colors">
          Check another message
        </button>
      </div>
    </div>
  );
}

function FeedbackLog({ log, onBack }) {
  return (
    <div className="px-5 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-paper">Corrections</h2>
        <button onClick={onBack} className="text-sm text-muted hover:text-paper">back</button>
      </div>
      {log.length === 0 ? (
        <p className="text-sm text-muted">No corrections yet. They'll show up here as people flag wrong verdicts.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {log.map((entry, i) => (
            <li key={i} className="rounded-lg bg-surface border border-line p-3.5">
              <p className="text-sm text-paper/80 leading-relaxed line-clamp-2">{entry.message}</p>
              <p className="text-xs font-mono text-muted mt-2">predicted {entry.predicted} → actually {entry.actual}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("input");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [log, setLog] = useState(getFeedbackLog());

  async function handleScan() {
    setError(null);
    setView("loading");
    try {
      const res = await scanMessage(message);
      setResult(res);
      setFeedbackGiven(false);
      setView("result");
    } catch (err) {
      setError(err.message);
      setView("input");
    }
  }

  function handleNewScan() {
    setMessage("");
    setResult(null);
    setView("input");
  }

  async function handleFeedback(actualVerdict) {
    await submitFeedback({ message, predicted: result.verdict, actual: actualVerdict });
    setLog(getFeedbackLog());
    setFeedbackGiven(true);
  }

  return (
    <div className="min-h-screen bg-ink flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-ink">
        <Header onShowLog={() => setView("log")} logCount={log.length} />
        {view === "input" && <InputScreen message={message} setMessage={setMessage} onScan={handleScan} error={error} />}
        {view === "loading" && <LoadingScreen />}
        {view === "result" && result && (
          <ResultScreen message={message} result={result} onNewScan={handleNewScan} onFeedback={handleFeedback} feedbackGiven={feedbackGiven} />
        )}
        {view === "log" && <FeedbackLog log={log} onBack={() => setView(result ? "result" : "input")} />}
      </div>
    </div>
  );
}
