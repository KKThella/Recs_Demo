import React, { useState } from "react";
import { hasMedialRisk } from "../api/claude";

const strategies = ["hybrid", "content-based", "collaborative"];

export default function RecsPanel({ recs, loading, strategy, onStrategyChange }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="recs-panel">
      <div className="skeleton-header" />
      {[1,2,3,4].map(i => <div key={i} className="skeleton-card" style={{ animationDelay: `${i*0.1}s` }} />)}
    </div>
  );

  if (!recs) return null;

  return (
    <div className="recs-panel">
      <div className="recs-header">
        <h2 className="panel-title">Your Recommendations</h2>
        <div className="strategy-toggle">
          {strategies.map(s => (
            <button key={s} className={`strat-btn ${strategy === s ? "strat-on" : ""}`}
              onClick={() => onStrategyChange(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <p className="strategy-note">
        {strategy === "hybrid" && "Combining your profile attributes + behavior patterns from similar users."}
        {strategy === "content-based" && "Matching purely on your stated goals, diet, and restrictions."}
        {strategy === "collaborative" && "Based on users with similar profiles and purchase history."}
      </p>

      <div className="recs-list">
        {recs.map((rec, i) => (
          <div key={i} className={`rec-card ${expanded === i ? "rec-expanded" : ""}`}
            onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="rec-top">
              <div className="rec-rank">#{i + 1}</div>
              <div className="rec-info">
                <p className="rec-name">{rec.name}</p>
                <p className="rec-reason">{rec.reason}</p>
              </div>
              <div className="rec-score-wrap">
                <div className="rec-score" style={{ "--score": rec.matchScore }}>
                  <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/><circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray={`${rec.matchScore * 0.942} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)"/></svg>
                  <span>{rec.matchScore}%</span>
                </div>
              </div>
            </div>

            {expanded === i && (
              <div className="rec-detail">
                <p className="rec-desc">{rec.description}</p>
                {hasMedialRisk(rec.description) && (
                  <p className="disclaimer">⚠ Consult a healthcare provider before use.</p>
                )}
                <div className="rec-meta">
                  <span className="meta-tag">Confidence: {rec.confidence}%</span>
                  <span className="meta-tag">Strategy: {rec.strategy || strategy}</span>
                  {rec.confidence < 50 && <span className="meta-tag low-conf">Low confidence</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
