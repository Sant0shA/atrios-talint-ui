// ─── SCORE PILLS ─────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { C, fontH, fontB } from "../constants";

export function ScorePill({ label, value, color, tooltipContent }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const showTooltip = () => {
    if (!tooltipContent || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
  };

  return (
    <div style={{ display: "inline-block" }} ref={ref}>
      <span
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPos(null)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "3px",
          padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700",
          backgroundColor: `${color}18`, color, cursor: "default",
        }}
      >
        {label}: {Math.round(value * 100)}%
      </span>
      {pos && tooltipContent && (
        <div style={{
          position: "fixed", top: pos.top, left: pos.left,
          background: C.white, border: `1px solid ${C.borderMid}`,
          borderRadius: 10, padding: "12px 14px",
          minWidth: 220, maxWidth: 260, zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          fontFamily: fontB, pointerEvents: "none",
        }}>
          {tooltipContent}
        </div>
      )}
    </div>
  );
}
