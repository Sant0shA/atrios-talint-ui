// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import { apiFetch, fmtDate } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";

export default function DashboardTab({ user, onGoToProject }) {
  const isMobile   = useIsMobile();
  const isAdmin    = user?.role === "admin";

  const [actionItems,   setActionItems]   = useState([]);
  const [overviewItems, setOverviewItems] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionFilter,  setActionFilter]  = useState("active");   // "active" | "all"
  const [ovFilter,      setOvFilter]      = useState("active");   // "active" | "on_hold" | "all"

  useEffect(() => {
    apiFetch("/api/v1/dashboard")
      .then(r => r.json())
      .then(d => {
        setActionItems(d.action_needed    || []);
        setOverviewItems(d.projects_overview || []);
        setLoading(false);
      })
      .catch(() => { setError("Could not load dashboard."); setLoading(false); });
  }, []);

  // ── Filtered views ──────────────────────────────────────────────────────────
  const filteredAction = actionFilter === "active"
    ? actionItems.filter(i => i.status === "active")
    : actionItems;  // "all" = active + on_hold (backend already scopes this)

  const filteredOverview =
    ovFilter === "active"  ? overviewItems.filter(i => i.status === "active")  :
    ovFilter === "on_hold" ? overviewItems.filter(i => i.status === "on_hold") :
    overviewItems;

  // ── Stat strip values ───────────────────────────────────────────────────────
  const activeCount      = overviewItems.filter(i => i.status === "active").length;
  const onHoldCount      = overviewItems.filter(i => i.status === "on_hold").length;
  const totalApplicants  = overviewItems.reduce((s, i) => s + (i.applicant_count || 0), 0);
  const actionCount      = actionItems.length; // total across active + on_hold

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const statusDot = (status) => {
    const color = status === "active" ? C.success : status === "on_hold" ? C.similar : C.error;
    return <span style={{ width: 8, height: 8, borderRadius: "50%", background: color,
      display: "inline-block", flexShrink: 0 }} />;
  };

  const fmtMatchDate = (iso) => {
    if (!iso) return "Never matched";
    const d = new Date(iso), now = new Date();
    const days = Math.floor((now - d) / 86400000);
    if (days === 0) return "Matched today";
    if (days === 1) return "Matched yesterday";
    if (days < 7)  return `Matched ${days}d ago`;
    return `Matched ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  };

  // ── Styles (local, uses C + S from constants) ────────────────────────────────
  const wrap     = { padding: isMobile ? "16px" : "24px", background: C.bg, minHeight: "100%" };
  const panel    = { background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px",
                     marginBottom: "16px", overflow: "hidden",
                     boxShadow: "0 1px 4px rgba(98,100,244,0.04)" };
  const pHdr     = { display: "flex", alignItems: "center", justifyContent: "space-between",
                     padding: "13px 18px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: "8px" };
  const pH2      = { fontFamily: fontH, fontSize: "14px", fontWeight: "700", color: C.text,
                     display: "flex", alignItems: "center", gap: "8px" };
  const pillRow  = { display: "flex", gap: "6px", flexWrap: "wrap" };
  const pill     = (active) => ({
    fontSize: 12, padding: "3px 11px", borderRadius: 20, cursor: "pointer", userSelect: "none",
    border: `1px solid ${active ? C.primary : C.border}`,
    background: active ? C.primary : C.bg,
    color: active ? "#fff" : C.muted,
    fontWeight: active ? 700 : 400, transition: "all 0.15s",
  });
  const statRow  = { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
                     gap: "10px", marginBottom: "16px" };
  const statCard = { background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px",
                     padding: "12px 16px", boxShadow: "0 1px 4px rgba(98,100,244,0.04)" };
  const aRow     = (last) => ({
    display: "flex", alignItems: "center", padding: "11px 18px", cursor: "pointer",
    borderBottom: last ? "none" : `1px solid ${C.border}`,
    transition: "background 0.12s", gap: "8px",
  });
  const recTag   = { fontSize: 10, padding: "2px 7px", background: C.surface, color: C.muted,
                     borderRadius: 4, fontFamily: font, flexShrink: 0 };


  // ── Loading / error ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${C.primary}`, borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, color: C.muted }}>Loading dashboard…</span>
      </div>
    </div>
  );

  if (error) return (
    <div style={wrap}>
      <div style={{ background: C.errorLight, border: `1px solid rgba(224,92,92,0.25)`,
        borderRadius: 8, padding: "12px 16px", fontSize: 13, color: C.error }}>
        {error}
      </div>
    </div>
  );

  return (
    <div style={wrap}>

      {/* Page title */}
      {!isMobile && (
        <>
          <div style={S.pageTitle}>Dashboard</div>
          <div style={{ ...S.pageSub, marginBottom: "20px" }}>
            {isAdmin ? "All recruiters · " : "Your projects · "}
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </>
      )}

      {/* Stat strip */}
      <div style={statRow}>
        {[
          { label: "Active jobs",     value: activeCount,     color: C.success },
          { label: "On hold",         value: onHoldCount,     color: C.similar },
          { label: "Action needed",   value: actionCount,     color: C.error   },
          { label: "Total applicants",value: totalApplicants, color: C.text    },
        ].map(s => (
          <div key={s.label} style={statCard}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase",
              letterSpacing: ".5px", marginBottom: 6, fontFamily: fontB, fontWeight: 700 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: font, fontSize: 24, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Panel A: Action Needed ─────────────────────────────────────────── */}
      <div style={panel}>
        <div style={pHdr}>
          <span style={pH2}>
            Action needed
            {filteredAction.length > 0 && (
              <span style={{ background: "#fde8e8", color: C.error, fontSize: 11,
                fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                {filteredAction.length} job{filteredAction.length !== 1 ? "s" : ""}
              </span>
            )}
            <span style={{ fontSize: 11, color: C.muted, fontFamily: fontB, fontWeight: 400 }}>
              · unmatched applicants
            </span>
          </span>
          <div style={pillRow}>
            {[{ v: "active", l: "Active only" }, { v: "all", l: "+ On hold" }].map(f => (
              <span key={f.v} style={pill(actionFilter === f.v)}
                onClick={() => setActionFilter(f.v)}>{f.l}</span>
            ))}
          </div>
        </div>

        {filteredAction.length === 0 ? (
          <div style={{ padding: "28px 18px", textAlign: "center", color: C.muted, fontSize: 13 }}>
            <Icon n="check_circle" size={32} color={C.success} style={{ display: "block", margin: "0 auto 10px" }} />
            All applicants have been matched — nothing pending.
          </div>
        ) : filteredAction.map((item, idx) => (
          <div key={item.id}
            style={aRow(idx === filteredAction.length - 1)}
            onMouseEnter={e => e.currentTarget.style.background = C.surface}
            onMouseLeave={e => e.currentTarget.style.background = C.white}>
            {statusDot(item.status)}
            <span style={{ fontFamily: fontH, fontSize: 13, fontWeight: 700, color: C.text, flex: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.title}
            </span>
            {isAdmin && item.recruiter_name && (
              <span style={recTag}>{item.recruiter_name}</span>
            )}
            <span style={{ fontSize: 11, color: C.muted, flex: "0 0 120px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              display: isMobile ? "none" : "block" }}>
              {item.client_name || "—"}
            </span>
            <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700,
              background: "#fde8e8", color: C.error, padding: "3px 10px",
              borderRadius: 20, flexShrink: 0 }}>
              {item.unmatched_count} unmatched
            </span>
            <button
              style={{ ...S.btn("primary", true), fontSize: 11, padding: "5px 12px", flexShrink: 0 }}
              onClick={() => onGoToProject(item.id)}>
              <Icon n="arrow_forward" size={12} />Open
            </button>
          </div>
        ))}
      </div>

      {/* ── Panel B: Projects Overview ─────────────────────────────────────── */}
      <div style={panel}>
        <div style={pHdr}>
          <span style={pH2}>
            {isAdmin ? "All projects" : "My projects"}
            <span style={{ background: C.surface, color: C.muted, fontSize: 11,
              padding: "2px 8px", borderRadius: 20 }}>
              {filteredOverview.length} shown
            </span>
          </span>
          <div style={pillRow}>
            {[
              { v: "active",  l: "Active"  },
              { v: "on_hold", l: "On hold" },
              { v: "all",     l: "All"     },
            ].map(f => (
              <span key={f.v} style={pill(ovFilter === f.v)}
                onClick={() => setOvFilter(f.v)}>{f.l}</span>
            ))}
          </div>
        </div>

        {filteredOverview.length === 0 ? (
          <div style={{ padding: "28px 18px", textAlign: "center", color: C.muted, fontSize: 13 }}>
            No projects found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Project", "Client", ...(isAdmin ? ["Recruiter"] : []), "Applied", "Matched", "Last Match", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11,
                      fontWeight: 700, color: C.muted, textTransform: "uppercase",
                      letterSpacing: ".5px", fontFamily: fontB, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOverview.map(item => {
                  const statusMap = {
                    active:  { bg: "#e8f7ef", color: "#1a6e40", dot: C.success, label: "Active"  },
                    on_hold: { bg: "#fef3cd", color: "#9a6700", dot: C.similar,  label: "On hold" },
                    closed:  { bg: "#fde8e8", color: "#c0392b", dot: C.error,    label: "Closed"  },
                  };
                  const s = statusMap[item.status] || statusMap.active;
                  return (
                    <tr key={item.id}
                      style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.surface}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => onGoToProject(item.id)}>
                      <td style={{ padding: "11px 16px", fontFamily: fontH, fontWeight: 700,
                        color: C.text, maxWidth: 220, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </td>
                      <td style={{ padding: "11px 16px", color: C.muted, fontSize: 12, whiteSpace: "nowrap" }}>
                        {item.client_name || "—"}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: "11px 16px" }}>
                          <span style={recTag}>{item.recruiter_name || "—"}</span>
                        </td>
                      )}
                      <td style={{ padding: "11px 16px", fontFamily: font, fontWeight: 700, color: C.text }}>
                        {item.applicant_count || 0}
                      </td>
                      <td style={{ padding: "11px 16px", fontFamily: font, fontWeight: 700, color: C.text }}>
                        {item.matched_count || 0}
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
                        {fmtMatchDate(item.last_matched_at)}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                          background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
                          padding: "3px 9px", borderRadius: 20 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%",
                            background: s.dot, display: "inline-block" }} />
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Icon n="arrow_forward" size={14} color={C.muted} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
