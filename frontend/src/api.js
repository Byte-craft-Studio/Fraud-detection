const getBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // If running in local web development (e.g. localhost or local IP for testing)
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '172.32.117.194') {
    // You can toggle this back to local IP if testing backend locally, 
    // or point it directly to Render for cloud testing.
    return 'https://fraud-detection-api-cbnq.onrender.com';
  }
  
  // Default fallback for Capacitor native app & production web
  return 'https://fraud-detection-api-cbnq.onrender.com';
};

const API_BASE = getBaseUrl();

export async function scanMessage(message) {
  const res = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    if (res.status === 503) throw new Error("model_not_loaded");
    throw new Error("scan_failed");
  }
  return res.json();
}

export async function scanTransaction(transactionData) {
  const res = await fetch(`${API_BASE}/scan-transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transactionData),
  });
  if (!res.ok) {
    if (res.status === 503) throw new Error("model_not_loaded");
    throw new Error("scan_failed");
  }
  return res.json();
}

export async function submitFeedback(entry) {
  const log = JSON.parse(localStorage.getItem("feedback_log") || "[]");
  log.unshift({ ...entry, timestamp: new Date().toISOString() });
  localStorage.setItem("feedback_log", JSON.stringify(log.slice(0, 50)));
  return true;
}

export function getFeedbackLog() {
  return JSON.parse(localStorage.getItem("feedback_log") || "[]");
}

export function recordScan(result) {
  const stats = JSON.parse(
    localStorage.getItem("scan_stats") || '{"total":0,"scam":0,"suspicious":0,"safe":0}'
  );
  stats.total += 1;
  stats[result.verdict] = (stats[result.verdict] || 0) + 1;
  localStorage.setItem("scan_stats", JSON.stringify(stats));
  return stats;
}

export function getStats() {
  const stats = JSON.parse(
    localStorage.getItem("scan_stats") || '{"total":0,"scam":0,"suspicious":0,"safe":0}'
  );
  const feedback = getFeedbackLog();
  const correct = feedback.filter((f) => f.predicted === f.actual).length;
  const accuracy = feedback.length > 0 ? Math.round((correct / feedback.length) * 100) : null;
  return { ...stats, accuracy, corrections: feedback.length };
}