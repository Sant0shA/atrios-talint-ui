import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import { apiFetch, fmtDate } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import BulkCvUploadModal from "../projects/BulkCvUploadModal";
import { ClientScorePill, clientSourceBadge } from "./ClientComponents";

export default function ClientProjectDetailPage({ project, onBack }) {
  const isMobile = useIsMobile();
  const [detail,         setDetail]         = useState(null);
  const [candidates,     setCandidates]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [copiedLink,     setCopiedLink]     = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch(`/api/v1/client/projects/${project.id}`).then(r => r.json()),
      apiFetch(`/api/v1/client/projects/${project.id}/candidates`).then(r => r.json()),
    ])
      .then(([d, c]) => {
        setDetail(d);
        setCandidates(Array.isArray(c) ? c : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [project.id]);

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

      {/* ── Count ── */}
      <div style={{ fontSize: "13px", color: C.muted, marginBottom: "12px" }}>
        {candidates.length} applicant{candidates.length !== 1 ? "s" : ""}
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
          {candidates.map(c => {
            const badge = clientSourceBadge(c.source);
            return (
              <div key={c.candidate_id} style={S.cardMobile}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>
                      {c.name || "—"}
                    </div>
                    <div style={{ fontSize: "12px", color: C.muted }}>
                      {[c.current_designation, c.current_company].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <ClientScorePill score={c.match_score} />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  {c.total_experience != null && (
                    <span style={{ fontSize: "12px", color: C.muted }}>{c.total_experience}y exp</span>
                  )}
                  {c.location && (
                    <span style={{ fontSize: "12px", color: C.muted }}>{c.location}</span>
                  )}
                  <span style={S.badge(badge.type)}>{badge.label}</span>
                  {c.cv_storage_url && (
                    <a href={c.cv_storage_url} target="_blank" rel="noreferrer"
                      style={{ ...S.btn("outline", true), fontSize: "11px", textDecoration: "none" }}>
                      <Icon n="open_in_new" size={12} />View CV
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Desktop table ── */}
      {candidates.length > 0 && !isMobile && (
        <div style={{ backgroundColor: C.white, borderRadius: "14px",
          border: `1px solid ${C.border}`, overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Score", "Name", "Designation", "Company", "Exp", "Location", "Source", "CV"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => {
                const badge = clientSourceBadge(c.source);
                return (
                  <tr key={c.candidate_id}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ""; }}>
                    <td style={{ ...S.td, width: "70px", textAlign: "center" }}>
                      <ClientScorePill score={c.match_score} />
                    </td>
                    <td style={{ ...S.td, maxWidth: "160px" }}>
                      <div style={{ fontWeight: "700", fontFamily: fontH, fontSize: "13px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.name || "—"}
                      </div>
                    </td>
                    <td style={{ ...S.td, fontSize: "12px", color: C.textMid, maxWidth: "160px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.current_designation || "—"}
                    </td>
                    <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "130px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.current_company || "—"}
                    </td>
                    <td style={{ ...S.td, fontFamily: font, fontSize: "12px",
                      color: C.primary, fontWeight: "600", whiteSpace: "nowrap" }}>
                      {c.total_experience != null ? `${c.total_experience}y` : "—"}
                    </td>
                    <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "120px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.location || "—"}
                    </td>
                    <td style={S.td}>
                      <span style={S.badge(badge.type)}>{badge.label}</span>
                    </td>
                    <td style={S.td}>
                      {c.cv_storage_url ? (
                        <a href={c.cv_storage_url} target="_blank" rel="noreferrer"
                          style={{ ...S.btn("outline", true), textDecoration: "none", fontSize: "11px" }}>
                          <Icon n="open_in_new" size={12} />View CV
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: C.muted }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
