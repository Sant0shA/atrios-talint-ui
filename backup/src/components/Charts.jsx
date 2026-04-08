// ─── CHARTS ───────────────────────────────────────────────────────────────────
// MiniBar, SourceDonut, LocationPieChart

import { useState } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import Icon from "./Icon";

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────

export function MiniBar({ data, color = C.primary, height = 40 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: `${height}px` }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.label}: ${d.value}`}
          style={{ flex: 1, borderRadius: "3px 3px 0 0",
            backgroundColor: color, opacity: 0.7 + (d.value / max) * 0.3,
            height: `${Math.max(3, (d.value / max) * height)}px`,
            transition: "height 0.3s ease", cursor: "default" }} />
      ))}
    </div>
  );
}

// ─── SOURCE DONUT ─────────────────────────────────────────────────────────────

export function SourceDonut({ data, total }) {
  const colors  = [C.primary, C.success, "#f59e0b", C.info, "#ec4899", "#8b5cf6"];
  let offset    = 0;
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0);
  const r = 34, cx = 44, cy = 44, circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="10" />
        {entries.map(([key, val], i) => {
          const pct  = val / total;
          const dash = pct * circ;
          const seg  = (
            <circle key={key} cx={cx} cy={cy} r={r} fill="none"
              stroke={colors[i % colors.length]} strokeWidth="10"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ + circ / 4}
              style={{ transition: "stroke-dasharray 0.5s ease" }} />
          );
          offset += pct;
          return seg;
        })}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={C.text} fontFamily={fontH}>{total}</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9"
          fill={C.muted} fontFamily={fontB}>total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {entries.map(([key, val], i) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: colors[i % colors.length], flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: C.textMid, fontWeight: "500" }}>{key}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: C.text, fontFamily: font }}>{val}</span>
            <span style={{ fontSize: "10px", color: C.muted }}>({Math.round(val / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOCATION PIE CHART ───────────────────────────────────────────────────────

export function LocationPieChart({ data, skill, total, onClose }) {
  const colors  = [C.primary, C.success, "#f59e0b", C.info, "#ec4899", "#8b5cf6",
                   "#14b8a6", "#f97316", "#a855f7", "#64748b"];
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0);
  const r = 70, cx = 90, cy = 90, circ = 2 * Math.PI * r;
  const [hovered, setHovered] = useState(null);

  let offset = 0;
  const segments = entries.map(([city, val], i) => {
    const pct  = val / total;
    const dash = pct * circ;
    const seg  = { city, val, pct, dash, offset, color: colors[i % colors.length] };
    offset += pct;
    return seg;
  });

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "580px" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px",
              backgroundColor: C.primaryLight,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="pie_chart" size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Location Breakdown</div>
              <div style={{ fontSize: "11px", color: C.muted }}>{total} candidates with "{skill}"</div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
            <Icon n="close" size={20} />
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="2" />
            {segments.map((seg) => (
              <circle key={seg.city} cx={cx} cy={cy} r={r} fill="none"
                stroke={seg.color}
                strokeWidth={hovered === seg.city ? 28 : 22}
                strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
                strokeDashoffset={-seg.offset * circ + circ / 4}
                style={{ transition: "stroke-width 0.15s", cursor: "pointer" }}
                onMouseEnter={() => setHovered(seg.city)}
                onMouseLeave={() => setHovered(null)} />
            ))}
            {hovered ? (
              <>
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize="20" fontWeight="800"
                  fill={C.text} fontFamily={fontH}>
                  {segments.find(s => s.city === hovered)?.val}
                </text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill={C.muted} fontFamily={fontB}>
                  {hovered}
                </text>
                <text x={cx} y={cy + 24} textAnchor="middle" fontSize="10"
                  fill={C.primary} fontFamily={fontB} fontWeight="700">
                  {Math.round((segments.find(s => s.city === hovered)?.pct || 0) * 100)}%
                </text>
              </>
            ) : (
              <>
                <text x={cx} y={cy - 5} textAnchor="middle" fontSize="22" fontWeight="800"
                  fill={C.text} fontFamily={fontH}>{total}</text>
                <text x={cx} y={cy + 13} textAnchor="middle" fontSize="10"
                  fill={C.muted} fontFamily={fontB}>candidates</text>
              </>
            )}
          </svg>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
            {segments.map((seg) => (
              <div key={seg.city}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px",
                  borderRadius: "8px",
                  backgroundColor: hovered === seg.city ? `${seg.color}12` : "transparent",
                  cursor: "default", transition: "background 0.15s" }}
                onMouseEnter={() => setHovered(seg.city)}
                onMouseLeave={() => setHovered(null)}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%",
                  backgroundColor: seg.color, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: C.text, flex: 1 }}>{seg.city}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", fontFamily: font, color: seg.color }}>
                  {seg.val}
                </span>
                <span style={{ fontSize: "11px", color: C.muted, minWidth: "36px", textAlign: "right" }}>
                  {Math.round(seg.pct * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
