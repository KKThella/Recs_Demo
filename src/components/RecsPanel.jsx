import React, { useState } from "react";
import { hasMedialRisk } from "../api/claude";

const strategies = ["hybrid", "content-based", "collaborative"];

export default function RecsPanel({
  recs,
  loading,
  strategy,
  onStrategyChange,
  feedbackData,
  onFeedback,
  compareMode,
  onCompareToggle,
  compareRecs
}) {
  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="recs-panel">
      <div className="skeleton-header" />
      {[1,2,3,4].map(i => <div key={i} className="skeleton-card" style={{ animationDelay: `${i*0.1}s` }} />)}
    </div>
  );

  if (!recs) return null;

  const renderRecsList = (recsList, showFeedback = true) => (
    <div className="recs-list">
      {recsList.map((rec, i) => (
        <div key={i} className={`rec-card ${expanded === i ? "rec-expanded" : ""}`}
          onClick={() => setExpanded(expanded === i ? null : i)}>
          <div className="rec-top">
            <div className="rec-rank">#{i + 1}</div>
            <div className="rec-info">
              <p className="rec-name">{rec.name}</p>
              <p className="rec-reason">{rec.reason}</p>
            </div>
            <div className="rec-score-wrap">
              <div className="rec-score">
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" strokeWidth="3"
                    strokeDasharray={`${rec.matchScore * 0.942} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)"/>
                </svg>
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
              {showFeedback && (
                <div className="feedback-row">
                  <span className="feedback-label">Was this helpful?</span>
                  <button
                    className={`fb-btn up ${feedbackData[rec.name] === 'up' ? 'voted' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onFeedback(rec.name, 'up'); }}
                  >
                    👍
                  </button>
                  <button
                    className={`fb-btn down ${feedbackData[rec.name] === 'down' ? 'voted' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onFeedback(rec.name, 'down'); }}
                  >
                    👎
                  </button>
                  {feedbackData[rec.name] && <span className="feedback-thanks">Thanks!</span>}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderFeedbackSummary = () => {
    const rated = recs.filter(r => feedbackData[r.name]);
    if (rated.length === 0) return null;

    const upCount = rated.filter(r => feedbackData[r.name] === 'up').length;

    return (
      <div className="fb-summary">
        <p className="fb-sum-title">Feedback Signal — {rated.length}/{recs.length} rated · {upCount} 👍 · {rated.length - upCount} 👎</p>
        {rated.map(r => {
          const isUp = feedbackData[r.name] === 'up';
          return (
            <div key={r.name} className="fb-bar-row">
              <span className="fb-bar-label">{r.name}</span>
              <div className="fb-bar-wrap">
                <div className="fb-bar-fill" style={{ width: isUp ? '100%' : '20%', background: isUp ? 'var(--accent)' : 'var(--danger)' }}></div>
              </div>
              <span className="fb-bar-val">{isUp ? '👍' : '👎'}</span>
            </div>
          );
        })}
        <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '8px', fontStyle: 'italic' }}>
          In production, this signal reranks future recommendations for this user profile.
        </p>
      </div>
    );
  };

  const renderCompareView = () => (
    <div className="compare-view">
      <p style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '12px', fontStyle: 'italic' }}>
        Same profile, 3 algorithms — notice how strategy affects which products surface and how they're ranked.
      </p>
      <div className="compare-grid">
        {strategies.map(s => (
          <div key={s} className="compare-col">
            <div className="compare-col-title">{s}</div>
            {(compareRecs[s] || []).map((r, i) => (
              <div key={i} className="compare-item">
                <span className="c-rank">#{i + 1}</span>
                <div>
                  <div className="c-name">{r.name}</div>
                  <div className="c-score">{r.matchScore}% match</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '10px', fontStyle: 'italic' }}>
        In an A/B test, I'd measure which strategy drives the highest add-to-cart lift over 2 weeks.
      </p>
    </div>
  );

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

      <div className="compare-toggle">
        <span className="compare-label">Compare all 3 strategies side-by-side</span>
        <label className="toggle-wrap">
          <input type="checkbox" checked={compareMode} onChange={onCompareToggle} />
          <div className="t-track"></div>
          <div className="t-thumb"></div>
        </label>
      </div>

      {compareMode ? renderCompareView() : renderRecsList(recs)}
      {!compareMode && renderFeedbackSummary()}
    </div>
  );
}
