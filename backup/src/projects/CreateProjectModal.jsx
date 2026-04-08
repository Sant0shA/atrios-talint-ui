// ─── CREATE PROJECT MODAL ─────────────────────────────────────────────────────
// Exports: default CreateProjectModal, named ParseReviewModal
// Internal: LiveHashtagPreview, InlineGuide

import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import { apiFetch, parseHashtagsFromNote, GUIDE_TEMPLATE } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import HiringBriefFlow from "./HiringBriefFlow";

// ─── LIVE HASHTAG PREVIEW ─────────────────────────────────────────────────────

function LiveHashtagPreview({ note, sectorMap, sectorLabels }) {
  const parsed = parseHashtagsFromNote(note, sectorMap);
  const hasAny = parsed.company_type || parsed.min_exp !== null || parsed.max_exp !== null || parsed.skills.length > 0;
  if (!hasAny) return null;
  return (
    <div style={{ marginTop: "10px", padding: "10px 13px", borderRadius: "10px", backgroundColor: "rgba(98,100,244,0.05)", border: "1px solid rgba(98,100,244,0.15)" }}>
      <div style={{ fontSize: "10px", fontWeight: "700", color: C.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: fontH, display: "flex", alignItems: "center", gap: "5px" }}>
        <Icon n="auto_awesome" size={12} color={C.primary} />Detected # overrides
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {parsed.company_type && (
          <span style={{ padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(217,119,6,0.1)", color: C.warning, fontFamily: font, border: "1px solid rgba(217,119,6,0.2)" }}>
            🏢 {sectorLabels[parsed.company_type] || parsed.company_type}
            <span style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.8 }}>(overrides dropdown)</span>
          </span>
        )}
        {parsed.min_exp !== null && <span style={{ padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(59,178,115,0.1)", color: "#2a7a50", fontFamily: font }}>↑ min {parsed.min_exp} yrs</span>}
        {parsed.max_exp !== null && <span style={{ padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(59,178,115,0.1)", color: "#2a7a50", fontFamily: font }}>↓ max {parsed.max_exp} yrs</span>}
        {parsed.skills.map((s, i) => (
          <span key={i} style={{ padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", backgroundColor: C.primaryDim, color: C.primary, fontFamily: font, border: "1px solid rgba(98,100,244,0.15)" }}>#{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─── INLINE GUIDE ─────────────────────────────────────────────────────────────

function InlineGuide({ expanded, onToggle, sectors }) {
  const [copied, setCopied] = useState(false);
  const copyTemplate = () => {
    navigator.clipboard.writeText(GUIDE_TEMPLATE).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div style={{ borderRadius: "10px", border: `1px solid ${C.border}`, backgroundColor: "#faf9fe", overflow: "hidden", marginTop: "6px" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", background: "none", border: "none", cursor: "pointer", color: C.primary, fontFamily: fontB }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600" }}>
          <Icon n="tips_and_updates" size={14} color={C.primary} />
          How to write a strong brief — and use{" "}
          <code style={{ backgroundColor: C.primaryDim, padding: "1px 5px", borderRadius: "4px", fontFamily: font, fontSize: "11px" }}>#</code>{" "}overrides
        </div>
        <Icon n={expanded ? "expand_less" : "expand_more"} size={16} color={C.muted} />
      </button>
      {expanded && (
        <div style={{ padding: "0 13px 13px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "13px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: fontH }}>Job Description</div>
              {[
                ["check_circle", C.success, "Paste the full JD — don't summarise"],
                ["check_circle", C.success, "Include responsibilities, requirements, sector context"],
                ["check_circle", C.success, "Longer JDs produce better skill extraction"],
                ["cancel",       C.error,   "Don't remove company name if it signals sector"],
              ].map(([icon, color, text], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px", fontSize: "12px", color: C.textMid, marginBottom: "6px", lineHeight: "1.5" }}>
                  <Icon n={icon} size={13} color={color} style={{ marginTop: "2px", flexShrink: 0 }} />{text}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: fontH }}>Client / Recruiter Note</div>
              {[
                ["check_circle", C.success, "Add context the JD doesn't state — deal-breakers, preferences"],
                ["check_circle", C.success, "Use #skill to add skills the parser might miss"],
                ["check_circle", C.success, "#min_exp / #max_exp override parsed experience band"],
                ["check_circle", C.success, "#company_type:sector overrides the dropdown for quick fix"],
                ["cancel",       C.error,   "Don't repeat what's already clear in the JD"],
              ].map(([icon, color, text], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px", fontSize: "12px", color: C.textMid, marginBottom: "6px", lineHeight: "1.5" }}>
                  <Icon n={icon} size={13} color={color} style={{ marginTop: "2px", flexShrink: 0 }} />{text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "12px", borderRadius: "8px", backgroundColor: "#f0f0f8", border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 11px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: fontH }}># override template — paste into Client Note</span>
              <button onClick={copyTemplate} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: copied ? C.success : C.primary, background: "none", border: "none", cursor: "pointer", fontFamily: fontB, padding: "2px 0" }}>
                <Icon n={copied ? "check" : "content_copy"} size={13} color={copied ? C.success : C.primary} />{copied ? "Copied!" : "Copy template"}
              </button>
            </div>
            <pre style={{ margin: 0, padding: "10px 12px", fontSize: "12px", fontFamily: font, color: C.primary, lineHeight: "1.7", overflowX: "auto", whiteSpace: "pre-wrap" }}>
{`#min_exp:3  #max_exp:8
#fundraising #donor management #grant writing #stakeholder engagement

// To override sector: #company_type:ngo`}
            </pre>
          </div>
          {sectors.length > 0 && (
            <div style={{ marginTop: "10px", fontSize: "11px", color: C.muted, lineHeight: "1.8" }}>
              <span style={{ fontWeight: "700" }}>Valid #company_type values: </span>
              {sectors.map((s, i, a) => (
                <span key={s.value}>
                  <code style={{ backgroundColor: C.primaryDim, color: C.primary, padding: "1px 5px", borderRadius: "4px", fontFamily: font, fontSize: "10px" }}>{s.value}</code>
                  {i < a.length - 1 ? " · " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PARSE REVIEW MODAL ───────────────────────────────────────────────────────
// Props: parsed, form, sectorLabels, sectorMap, onConfirm, onBack,
//        confirming, confirmLabel, confirmIcon

export function ParseReviewModal({ parsed, form, sectorLabels, sectorMap, onConfirm, onBack, confirming, confirmLabel, confirmIcon }) {
  const hashParsed = parseHashtagsFromNote(form.client_note, sectorMap);

  const displaySkills = (() => {
    const base   = (parsed.must_have_skills || []).map(s => s.toLowerCase());
    const tags   = hashParsed.skills;
    const seen   = new Set(base);
    const merged = [...base];
    tags.forEach(s => { if (!seen.has(s)) { seen.add(s); merged.push(s); } });
    return { base, tags, merged };
  })();

  const displayCompanyType = hashParsed.company_type || form.company_type || parsed.company_type;
  const ctSource = hashParsed.company_type ? "hashtag"
    : form.company_type ? "dropdown"
    : parsed.company_type ? "parser"
    : null;
  const displayMinExp = hashParsed.min_exp !== null ? hashParsed.min_exp : parsed.min_experience;
  const displayMaxExp = hashParsed.max_exp !== null ? hashParsed.max_exp : parsed.max_experience;
  const hasWarnings   = !displayCompanyType || displayMinExp === null || displayMaxExp === null || displaySkills.merged.length === 0;

  const ctSourceBadge = ctSource ? (
    <span style={{ fontSize: "10px", color: ctSource === "hashtag" ? C.warning : C.primary, backgroundColor: ctSource === "hashtag" ? "rgba(217,119,6,0.1)" : C.primaryDim, padding: "1px 6px", borderRadius: "4px", fontFamily: font }}>
      via {ctSource}
    </span>
  ) : null;

  const Field = ({ label, value, warn, children }) => (
    <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: warn ? "rgba(217,119,6,0.06)" : value ? "rgba(59,178,115,0.05)" : C.surface, border: `1px solid ${warn ? "rgba(217,119,6,0.2)" : value ? "rgba(59,178,115,0.2)" : C.border}` }}>
      <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px", fontFamily: fontH, display: "flex", alignItems: "center", gap: "5px" }}>
        <Icon n={value ? "check_circle" : "warning"} size={12} color={value ? C.success : warn ? C.warning : C.muted} />{label}
      </div>
      {children || (
        <div style={{ fontSize: "13px", color: value ? C.text : C.muted, fontWeight: "600" }}>
          {value !== null && value !== undefined ? String(value) : <span style={{ color: C.warning, fontStyle: "italic", fontWeight: "400" }}>null — not extracted</span>}
        </div>
      )}
    </div>
  );

  return (
    <div style={S.modal} onClick={e => e.stopPropagation()}>
      <div style={{ ...S.modalWrap, maxWidth: "560px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="manage_search" size={17} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Review Parsed Data</div>
              <div style={{ fontSize: "11px", color: C.muted }}>Verify before confirming — go back to fix via # or dropdown if needed</div>
            </div>
          </div>
          {hasWarnings && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "700", color: C.warning, backgroundColor: C.warningLight, padding: "4px 10px", borderRadius: "20px" }}>
              <Icon n="warning" size={13} color={C.warning} />Needs review
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ ...S.modalBody, overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: "4px", fontSize: "12px", color: C.muted }}>Project</div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: C.text, marginBottom: "16px", fontFamily: fontH }}>{form.title}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <Field label="Sector / Company Type" value={displayCompanyType} warn={!displayCompanyType}>
              {displayCompanyType ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>{sectorLabels[displayCompanyType] || displayCompanyType}</span>
                  {ctSourceBadge}
                </div>
              ) : null}
            </Field>
            <Field label="Experience Band" value={displayMinExp !== null || displayMaxExp !== null ? `${displayMinExp ?? "?"} – ${displayMaxExp ?? "?"} yrs` : null} warn={displayMinExp === null && displayMaxExp === null}>
              {(displayMinExp !== null || displayMaxExp !== null) ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>{displayMinExp ?? "?"} – {displayMaxExp ?? "?"} yrs</span>
                  {(hashParsed.min_exp !== null || hashParsed.max_exp !== null) && (
                    <span style={{ fontSize: "10px", color: C.primary, backgroundColor: C.primaryDim, padding: "1px 6px", borderRadius: "4px", fontFamily: font }}>via #</span>
                  )}
                </div>
              ) : null}
            </Field>
          </div>

          {/* Must-have skills */}
          <div style={{ padding: "12px 14px", borderRadius: "10px", marginBottom: "10px", backgroundColor: displaySkills.merged.length > 0 ? "rgba(59,178,115,0.05)" : C.surface, border: `1px solid ${displaySkills.merged.length > 0 ? "rgba(59,178,115,0.2)" : C.border}` }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: fontH, display: "flex", alignItems: "center", gap: "5px" }}>
              <Icon n={displaySkills.merged.length > 0 ? "check_circle" : "warning"} size={12} color={displaySkills.merged.length > 0 ? C.success : C.warning} />
              Must-Have Skills ({displaySkills.merged.length})
            </div>
            {displaySkills.merged.length > 0 ? (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {displaySkills.merged.map((s, i) => {
                    const fromHash = displaySkills.tags.includes(s) && !displaySkills.base.includes(s);
                    return (
                      <span key={i} style={{ padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", fontFamily: font, backgroundColor: fromHash ? C.primaryDim : "rgba(59,178,115,0.1)", color: fromHash ? C.primary : "#2a7a50", border: `1px solid ${fromHash ? "rgba(98,100,244,0.2)" : "rgba(59,178,115,0.2)"}` }}>
                        {fromHash ? "#" : ""}{s}
                      </span>
                    );
                  })}
                </div>
                {displaySkills.tags.length > 0 && displaySkills.base.length > 0 && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: C.muted }}>
                    <span style={{ color: "#2a7a50", fontWeight: "600" }}>■</span> from JD &nbsp;&nbsp;
                    <span style={{ color: C.primary, fontWeight: "600" }}>#</span> added via hashtag
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: "12px", color: C.warning, fontStyle: "italic" }}>No skills extracted — go back and add #skills to the client note</div>
            )}
          </div>

          {/* JD Summary */}
          {parsed.jd_summary && (
            <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px", fontFamily: fontH }}>JD Summary (AI-generated)</div>
              <div style={{ fontSize: "12px", color: C.textMid, lineHeight: "1.6" }}>{parsed.jd_summary}</div>
            </div>
          )}

          {hasWarnings && (
            <div style={{ marginTop: "12px", padding: "10px 13px", borderRadius: "10px", backgroundColor: C.warningLight, border: "1px solid rgba(217,119,6,0.25)", fontSize: "12px", color: C.warning, lineHeight: "1.6" }}>
              <div style={{ fontWeight: "700", marginBottom: "3px", display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n="info" size={13} color={C.warning} />Missing fields will reduce match quality
              </div>
              Go back and fix using the sector dropdown or # overrides in the Client Note.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={S.modalFoot}>
          <button style={{ ...S.btn("primary"), opacity: confirming ? 0.65 : 1 }} onClick={onConfirm} disabled={confirming}>
            <Icon n={confirmIcon || "check"} size={15} />
            {confirming ? "Creating…" : (confirmLabel || "Confirm & Create Project")}
          </button>
          <button style={S.btn("outline")} onClick={onBack} disabled={confirming}>
            <Icon n="arrow_back" size={14} />Go Back & Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CREATE PROJECT MODAL ─────────────────────────────────────────────────────

export default function CreateProjectModal({ onCreated, onCancel }) {
  const isMobile = useIsMobile();

  const [form, setForm]             = useState({ title: "", jd_text: "", company_type: "", client_id: "" });
  const [parsing, setParsing]       = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError]           = useState("");
  const [guideOpen, setGuideOpen]   = useState(false);
  const [preview, setPreview]       = useState(null);
  const [briefMode, setBriefMode]   = useState(false);
  const [briefResult, setBriefResult] = useState(null);
  const [sectors, setSectors]       = useState([]);
  const [sectorMap, setSectorMap]   = useState({});
  const [sectorLabels, setSectorLabels] = useState({});
  const [clients, setClients]       = useState([]);

  useEffect(() => {
    apiFetch("/api/v1/sectors").then(r => r.json()).then(d => {
      const list = d.sectors || [];
      setSectors(list);
      const map = {}, labels = {};
      list.forEach(s => { map[s.value] = true; labels[s.value] = s.label; });
      setSectorMap(map); setSectorLabels(labels);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch("/api/v1/admin/clients/simple").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handlePreview = async () => {
    if (!form.client_id)                 { setError("Please select a client for this project."); return; }
    if (!form.title.trim())              { setError("Project title is required."); return; }
    if (form.jd_text.trim().length < 50) { setError("Please paste the full job description (at least 50 characters)."); return; }
    setParsing(true); setError("");
    try {
      const r = await apiFetch("/api/v1/projects/preview", { method: "POST", body: JSON.stringify({ title: form.title.trim(), jd_text: form.jd_text.trim(), company_type: form.company_type || null, client_note: null }) });
      const d = await r.json();
      if (!r.ok) { setError(d.detail || "Failed to parse JD."); setParsing(false); return; }
      setPreview(d);
    } catch { setError("Network error."); } finally { setParsing(false); }
  };

  const handleGoToBrief    = () => setBriefMode(true);
  const handleBriefComplete = (result) => { setBriefResult(result); setBriefMode(false); };
  const handleBack          = () => { setPreview(null); setBriefResult(null); };

  const handleConfirm = async () => {
    setConfirming(true); setError("");
    try {
      const r = await apiFetch("/api/v1/projects", { method: "POST", body: JSON.stringify({ title: form.title.trim(), jd_text: form.jd_text.trim(), company_type: form.company_type || null, client_note: briefResult?.client_note || null, hiring_brief_raw: briefResult?.structured || null, client_id: form.client_id ? parseInt(form.client_id, 10) : null }) });
      const d = await r.json();
      if (!r.ok) { setError(d.detail || "Failed to create project."); setConfirming(false); return; }
      onCreated(d);
    } catch { setError("Network error."); setConfirming(false); }
  };

  const ta = { ...S.input, resize: "vertical", marginTop: "6px" };

  if (briefMode) {
    return <HiringBriefFlow jobTitle={form.title} jdText={form.jd_text} parsedSkills={preview?.must_have_skills || []} onComplete={handleBriefComplete} onCancel={() => setBriefMode(false)} />;
  }

  return (
    <>
      <div>
        {!isMobile && (
          <>
            <div style={S.pageTitle}>New Project</div>
            <div style={S.pageSub}>Paste a JD to create a project and start matching candidates</div>
          </>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <button style={S.btn("outline", true)} onClick={onCancel} disabled={parsing}><Icon n="arrow_back" size={14} /> Back</button>
        </div>

        <div style={{ ...S.card, maxWidth: "680px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Client */}
            <div>
              <label style={S.label}>Client * <span style={{ fontWeight: "400", color: C.muted, textTransform: "none", letterSpacing: 0 }}>(which company is this mandate for?)</span></label>
              <select style={S.select} value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                <option value="">— Select client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {clients.length === 0 && <div style={{ fontSize: "11px", color: C.warning, marginTop: "4px", display: "flex", alignItems: "center", gap: "5px" }}><Icon n="warning" size={12} color={C.warning} />No clients found — create one in Admin → Clients first</div>}
            </div>

            {/* Title */}
            <div>
              <label style={S.label}>Project Title *</label>
              <input style={ta} placeholder="e.g. Senior PM — FinTech · HDFC" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            {/* Sector */}
            <div>
              <label style={S.label}>Sector / Company Type <span style={{ fontWeight: "400", color: C.muted, textTransform: "none", letterSpacing: 0 }}>(recommended — improves domain matching)</span></label>
              <select style={S.select} value={form.company_type} onChange={e => setForm(f => ({ ...f, company_type: e.target.value }))}>
                <option value="">— Let AI infer from JD —</option>
                {sectors.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* JD */}
            <div>
              <label style={S.label}>Job Description *</label>
              <textarea style={{ ...ta, height: "220px" }} placeholder="Paste the full JD here…" value={form.jd_text} onChange={e => setForm(f => ({ ...f, jd_text: e.target.value }))} />
              <InlineGuide expanded={guideOpen} onToggle={() => setGuideOpen(o => !o)} sectors={sectors} />
            </div>

            {/* Brief ready */}
            {briefResult && (
              <div style={{ padding: "14px 16px", borderRadius: "12px", backgroundColor: "rgba(59,178,115,0.06)", border: `1px solid rgba(59,178,115,0.25)`, display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <Icon n="check_circle" size={20} color={C.success} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: C.text, marginBottom: "3px" }}>Hiring Brief Ready</div>
                  <div style={{ fontSize: "11px", color: C.muted, marginBottom: "8px" }}>Brief will be used to improve match quality for this project</div>
                  <div style={{ fontSize: "12px", color: C.text, lineHeight: "1.5", whiteSpace: "pre-wrap", maxHeight: "120px", overflowY: "auto", padding: "10px 12px", borderRadius: "8px", backgroundColor: C.surface, border: `1px solid ${C.border}`, marginBottom: "8px" }}>
                    {briefResult.generated_brief?.slice(0, 300)}{briefResult.generated_brief?.length > 300 ? "…" : ""}
                  </div>
                  <button style={{ ...S.btn("outline", true), fontSize: "11px", padding: "5px 12px" }} onClick={() => setBriefMode(true)}>
                    <Icon n="restart_alt" size={13} /> Redo Brief
                  </button>
                </div>
              </div>
            )}

            {/* Build brief CTA */}
            {!briefResult && preview && (
              <div style={{ padding: "14px 16px", borderRadius: "12px", backgroundColor: C.primaryLight, border: `1px solid rgba(98,100,244,0.2)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Icon n="auto_awesome" size={16} color={C.primary} />
                  <div style={{ fontSize: "13px", fontWeight: "700", color: C.primary }}>Build your Hiring Brief</div>
                </div>
                <div style={{ fontSize: "11px", color: C.muted, marginBottom: "10px" }}>7 quick questions · under 3 minutes · significantly improves match quality</div>
                <button style={S.btn("primary")} onClick={handleGoToBrief}><Icon n="auto_awesome" size={14} />Start Hiring Brief →</button>
              </div>
            )}

            {error && <div style={{ background: C.errorLight, borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: C.error }}>{error}</div>}

            {parsing && (
              <div style={{ textAlign: "center", color: C.muted, fontSize: "14px", padding: "8px 0" }}>
                <div className="dot-wave" style={{ display: "inline-flex", gap: "4px", marginRight: "8px" }}><span /><span /><span /></div>
                Parsing JD… (2–4 seconds)
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={onCancel} disabled={parsing || confirming}>Cancel</button>
              {!preview && (
                <button style={{ ...S.btn("primary"), opacity: parsing ? 0.6 : 1 }} onClick={handlePreview} disabled={parsing}>
                  <Icon n="manage_search" size={15} />{parsing ? "Parsing…" : "Parse & Review"}
                </button>
              )}
              {preview && briefResult && (
                <button style={{ ...S.btn("primary"), opacity: confirming ? 0.6 : 1 }} onClick={handleConfirm} disabled={confirming}>
                  <Icon n="check" size={15} />{confirming ? "Creating…" : "Create Project"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {preview && !briefResult && (
        <ParseReviewModal
          parsed={preview}
          form={{ ...form, client_note: "" }}
          sectorLabels={sectorLabels}
          sectorMap={sectorMap}
          onConfirm={handleGoToBrief}
          confirmLabel="Build Hiring Brief →"
          confirmIcon="auto_awesome"
          onBack={handleBack}
          confirming={false}
          error={error}
        />
      )}
    </>
  );
}
