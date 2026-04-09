import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import { apiFetch, fmtDate } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import BulkCvUploadModal from "../projects/BulkCvUploadModal";
import { ClientScorePill, clientSourceBadge } from "./ClientComponents";

// ── Flag Modal ────────────────────────────────────────────────────────────────
const FLAG_REASONS = [
  "Already interviewed previously",
  "Wrong seniority level",
  "Overqualified",
  "Culture fit concern",
  "Other",
];

function FlagModal({ candidate, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const [note,   setNote]   = useState("");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div style={{ ...S.card, width: "360px", maxWidth: "90vw" }}>
        <div style={{ ...S.pageTitle, fontSize: "15px", marginBottom: "6px" }}>
          Flag {candidate.name} as not relevant
        </div>
        <div style={{ fontSize: "13px", color: C.muted, marginBottom: "16px" }}>
          This candidate will be flagged as not relevant. Recruiters will see this warning. You can undo anytime.
        </div>
        <div style={S.label}>Reason</div>
        <select
          value={reason}
          onChange={e => setReason(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", fontSize: "13px" }}
        >
          <option value="">Select a reason</option>
          {FLAG_REASONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <div style={S.label}>Note (optional)</div>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. spoke with them in 2023"
          style={{ width: "100%", marginBottom: "18px", fontSize: "13px" }}
        />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button style={S.btn("outline", true)} onClick={onCancel}>Cancel</button>
          <button
            style={{ ...S.btn("primary", true), background: "#E24B4A", border: "none" }}
            onClick={() => onConfirm({ reason, note })}
          >
            Confirm flag
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Candidate Row (desktop) ───────────────────────────────────────────────────
function CandidateRow({ c, expanded, onToggle, flagged, onFlag, onUndo }) {
  const badge = clientSourceBadge(c.source);

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${flagged ? "#F7C1C1" : expanded ? C.primary : C.border}`,
      borderLeft: flagged ? "3px solid #E24B4A" : `1px solid ${expanded ? C.primary : C.border}`,
      borderRadius: "12px",
      marginBottom: "8px",
      opacity: flagged ? 0.7 : 1,
      overflow: "hidden",
      transition: "border-color 0.15s",
    }}>
      {/* ── Top row ── */}
      <div
        onClick={onToggle}
        style={{
          display: "grid",
          gridTemplateColumns: "52px 1fr auto",
          gap: "12px",
          alignItems: "center",
          padding: "12px 14px",
          cursor: "pointer",
        }}
      >
        <ClientScorePill score={c.match_score} />

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1fr 0.8fr", gap: "4px 12px" }}>
          {/* Name + desig */}
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px", fontFamily: fontH }}>{c.name || "—"}</div>
            <div style={{ fontSize: "13px", color: C.muted, lineHeight: "1.5" }}>
				{c.current_designation || "—"}
			</div>
            {flagged && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "10px", color: "#A32D2D", background: "#FCEBEB",
                border: "0.5px solid #F7C1C1", borderRadius: "999px",
                padding: "2px 7px", marginTop: "3px",
              }}>Not relevant</div>
            )}
          </div>
          {/* Company */}
          <div>
            <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "2px" }}>Company</div>
            <div style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.current_company || "—"}</div>
          </div>
          {/* Exp + location */}
          <div>
            <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "2px" }}>Exp · Location</div>
            <div style={{ fontSize: "13px" }}>
              {c.total_experience != null ? `${c.total_experience}y` : "—"} · {c.location || "—"}
            </div>
          </div>
          {/* Source */}
          <div>
            <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "2px" }}>Source</div>
            <span style={S.badge(badge.type)}>{badge.label}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-end", flexShrink: 0 }}
          onClick={e => e.stopPropagation()}>
          {c.cv_storage_url ? (
            <a href={c.cv_storage_url} target="_blank" rel="noreferrer"
              style={{ ...S.btn("outline", true), fontSize: "11px", textDecoration: "none" }}>
              <Icon n="open_in_new" size={12} />View CV
            </a>
          ) : (
            <span style={{ fontSize: "11px", color: C.muted }}>No CV</span>
          )}
          {flagged
            ? <button style={{ ...S.btn("outline", true), fontSize: "11px" }} onClick={onUndo}>Undo flag</button>
            : <button style={{ ...S.btn("outline", true), fontSize: "11px", color: "#A32D2D", borderColor: "#F7C1C1", background: "#FCEBEB" }} onClick={onFlag}>
                Not relevant
              </button>
          }
          <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>
            {expanded ? "▲" : "▼"}
          </div>
        </div>
      </div>

      {/* ── Expanded section ── */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          background: C.surface,
          padding: "14px 16px",
        }}>
          {/* Candidate CV Summary — full width */}
          <div>
            <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Candidate CV Summary
            </div>
            <div style={{ fontSize: "12px", color: C.textMid, lineHeight: "1.7" }}>
              {c.ai_summary || "Summary not available."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function CandidateMobileCard({ c, flagged, onFlag, onUndo }) {
  const badge = clientSourceBadge(c.source);
  return (
    <div style={{
      ...S.cardMobile,
      borderLeft: flagged ? "3px solid #E24B4A" : undefined,
      opacity: flagged ? 0.7 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>{c.name || "—"}</div>
          <div style={{ fontSize: "12px", color: C.muted }}>
            {[c.current_designation, c.current_company].filter(Boolean).join(" · ") || "—"}
          </div>
        </div>
        <ClientScorePill score={c.match_score} />
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
        {c.total_experience != null && <span style={{ fontSize: "13px", color: C.muted }}>{c.total_experience}y exp</span>}
        {c.location && <span style={{ fontSize: "13px", color: C.muted }}>{c.location}</span>}
        <span style={S.badge(badge.type)}>{badge.label}</span>
        {c.cv_storage_url && (
          <a href={c.cv_storage_url} target="_blank" rel="noreferrer"
            style={{ ...S.btn("outline", true), fontSize: "11px", textDecoration: "none" }}>
            <Icon n="open_in_new" size={12} />View CV
          </a>
        )}
        {flagged
          ? <button style={{ ...S.btn("outline", true), fontSize: "11px" }} onClick={onUndo}>Undo flag</button>
          : <button style={{ ...S.btn("outline", true), fontSize: "11px", color: "#A32D2D", borderColor: "#F7C1C1", background: "#FCEBEB" }} onClick={onFlag}>
              Not relevant
            </button>
        }
      </div>
      {flagged && (
        <div style={{ fontSize: "11px", color: "#A32D2D", marginTop: "6px" }}>Flagged as not relevant</div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ClientProjectDetailPage({ project, onBack }) {
  const isMobile = useIsMobile();
  const [detail,         setDetail]         = useState(null);
  const [candidates,     setCandidates]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [copiedLink,     setCopiedLink]     = useState(false);
  const [expanded,       setExpanded]       = useState({});   // { [candidate_id]: bool }
  const [flags,          setFlags]          = useState({});   // { [candidate_id]: { reason, note } }
  const [flagTarget,     setFlagTarget]     = useState(null); // candidate being flagged

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch(`/api/v1/client/projects/${project.id}`).then(r => r.json()),
      apiFetch(`/api/v1/client/projects/${project.id}/candidates`).then(r => r.json()),
    ])
      .then(([d, c]) => {
        setDetail(d);
        const cands = Array.isArray(c) ? c : [];
        setCandidates(cands);

        // ── Rehydrate flags from backend response ──────────────────────
        const existingFlags = {};
        cands.forEach(c => {
          if (c.client_flagged) {
            existingFlags[c.candidate_id] = {
              reason: c.client_flag_reason,
              note: c.client_flag_note,
            };
          }
        });
        setFlags(existingFlags);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [project.id]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleFlag = async (candidate, { reason, note }) => {
    try {
      await apiFetch(
        `/api/v1/client/projects/${project.id}/candidates/${candidate.candidate_id}/flag`,
        { method: "POST", body: JSON.stringify({ reason, note }) }
      );
    } catch (_) {}
    setFlags(prev => ({ ...prev, [candidate.candidate_id]: { reason, note } }));
    setFlagTarget(null);
  };

  const handleUndo = async (candidateId) => {
    try {
      await apiFetch(
        `/api/v1/client/projects/${project.id}/candidates/${candidateId}/flag`,
        { method: "DELETE" }
      );
    } catch (_) {}
    setFlags(prev => { const n = { ...prev }; delete n[candidateId]; return n; });
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
      <div style={{
        width: "28px", height: "28px", border: `3px solid ${C.primary}`,
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
      }} />
      Loading applicants…
    </div>
  );

  const expRange = detail
    ? [detail.min_experience, detail.max_experience]
        .filter(v => v != null)
        .join("–") + (detail.min_experience != null ? " yrs" : "")
    : "";

  const applySlug = project.apply_slug || null;
  const applyUrl  = applySlug ? `https://talint.atrios.in/apply/${applySlug}` : null;

  const handleCopyLink = async () => {
    if (!applyUrl) return;
    try {
      await navigator.clipboard.writeText(applyUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (_) {}
  };

  const flaggedCount = Object.keys(flags).length;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
        <button style={{ ...S.btn("outline", true), marginTop: "2px" }} onClick={onBack}>
          <Icon n="arrow_back" size={14} />Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ ...S.pageTitle, marginBottom: "4px" }}>{project.title}</div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {detail?.location && (
              <span style={{ fontSize: "12px", color: C.muted, display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon n="location_on" size={13} />{detail.location}
              </span>
            )}
            {expRange && (
              <span style={{ fontSize: "12px", color: C.muted, display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon n="work_history" size={13} />{expRange}
              </span>
            )}
            {detail?.apply_enabled
              ? <span style={S.badge("info")}>Applications Open</span>
              : <span style={S.badge("")}>Applications Closed</span>
            }
          </div>
        </div>
        <button style={S.btn("outline", true)} onClick={() => setShowBulkUpload(true)}>
          <Icon n="upload_file" size={13} />Upload CVs
        </button>
      </div>

      {/* ── JD Summary ── */}
      {detail?.jd_public_summary && (
        <div style={{ ...S.card, marginBottom: "16px", backgroundColor: C.primaryDim,
          border: `1px solid rgba(98,100,244,0.15)` }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: C.primary,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: fontH }}>
            Role Description
          </div>
          <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.7" }}>
            {detail.jd_public_summary}
          </div>
        </div>
      )}

      {/* ── Apply link card ── */}
      {applyUrl && (
        <div style={{ ...S.card, display: "flex", alignItems: "center", gap: "14px",
          flexWrap: "wrap", marginBottom: "16px" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={S.label}>Application Link</div>
            <div style={{ fontSize: "12px", color: detail?.apply_enabled ? C.primary : C.muted,
              fontFamily: font, wordBreak: "break-all" }}>
              {applyUrl}
            </div>
            <div style={{ fontSize: "11px", color: C.muted, marginTop: "3px" }}>
              Share this link with candidates to collect applications directly
            </div>
          </div>
          <button style={S.btn("outline", true)} onClick={handleCopyLink}>
            <Icon n={copiedLink ? "check" : "content_copy"} size={13} />
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>
          <a href={applyUrl} target="_blank" rel="noreferrer"
            style={{ ...S.btn("primary", true), textDecoration: "none" }}>
            <Icon n="open_in_new" size={13} />Preview
          </a>
        </div>
      )}

      {/* ── Summary bar ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        {[
          { label: "Candidates", value: candidates.length },
          { label: "Above 70%", value: candidates.filter(c => {
			const s = c.match_score ?? 0;
			return (s > 1 ? s : s * 100) >= 70;
		  }).length },
          { label: "Flagged",    value: flaggedCount },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: C.surface, borderRadius: "8px",
            padding: "8px 14px", fontSize: "13px", color: C.muted,
          }}>
            <span style={{ fontWeight: "700", color: C.text, fontSize: "15px", display: "block" }}>{value}</span>
            {label}
          </div>
        ))}
      </div>

      {/* ── Empty state ── */}
      {candidates.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>
          <Icon n="people" size={40} color={C.border} style={{ display: "block", margin: "0 auto 12px" }} />
          No applicants yet. Share the application link or upload CVs directly using the button above.
        </div>
      )}

      {/* ── Mobile cards ── */}
      {candidates.length > 0 && isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {candidates.map(c => (
            <CandidateMobileCard
              key={c.candidate_id}
              c={c}
              flagged={!!flags[c.candidate_id]}
              onFlag={() => setFlagTarget(c)}
              onUndo={() => handleUndo(c.candidate_id)}
            />
          ))}
        </div>
      )}

      {/* ── Desktop rows ── */}
      {candidates.length > 0 && !isMobile && (
        <div>
          {candidates.map(c => (
            <CandidateRow
              key={c.candidate_id}
              c={c}
              expanded={!!expanded[c.candidate_id]}
              onToggle={() => toggleExpand(c.candidate_id)}
              flagged={!!flags[c.candidate_id]}
              onFlag={() => setFlagTarget(c)}
              onUndo={() => handleUndo(c.candidate_id)}
            />
          ))}
        </div>
      )}

      {/* ── Flag modal ── */}
      {flagTarget && (
        <FlagModal
          candidate={flagTarget}
          onConfirm={(data) => handleFlag(flagTarget, data)}
          onCancel={() => setFlagTarget(null)}
        />
      )}

      {/* ── Bulk upload modal ── */}
      {showBulkUpload && (
        <BulkCvUploadModal
          project={project}
          onClose={() => setShowBulkUpload(false)}
          onComplete={() => { setShowBulkUpload(false); fetchData(); }}
        />
      )}
    </div>
  );
}