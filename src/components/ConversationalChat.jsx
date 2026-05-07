import React, { useState, useEffect, useRef } from "react";
import { fetchConversational } from "../api/claude";

const OPENER = {
  role: "assistant",
  content: null,
  parsed: {
    reply: "Hi! I'm your iHerb wellness guide. I'll help you find the right supplements for your goals — no forms needed, just a quick conversation. What health goal brings you here today?",
    recs: null,
    followUp: null
  }
};

export default function ConversationalChat({ onRecsUpdate }) {
  const [messages, setMessages] = useState([OPENER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shopList, setShopList] = useState([]);
  const [listAdded, setListAdded] = useState({});
  const bottomRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      // Build API messages — Claude API requires first message to be from "user"
      // Skip any leading assistant messages (e.g. the OPENER greeting)
      const allMapped = nextMessages
        .filter(m => m.role === "user" || (m.role === "assistant" && m.parsed))
        .map(m => ({
          role: m.role,
          content: m.role === "assistant" ? m.parsed.reply : m.content
        }));
      const firstUserIdx = allMapped.findIndex(m => m.role === "user");
      const apiMessages = firstUserIdx >= 0 ? allMapped.slice(firstUserIdx) : allMapped;

      const parsed = await fetchConversational(apiMessages);
      const assistantMsg = { role: "assistant", content: null, parsed };
      setMessages(prev => [...prev, assistantMsg]);

      // If recs surfaced, push to parent
      if (parsed.recs && parsed.recs.length > 0) {
        onRecsUpdate(parsed.recs);
      }
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const addToList = (rec) => {
    if (listAdded[rec.name]) return;
    setShopList(prev => [...prev, rec]);
    setListAdded(prev => ({ ...prev, [rec.name]: true }));
  };

  const reset = () => {
    setMessages([OPENER]);
    setInput("");
    setError("");
    setShopList([]);
    setListAdded({});
    onRecsUpdate(null);
  };

  const renderRecs = (recs) => (
    <div className="conv-recs">
      <p className="conv-recs-label">✦ Recommendations for you</p>
      {recs.map((rec, i) => (
        <div key={i} className="conv-rec-card">
          <div className="conv-rec-top">
            <div className="conv-rec-info">
              <span className="conv-rec-name">{rec.name}</span>
              {rec.tag && <span className="conv-rec-tag">{rec.tag}</span>}
            </div>
            <div className="conv-rec-score">{rec.matchScore}%</div>
          </div>
          <p className="conv-rec-reason">{rec.reason}</p>
          <button
            className={`conv-add-btn ${listAdded[rec.name] ? "added" : ""}`}
            onClick={() => addToList(rec)}
          >
            {listAdded[rec.name] ? "✓ Added" : "+ Add to list"}
          </button>
        </div>
      ))}
      <p className="conv-panel-note">↑ Rec panel updated with these results</p>
    </div>
  );

  return (
    <div className="conv-container">
      {/* Chat area */}
      <div className="conv-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`conv-row conv-row-${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="conv-avatar">iH</div>
            )}
            <div className={`conv-bubble conv-bubble-${msg.role}`}>
              <p>{msg.role === "assistant" ? msg.parsed.reply : msg.content}</p>
              {msg.role === "assistant" && msg.parsed.recs && renderRecs(msg.parsed.recs)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="conv-row conv-row-assistant">
            <div className="conv-avatar">iH</div>
            <div className="conv-bubble conv-bubble-assistant conv-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {error && <p className="conv-error">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="conv-input-row">
        <input
          className="conv-input"
          value={input}
          placeholder="Type your response..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button className="conv-send" onClick={send} disabled={loading || !input.trim()}>
          {loading ? <span className="spinner" /> : "→"}
        </button>
        <button className="conv-reset" onClick={reset} title="Start over">↺</button>
      </div>

      {/* Shopping list */}
      {shopList.length > 0 && (
        <div className="conv-shoplist">
          <p className="conv-shoplist-title">🛒 Your List ({shopList.length})</p>
          {shopList.map((item, i) => (
            <div key={i} className="conv-shoplist-item">
              <span className="conv-shoplist-dot">•</span>
              <span>{item.name}</span>
              <span className="conv-shoplist-score">{item.matchScore}% match</span>
            </div>
          ))}
          <p className="conv-shoplist-note">In production: one-click add to iHerb cart or Autoship subscription</p>
        </div>
      )}
    </div>
  );
}
