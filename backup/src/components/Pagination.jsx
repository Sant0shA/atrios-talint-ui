// ─── PAGINATION, STARBN, CANDIDATECARD ───────────────────────────────────────

import { useState } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import { apiFetch } from "../utils";
import Icon from "./Icon";

// ─── PAGINATION ───────────────────────────────────────────────────────────────

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center", padding: "20px 0 4px" }}>
      <button style={{ ...S.btn("outline", true), opacity: page <= 1 ? 0.4 : 1 }}
        disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <Icon n="chevron_left" size={14} />Prev
      </button>
      {pages[0] > 1 && (
        <>
          <button style={S.btn("outline", true)} onClick={() => onChange(1)}>1</button>
          {pages[0] > 2 && <span style={{ color: C.muted }}>…</span>}
        </>
      )}
      {pages.map(p => (
        <button key={p}
          style={{ ...S.btn(p === page ? "primary" : "outline", true), minWidth: "34px", justifyContent: "center" }}
          onClick={() => onChange(p)}>{p}</button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          <span style={{ color: C.muted }}>…</span>
          <button style={S.btn("outline", true)} onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button style={{ ...S.btn("outline", true), opacity: page >= totalPages ? 0.4 : 1 }}
        disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next<Icon n="chevron_right" size={14} />
      </button>
      <span style={{ fontSize: "12px", color: C.muted, fontFamily: font }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}

// ─── STAR BUTTON ──────────────────────────────────────────────────────────────

export function StarBtn({ candidateId, starred, onToggle }) {
  const [loading, setLoading] = useState(false);
  const toggle = async (e) => {
    e.stopPropagation(); setLoading(true);
    try { await apiFetch(`/api/v1/candidates/${candidateId}/shortlist`, { method: "POST" }); onToggle(candidateId); }
    finally { setLoading(false); }
  };
  return (
    <button onClick={toggle} disabled={loading}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px",
        color: starred ? "#f59e0b" : C.border, transition: "all 0.15s", padding: "2px 6px",
        filter: starred ? "drop-shadow(0 0 4px rgba(245,158,11,0.5))" : "none" }}>
      ★
    </button>
  );
}

// ─── CANDIDATE CARD (mobile) ──────────────────────────────────────────────────

export function CandidateCard({ c, isStarred, onToggleStar, onView }) {
  return (
    <div className="fade-up" style={{ ...S.cardMobile, cursor: "pointer" }} onClick={() => onView(c)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "15px", fontFamily: fontH, color: C.text }}>
            {c.name || "—"}
          </div>
          <div style={{ fontSize: "12px", color: C.primary, fontWeight: "600", marginTop: "1px" }}>
            {c.current_designation || "—"}
          </div>
        </div>
        <StarBtn candidateId={c.id} starred={isStarred} onToggle={onToggleStar} />
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "12px", color: C.muted }}>
        {c.total_experience != null && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Icon n="work_history" size={13} />{c.total_experience}y exp
          </span>
        )}
        {c.location && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Icon n="location_on" size={13} />{c.location}
          </span>
        )}
        {c.current_ctc && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Icon n="currency_rupee" size={13} />{c.current_ctc}L
          </span>
        )}
      </div>
      {(c.skills || []).length > 0 && (
        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap" }}>
          {c.skills.slice(0, 3).map((s, i) => (
            <span key={i} style={S.tag}>{s}</span>
          ))}
          {c.skills.length > 3 && (
            <span style={{ fontSize: "11px", color: C.muted, padding: "2px 6px" }}>
              +{c.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
