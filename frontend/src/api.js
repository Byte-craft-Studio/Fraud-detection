const MOCK_RESULTS = [
  {
    verdict: "scam",
    confidence: 0.92,
    reasons: [
      "Asks for your M-Pesa PIN",
      "Urgency language: 'act now or account suspended'",
      "Sender doesn't match official Safaricom shortcodes",
    ],
  },
  {
    verdict: "suspicious",
    confidence: 0.58,
    reasons: [
      "Unknown sender number",
      "Contains a shortened link",
      "Requests a reply with personal details",
    ],
  },
  {
    verdict: "safe",
    confidence: 0.95,
    reasons: [
      "No requests for money, PINs, or codes",
      "Sender matches a known contact pattern",
      "No urgency or threat language detected",
    ],
  },
];

function pickMockResult(message) {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 31 + message.charCodeAt(i)) >>> 0;
  }
  return MOCK_RESULTS[hash % MOCK_RESULTS.length];
}

export async function scanMessage(message) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (!message.trim()) throw new Error("empty_message");
  return pickMockResult(message);

  // REAL IMPLEMENTATION — swap in once the AI pair has an endpoint:
  // const res = await fetch("http://localhost:8000/scan", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ message }),
  // });
  // if (!res.ok) throw new Error("scan_failed");
  // return res.json();
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
