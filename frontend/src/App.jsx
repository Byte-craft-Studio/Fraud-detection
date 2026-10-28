import { useState, useEffect } from "react";
import {
  ShieldCheck, ShieldAlert, ShieldX, Send, ThumbsUp, ThumbsDown,
  History, ArrowLeft, ClipboardList, Activity, Smartphone, CreditCard,
} from "lucide-react";
import { scanMessage, scanTransaction, submitFeedback, getFeedbackLog, recordScan, getStats } from "./api";

const VERDICT_COPY = {
  safe: { label: "Looks safe", sub: "No major red flags found", color: "text-safe", bg: "bg-safe-dim", bar: "bg-safe", Icon: ShieldCheck },
  suspicious: { label: "Suspicious", sub: "Proceed with caution", color: "text-suspicious", bg: "bg-suspicious-dim", bar: "bg-suspicious", Icon: ShieldAlert },
  scam: { label: "Likely scam", sub: "Don't click, reply, or share info", color: "text-scam", bg: "bg-scam-dim", bar: "bg-scam", Icon: ShieldX },
};

const LOADING_MESSAGES = ["Analyzing patterns...", "Checking mathematical rules...", "Cross-checking known indicators...", "Almost done..."];

function Header({ onShowLog, logCount, onBack, showBack }) {
  return (
    <header className="safe-top flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-ink/95 backdrop-blur z-10">
      <div className="flex items-center gap-2.5">
        {showBack ? (
          <button onClick={onBack} className="w-7 h-7 -ml-1 flex items-center justify-center rounded-full text-muted hover:text-paper hover:bg-surface transition-colors" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-safe-dim flex items-center justify-center">
            <ShieldCheck size={16} className="text-safe" />
          </div>
        )}
        <span className="font-semibold text-paper tracking-tight">Fraud Shield</span>
      </div>
      <button onClick={onShowLog} className="flex items-center gap-1.5 text-sm text-muted hover:text-paper transition-colors">
        <History size={15} />
        <span className="font-mono text-xs">{logCount}</span>
      </button>
    </header>
  );
}

function StatsStrip({ stats }) {
  if (stats.total === 0) return null;
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-surface/60 border border-line text-xs font-mono text-muted overflow-x-auto">
      <div className="flex items-center gap-1.5 text-safe shrink-0">
        <Activity size={12} />
        <span>live</span>
      </div>
      <span className="shrink-0">{stats.total} checked</span>
      <span className="shrink-0 text-scam">{stats.scam || 0} scams caught</span>
      {stats.accuracy !== null && (
        <span className="shrink-0">{stats.accuracy}% confirmed accurate</span>
      )}
    </div>
  );
}

function ModeSelector({ mode, setMode }) {
  return (
    <div className="flex bg-surface p-1 rounded-xl border border-line mb-4">
      <button
        onClick={() => setMode("sms")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
          mode === "sms" ? "bg-paper text-ink shadow" : "text-muted hover:text-paper"
        }`}
      >
        <Smartphone size={14} />
        SMS Message
      </button>
      <button
        onClick={() => setMode("transaction")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
          mode === "transaction" ? "bg-paper text-ink shadow" : "text-muted hover:text-paper"
        }`}
      >
        <CreditCard size={14} />
        M-Pesa Transaction
      </button>
    </div>
  );
}

function InputScreen({ message, setMessage, onScan, error, stats, mode, setMode }) {
  return (
    <div className="px-5 py-6 flex flex-col gap-5 animate-enter">
      <StatsStrip stats={stats} />
      <ModeSelector mode={mode} setMode={setMode} />
      
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-14 h-14 rounded-2xl bg-safe-dim flex items-center justify-center">
          <ShieldCheck size={28} className="text-safe" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-paper">Check a message</h1>
          <p className="text-sm text-muted mt-1 leading-relaxed max-w-[280px]">
            Paste a text, WhatsApp, or email message. We'll tell you if it looks like a scam and why.
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-surface border border-line overflow-hidden focus-within:border-safe/40 focus-within:ring-2 focus-within:ring-safe/20 transition-all">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the message here..."
          rows={7}
          className="w-full bg-transparent text-paper placeholder:text-muted/60 p-4 text-[15px] leading-relaxed focus:outline-none resize-none"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 px-1">
          <ShieldAlert size={14} className="text-scam shrink-0" />
          <p className="text-sm text-scam">{error === "empty_message" ? "Paste a message first." : "Couldn't analyze that message. Try again."}</p>
        </div>
      )}
      <button
        onClick={onScan}
        disabled={!message.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-paper text-ink font-semibold py-3.5 text-[15px] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-black/20"
      >
        <Send size={16} />
        Check this message
      </button>
    </div>
  );
}

function TransactionScreen({ onScanTransaction, error, stats, mode, setMode }) {
  const [formData, setFormData] = useState({
    amount: "",
    old_bal_org: "",
    new_bal_org: "",
    old_bal_dest: "0",
    new_bal_dest: "0",
    tx_type: "PAYMENT",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onScanTransaction({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      old_bal_org: parseFloat(formData.old_bal_org) || 0,
      new_bal_org: parseFloat(formData.new_bal_org) || 0,
      old_bal_dest: parseFloat(formData.old_bal_dest) || 0,
      new_bal_dest: parseFloat(formData.new_bal_dest) || 0,
    });
  };

  return (
    <div className="px-5 py-6 flex flex-col gap-5 animate-enter">
      <StatsStrip stats={stats} />
      <ModeSelector mode={mode} setMode={setMode} />

      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-14 h-14 rounded-2xl bg-safe-dim flex items-center justify-center">
          <ShieldCheck size={28} className="text-safe" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-paper">Verify M-Pesa Transaction</h1>
          <p className="text-sm text-muted mt-1 leading-relaxed max-w-[280px]">
            Check structured transaction parameters for mathematical inconsistencies or fraud patterns.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted mb-1 block">Transaction Type</label>
          <select
            value={formData.tx_type}
            onChange={(e) => setFormData({ ...formData, tx_type: e.target.value })}
            className="w-full bg-surface border border-line text-paper rounded-xl p-3 text-sm focus:outline-none focus:border-safe/40"
          >
            <option value="PAYMENT">PAYMENT</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="CASH_OUT">CASH_OUT</option>
            <option value="CASH_IN">CASH_IN</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted mb-1 block">Amount (KES)</label>
          <input
            type="number"
            placeholder="e.g. 5000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full bg-surface border border-line text-paper placeholder:text-muted/60 rounded-xl p-3 text-sm focus:outline-none focus:border-safe/40 font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-muted mb-1 block">Old Balance (Origin)</label>
            <input
              type="number"
              placeholder="e.g. 10250"
              value={formData.old_bal_org}
              onChange={(e) => setFormData({ ...formData, old_bal_org: e.target.value })}
              className="w-full bg-surface border border-line text-paper placeholder:text-muted/60 rounded-xl p-3 text-sm focus:outline-none focus:border-safe/40 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-muted mb-1 block">New Balance (Origin)</label>
            <input
              type="number"
              placeholder="e.g. 5250"
              value={formData.new_bal_org}
              onChange={(e) => setFormData({ ...formData, new_bal_org: e.target.value })}
              className="w-full bg-surface border border-line text-paper placeholder:text-muted/60 rounded-xl p-3 text-sm focus:outline-none focus:border-safe/40 font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-1">
            <ShieldAlert size={14} className="text-scam shrink-0" />
            <p className="text-sm text-scam">Couldn't verify transaction. Check backend connection.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!formData.amount}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-paper text-ink font-semibold py-3.5 text-[15px] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-black/20"
        >
          Verify Transaction
        </button>
      </form>
    </div>
  );
}

function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="px-5 py-24 flex flex-col items-center gap-5 animate-enter">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-line flex items-center justify-center animate-pulse-soft">
        <ShieldCheck size={30} className="text-muted" />
      </div>
      <p className="text-sm text-muted font-mono transition-all">{LOADING_MESSAGES[msgIndex]}</p>
    </div>
  );
}

function ResultScreen({ labelTitle, result, onNewScan, onFeedback, feedbackGiven }) {
  const copy = VERDICT_COPY[result.verdict] || VERDICT_COPY.safe;
  const confidencePct = Math.round((result.confidence || 0.95) * 100);
  const { Icon } = copy;
  return (
    <div className="flex flex-col animate-enter">
      <div className={`${copy.bg} px-5 pt-8 pb-7 border-b border-line flex flex-col items-center text-center gap-3`}>
        <div className="animate-pop"><Icon size={44} className={copy.color} strokeWidth={1.75} /></div>
        <div>
          <h2 className={`text-2xl font-bold ${copy.color}`}>{copy.label}</h2>
          <p className="text-sm text-muted mt-0.5">{copy.sub}</p>
        </div>
        <div className="flex items-center gap-2 w-full max-w-[220px] mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-black/25 overflow-hidden">
            <div className={`h-full rounded-full ${copy.bar} transition-all duration-500`} style={{ width: `${confidencePct}%` }} />
          </div>
          <span className={`text-xs font-mono ${copy.color}`}>{confidencePct}%</span>
        </div>
      </div>
      <div className="px-5 py-6 flex flex-col gap-5">
        <div className="rounded-xl bg-surface border border-line p-4">
          <p className="text-xs font-mono uppercase tracking-wide text-muted mb-2">analyzed target</p>
          <p className="text-sm text-paper/80 leading-relaxed line-clamp-3">{labelTitle}</p>
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wide text-muted mb-2.5">why</p>
          <ul className="flex flex-col gap-2.5">
            {(result.reasons || ["Evaluated against fraud detection rules."]).map((reason, i) => (
              <li key={i} className="flex gap-3 text-sm text-paper/90 leading-relaxed bg-surface/60 rounded-lg border border-line px-3.5 py-2.5">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full ${copy.bar} shrink-0`} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-xs font-mono uppercase tracking-wide text-muted mb-3">was this right?</p>
          {feedbackGiven ? (
            <div className="flex items-center gap-2 text-sm text-safe"><ShieldCheck size={15} />Thanks — logged.</div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => onFeedback(result.verdict)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm text-paper hover:border-safe/50 hover:text-safe hover:bg-safe-dim/40 transition-colors">
                <ThumbsUp size={14} />Right
              </button>
              <button onClick={() => onFeedback(result.verdict === "scam" ? "safe" : "scam")} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm text-paper hover:border-scam/50 hover:text-scam hover:bg-scam-dim/40 transition-colors">
                <ThumbsDown size={14} />Wrong
              </button>
            </div>
          )}
        </div>
        <button onClick={onNewScan} className="w-full rounded-xl bg-surface border border-line text-paper font-medium py-3 hover:bg-surface-raised active:scale-[0.98] transition-all">
          Check another
        </button>
      </div>
    </div>
  );
}

function FeedbackLog({ log }) {
  return (
    <div className="px-5 py-6 flex flex-col gap-4 animate-enter">
      <h2 className="text-lg font-semibold text-paper flex items-center gap-2">
        <ClipboardList size={18} className="text-muted" />Corrections
      </h2>
      {log.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-12">
          <History size={28} className="text-muted/50" />
          <p className="text-sm text-muted max-w-[220px]">No corrections yet. They'll show up here as people flag wrong verdicts.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {log.map((entry, i) => (
            <li key={i} className="rounded-xl bg-surface border border-line p-3.5">
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
  const [mode, setMode] = useState("sms");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [log, setLog] = useState(getFeedbackLog());
  const [stats, setStats] = useState(getStats());

  async function handleScanMessage() {
    setError(null);
    setView("loading");
    try {
      const res = await scanMessage(message);
      recordScan(res);
      setStats(getStats());
      setResult(res);
      setFeedbackGiven(false);
      setView("result");
    } catch (err) {
      setError(err.message);
      setView("input");
    }
  }

  async function handleScanTransaction(transactionData) {
    setError(null);
    setView("loading");
    try {
      const res = await scanTransaction(transactionData);
      recordScan(res);
      setStats(getStats());
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
    await submitFeedback({ message: message || "M-Pesa Transaction Verification", predicted: result.verdict, actual: actualVerdict });
    setLog(getFeedbackLog());
    setStats(getStats());
    setFeedbackGiven(true);
  }

  return (
    <div className="min-h-screen bg-ink flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-ink flex flex-col">
        <Header onShowLog={() => setView("log")} logCount={log.length} showBack={view === "log"} onBack={() => setView(result ? "result" : "input")} />
        <div className="flex-1 safe-bottom">
          {view === "input" && mode === "sms" && (
            <InputScreen message={message} setMessage={setMessage} onScan={handleScanMessage} error={error} stats={stats} mode={mode} setMode={setMode} />
          )}
          {view === "input" && mode === "transaction" && (
            <TransactionScreen onScanTransaction={handleScanTransaction} error={error} stats={stats} mode={mode} setMode={setMode} />
          )}
          {view === "loading" && <LoadingScreen />}
          {view === "result" && result && (
            <ResultScreen labelTitle={message || "Transaction Verification"} result={result} onNewScan={handleNewScan} onFeedback={handleFeedback} feedbackGiven={feedbackGiven} />
          )}
          {view === "log" && <FeedbackLog log={log} />}
        </div>
      </div>
    </div>
  );
}