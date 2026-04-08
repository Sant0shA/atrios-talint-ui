// ─── WEIGHT SLIDERS ───────────────────────────────────────────────────────────
// WeightSliders     — 3-factor (used in SimilarPanel)
// ProjectWeightSliders — 4-factor number inputs (used in ProjectDetailPage)

import { C, S, fontH, fontB, font, DEFAULT_WEIGHTS, DEFAULT_PROJECT_WEIGHTS } from "../constants";
import Icon from "./Icon";

// ─── 3-FACTOR SLIDER ─────────────────────────────────────────────────────────

export function WeightSliders({ weights, onChange }) {
  const sliderConfig = [
    { key: "vector",     label: "Talint",     color: C.primary, icon: "psychology"   },
    { key: "skill",      label: "Skills",     color: C.success, icon: "construction" },
    { key: "experience", label: "Experience", color: C.similar, icon: "timeline"     },
  ];

  const handleChange = (key, rawVal) => {
    const val = Math.max(0, Math.min(100, parseInt(rawVal) || 0));
    const others = sliderConfig.map(s => s.key).filter(k => k !== key);
    const remaining = 100 - val;
    const currentOtherTotal = others.reduce((s, k) => s + weights[k], 0);
    let updated = { ...weights, [key]: val };
    if (currentOtherTotal === 0) {
      updated[others[0]] = Math.floor(remaining / 2);
      updated[others[1]] = remaining - updated[others[0]];
    } else {
      others.forEach(k => {
        updated[k] = Math.round((weights[k] / currentOtherTotal) * remaining);
      });
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      if (total !== 100) updated[others[1]] += (100 - total);
    }
    onChange(updated);
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const isDefault = weights.vector === DEFAULT_WEIGHTS.vector &&
    weights.skill === DEFAULT_WEIGHTS.skill &&
    weights.experience === DEFAULT_WEIGHTS.experience;

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px", marginTop: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon n="tune" size={14} color={C.muted} />
          <span style={{ ...S.label, marginBottom: 0 }}>Scoring Weights</span>
          <span style={{ fontSize: "10px", color: C.muted, backgroundColor: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "6px", padding: "1px 8px", fontFamily: font }}>
            tal·{weights.vector}% + skill·{weights.skill}% + exp·{weights.experience}%
          </span>
        </div>
        {!isDefault && (
          <button onClick={() => onChange({ ...DEFAULT_WEIGHTS })}
            style={{ fontSize: "11px", color: C.muted, background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "2px 6px",
              borderRadius: "6px", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            <Icon n="restart_alt" size={13} />Reset
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {sliderConfig.map(({ key, label, color, icon }) => (
          <div key={key} style={{ flex: "1", minWidth: "160px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n={icon} size={12} color={color} />
                <span style={{ fontSize: "11px", fontWeight: "600", color: C.textMid }}>{label}</span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color, fontFamily: font }}>{weights[key]}%</span>
            </div>
            <div style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: "4px",
                borderRadius: "4px", backgroundColor: C.border }} />
              <div style={{ position: "absolute", left: 0, height: "4px", borderRadius: "4px",
                backgroundColor: color, opacity: 0.35, width: `${weights[key]}%`, transition: "width 0.15s" }} />
              <input type="range" min="0" max="100" value={weights[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{ position: "relative", width: "100%", appearance: "none",
                  WebkitAppearance: "none", background: "transparent", cursor: "pointer",
                  height: "20px", margin: 0, accentColor: color }} />
            </div>
          </div>
        ))}
      </div>
      {total !== 100 && (
        <div style={{ fontSize: "11px", color: C.error, marginTop: "6px",
          display: "flex", alignItems: "center", gap: "4px" }}>
          <Icon n="warning" size={12} color={C.error} />
          Weights must sum to 100% (currently {total}%)
        </div>
      )}
    </div>
  );
}

// ─── 4-FACTOR NUMBER INPUTS ───────────────────────────────────────────────────

export function ProjectWeightSliders({ weights, onChange }) {
  const inputConfig = [
    { key: "skill",      label: "Skills",     color: C.success, icon: "construction" },
    { key: "vector",     label: "Semantic",   color: C.primary, icon: "psychology"   },
    { key: "experience", label: "Experience", color: C.similar, icon: "timeline"     },
    { key: "domain",     label: "Domain",     color: C.info,    icon: "domain"       },
  ];

  const total     = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid   = total === 100;
  const isDefault = JSON.stringify(weights) === JSON.stringify(DEFAULT_PROJECT_WEIGHTS);

  const handleChange = (key, raw) => {
    const val = Math.max(0, Math.min(100, parseInt(raw) || 0));
    onChange({ ...weights, [key]: val });
  };

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px", marginTop: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <Icon n="tune" size={14} color={C.muted} />
          <span style={{ ...S.label, marginBottom: 0 }}>Scoring Weights</span>
          <span style={{
            fontSize: "10px", color: isValid ? C.muted : C.error,
            backgroundColor: isValid ? C.surface : C.errorLight,
            border: `1px solid ${isValid ? C.border : "rgba(224,92,92,0.3)"}`,
            borderRadius: "6px", padding: "1px 8px", fontFamily: font,
            fontWeight: isValid ? "400" : "700", transition: "all 0.2s",
          }}>
            {isValid
              ? `skill·${weights.skill}% + sem·${weights.vector}% + exp·${weights.experience}% + dom·${weights.domain}%`
              : `sum = ${total}% — must equal 100%`}
          </span>
        </div>
        {!isDefault && (
          <button onClick={() => onChange({ ...DEFAULT_PROJECT_WEIGHTS })}
            style={{ fontSize: "11px", color: C.muted, background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
              padding: "2px 6px", borderRadius: "6px", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            <Icon n="restart_alt" size={13} />Reset
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {inputConfig.map(({ key, label, color, icon }) => (
          <div key={key} style={{ flex: "1", minWidth: "100px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
              <Icon n={icon} size={12} color={color} />
              <span style={{ fontSize: "11px", fontWeight: "600", color: C.textMid }}>{label}</span>
            </div>
            <div style={{ position: "relative" }}>
              <input type="number" min="0" max="100" value={weights[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{
                  ...S.input, fontFamily: font, fontSize: "18px", fontWeight: "700",
                  color, textAlign: "center", paddingRight: "22px",
                  border: `1.5px solid ${weights[key] === 0 ? C.border : `${color}55`}`,
                  backgroundColor: weights[key] === 0 ? C.surface : `${color}08`,
                  transition: "all 0.15s",
                }} />
              <span style={{ position: "absolute", right: "8px", top: "50%",
                transform: "translateY(-50%)", fontSize: "11px", fontWeight: "700",
                color, opacity: 0.6, pointerEvents: "none" }}>%</span>
            </div>
            <div style={{ height: "3px", borderRadius: "3px", backgroundColor: C.border,
              marginTop: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "3px", backgroundColor: color,
                width: `${weights[key]}%`, transition: "width 0.2s ease",
                opacity: weights[key] === 0 ? 0 : 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px", fontSize: "11px", color: C.muted,
        display: "flex", alignItems: "center", gap: "5px" }}>
        <Icon n="info" size={12} color={C.muted} />
        Set any param to 0 to remove it · all four must add up to 100
      </div>

      {!isValid && (
        <div style={{ marginTop: "8px", padding: "8px 12px", borderRadius: "8px",
          backgroundColor: C.errorLight, border: `1px solid rgba(224,92,92,0.25)`,
          fontSize: "12px", fontWeight: "600", color: C.error,
          display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon n="warning" size={14} color={C.error} />
          Weights must sum to 100% · currently {total}% · adjust any field to balance
        </div>
      )}
    </div>
  );
}
