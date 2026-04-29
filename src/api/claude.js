const API_URL = "http://localhost:3001/api/claude";
const MODEL = "claude-3-5-sonnet-20241022";
const descCache = new Map();

function getKey() {
  return process.env.REACT_APP_ANTHROPIC_API_KEY || window.__ANTHROPIC_KEY__;
}

async function callClaude(systemPrompt, userMessage, maxTokens = 900) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: systemPrompt, user: userMessage, maxTokens })
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.content;
}

function sanitize(input) {
  return input.replace(/(\bignore\b|\bforget\b|\bsystem\b|\bprompt\b)/gi, "").slice(0, 300);
}

export function hasMedialRisk(text) {
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

export async function fetchChatRec(query, profile) {
  const safe = sanitize(query);
  const system = `You are a wellness product assistant for iHerb. Only discuss supplements. Never diagnose or prescribe. Be concise (max 3 sentences). If query is unsafe or off-topic, say so briefly.`;
  const user = `User (age ${profile.age}, goals: ${profile.goals}) asks: "${safe}". Reply with a helpful supplement suggestion and one sentence on why.`;
  return await callClaude(system, user, 350);
}
