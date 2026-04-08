// ─── QUALITY COMPONENTS ───────────────────────────────────────────────────────
// QualitySplitButton, QualityBadge, MatchPillWithTooltip

import { useState, useEffect, useRef } from "react";
import { C, fontH, fontB } from "../constants";
import { domainTierLabel } from "../utils";
import Icon from "../components/Icon";

// ─── QUALITY SPLIT BUTTON ─────────────────────────────────────────────────────

export function QualitySplitButton({ running, onScore, label, color, borderColor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnColor  = color       || C.muted;
  const btnBorder = borderColor || C.border;

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <button
        style={{ fontSize: "12px", color: running ? C.muted : btnColor,
          borderColor: btnBorder, borderRight: "none", borderRadius: "10px 0 0 10px",
          opacity: running ? 0.5 : 1, gap: "5px",
          padding: "6px 13px", cursor: "pointer", fontWeight: "600", fontFamily: fontB,
          transition: "all 0.15s", border: `1px solid ${btnBorder}`,
          backgroundColor: "transparent", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}
        onClick={() => { if (!running) { onScore("new"); setOpen(false); } }}
        disabled={running}
        title="Score only unscored candidates"
      >
        <Icon n="verified" size={13} color={running ? C.muted : btnColor} />
        {running ? "Scoring…" : label}
        <span style={{ fontSize: "9px", fontWeight: "700",
          backgroundColor: running ? C.surface : `${btnColor}18`,
          color: running ? C.muted : btnColor,
          padding: "1px 5px", borderRadius: "4px", marginLeft: "2px" }}>NEW</span>
      </button>
      <button
        style={{ padding: "6px 7px", borderRadius: "0 10px 10px 0",
          borderLeft: `1px solid ${btnBorder}`, color: running ? C.muted : btnColor,
          border: `1px solid ${btnBorder}`, opacity: running ? 0.5 : 1, minWidth: "unset",
          backgroundColor: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
        onClick={(e) => { e.stopPropagation(); if (!running) setOpen(o => !o); }}
        disabled={running}
      >
        <Icon n={open ? "expand_less" : "expand_more"} size={14} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0,
          backgroundColor: C.white, border: `1px solid ${C.border}`,
          borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          minWidth: "180px", zIndex: 300, overflow: "hidden" }}>
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px",
              padding: "10px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: "12px", color: C.textMid, fontFamily: fontB, textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            onClick={() => { onScore("new"); setOpen(false); }}>
            <Icon n="fiber_new" size={15} color={C.primary} />
            <div>
              <div style={{ fontWeight: "700", color: C.text }}>New only</div>
              <div style={{ fontSize: "11px", color: C.muted }}>Score unscored candidates only</div>
            </div>
          </button>
          <div style={{ height: "1px", backgroundColor: C.border }} />
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px",
              padding: "10px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: "12px", color: C.textMid, fontFamily: fontB, textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            onClick={() => { onScore("all"); setOpen(false); }}>
            <Icon n="refresh" size={15} color={C.warning} />
            <div>
              <div style={{ fontWeight: "700", color: C.text }}>Re-score all</div>
              <div style={{ fontSize: "11px", color: C.muted }}>Overwrite existing scores</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── QUALITY BADGE ────────────────────────────────────────────────────────────

export function QualityBadge({ label, score, rationale }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const cfg = {
    "Strong fit":   { text: "#3B6D11", bg: "#EAF3DE" },
    "Probable fit": { text: "#854F0B", bg: "#FAEEDA" },
    "Weak fit":     { text: "#A32D2D", bg: "#FCEBEB" },
  };
  const c = cfg[label] || { text: C.muted, bg: C.surface };

  const showTooltip = () => {
    if (!ref.current || score == null) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
  };

  return (
    <div style={{ display: "inline-block" }} ref={ref}>
      <span
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPos(null)}
        style={{ display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 999,
          fontSize: 11, fontWeight: 600, cursor: "default",
          background: c.bg, color: c.text, fontFamily: fontB, whiteSpace: "nowrap" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text, flexShrink: 0 }} />
        {label}
      </span>
      {pos && score != null && (
        <div style={{ position: "fixed", top: pos.top, left: pos.left,
          transform: "translateX(-50%)",
          background: C.white, border: `1px solid ${C.borderMid}`,
          borderRadius: 10, padding: "10px 14px",
          minWidth: 200, maxWidth: 240, zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          fontFamily: fontB, pointerEvents: "none" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1, fontFamily: fontH }}>
            {Math.round(score)}
            <span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>/100</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Quality score</div>
          {rationale && (
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5,
              borderTop: `1px solid ${C.border}`, paddingTop: 6 }}>
              {rationale}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MATCH PILL WITH TOOLTIP ──────────────────────────────────────────────────

export function MatchPillWithTooltip({ c, project }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const dtl = domainTierLabel(c.domain_score);

  const showTooltip = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
  };

  return (
    <div ref={ref} style={{ display: "inline-block" }}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setPos(null)}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: "default" }}>
        <div style={{ fontSize: "17px", fontWeight: "800", fontFamily: fontH,
          color: c.match_score >= 0.70 ? C.success : c.match_score >= 0.50 ? C.similar : C.error }}>
          {Math.round(c.match_score * 100)}
        </div>
        <div style={{ fontSize: "9px", color: C.muted, fontWeight: "700", textTransform: "uppercase" }}>match</div>
      </div>
      {pos && (
        <div style={{ position: "fixed", top: pos.top, left: pos.left,
          transform: "translateX(-50%)",
          background: C.white, border: `1px solid ${C.borderMid}`,
          borderRadius: 12, padding: "14px 16px",
          width: 260, zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          fontFamily: fontB, pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: fontH,
                color: c.match_score >= 0.70 ? C.success : c.match_score >= 0.50 ? C.similar : C.error, lineHeight: 1 }}>
                {Math.round(c.match_score * 100)}%
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Overall match</div>
            </div>
            {dtl && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                background: dtl.bg, color: dtl.color, whiteSpace: "nowrap" }}>
                {dtl.label}
              </span>
            )}
          </div>
          {[
            { label: "Skills",     val: c.skill_score,      color: C.success, sub: null },
            { label: "Semantic",   val: c.vector_score,     color: C.primary, sub: null },
            { label: "Experience", val: c.experience_score, color: C.similar,
              sub: c.experience_delta != null && c.experience_delta !== 0
                ? `${c.experience_delta > 0 ? "+" : ""}${c.experience_delta}yr vs band`
                : "Within band" },
            { label: "Domain",     val: c.domain_score,     color: C.info,    sub: null },
          ].filter(r => r.val != null).map(r => (
            <div key={r.label} style={{ marginBottom: r.sub ? 2 : 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, color: C.muted, width: 68, flexShrink: 0 }}>{r.label}</div>
                <div style={{ flex: 1, height: 4, background: C.surface, borderRadius: 3 }}>
                  <div style={{ height: 4, borderRadius: 3, background: r.color,
                    width: `${Math.round(r.val * 100)}%` }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: r.color,
                  minWidth: 30, textAlign: "right" }}>
                  {Math.round(r.val * 100)}%
                </div>
              </div>
              {r.sub && (
                <div style={{ fontSize: 10, color: C.muted, marginLeft: 76, marginBottom: 6 }}>{r.sub}</div>
              )}
            </div>
          ))}
          {c.matching_skills?.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 5, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.05em" }}>Matched skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {c.matching_skills.map(s => (
                  <span key={s} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 6,
                    background: C.surface, color: C.textMid }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
