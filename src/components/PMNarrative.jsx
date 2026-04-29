import React, { useState } from "react";

const kpis = [
  { label: "Primary KPI", value: "Rec CTR", detail: "Click-through on recommended products — direct signal of relevance" },
  { label: "Secondary KPI", value: "Add-to-Cart Lift", detail: "% increase vs. non-personalized baseline — conversion impact" },
  { label: "Guardrail Metric", value: "Disclaimer Trigger Rate", detail: "If >5% of responses trigger medical flags, tighten the system prompt" },
  { label: "Quality Gate", value: "Confidence Floor ≥50%", detail: "Recs below 50% confidence are suppressed — not shown to users" },
];

const abTest = {
  hypothesis: "Hybrid filtering will outperform content-based by ≥10% on Add-to-Cart rate",
  control: "Content-based filtering (current baseline)",
  variant: "Hybrid filtering (collab + content)",
  duration: "2 weeks, 50/50 split",
  successCriteria: "p<0.05, ≥10% lift in add-to-cart",
};

const nextSteps = [
  "Vector DB integration — move from prompt-based to embedding similarity for recs",
  "Real-time signals — incorporate live browsing session into rec context",
  "Multi-locale personalization — adapt description tone/focus by region",
  "Feedback loop — thumbs up/down on recs feeds reranking model",
];

export default function PMNarrative() {
  const [tab, setTab] = useState("kpis");

  return (
    <div className="pm-panel">
      <div className="pm-header">
        <h2 className="panel-title">Product Thinking</h2>
        <p className="form-sub">How I'd measure, test, and evolve this in production.</p>
      </div>

      <div className="pm-tabs">
        {["kpis", "a/b test", "roadmap"].map(t => (
          <button key={t} className={`pm-tab ${tab === t ? "pm-tab-on" : ""}`} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab === "kpis" && (
        <div className="pm-content">
          {kpis.map((k, i) => (
            <div key={i} className="pm-row">
              <span className="pm-label">{k.label}</span>
              <div>
                <p className="pm-value">{k.value}</p>
                <p className="pm-detail">{k.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "a/b test" && (
        <div className="pm-content">
          <div className="pm-row"><span className="pm-label">Hypothesis</span><p className="pm-value">{abTest.hypothesis}</p></div>
          <div className="pm-row"><span className="pm-label">Control</span><p className="pm-detail">{abTest.control}</p></div>
          <div className="pm-row"><span className="pm-label">Variant</span><p className="pm-detail">{abTest.variant}</p></div>
          <div className="pm-row"><span className="pm-label">Duration</span><p className="pm-detail">{abTest.duration}</p></div>
          <div className="pm-row"><span className="pm-label">Success</span><p className="pm-detail">{abTest.successCriteria}</p></div>
        </div>
      )}

      {tab === "roadmap" && (
        <div className="pm-content">
          {nextSteps.map((s, i) => (
            <div key={i} className="pm-row">
              <span className="pm-label">V{i + 2}</span>
              <p className="pm-detail">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
