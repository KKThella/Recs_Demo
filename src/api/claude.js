// API base: set REACT_APP_API_URL in .env to point to a deployed proxy.
// Falls back to localhost for local dev.
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const DIRECT_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const descCache = new Map();

function getApiKey() {
  return process.env.REACT_APP_ANTHROPIC_API_KEY || window.__ANTHROPIC_KEY__;
}

// Use direct Anthropic API calls when running on a deployed static host (GitHub Pages)
// and no external proxy URL was configured.
function useDirectMode() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  return !isLocal && !process.env.REACT_APP_API_URL;
}

async function callDirectAPI(system, messages, maxTokens = 900) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No API key — please enter your Anthropic API key");
  const res = await fetch(DIRECT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages })
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

async function callProxy(payload) {
  const res = await fetch(`${API_BASE}/api/claude`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Proxy error ${res.status}`);
  const data = await res.json();
  return data.content;
}

async function callClaude(systemPrompt, userMessage, maxTokens = 900) {
  if (useDirectMode()) {
    return await callDirectAPI(systemPrompt, [{ role: "user", content: userMessage }], maxTokens);
  }
  return await callProxy({ system: systemPrompt, user: userMessage, maxTokens });
}

function sanitize(input) {
  return input.replace(/(\bignore\b|\bforget\b|\bsystem\b|\bprompt\b)/gi, "").slice(0, 300);
}

export function hasMedicalRisk(text) {
  return /\b(treat|cure|diagnose|prescription|medication|disease)\b/i.test(text);
}

export async function fetchRecs(profile, strategy = "hybrid") {
  const cacheKey = JSON.stringify({ profile, strategy });
  if (descCache.has(cacheKey)) return descCache.get(cacheKey);
  const system = `You are an iHerb supplement recommendation engine. Only recommend supplements and wellness products. Never diagnose, treat, or cure any condition. Respond ONLY with valid JSON, no markdown. Use ${strategy} filtering logic. Return: { "recs": [ { "name": string, "matchScore": number (0-100), "reason": string (1 sentence), "description": string (2 sentences personalized to the user profile), "confidence": number (0-100), "strategy": string } ] } with exactly 4 items.`;
  const user = `User profile: age ${profile.age}, goals: ${profile.goals}, diet: ${profile.diet}, restrictions: ${profile.restrictions || "none"}. Generate personalized recommendations.`;
  const raw = await callClaude(system, user, 900);
  const clean = raw.replace(/```json|```/g, "").trim();
  const result = JSON.parse(clean);
  descCache.set(cacheKey, result);
  return result;
}

export async function fetchConversational(messages) {
  const system = `You are a warm, knowledgeable wellness shopping guide for iHerb — a global health and wellness retailer with 100M+ customers. Your job is to understand what the user is trying to achieve and guide them to the right supplements through natural conversation.

CONVERSATION RULES:
- Ask ONE focused clarifying question per turn — never multiple at once
- After 2-3 exchanges (once you know their goal, any relevant health context, and dietary needs), surface 3 product recommendations
- Personalize every recommendation to what THIS specific user told you — never generic descriptions
- For any medications or medical conditions mentioned, include a brief safety note and suggest consulting a healthcare provider
- Never diagnose, treat, or prescribe
- Be warm, specific, and concise (3-5 sentences max per reply)
- After recommending, keep the conversation open — refine based on their feedback

RESPONSE FORMAT — respond with valid JSON only, no markdown fences:
{
  "reply": "your conversational message",
  "recs": null,
  "followUp": "a natural next question to deepen understanding, or null if you just recommended"
}

When ready to recommend (after enough context), set recs to an array:
"recs": [
  {
    "name": "Exact Product Name",
    "matchScore": 85,
    "reason": "1 sentence tied directly to what this user told you",
    "confidence": 80,
    "tag": "Best Match"
  }
]

Intent signals to gather before recommending: primary health goal, any conditions or medications, dietary restrictions, prior supplement experience.`;

  if (useDirectMode()) {
    const raw = await callDirectAPI(system, messages, 800);
    const clean = raw.replace(/```json|```/g, '').trim();
    try { return JSON.parse(clean); }
    catch { return { reply: raw, recs: null, followUp: null }; }
  }

  const res = await fetch(`${API_BASE}/api/claude`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages, maxTokens: 800 })
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const clean = data.content.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    return { reply: data.content, recs: null, followUp: null };
  }
}

export async function fetchChatRec(query, profile) {
  const safe = sanitize(query);
  const system = `You are a wellness product assistant for iHerb. Only discuss supplements. Never diagnose or prescribe. Be concise (max 3 sentences). If query is unsafe or off-topic, say so briefly.`;
  const user = `User (age ${profile.age}, goals: ${profile.goals}) asks: "${safe}". Reply with a helpful supplement suggestion and one sentence on why.`;
  return await callClaude(system, user, 350);
}
