import React, { useState } from "react";

const goals = ["Energy", "Sleep", "Stress", "Immunity", "Joint Health", "Weight", "Digestion", "Focus"];

export default function ProfileForm({ onSubmit, loading }) {
  const [profile, setProfile] = useState({ age: "35", goals: "Energy, Sleep", diet: "Omnivore", restrictions: "" });

  return (
    <div className="form-card">
      <h2 className="form-title">Your Health Profile</h2>
      <p className="form-sub">Personalized to you — not a generic list.</p>

      <div className="field">
        <label>Age</label>
        <input type="number" value={profile.age} min="18" max="90"
          onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} />
      </div>

      <div className="field">
        <label>Health Goals</label>
        <div className="chip-row">
          {goals.map(g => {
            const active = profile.goals.includes(g);
            return (
              <button key={g} className={`chip ${active ? "chip-on" : ""}`}
                onClick={() => setProfile(p => ({
                  ...p,
                  goals: active ? p.goals.split(", ").filter(x => x !== g).join(", ")
                           : [...p.goals.split(", ").filter(Boolean), g].join(", ")
                }))}>
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label>Diet</label>
        <select value={profile.diet} onChange={e => setProfile(p => ({ ...p, diet: e.target.value }))}>
          {["Omnivore", "Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free"].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Restrictions / Current Meds <span className="optional">(optional)</span></label>
        <input type="text" placeholder="e.g. blood thinners, pregnant"
          value={profile.restrictions}
          onChange={e => setProfile(p => ({ ...p, restrictions: e.target.value }))} />
      </div>

      <button className="submit-btn" onClick={() => onSubmit(profile)} disabled={loading || !profile.goals}>
        {loading ? <span className="spinner" /> : "Get My Recommendations →"}
      </button>
    </div>
  );
}
