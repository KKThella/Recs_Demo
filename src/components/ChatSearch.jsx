import React, { useState } from "react";

export default function ChatSearch({ onChat, loading, lastReply }) {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim() || loading) return;
    onChat(input);
    setInput("");
  };

  return (
    <div className="chat-panel">
      <h2 className="panel-title">Ask Anything</h2>
      <p className="form-sub">e.g. "What's good for joint pain if I take blood thinners?"</p>

      <div className="chat-input-row">
        <input className="chat-input" value={input} placeholder="Ask about a supplement, goal, or concern..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()} />
        <button className="chat-send" onClick={send} disabled={loading || !input.trim()}>
          {loading ? <span className="spinner" /> : "→"}
        </button>
      </div>

      {lastReply && (
        <div className="chat-reply">
          <span className="chat-badge">AI Response</span>
          <p>{lastReply}</p>
          <p className="chat-note">↑ Recs panel updated to reflect this query.</p>
        </div>
      )}
    </div>
  );
}
