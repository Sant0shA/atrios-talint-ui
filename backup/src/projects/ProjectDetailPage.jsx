// ─── PROJECT DETAIL PAGE ──────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font, DEFAULT_PROJECT_WEIGHTS, PROJECT_PRESETS } from "../constants";
import { apiFetch, fmtDate, openSimilarWindow, domainTierLabel } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import { ScorePill } from "../components/ScorePills";
import { ProjectWeightSliders } from "../components/WeightSliders";
import { QualitySplitButton, QualityBadge, MatchPillWithTooltip } from "./QualityComponents";
import BulkCvUploadModal from "./BulkCvUploadModal";
import GenerateReportModal from "./GenerateReportModal";

// ── Client flag badge ─────────────────────────────────────────────────────────
// Read-only warning — recruiter sees it, cannot dismiss it (only client can undo).
function ClientFlagBadge({ flag, reason }) {
  if (flag !== "not_appropriate") return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      color: "#A32D2D", fontSize: "11px", fontFamily: fontB, fontWeight: "600",
    }}>
      <Icon n="flag" size={11} color="#A32D2D" />
      Client flagged: {reason || "Not appropriate"}
    </span>
  );
}

export default function ProjectDetailPage({ project: initProject, onBack, onViewCandidate }) {
  const isMobile = useIsMobile();
  const [project,          setProject]        = useState(initProject);
  const [candidates,       setCandidates]     = useState([]);
  const [matching,         setMatching]       = useState(false);
  const [matchMsg,         setMatchMsg]       = useState("");
  const [copiedLink,       setCopied]         = useState(false);
  const [poolTab,          setPoolTab]        = useState("matched");
  const [showReport,       setShowReport]     = useState(false);
  const [showMatchPanel,   setShowMatchPanel] = useState(false);
  const [showBulkUpload,   setShowBulkUpload] = useState(false);
  const [matchWeights,     setMatchWeights]   = useState({ ...DEFAULT_PROJECT_WEIGHTS });
  const [selectedPreset,   setSelectedPreset] = useState("ngo");
  const [removeConfirm,    setRemoveConfirm]  = useState(null);
  const [qualityRunning,   setQualityRunning] = useState(false);
  const [qualityMsg,       setQualityMsg]     = useState("");
  const [qualityAppliedMsg, setQualityAppliedMsg] = useState("");
  const [qualityFilter,    setQualityFilter]  = useState("all");
  const [selectedIds,      setSelectedIds]    = useState(new Set());
  const [bulkRemoveConfirm, setBulkRemoveConfirm] = useState(false);
  const [bulkRemoving,     setBulkRemoving]   = useState(false);
  const [statusDropdown,   setStatusDropdown] = useState(false);
  const [statusSaving,     setStatusSaving]   = useState(false);

  const applyUrl = `${window.location.origin}/apply/${project.apply_slug}`;

  const fetchCandidates = async () => {
    try {
      const r = await apiFetch(`/api/v1/projects/${project.id}/candidates?page=1&page_size=500`);
      const d = await r.json();
      setCandidates(d.candidates || []);
    } catch { setCandidates([]); }
  };

  useEffect(() => { fetchCandidates(); }, [project.id]);

	useEffect(() => {
	  if (!statusDropdown) return;
	  const close = () => setStatusDropdown(false);
	  const timer = setTimeout(() => {
		document.addEventListener("click", close);
	  }, 0);
	  return () => {
		clearTimeout(timer);
		document.removeEventListener("click", close);
	  };
	}, [statusDropdown]);

  useEffect(() => {
    if (!statusDropdown) return;
    const close = () => setStatusDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [statusDropdown]);

  const switchTab = (tab) => {
    setPoolTab(tab); setQualityFilter("all");
    setSelectedIds(new Set()); setQualityAppliedMsg("");
  };

  const applyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    const p = PROJECT_PRESETS[presetKey];
    if (p) setMatchWeights({ skill: p.skill, vector: p.vector, experience: p.experience, domain: p.domain });
  };

  const runMatch = async () => {
    setMatching(true); setMatchMsg("");
    try {
      const weightTotal = Object.values(matchWeights).reduce((a, b) => a + b, 0);
      if (weightTotal !== 100) { setMatchMsg("Weights must sum to 100% before running match."); setMatching(false); return; }
      const r = await apiFetch(`/api/v1/projects/${project.id}/match`, {
        method: "POST",
        body: JSON.stringify({
          skill_weight:      matchWeights.skill / 100,
          vector_weight:     matchWeights.vector / 100,
          experience_weight: matchWeights.experience / 100,
          domain_weight:     matchWeights.domain / 100,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setMatchMsg(d.detail || "Match failed."); }
      else { setMatchMsg(`✓ ${d.candidates_matched} candidates matched`); setShowMatchPanel(false); setSelectedIds(new Set()); fetchCandidates(); }
    } catch { setMatchMsg("Network error."); } finally { setMatching(false); }
  };

  const runQualityScore = async (scope = "all") => {
    const isApplied = scope === "applied";
    if (isApplied) setQualityAppliedMsg(""); else { setQualityRunning(true); setQualityMsg(""); }
    try {
      const r = await apiFetch(`/api/v1/projects/${project.id}/quality-score?scope=${scope}`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        const msg = d.detail || "Quality check failed.";
        isApplied ? setQualityAppliedMsg(msg) : setQualityMsg(msg);
      } else {
        const msg = `✓ ${d.scored} scored`;
        isApplied ? setQualityAppliedMsg(msg) : setQualityMsg(`✓ ${d.scored} candidates scored`);
        fetchCandidates();
      }
    } catch {
      const msg = "Network error.";
      isApplied ? setQualityAppliedMsg(msg) : setQualityMsg(msg);
    } finally { if (!isApplied) setQualityRunning(false); }
  };

  const toggleApplyLink = async () => {
    const r = await apiFetch(`/api/v1/projects/${project.id}`, { method: "PATCH", body: JSON.stringify({ apply_enabled: !project.apply_enabled }) });
    if (r.ok) setProject(p => ({ ...p, apply_enabled: !p.apply_enabled }));
  };

  const changeStatus = async (newStatus) => {
    setStatusDropdown(false);
    if (newStatus === project.status) return;
    setStatusSaving(true);
    const r = await apiFetch(`/api/v1/projects/${project.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    if (r.ok) setProject(p => ({ ...p, status: newStatus,
      apply_enabled: newStatus === "closed" ? false : p.apply_enabled }));
    setStatusSaving(false);
  };

  const viewCandidate = async (candidateId) => {
    try { const res = await apiFetch(`/api/v1/candidates/${candidateId}`); onViewCandidate(await res.json()); } catch {}
  };

  const removeCand = async (candidateId) => {
    await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, { method: "PATCH", body: JSON.stringify({ action: "remove" }) });
    setRemoveConfirm(null); fetchCandidates();
  };

  const restoreCand = async (candidateId) => {
    await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, { method: "PATCH", body: JSON.stringify({ action: "add" }) });
    fetchCandidates();
  };

  const handleAddCandidate = async (candidateId) => {
    await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, { method: "PATCH", body: JSON.stringify({ action: "add", action_source: "apply_link_add" }) });
    fetchCandidates();
  };

  const toggleSelect = (id) => setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleSelectAll = () => {
    const activeIds = displayCandidates.filter(c => c.is_active).map(c => c.candidate_id);
    const allSelected = activeIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(activeIds));
  };

  const executeBulkRemove = async () => {
    setBulkRemoving(true);
    try {
      for (const candidateId of selectedIds) {
        await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, { method: "PATCH", body: JSON.stringify({ action: "remove" }) });
      }
      setSelectedIds(new Set()); setBulkRemoveConfirm(false); fetchCandidates();
    } catch { setBulkRemoveConfirm(false); } finally { setBulkRemoving(false); }
  };

  const scoreColor = s => !s ? C.muted : s >= 0.7 ? C.success : s >= 0.5 ? C.warning : C.error;
  const scoreBg    = s => !s ? C.surface : s >= 0.7 ? C.successLight : s >= 0.5 ? C.warningLight : C.errorLight;
  const srcBadge   = src =>
    src === "apply_link"     ? { type: "success", label: "Applied"  } :
    src === "apply_link_add" ? { type: "success", label: "Promoted" } :
    src === "manual_add"     ? { type: "",        label: "Manual"   } :
                               { type: "admin",   label: "Auto"     };

  const matchedCandidates     = candidates.filter(c => c.source !== "apply_link");
  const appliedCandidates     = candidates.filter(c => c.source === "apply_link");
  const shortlistedCandidates = candidates.filter(c => c.source === "apply_link_add" && c.is_active);
  const reportAvailable       = matchedCandidates.filter(c => c.is_active).length > 0;
  const weightsChanged        = JSON.stringify(matchWeights) !== JSON.stringify(DEFAULT_PROJECT_WEIGHTS);
  const tabCandidates         = poolTab === "matched" ? matchedCandidates : appliedCandidates;

  const displayCandidates = qualityFilter === "all" ? tabCandidates
    : qualityFilter === "unscored" ? tabCandidates.filter(c => !c.quality_label)
    : tabCandidates.filter(c => c.quality_label === { strong: "Strong fit", probable: "Probable fit", weak: "Weak fit" }[qualityFilter]);

  const anyScored      = candidates.some(c => c.quality_label != null);
  const activeDisplayIds = displayCandidates.filter(c => c.is_active).map(c => c.candidate_id);
  const allSelected    = activeDisplayIds.length > 0 && activeDisplayIds.every(id => selectedIds.has(id));
  const someSelected   = selectedIds.size > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
        <button style={{ ...S.btn("outline", true), marginTop: "2px" }} onClick={onBack}><Icon n="arrow_back" size={14} />Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ ...S.pageTitle, marginBottom: "2px" }}>{project.title}</div>
          <div style={{ fontSize: "12px", color: C.muted }}>
            Created {fmtDate(project.created_at)}{project.last_matched_at && ` · Last matched ${fmtDate(project.last_matched_at)}`}
          </div>
        </div>

        {/* Status pill + dropdown */}
        {!project.is_archived && (() => {
          const statusMap = {
            active:  { bg: "#e8f7ef", color: "#1a6e40", dot: C.success, label: "Active"  },
            on_hold: { bg: "#fef3cd", color: "#9a6700", dot: C.similar,  label: "On hold" },
            closed:  { bg: "#fde8e8", color: "#c0392b", dot: C.error,    label: "Closed"  },
          };
          const s = statusMap[project.status] || statusMap.active;
          return (
            <div style={{ position: "relative", marginTop: "2px" }} onClick={e => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); setStatusDropdown(v => !v); }}
                disabled={statusSaving}
                style={{ display: "inline-flex", alignItems: "center", gap: 6,
                  background: s.bg, color: s.color, fontSize: 12, fontWeight: 700,
                  padding: "5px 11px", borderRadius: 20, border: `1px solid ${s.color}30`,
                  cursor: "pointer", opacity: statusSaving ? 0.6 : 1, transition: "opacity 0.15s" }}>
                {statusSaving
                  ? <div style={{ width: 8, height: 8, borderRadius: "50%",
                      border: `2px solid ${s.color}`, borderTopColor: "transparent",
                      animation: "spin 0.7s linear infinite" }} />
                  : <span style={{ width: 7, height: 7, borderRadius: "50%",
                      background: s.dot, display: "inline-block" }} />}
                {s.label}
                <Icon n="expand_more" size={14} color={s.color} />
              </button>
              {statusDropdown && (
                <div onClick={e => e.stopPropagation()}
                  style={{ position: "absolute", top: "calc(100% + 6px)", left: 0,
                    background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: 140, zIndex: 300, overflow: "hidden" }}>
                  {[
                    { v: "active",  label: "Active",  dot: C.success },
                    { v: "on_hold", label: "On hold", dot: C.similar },
                    { v: "closed",  label: "Closed",  dot: C.error   },
                  ].map(opt => (
                    <button key={opt.v} onClick={() => changeStatus(opt.v)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 9,
                        padding: "9px 13px", background: project.status === opt.v ? C.surface : "none",
                        border: "none", cursor: "pointer", fontSize: 13, color: C.text,
                        fontFamily: fontB, textAlign: "left", fontWeight: project.status === opt.v ? 700 : 400 }}
                      onMouseEnter={e => { if (project.status !== opt.v) e.currentTarget.style.background = C.surface; }}
                      onMouseLeave={e => { if (project.status !== opt.v) e.currentTarget.style.background = "none"; }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%",
                        background: opt.dot, display: "inline-block", flexShrink: 0 }} />
                      {opt.label}
                      {project.status === opt.v && <Icon n="check" size={13} color={C.primary} style={{ marginLeft: "auto" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {reportAvailable && !project.is_archived && (
            <button style={S.btn("outline", true)} onClick={() => setShowReport(true)}><Icon n="summarize" size={13} />Generate Report</button>
          )}
          {!project.is_archived && (
            <button
              style={{ ...S.btn("outline", true), opacity: project.status === "closed" ? 0.4 : 1,
                cursor: project.status === "closed" ? "not-allowed" : "pointer" }}
              onClick={() => { if (project.status !== "closed") setShowBulkUpload(true); }}
              title={project.status === "closed" ? "Project is closed" : undefined}>
              <Icon n="upload_file" size={13} />Upload CVs
            </button>
          )}
          {!project.is_archived && (
            <QualitySplitButton running={qualityRunning} onScore={runQualityScore} label="Quality Check" />
          )}
          <button
            style={{ ...S.btn(project.is_archived ? "outline" : "primary", true), opacity: project.is_archived ? 0.5 : 1 }}
            onClick={() => { if (!project.is_archived) setShowMatchPanel(p => !p); }}
            disabled={project.is_archived}>
            <Icon n="hub" size={13} />Run Match
          </button>
        </div>
      </div>

      {/* Closed project banner */}
      {project.status === "closed" && (
        <div style={{ background: "#fde8e8", border: "1px solid rgba(224,92,92,0.25)",
          borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
          fontSize: "13px", color: "#c0392b", display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon n="block" size={15} color="#c0392b" />
          This project is closed. Apply link and CV uploads are disabled.
        </div>
      )}

      {/* Match panel */}
      {showMatchPanel && !project.is_archived && (
        <div className="fade-up" style={{ ...S.card, marginBottom: "16px", border: `1px solid ${C.borderMid}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", fontFamily: fontH, color: C.text, display: "flex", alignItems: "center", gap: "7px" }}>
              <Icon n="hub" size={15} color={C.primary} />Match Settings
            </div>
            <button onClick={() => { setShowMatchPanel(false); setMatchMsg(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon n="close" size={18} /></button>
          </div>
          <div style={{ marginBottom: "4px" }}>
            <label style={S.label}>Scoring Profile</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
              {Object.entries(PROJECT_PRESETS).map(([key, preset]) => (
                <button key={key} onClick={() => applyPreset(key)}
                  style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                    border: `1px solid ${selectedPreset === key ? C.primary : C.border}`,
                    backgroundColor: selectedPreset === key ? C.primaryDim : "transparent",
                    color: selectedPreset === key ? C.primary : C.muted,
                    transition: "all 0.15s", fontFamily: fontB }}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <ProjectWeightSliders weights={matchWeights} onChange={setMatchWeights} />
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px", paddingTop: "14px", borderTop: `1px solid ${C.border}` }}>
            <button style={{ ...S.btn("primary"), opacity: matching ? 0.6 : 1 }} onClick={runMatch} disabled={matching}>
              <Icon n="hub" size={14} />{matching ? "Matching…" : weightsChanged ? "Run Match ✦" : "Run Match"}
            </button>
            <button style={S.btn("outline")} onClick={() => { setShowMatchPanel(false); setMatchMsg(""); }}>Cancel</button>
            {matchMsg && (
              <span style={{ fontSize: "13px", color: matchMsg.startsWith("✓") ? C.success : C.error, display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n={matchMsg.startsWith("✓") ? "check_circle" : "error"} size={14} color={matchMsg.startsWith("✓") ? C.success : C.error} />{matchMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Match result message */}
      {matchMsg && !showMatchPanel && (
        <div style={{ background: matchMsg.startsWith("✓") ? C.successLight : C.errorLight, border: `1px solid ${matchMsg.startsWith("✓") ? "rgba(59,178,115,0.25)" : "rgba(224,92,92,0.25)"}`, borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "13px", color: matchMsg.startsWith("✓") ? "#2a7a50" : C.error }}>{matchMsg}</div>
      )}

      {/* Quality message */}
      {qualityMsg && (
        <div style={{ background: qualityMsg.startsWith("✓") ? C.successLight : C.errorLight, border: `1px solid ${qualityMsg.startsWith("✓") ? "rgba(59,178,115,0.25)" : "rgba(224,92,92,0.25)"}`, borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "13px", color: qualityMsg.startsWith("✓") ? "#2a7a50" : C.error, display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon n={qualityMsg.startsWith("✓") ? "verified" : "error"} size={14} color={qualityMsg.startsWith("✓") ? C.success : C.error} />{qualityMsg}
        </div>
      )}

      {/* Apply link card */}
      <div style={{ ...S.card, display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={S.label}>Apply Link</div>
          <div style={{ fontSize: "12px", color: project.apply_enabled ? C.primary : C.muted, fontFamily: font, wordBreak: "break-all" }}>{applyUrl}</div>
        </div>
        <button style={S.btn("outline", true)} onClick={() => { navigator.clipboard.writeText(applyUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
          <Icon n={copiedLink ? "check" : "content_copy"} size={13} />{copiedLink ? "Copied!" : "Copy"}
        </button>
        <button
          style={{ ...S.btn(project.apply_enabled ? "danger" : "success", true),
            opacity: project.status === "closed" ? 0.4 : 1,
            cursor: project.status === "closed" ? "not-allowed" : "pointer" }}
          onClick={() => { if (project.status !== "closed") toggleApplyLink(); }}
          title={project.status === "closed" ? "Project is closed" : undefined}>
          <Icon n={project.apply_enabled ? "link_off" : "link"} size={13} />
          {project.apply_enabled ? "Disable Link" : "Enable Link"}
        </button>
      </div>

      {/* Pool counts */}
      <div style={{ fontSize: "13px", color: C.muted, marginBottom: "12px" }}>{matchedCandidates.length} matched · {appliedCandidates.length} applied</div>

      {/* Tab toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <button style={{ padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", backgroundColor: poolTab === "matched" ? C.primary : C.surface, color: poolTab === "matched" ? "#fff" : C.muted }} onClick={() => switchTab("matched")}>
          <Icon n="auto_awesome" size={13} />{` Matched (${matchedCandidates.length})`}
        </button>
        <button style={{ padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", backgroundColor: poolTab === "applied" ? C.success : C.surface, color: poolTab === "applied" ? "#fff" : C.muted }} onClick={() => switchTab("applied")}>
          <Icon n="inbox" size={13} />{` Applied (${appliedCandidates.length})`}
        </button>
        {poolTab === "applied" && appliedCandidates.length > 0 && !project.is_archived && (
          <>
            <div style={{ width: "1px", height: "24px", backgroundColor: C.border, margin: "0 4px" }} />
            <QualitySplitButton running={qualityRunning} onScore={(scope) => runQualityScore(scope === "all" ? "applied_all" : "applied")} label="Score Applied" color={C.success} borderColor="rgba(59,178,115,0.4)" />
            {qualityAppliedMsg && (
              <span style={{ fontSize: "12px", color: qualityAppliedMsg.startsWith("✓") ? C.success : C.error, display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon n={qualityAppliedMsg.startsWith("✓") ? "check_circle" : "error"} size={13} color={qualityAppliedMsg.startsWith("✓") ? C.success : C.error} />{qualityAppliedMsg}
              </span>
            )}
          </>
        )}
      </div>

      {/* Quality filter pills */}
      {anyScored && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: C.muted, fontFamily: fontB, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quality</span>
          {[
            { key: "all",      label: "All" },
            { key: "strong",   label: "Strong fit",   color: "#3B6D11", border: "#97C459" },
            { key: "probable", label: "Probable fit", color: "#854F0B", border: "#EF9F27" },
            { key: "weak",     label: "Weak fit",     color: "#A32D2D", border: "#F09595" },
            { key: "unscored", label: "Not scored",   color: C.muted,   border: C.border  },
          ].map(f => (
            <button key={f.key} onClick={() => { setQualityFilter(f.key); setSelectedIds(new Set()); }}
              style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontFamily: fontB,
                border: `1px solid ${qualityFilter === f.key ? (f.border || C.borderMid) : C.border}`,
                background: qualityFilter === f.key ? `${(f.color || C.muted)}18` : "transparent",
                color: qualityFilter === f.key ? (f.color || C.muted) : C.muted,
                cursor: "pointer", fontWeight: qualityFilter === f.key ? 700 : 400, transition: "all 0.15s" }}>
              {f.label}
            </button>
          ))}
          <span style={{ fontSize: "11px", color: C.muted, fontFamily: fontB }}>{displayCandidates.length} shown</span>
        </div>
      )}

      {/* Bulk action bar */}
      {!isMobile && poolTab === "matched" && someSelected && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", marginBottom: "12px", backgroundColor: C.errorLight, border: `1px solid rgba(224,92,92,0.25)`, borderRadius: "10px" }}>
          <span style={{ fontSize: "13px", color: C.error, fontWeight: "600", fontFamily: fontB }}>{selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""} selected</span>
          <button style={S.btn("danger", true)} onClick={() => setBulkRemoveConfirm(true)}><Icon n="person_remove" size={13} />Remove Selected</button>
          <button style={{ ...S.btn("outline", true), fontSize: "12px" }} onClick={() => setSelectedIds(new Set())}>Clear</button>
        </div>
      )}

      {/* Candidate list */}
      {displayCandidates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>
          <Icon n="people" size={40} color={C.border} style={{ display: "block", margin: "0 auto 12px" }} />
          {poolTab === "matched" ? "No matched candidates yet. Click Run Match to build the pool." : "No applied candidates yet. Share the apply link or upload CVs directly."}
        </div>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayCandidates.map(c => {
            const badge = srcBadge(c.source);
            return (
              <div key={c.candidate_id} style={{ ...S.cardMobile, opacity: c.is_active ? 1 : 0.45 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>{c.name || "—"}</div>
                    <div style={{ fontSize: "12px", color: C.muted }}>{[c.current_designation, c.current_company].filter(Boolean).join(" · ") || "—"}</div>
                    {/* Client flag — mobile */}
                    {c.client_flag === "not_appropriate" && (
                      <div style={{ marginTop: "4px" }}>
                        <ClientFlagBadge flag={c.client_flag} reason={c.client_flag_reason} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    {c.match_score != null && <span style={{ background: scoreBg(c.match_score), color: scoreColor(c.match_score), padding: "3px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>{Math.round(c.match_score * 100)}%</span>}
                    {c.quality_label && <QualityBadge label={c.quality_label} score={c.quality_score} rationale={c.quality_rationale} />}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={S.badge(badge.type)}>{badge.label}</span>
                  <button style={S.btn("outline", true)} onClick={() => viewCandidate(c.candidate_id)}><Icon n="person" size={12} />View</button>
                  <button className="similar-btn" style={S.btn("similar", true)} onClick={() => openSimilarWindow({ id: c.candidate_id, name: c.name })}><Icon n="hub" size={12} />Similar</button>
                  {poolTab === "applied" && <button style={{ ...S.btn("outline", true), fontSize: "11px" }} onClick={() => handleAddCandidate(c.candidate_id)}><Icon n="add" size={12} />Add to Matched</button>}
                  {c.is_active ? <button style={S.btn("danger", true)} onClick={() => setRemoveConfirm(c)}>Remove</button> : <button style={S.btn("success", true)} onClick={() => restoreCand(c.candidate_id)}>Restore</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ backgroundColor: C.white, borderRadius: "14px", border: `1px solid ${C.border}`, overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {poolTab === "matched" && (
                  <th style={{ ...S.th, width: "36px", textAlign: "center" }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ cursor: "pointer", accentColor: C.primary }} title="Select all" />
                  </th>
                )}
                {["Match","Name","Designation","Exp","Location","Score Breakdown","Quality","Source","Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayCandidates.map(c => {
                const badge = srcBadge(c.source);
                const isSelected = selectedIds.has(c.candidate_id);
                return (
                  <tr key={c.candidate_id}
                    style={{ opacity: c.is_active ? 1 : 0.4, backgroundColor: isSelected ? C.primaryDim : "" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = C.surface; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = isSelected ? C.primaryDim : ""; }}>
                    {poolTab === "matched" && (
                      <td style={{ ...S.td, width: "36px", textAlign: "center" }}>
                        {c.is_active && <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(c.candidate_id)} style={{ cursor: "pointer", accentColor: C.primary }} />}
                      </td>
                    )}
                    <td style={{ ...S.td, width: "60px", textAlign: "center" }}>
                      {c.match_score != null ? <MatchPillWithTooltip c={c} project={project} /> : <span style={{ fontSize: "13px", color: C.muted }}>—</span>}
                    </td>
                    <td style={{ ...S.td, maxWidth: "180px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || "—"}</div>
                        {c.tier1_institute && <span title="Tier 1 Institute" style={{ fontSize: "9px", fontWeight: "800", padding: "1px 5px", borderRadius: "4px", backgroundColor: C.primaryDim, color: C.primary, flexShrink: 0, fontFamily: font, letterSpacing: "0.04em" }}>T1</span>}
                      </div>
                      <div style={{ fontSize: "11px", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.current_company || "—"}</div>
                      {/* Client flag — desktop, sits under company name in the Name cell */}
                      {c.client_flag === "not_appropriate" && (
                        <div style={{ marginTop: "3px" }}>
                          <ClientFlagBadge flag={c.client_flag} reason={c.client_flag_reason} />
                        </div>
                      )}
                    </td>
                    <td style={{ ...S.td, fontSize: "12px", color: C.textMid, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.current_designation || "—"}</td>
                    <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600", whiteSpace: "nowrap" }}>{c.total_experience != null ? `${c.total_experience}y` : "—"}</td>
                    <td style={{ ...S.td, color: C.muted, fontSize: "12px", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.location || "—"}</td>
                    <td style={S.td}>
                      {c.match_score != null ? (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          <ScorePill label="Skill" value={c.skill_score ?? 0} color={C.success}
                            tooltipContent={(() => {
                              const mustHaves = project.must_have_skills ?? [];
                              const matched   = c.matching_skills ?? [];
                              const missing   = mustHaves.filter(s => !matched.some(m => m.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(m.toLowerCase())));
                              const goodTotal = project.good_to_have_skills?.length ?? 0;
                              return (
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Skill breakdown</div>
                                  {mustHaves.length > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                      <div style={{ fontSize: 11, color: C.muted, width: 90 }}>Must-have</div>
                                      <div style={{ flex: 1, height: 4, background: C.surface, borderRadius: 3 }}><div style={{ height: 4, borderRadius: 3, background: C.success, width: `${Math.round(((mustHaves.length - missing.length) / mustHaves.length) * 100)}%` }} /></div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: C.success, minWidth: 28, textAlign: "right" }}>{mustHaves.length - missing.length}/{mustHaves.length}</div>
                                    </div>
                                  )}
                                  {goodTotal > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                      <div style={{ fontSize: 11, color: C.muted, width: 90 }}>Good to have</div>
                                      <div style={{ flex: 1, height: 4, background: C.surface, borderRadius: 3 }}><div style={{ height: 4, borderRadius: 3, background: C.similar, width: `${Math.round(((c.good_matched ?? 0) / goodTotal) * 100)}%` }} /></div>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: C.similar, minWidth: 28, textAlign: "right" }}>{c.good_matched ?? 0}/{goodTotal}</div>
                                    </div>
                                  )}
                                  {matched.length > 0 && <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 6 }}><div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Matched</div><div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{matched.map(s => <span key={s} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 5, background: "#EAF3DE", color: "#3B6D11" }}>{s}</span>)}</div></div>}
                                  {missing.length > 0 && <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 6 }}><div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Missing</div><div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{missing.map(s => <span key={s} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 5, background: "#FCEBEB", color: "#A32D2D" }}>{s}</span>)}</div></div>}
                                  {mustHaves.length === 0 && matched.length === 0 && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Skills not configured on this project</div>}
                                </div>
                              );
                            })()}
                          />
                          <ScorePill label="Sem" value={c.vector_score ?? 0} color={C.primary} />
                          <ScorePill label="Exp" value={c.experience_score ?? 0} color={C.similar} />
                          {c.domain_score != null && (() => {
                            const dtl = domainTierLabel(c.domain_score);
                            return (
                              <ScorePill label="Dom" value={c.domain_score} color={C.info}
                                tooltipContent={dtl ? (
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Domain breakdown</div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                      <span style={{ fontSize: 11, color: C.muted }}>Tier</span>
                                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: dtl.bg, color: dtl.color }}>{dtl.label}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 8, lineHeight: 1.6 }}>
                                      {c.domain_score >= 1.0                            && "Matches ideal sector and sub-domain exactly."}
                                      {c.domain_score >= 0.90 && c.domain_score < 1.0  && "Matches adjacent sub-domain within ideal sector."}
                                      {c.domain_score >= 0.70 && c.domain_score < 0.90 && "Right sector but not the target sub-domain."}
                                      {c.domain_score >= 0.55 && c.domain_score < 0.70 && "Acceptable sector with preferred sub-domain match."}
                                      {c.domain_score >= 0.45 && c.domain_score < 0.55 && "Acceptable sector — broader background."}
                                      {c.domain_score >= 0.35 && c.domain_score < 0.45 && "Acceptable sector — company type match only."}
                                      {c.domain_score  < 0.35                          && "No meaningful domain alignment found."}
                                    </div>
                                  </div>
                                ) : null}
                              />
                            );
                          })()}
                        </div>
                      ) : <span style={{ fontSize: "12px", color: C.muted }}>—</span>}
                    </td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      {c.quality_label ? <QualityBadge label={c.quality_label} score={c.quality_score} rationale={c.quality_rationale} /> : <span style={{ fontSize: "12px", color: C.muted }}>—</span>}
                    </td>
                    <td style={S.td}><span style={S.badge(badge.type)}>{badge.label}</span></td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <button style={S.btn("outline", true)} onClick={() => viewCandidate(c.candidate_id)}><Icon n="person" size={12} />View</button>
                        <button className="similar-btn" style={S.btn("similar", true)} onClick={() => openSimilarWindow({ id: c.candidate_id, name: c.name })}><Icon n="hub" size={12} />Similar</button>
                        {poolTab === "applied" && <button style={{ ...S.btn("outline", true), fontSize: "11px" }} onClick={() => handleAddCandidate(c.candidate_id)}><Icon n="add" size={12} />Match</button>}
                        {c.is_active
                          ? <button title="Remove candidate" style={{ ...S.btn("outline", true), padding: "6px 8px", color: C.error, borderColor: "rgba(224,92,92,0.3)" }} onClick={() => setRemoveConfirm(c)}><Icon n="delete" size={14} color={C.error} /></button>
                          : <button style={S.btn("success", true)} onClick={() => restoreCand(c.candidate_id)}><Icon n="undo" size={12} />Restore</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showReport && <GenerateReportModal project={project} allCandidates={candidates} matchedCandidates={matchedCandidates.filter(c => c.is_active)} shortlistedCandidates={shortlistedCandidates} onClose={() => setShowReport(false)} />}
      {showBulkUpload && <BulkCvUploadModal project={project} onClose={() => setShowBulkUpload(false)} onComplete={fetchCandidates} />}

      {/* Single remove confirm */}
      {removeConfirm && (
        <div style={S.modal} onClick={() => setRemoveConfirm(null)}>
          <div style={{ ...S.modalWrap, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.errorLight, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="person_remove" size={15} color={C.error} /></div>
                <span style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Remove Candidate</span>
              </div>
              <button onClick={() => setRemoveConfirm(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon n="close" size={20} /></button>
            </div>
            <div style={S.modalBody}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: C.text, marginBottom: "6px", fontFamily: fontH }}>{removeConfirm.name || "This candidate"}</div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "16px" }}>{[removeConfirm.current_designation, removeConfirm.current_company].filter(Boolean).join(" · ")}</div>
              <div style={{ backgroundColor: C.warningLight, border: `1px solid rgba(217,119,6,0.25)`, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: C.warning, lineHeight: "1.6", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Icon n="warning" size={15} color={C.warning} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>This candidate will be permanently removed from this project. <strong>This only affects this project</strong> — they remain in the candidate database.</span>
              </div>
            </div>
            <div style={S.modalFoot}>
              <button style={S.btn("danger")} onClick={() => removeCand(removeConfirm.candidate_id)}><Icon n="person_remove" size={14} />Confirm Remove</button>
              <button style={S.btn("outline")} onClick={() => setRemoveConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk remove confirm */}
      {bulkRemoveConfirm && (
        <div style={S.modal} onClick={() => setBulkRemoveConfirm(false)}>
          <div style={{ ...S.modalWrap, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.errorLight, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="group_remove" size={15} color={C.error} /></div>
                <span style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Remove {selectedIds.size} Candidate{selectedIds.size > 1 ? "s" : ""}</span>
              </div>
              <button onClick={() => setBulkRemoveConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon n="close" size={20} /></button>
            </div>
            <div style={S.modalBody}>
              <div style={{ backgroundColor: C.errorLight, border: `1px solid rgba(224,92,92,0.25)`, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: C.error, lineHeight: "1.6", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Icon n="warning" size={15} color={C.error} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span><strong>{selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""}</strong> will be permanently removed from this project. They remain in the candidate database.</span>
              </div>
            </div>
            <div style={S.modalFoot}>
              <button style={{ ...S.btn("danger"), opacity: bulkRemoving ? 0.6 : 1 }} onClick={executeBulkRemove} disabled={bulkRemoving}><Icon n="group_remove" size={14} />{bulkRemoving ? "Removing…" : `Remove ${selectedIds.size}`}</button>
              <button style={S.btn("outline")} onClick={() => setBulkRemoveConfirm(false)} disabled={bulkRemoving}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}