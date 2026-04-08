// ─── PROFILE MODAL ────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import { apiFetch, openSimilarWindow, companyTypeLabel, workTypeLabel, trajectoryLabel, educationLabel } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "./Icon";

export default function ProfileModal({ candidate: init, onClose }) {
  const [c, setC]                 = useState(init);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({ phone: init.phone || "", location: init.location || "", recruiter_notes: init.recruiter_notes || "" });
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState("");
  const [projects, setProjects]   = useState([]);
  const [showProjDrop, setShowProjDrop] = useState(false);
  const [addingToProj, setAddingToProj] = useState(null);
  const [addedToProj, setAddedToProj]   = useState(null);
  const isMobile = useIsMobile();

  if (!c) return null;

  const meta      = c.metadata_json || {};
  const knownKeys = ["all_designations", "functions", "companies", "education", "certifications", "languages", "academic_institutions"];
  const extraKeys = Object.keys(meta).filter(k => !knownKeys.includes(k) && meta[k]);

  useEffect(() => {
    apiFetch("/api/v1/projects?archived=false")
      .then(r => r.json())
      .then(d => setProjects(d.projects || []))
      .catch(() => {});
  }, []);

  const Section = ({ title, children }) => (
    <div style={{ marginTop: "16px" }}>
      <div style={{ ...S.label, paddingBottom: "6px", borderBottom: `2px solid ${C.border}`, marginBottom: "10px" }}>{title}</div>
      {children}
    </div>
  );

  const F = ({ label, value }) => !value && value !== 0 ? null : (
    <div style={{ marginBottom: "10px" }}>
      <div style={S.label}>{label}</div>
      <div style={{ fontSize: "13px", color: C.textMid }}>{value}</div>
    </div>
  );

  const Pill = ({ label, bg = "rgba(255,255,255,0.18)", color = "#fff" }) => label ? (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backgroundColor: bg, color }}>{label}</span>
  ) : null;

  const saveEdit = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await apiFetch(`/api/v1/candidates/${c.id}`, { method: "PATCH", body: JSON.stringify(editForm) });
      if (res.ok) { const u = await res.json(); setC(u); setEditing(false); setSaveMsg("Saved"); }
      else setSaveMsg("Failed");
    } catch { setSaveMsg("Error"); } finally { setSaving(false); }
  };

  const addToProject = async (projectId) => {
    setAddingToProj(projectId);
    try {
      await apiFetch(`/api/v1/projects/${projectId}/candidates/${c.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "add", action_source: "manual_add" }),
      });
      setAddedToProj(projectId);
      setShowProjDrop(false);
    } catch {} finally { setAddingToProj(null); }
  };

  return (
    <div style={{ ...S.modal, alignItems: isMobile ? "flex-end" : "center", padding: isMobile ? "0" : "16px" }} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: isMobile ? "100%" : "720px", width: "100%",
        maxHeight: isMobile ? "92vh" : "88vh", overflowY: "auto",
        borderRadius: isMobile ? "20px 20px 0 0" : "20px" }} onClick={e => e.stopPropagation()}>

        {/* Header gradient */}
        <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #9b8fd0 100%)`, padding: "20px 22px 18px" }}>
          {isMobile && <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.35)", margin: "0 auto 16px" }} />}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "19px", fontWeight: "700", color: "#fff", marginBottom: "2px", fontFamily: fontH }}>{c.name || "Unknown"}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>{c.current_designation || "No designation"}{c.current_company ? ` · ${c.current_company}` : ""}</div>
            </div>
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {/* Find Similar */}
              <button className="similar-btn" onClick={() => { onClose(); openSimilarWindow(c); }}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: "600", backgroundColor: C.similar, color: "#fff",
                  display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n="hub" size={14} />Find Similar
              </button>
              {/* Add to Project */}
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowProjDrop(p => !p); setAddedToProj(null); }}
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)",
                    cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    backgroundColor: addedToProj ? "rgba(59,178,115,0.35)" : "rgba(255,255,255,0.15)",
                    color: "#fff", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Icon n={addedToProj ? "check" : "work"} size={14} />
                  {addedToProj ? "Added!" : "Add to Project"}
                </button>
                {showProjDrop && (
                  <div style={{ position: "absolute", top: "110%", right: 0, zIndex: 200,
                    backgroundColor: C.white, border: `1px solid ${C.border}`,
                    borderRadius: "10px", boxShadow: "0 8px 24px rgba(98,100,244,0.14)",
                    minWidth: "230px", overflow: "hidden" }}>
                    {projects.length === 0 ? (
                      <div style={{ padding: "12px 14px", fontSize: "13px", color: C.muted }}>No active projects</div>
                    ) : projects.map(p => (
                      <button key={p.id}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                          width: "100%", padding: "10px 14px", border: "none", background: "none",
                          cursor: "pointer", fontSize: "13px", color: C.text, textAlign: "left",
                          borderBottom: `1px solid ${C.border}` }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}
                        onClick={() => addToProject(p.id)}
                        disabled={addingToProj === p.id}>
                        <span>{p.title}</span>
                        {addingToProj === p.id && <Icon n="sync" size={14} color={C.muted} />}
                        {addedToProj === p.id  && <Icon n="check" size={14} color={C.success} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* View CV */}
              {c.cv_storage_url && (
                <a href={c.cv_storage_url} target="_blank" rel="noreferrer"
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)",
                    fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#fff", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
                  <Icon n="open_in_new" size={14} />View CV
                </a>
              )}
              {/* Edit */}
              {!isMobile && (
                <button onClick={() => { setEditing(!editing); setSaveMsg(""); }}
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)",
                    cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    backgroundColor: "rgba(255,255,255,0.15)", color: "#fff",
                    display: "flex", alignItems: "center", gap: "5px" }}>
                  <Icon n={editing ? "close" : "edit"} size={14} />{editing ? "Cancel" : "Edit"}
                </button>
              )}
              {/* Close */}
              <button onClick={onClose}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", cursor: "pointer",
                  backgroundColor: "rgba(255,255,255,0.15)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon n="close" size={18} />
              </button>
            </div>
          </div>

          {/* Pills row 1 */}
          <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
            <Pill label={c.is_leadership ? "Leadership" : null} />
            <Pill label={c.source} />
            <Pill label={c.total_experience != null ? `${c.total_experience}y exp` : null} bg="rgba(59,178,115,0.4)" />
            <Pill label={c.current_ctc ? `${c.current_ctc}L CTC` : null} />
          </div>
          {/* Pills row 2 */}
          <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
            <Pill label={educationLabel(c.highest_education_level)} />
            <Pill label={c.tier1_institute ? "Tier 1 Institute" : null} bg="rgba(245,158,11,0.35)" />
            <Pill label={trajectoryLabel(c.career_trajectory)} />
            <Pill label={companyTypeLabel(c.current_company_type)} />
            <Pill label={workTypeLabel(c.current_work_type)} />
            <Pill label={c.notice_period != null ? `${c.notice_period}d notice` : null} />
            <Pill label={c.estimated_age != null ? `~${c.estimated_age} yrs` : null} bg="rgba(255,255,255,0.1)" color="rgba(255,255,255,0.75)" />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px" }}>
          {/* AI Summary */}
          {c.ai_cv_summary && !editing && (
            <div style={{ backgroundColor: C.primaryDim, border: `1px solid rgba(98,100,244,0.18)`, borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", color: C.primary, fontWeight: "700", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fontH }}>AI Summary</div>
              <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{c.ai_cv_summary}</div>
            </div>
          )}
          {/* Recruiter Notes */}
          {c.recruiter_notes && !editing && (
            <div style={{ backgroundColor: C.warningLight, border: `1px solid rgba(217,119,6,0.18)`, borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", color: C.warning, fontWeight: "700", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fontH }}>Recruiter Notes</div>
              <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{c.recruiter_notes}</div>
            </div>
          )}
          {/* Edit form */}
          {editing && (
            <div style={{ backgroundColor: C.primaryDim, border: `1px solid rgba(98,100,244,0.2)`, borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: C.primary, fontWeight: "700", marginBottom: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Edit Contact Info</div>
              <div style={S.grid2}>
                <div><label style={S.label}>Phone</label><input style={S.input} value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><label style={S.label}>Location</label><input style={S.input} value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} /></div>
              </div>
              <div style={{ marginTop: "10px" }}>
                <label style={S.label}>Recruiter Notes</label>
                <textarea value={editForm.recruiter_notes} onChange={e => setEditForm(p => ({ ...p, recruiter_notes: e.target.value }))}
                  style={{ ...S.input, height: "90px", resize: "vertical", lineHeight: "1.5" }} />
              </div>
              <div style={{ ...S.row, marginTop: "10px" }}>
                <button style={S.btn("primary", true)} onClick={saveEdit} disabled={saving}><Icon n="save" size={13} />{saving ? "Saving..." : "Save"}</button>
                {saveMsg && <span style={{ fontSize: "12px", color: saveMsg === "Saved" ? C.success : C.error }}>{saveMsg}</span>}
              </div>
            </div>
          )}

          <Section title="Contact & Personal">
            <div style={S.grid2}>
              <F label="Email" value={c.email} /><F label="Phone" value={c.phone} />
              <F label="Location" value={c.location} /><F label="Gender" value={c.gender} />
              <F label="LinkedIn" value={c.linkedin_url ? <a href={c.linkedin_url} target="_blank" rel="noreferrer" style={{ color: C.primary }}>View Profile</a> : null} />
              <F label="Candidate ID" value={`#${c.id}`} />
            </div>
          </Section>
          <Section title="Career">
            <div style={S.grid2}>
              <F label="Total Experience" value={c.total_experience != null ? `${c.total_experience} years` : null} />
              <F label="Current CTC" value={c.current_ctc ? `${c.current_ctc} Lakhs` : null} />
              <F label="Career Gap" value={c.career_gap_years != null ? `${c.career_gap_years} years` : null} />
              <F label="Notice Period" value={c.notice_period != null ? `${c.notice_period} days` : null} />
              <F label="Work Type" value={workTypeLabel(c.current_work_type)} />
              <F label="Company Type" value={companyTypeLabel(c.current_company_type)} />
              <F label="Career Trajectory" value={trajectoryLabel(c.career_trajectory)} />
              <F label="Source" value={c.source} />
            </div>
          </Section>
          <Section title="Education">
            <div style={S.grid2}>
              <F label="Highest Level" value={educationLabel(c.highest_education_level)} />
              <F label="Tier 1 Institute" value={c.tier1_institute != null ? (c.tier1_institute ? "Yes" : "No") : null} />
              <F label="Estimated Age" value={c.estimated_age != null ? `~${c.estimated_age} years` : null} />
            </div>
            {(meta.education || []).length > 0 && <div style={{ marginTop: "6px" }}>{meta.education.map((e, i) => <div key={i} style={{ fontSize: "13px", marginBottom: "5px", color: C.textMid }}>🎓 {e}</div>)}</div>}
            {(meta.academic_institutions || []).length > 0 && <div style={{ marginTop: "6px" }}>{meta.academic_institutions.map((e, i) => <div key={i} style={{ fontSize: "13px", marginBottom: "5px", color: C.textMid }}>🏫 {e}</div>)}</div>}
          </Section>
          {(c.skills || []).length > 0 && <Section title={`Skills (${c.skills.length})`}><div>{c.skills.map((s, i) => <span key={i} style={S.tag}>{s}</span>)}</div></Section>}
          {(c.industry_history || []).length > 0 && <Section title="Industry History"><div>{c.industry_history.map((ind, i) => <span key={i} style={{ ...S.tag, backgroundColor: C.successLight, color: C.success, border: "1px solid rgba(59,178,115,0.2)" }}>{ind}</span>)}</div></Section>}
          {(meta.all_designations || []).length > 0 && <Section title="All Designations"><div>{meta.all_designations.map((d, i) => <span key={i} style={{ ...S.tag, backgroundColor: C.successLight, color: C.success, border: "1px solid rgba(59,178,115,0.2)" }}>{d}</span>)}</div></Section>}
          {(meta.companies || []).length > 0 && <Section title="Companies"><div>{meta.companies.map((co, i) => <span key={i} style={{ ...S.tag, backgroundColor: C.warningLight, color: C.warning, border: "1px solid rgba(217,119,6,0.2)" }}>{co}</span>)}</div></Section>}
          {(meta.functions || []).length > 0 && <Section title="Functions"><div>{meta.functions.map((f, i) => <span key={i} style={S.tag}>{f}</span>)}</div></Section>}
          {(meta.certifications || []).length > 0 && <Section title="Certifications">{meta.certifications.map((cert, i) => <div key={i} style={{ fontSize: "13px", marginBottom: "5px", color: C.textMid }}>📜 {cert}</div>)}</Section>}
          {(meta.languages || []).length > 0 && <Section title="Languages"><div style={{ fontSize: "13px", color: C.textMid }}>{meta.languages.join("  ·  ")}</div></Section>}
          {extraKeys.map(key => {
            const val = meta[key];
            return (
              <Section key={key} title={key.replace(/_/g, " ").toUpperCase()}>
                {Array.isArray(val)
                  ? <div>{val.map((v, i) => <span key={i} style={S.tag}>{v}</span>)}</div>
                  : <div style={{ fontSize: "13px" }}>{String(val)}</div>}
              </Section>
            );
          })}
          {/* Parse metadata footer */}
          <div style={{ marginTop: "16px", padding: "10px 12px", backgroundColor: C.surface, borderRadius: "8px", display: "flex", gap: "16px" }}>
            {c.parse_model   && <span style={{ fontSize: "11px", color: C.muted }}>Model: <span style={{ fontFamily: font }}>{c.parse_model}</span></span>}
            {c.parse_version && <span style={{ fontSize: "11px", color: C.muted }}>Parse v{c.parse_version}</span>}
            {c.source_file   && <span style={{ fontSize: "11px", color: C.muted, fontFamily: font }}>{c.source_file}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
