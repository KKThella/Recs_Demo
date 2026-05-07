import React, { useState } from "react";
import ProfileForm from "./components/ProfileForm";
import RecsPanel from "./components/RecsPanel";
import ChatSearch from "./components/ChatSearch";
import ConversationalChat from "./components/ConversationalChat";
import PMNarrative from "./components/PMNarrative";
import { fetchRecs, fetchChatRec } from "./api/claude";
import "./App.css";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [keySet, setKeySet] = useState(!!process.env.REACT_APP_ANTHROPIC_API_KEY);
  const [mode, setMode] = useState("conversational"); // "profile" | "conversational"
  const [profile, setProfile] = useState(null);
  const [recs, setRecs] = useState(null);
  const [strategy, setStrategy] = useState("hybrid");
  const [recsLoading, setRecsLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatReply, setChatReply] = useState("");
  const [error, setError] = useState("");
  const [feedbackData, setFeedbackData] = useState({});
  const [compareMode, setCompareMode] = useState(false);
  const [compareRecs, setCompareRecs] = useState({});

  const handleKeySet = () => {
    if (!apiKey.trim()) return;
    window.__ANTHROPIC_KEY__ = apiKey.trim();
    setKeySet(true);
  };

  const handleProfile = async (p) => {
    setProfile(p);
    setRecsLoading(true);
    setError("");
    try {
      const data = await fetchRecs(p, strategy);
      setRecs(data.recs);
    } catch (e) {
      setError("Failed to fetch recommendations. Check your API key.");
    } finally {
      setRecsLoading(false);
    }
  };

  const handleStrategy = async (s) => {
    if (!profile) return;
    setStrategy(s);
    setRecsLoading(true);
    setError("");
    try {
      const data = await fetchRecs(profile, s);
      setRecs(data.recs);
    } catch (e) {
      setError("Strategy switch failed.");
    } finally {
      setRecsLoading(false);
    }
  };

  const handleChat = async (query) => {
    if (!profile) return;
    setChatLoading(true);
    setError("");
    try {
      const reply = await fetchChatRec(query, profile);
      setChatReply(reply);
      const chatProfile = { ...profile, goals: `${profile.goals}, ${query}` };
      const data = await fetchRecs(chatProfile, strategy);
      setRecs(data.recs);
    } catch (e) {
      setError("Chat failed. Try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleConvRecs = (convRecs) => {
    if (!convRecs) { setRecs(null); return; }
    // Map conversational recs to the panel format
    const mapped = convRecs.map(r => ({
      name: r.name,
      matchScore: r.matchScore,
      reason: r.reason,
      description: r.reason,
      confidence: r.confidence,
      strategy: "conversational"
    }));
    setRecs(mapped);
  };

  const handleFeedback = (recName, vote) => {
    setFeedbackData(prev => ({ ...prev, [recName]: vote }));
  };

  const handleCompareToggle = async () => {
    const newCompareMode = !compareMode;
    setCompareMode(newCompareMode);
    if (newCompareMode && profile) {
      setRecsLoading(true);
      setError("");
      try {
        const strategies = ["hybrid", "content-based", "collaborative"];
        const results = {};
        await Promise.all(strategies.map(async (s) => {
          try {
            const data = await fetchRecs(profile, s);
            results[s] = data.recs;
          } catch (e) {
            results[s] = [];
          }
        }));
        setCompareRecs(results);
      } catch (e) {
        setError("Failed to fetch comparison data.");
      } finally {
        setRecsLoading(false);
      }
    }
  };

  if (!keySet) return (
    <div className="app key-screen">
      <div className="key-card">
        <div className="logo">iHerb <span>AI Recs</span></div>
        <h1>Enter your Anthropic API Key</h1>
        <p>Your key is never stored — session only. Or set <code>REACT_APP_ANTHROPIC_API_KEY</code> in <code>.env</code></p>
        <div className="key-row">
          <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleKeySet()} />
          <button onClick={handleKeySet}>Start →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">iHerb <span>AI Recs</span></div>
        <p className="header-sub">Personalized supplement discovery · Powered by generative AI</p>
      </header>

      {/* Mode toggle */}
      <div className="mode-bar">
        <button
          className={`mode-btn ${mode === "conversational" ? "mode-on" : ""}`}
          onClick={() => setMode("conversational")}
        >
          💬 Conversational Shopping
          {mode === "conversational" && <span className="mode-badge">NEW</span>}
        </button>
        <button
          className={`mode-btn ${mode === "profile" ? "mode-on" : ""}`}
          onClick={() => setMode("profile")}
        >
          📋 Profile Mode
        </button>
        <span className="mode-hint">
          {mode === "conversational"
            ? "AI guides you through discovery — no forms needed"
            : "Fill your profile for instant recommendations"}
        </span>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      <main className="app-grid">
        <div className="col-left">
          {mode === "conversational" ? (
            <ConversationalChat onRecsUpdate={handleConvRecs} />
          ) : (
            <>
              <ProfileForm onSubmit={handleProfile} loading={recsLoading} />
              <ChatSearch onChat={handleChat} loading={chatLoading} lastReply={chatReply} />
            </>
          )}
        </div>
        <div className="col-right">
          <RecsPanel
            recs={recs}
            loading={recsLoading}
            strategy={strategy}
            onStrategyChange={handleStrategy}
            feedbackData={feedbackData}
            onFeedback={handleFeedback}
            compareMode={compareMode}
            onCompareToggle={handleCompareToggle}
            compareRecs={compareRecs}
            conversationalMode={mode === "conversational"}
          />
          {(recs || recsLoading) && <PMNarrative />}
        </div>
      </main>
    </div>
  );
}
