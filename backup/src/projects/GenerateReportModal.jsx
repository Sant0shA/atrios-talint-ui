// ─── GENERATE REPORT MODAL ────────────────────────────────────────────────────

import { useState } from "react";
import { C, S, fontH, fontB, getUser } from "../constants";
import { apiFetch, fmtDate } from "../utils";
import Icon from "../components/Icon";

export default function GenerateReportModal({ project, allCandidates, matchedCandidates, shortlistedCandidates, onClose }) {
  const [step,          setStep]          = useState("type");
  const [reportType,    setReportType]    = useState(null);
  const [clientName,    setClientName]    = useState("");
  const [contextNote,   setContextNote]   = useState(project.client_note || "");
  const [recruiterNote, setRecruiterNote] = useState("");
  const [clientNameErr, setClientNameErr] = useState("");
  const [progress,      setProgress]      = useState([]);
  const [reportPayload, setReportPayload] = useState(null);

  const user = getUser();
  const candidatesForReport = reportType === "shortlist" ? shortlistedCandidates : matchedCandidates;
  const reportTitle = reportType === "shortlist"
    ? `Applied Candidate Shortlist — ${project.title}`
    : `Candidate Matched Report — ${project.title}`;
  const appliedCount  = allCandidates.filter(c => (c.source === "apply_link" || c.source === "apply_link_add") && c.is_active).length;
  const promotedCount = shortlistedCandidates.length;

  const selectType = (type) => { setReportType(type); setStep("details"); };

  const goToNotes = () => {
    if (!clientName.trim()) { setClientNameErr("Client name is required"); return; }
    setClientNameErr(""); setStep("notes");
  };

  const generate = async () => {
    setStep("generating");
    const candidates = candidatesForReport;
    setProgress([
      { label: "Fetching full candidate profiles", done: false },
      { label: "Generating AI assessments",        done: false },
      { label: "Assembling report",                done: false },
    ]);

    try {
      // Step 1: fetch full profiles
      const fullProfiles = await Promise.all(
        candidates.map(async c => {
          try { const r = await apiFetch(`/api/v1/candidates/${c.candidate_id}`); return await r.json(); }
          catch { return null; }
        })
      );
      setProgress(p => p.map((s, i) => i === 0 ? { ...s, done: true } : s));

      // Step 2: parse recruiter notes using --- delimiter
      const noteMap = {};
      if (recruiterNote.trim()) {
        const blocks = recruiterNote.split(/\n?---\n?/).map(b => b.trim()).filter(Boolean);
        for (const block of blocks) {
          const lines = block.split("\n");
          const nameLine = lines[0].trim();
          const content  = lines.slice(1).join("\n").trim();
          for (const cand of candidates) {
            const fn = (cand.name || "").split(" ")[0];
            if (fn && nameLine.toLowerCase().includes(fn.toLowerCase())) {
              noteMap[cand.candidate_id] = content; break;
            }
          }
        }
      }

      // Step 3: generate AI assessments
      const assessments = {};
      await Promise.all(
        candidates.map(async (c, idx) => {
          const full = fullProfiles[idx];
          if (!full) { assessments[c.candidate_id] = { recruiter_summary: "", talint_assessment: "" }; return; }
          const recruiterSummary = noteMap[c.candidate_id] || "";
          let talintAssessment = "";
          try {
            const r = await apiFetch(`/api/v1/projects/${project.id}/candidates/${c.candidate_id}/briefing`, { method: "POST" });
            const d = await r.json();
            const raw = d.briefing || "";
            const cleaned = raw.replace(/^#{1,3}\s+/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
            const sectionLabel = /^(summary|strengths|match rationale|development areas)[:\s]*/i;
            const paragraphs = cleaned.split(/\n\n+/);
            const firstReal = paragraphs.find(p => !sectionLabel.test(p.trim())) || paragraphs[0] || "";
            talintAssessment = firstReal.replace(sectionLabel, "").trim();
          } catch { talintAssessment = ""; }
          assessments[c.candidate_id] = { recruiter_summary: recruiterSummary, talint_assessment: talintAssessment };
        })
      );
      setProgress(p => p.map((s, i) => i === 1 ? { ...s, done: true } : s));

      // Assemble payload
      const scores   = candidates.map(c => c.match_score).filter(Boolean);
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const payload  = {
        report_type:    reportType,
        report_title:   reportTitle,
        generated_at:   new Date().toISOString(),
        client_name:    clientName.trim(),
        recruiter_name: user?.username || "ATRIOS",
        project: { id: project.id, title: project.title, created_at: project.created_at, last_matched_at: project.last_matched_at },
        summary: {
          total_applied:     appliedCount,
          total_shortlisted: promotedCount,
          total_in_report:   candidates.length,
          avg_match_score:   Math.round(avgScore * 100),
          strong:   scores.filter(s => s >= 0.7).length,
          moderate: scores.filter(s => s >= 0.5 && s < 0.7).length,
          weak:     scores.filter(s => s < 0.5).length,
        },
        candidates: candidates.map((c, idx) => ({
          ...c, ...fullProfiles[idx],
          recruiter_summary: assessments[c.candidate_id]?.recruiter_summary || "",
          talint_assessment: assessments[c.candidate_id]?.talint_assessment || "",
        })),
      };

      setProgress(p => p.map((s, i) => i === 2 ? { ...s, done: true } : s));
      setReportPayload(payload);
      setStep("done");
    } catch { setStep("details"); }
  };

  const printReport = () => {
    const key = `talint_report_${project.id}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(reportPayload));
    const url = `${window.location.origin}${window.location.pathname}#report?key=${key}`;
    window.open(url, `report_${project.id}`, "width=900,height=1100,scrollbars=yes,resizable=yes");
  };

  const typeCard = (type, icon, title, subtitle, count, countLabel) => (
    <div onClick={() => count > 0 && selectType(type)}
      style={{ border: `2px solid ${count > 0 ? C.borderMid : C.border}`, borderRadius: "12px",
        padding: "18px 20px", cursor: count > 0 ? "pointer" : "not-allowed",
        opacity: count > 0 ? 1 : 0.45, transition: "all 0.15s", marginBottom: "10px", backgroundColor: C.white }}
      onMouseEnter={e => { if (count > 0) { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.backgroundColor = C.primaryLight; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = count > 0 ? C.borderMid : C.border; e.currentTarget.style.backgroundColor = C.white; }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: C.primaryDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon n={icon} size={20} color={C.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH, color: C.text, marginBottom: "3px" }}>{title}</div>
          <div style={{ fontSize: "12px", color: C.muted, lineHeight: "1.5" }}>{subtitle}</div>
          <div style={{ marginTop: "8px" }}>
            <span style={{ ...S.badge(count > 0 ? "admin" : ""), fontSize: "11px" }}>{count} {countLabel}</span>
          </div>
        </div>
        {count > 0 && <Icon n="chevron_right" size={20} color={C.muted} />}
      </div>
    </div>
  );

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "520px" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {step !== "type" && step !== "done" && (
              <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: "2px" }}
                onClick={() => setStep(step === "details" ? "type" : step === "notes" ? "details" : "type")}>
                <Icon n="arrow_back" size={18} />
              </button>
            )}
            <div>
              <div style={{ fontWeight: "700", fontFamily: fontH, fontSize: "15px" }}>
                {step === "type"       && "Generate Report"}
                {step === "details"    && (reportType === "shortlist" ? "Applied Shortlist Report" : "Full Matched Pool Report")}
                {step === "notes"      && "Recruiter Notes"}
                {step === "generating" && "Generating Report…"}
                {step === "done"       && "Report Ready"}
              </div>
              {step !== "type" && <div style={{ fontSize: "11px", color: C.muted, marginTop: "1px" }}>{project.title}</div>}
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }} onClick={onClose}>
            <Icon n="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={S.modalBody}>
          {step === "type" && (
            <div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "16px" }}>Choose the type of report to generate for this project.</div>
              {typeCard("shortlist", "how_to_reg", "Applied Shortlist Report",
                "Candidates who applied via link and were promoted by your team. For clients evaluating your application sorting service.",
                promotedCount, `promoted candidate${promotedCount !== 1 ? "s" : ""}`)}
              {typeCard("matched", "groups", "Full Matched Pool Report",
                "All active candidates in the Matched tab — auto-matched, manually added, and promoted. For team use or full client briefings.",
                matchedCandidates.length, `matched candidate${matchedCandidates.length !== 1 ? "s" : ""}`)}
            </div>
          )}

          {step === "details" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={S.label}>Client Name *</label>
                <input style={{ ...S.input, marginTop: "4px" }} placeholder="e.g. HDFC Bank, Teach For India"
                  value={clientName} onChange={e => { setClientName(e.target.value); setClientNameErr(""); }} />
                {clientNameErr && <div style={{ fontSize: "12px", color: C.error, marginTop: "4px" }}>{clientNameErr}</div>}
              </div>
              <div>
                <label style={S.label}>
                  Project Context Note
                  <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0, color: C.muted, marginLeft: "6px" }}>internal only · not printed</span>
                </label>
                <textarea style={{ ...S.input, resize: "vertical", minHeight: "80px", marginTop: "4px" }}
                  placeholder="e.g. Client prefers NGO background. Budget is ₹25L max."
                  value={contextNote} onChange={e => setContextNote(e.target.value)} />
              </div>
              <div style={{ backgroundColor: C.surface, borderRadius: "10px", padding: "12px 14px" }}>
                <div style={S.label}>Candidates included ({candidatesForReport.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                  {candidatesForReport.slice(0, 6).map(c => (
                    <div key={c.candidate_id} style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{c.name || "—"}</span>
                      <span style={{ fontSize: "12px", color: C.muted, marginLeft: "6px" }}>{c.current_designation || ""}</span>
                    </div>
                  ))}
                  {candidatesForReport.length > 6 && <div style={{ fontSize: "12px", color: C.muted }}>+{candidatesForReport.length - 6} more</div>}
                </div>
              </div>
            </div>
          )}

          {step === "notes" && (
            <div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "12px", lineHeight: "1.6" }}>
                Add notes per candidate. Start each section with the candidate name, then their note. Separate candidates with a line containing only <strong>---</strong>
              </div>
              <label style={S.label}>Free-format notes</label>
              <textarea style={{ ...S.input, resize: "vertical", minHeight: "130px", marginTop: "4px" }}
                placeholder={"Prachi Jain\nSenior leader with 25 years experience. CTC 31L. Notice 60 days.\n---\nArooje Sajjad\nGrant management expert. Contract ending Mar 2026."}
                value={recruiterNote} onChange={e => setRecruiterNote(e.target.value)} />
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "6px" }}>
                Use <strong>---</strong> on its own line to separate candidates · Leave blank to skip recruiter notes
              </div>
            </div>
          )}

          {step === "generating" && (
            <div style={{ padding: "8px 0" }}>
              {progress.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < progress.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  {s.done ? (
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: C.successLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon n="check" size={14} color={C.success} />
                    </div>
                  ) : (
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${C.primary}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: "13px", color: s.done ? C.muted : C.text, fontWeight: s.done ? "400" : "600" }}>{s.label}</span>
                </div>
              ))}
              <div style={{ fontSize: "12px", color: C.muted, marginTop: "16px", textAlign: "center" }}>
                Generating {candidatesForReport.length} AI assessment{candidatesForReport.length !== 1 ? "s" : ""}… this takes 10–20 seconds
              </div>
            </div>
          )}

          {step === "done" && reportPayload && (
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.successLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon n="check_circle" size={28} color={C.success} />
              </div>
              <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: fontH, color: C.text, marginBottom: "6px" }}>
                {reportType === "shortlist" ? "Applied Shortlist Report" : "Full Matched Pool Report"}
              </div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "20px" }}>
                {clientName} · {candidatesForReport.length} candidate{candidatesForReport.length !== 1 ? "s" : ""}
              </div>
              <button style={{ ...S.btn("primary"), justifyContent: "center", padding: "10px 28px" }} onClick={printReport}>
                <Icon n="print" size={15} />Print / Save as PDF
              </button>
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "10px" }}>Opens in new window · File → Print → Save as PDF</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === "details" || step === "notes") && (
          <div style={S.modalFoot}>
            {step === "details" && (
              <>
                <button style={S.btn("primary")} onClick={goToNotes}>Next <Icon n="arrow_forward" size={14} /></button>
                <button style={S.btn("outline")} onClick={() => setStep("type")}>Back</button>
              </>
            )}
            {step === "notes" && (
              <>
                <button style={S.btn("primary")} onClick={generate}><Icon n="auto_awesome" size={14} />Generate</button>
                <button style={S.btn("outline")} onClick={() => setStep("details")}>Back</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
