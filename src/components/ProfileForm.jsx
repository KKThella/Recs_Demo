import React, { useState } from "react";

const goals = ["Energy", "Sleep", "Stress", "Immunity", "Joint Health", "Weight", "Digestion", "Focus"];

const PERSONAS = [
  { name: "45yo Athlete", desc: "Energy & joint recovery", age: "45", goals: "Energy, Joint Health, Stress", diet: "Omnivore", restrictions: "" },
  { name: "25yo Vegan", desc: "Immunity & digestion", age: "25", goals: "Immunity, Energy, Digestion", diet: "Vegan", restrictions: "" },
  { name: "60yo Active", desc: "Sleep & joint support", age: "60", goals: "Sleep, Joint Health, Stress", diet: "Omnivore", restrictions: "blood pressure meds" },
];

export default function ProfileForm({ onSubmit, loading }) {
  const [profile, setProfile] = useState({ age: "35", goals: "Energy, Sleep", diet: "Omnivore", restrictions: "" });
  const [selectedPersona, setSelectedPersona] = useState(null);

  const applyPersona = (persona, index) => {
    setSelectedPersona(index);
    setProfile({
      age: persona.age,
      goals: persona.goals,
      diet: persona.diet,
      restrictions: persona.restrictions
    });
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Your Health Profile</h2>
      <p className="form-sub">Try a preset persona or customize your own.</p>

      <div className="persona-row">
        {PERSONAS.map((persona, i) => (
          <button
            key={i}
            className={`persona-btn ${selectedPersona === i ? "persona-on" : ""}`}
            onClick={() => applyPersona(persona, i)}
          >
            <span className="persona-name">{persona.name}</span>
            <span className="persona-desc">{persona.desc}</span>
          </button>
        ))}
      </div>

      <div className="field">
        <label>Age</label>
        <input
          type="number"
          value={profile.age}
          min="18"
          max="90"
          onChange={e => {
            setProfile(p => ({ ...p, age: e.target.value }));
            setSelectedPersona(null);
          }}
        />
      </div>

      <div className="field">
        <label>Health Goals</label>
        <div className="chip-row">
          {goals.map(g => {
            const active = profile.goals.includes(g);
            return (
              <button
                key={g}
                className={`chip ${active ? "chip-on" : ""}`}
                onClick={() => {
                  setProfile(p => ({
                    ...p,
                    goals: active
                      ? p.goals.split(", ").filter(x => x !== g).join(", ")
                      : [...p.goals.split(", ").filter(Boolean), g].join(", ")
                  }));
                  setSelectedPersona(null);
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label>Diet</label>
        <select
          value={profile.diet}
          onChange={e => {
            setProfile(p => ({ ...p, diet: e.target.value }));
            setSelectedPersona(null);
          }}
        >
          {["Omnivore", "Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free"].map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Restrictions / Current Meds <span className="optional">(optional)</span></label>
        <input
          type="text"
          placeholder="e.g. blood thinners, pregnant"
          value={profile.restrictions}
          onChange={e => {
            setProfile(p => ({ ...p, restrictions: e.target.value }));
            setSelectedPersona(null);
          }}
        />
      </div>

      <button className="submit-btn" onClick={() => onSubmit(profile)} disabled={loading || !profile.goals}>
        {loading ? <span className="spinner" /> : "Get My Recommendations →"}
      </button>
    </div>
  );
}
