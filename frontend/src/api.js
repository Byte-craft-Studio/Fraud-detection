export async function scanMessage(message) {
  const res = await fetch("http://localhost:8000/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("scan_failed");
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
