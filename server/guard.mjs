export const MAX_BODY_BYTES = 32_000;
export const MAX_MESSAGE_CHARS = 4_000;
export const SYNTHETIC_TICKET = Object.freeze({
  ticket_id: "WL-1026",
  customer: "Maarten",
  message: "I was charged twice. I need this fixed today or I will file a complaint.",
});

export function isAllowedOrigin(origin = "") {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1"].includes(url.hostname) && ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateChatRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request must be a JSON object.");
  if (value.mode !== "demo" && value.mode !== "live") throw new Error("mode must be demo or live.");
  if (typeof value.message !== "string" || !value.message.trim()) throw new Error("message must be a non-empty string.");
  if (value.message.length > MAX_MESSAGE_CHARS) throw new Error(`message exceeds ${MAX_MESSAGE_CHARS} characters.`);
  const ticket = value.ticket;
  if (!ticket || ticket.ticket_id !== SYNTHETIC_TICKET.ticket_id || ticket.customer !== SYNTHETIC_TICKET.customer || ticket.message !== SYNTHETIC_TICKET.message) {
    throw new Error("Only the supplied synthetic WL-1026 ticket is accepted.");
  }
  return { mode: value.mode, message: value.message.trim(), ticket };
}

export function validateDecision(value, ticket = SYNTHETIC_TICKET) {
  const fields = ["ticket_id", "priority", "sentiment", "recommended_action", "summary", "customer_reply", "risk_note", "draft_only", "human_approval_required"];
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).sort().join() !== fields.slice().sort().join()) throw new Error("Claude must return exactly the support-triage decision fields.");
  if (value.ticket_id !== ticket.ticket_id) throw new Error("Claude returned a conflicting ticket_id.");
  if (!["low", "medium", "high"].includes(value.priority)) throw new Error("Claude returned an unknown priority.");
  if (!["neutral", "frustrated", "angry"].includes(value.sentiment)) throw new Error("Claude returned an unknown sentiment.");
  if (value.recommended_action !== { low: "auto_reply", medium: "investigate", high: "escalate" }[value.priority]) throw new Error("Claude returned a priority/action conflict.");
  for (const field of ["summary", "customer_reply", "risk_note"]) if (typeof value[field] !== "string" || !value[field].trim()) throw new Error(`${field} must be a non-empty string.`);
  if (value.draft_only !== true || value.human_approval_required !== true) throw new Error("Claude response must remain draft-only and require human approval.");
  return value;
}
