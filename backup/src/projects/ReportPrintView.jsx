// ─── REPORT PRINT VIEW ────────────────────────────────────────────────────────
// Renders at hash #report?key=... — reads payload from localStorage with retry loop

import { useState, useEffect } from "react";

export default function ReportPrintView() {
  const [payload, setPayload] = useState(null);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace("#report?", ""));
    const key = params.get("key");
    if (!key) { setError(true); return; }

    // Retry every 100ms up to 2s — handles timing between parent write and new window read
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          clearInterval(interval);
          setPayload(JSON.parse(raw));
          localStorage.removeItem(key);
          return;
        }
      } catch {
        clearInterval(interval); setError(true); return;
      }
      if (attempts >= 20) { clearInterval(interval); setError(true); }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (error) return (
    <div style={{ padding: "60px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: "#8b8ab8" }}>
      Report data could not be loaded.
    </div>
  );
  if (!payload) return (
    <div style={{ padding: "60px", textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: "#8b8ab8" }}>
      Loading…
    </div>
  );

  const { client_name, recruiter_name, generated_at, project, summary, candidates } = payload;
  const dateStr = new Date(generated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const printStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #fff; color: #0f0f2d; }
    .no-print { display: block; }
    @media print {
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#fff", minHeight: "100vh" }}>
      <style>{printStyles}</style>

      {/* Print button */}
      <div className="no-print" style={{ position: "fixed", top: "16px", right: "16px", zIndex: 100 }}>
        <button onClick={() => window.print()}
          style={{ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
            backgroundColor: "#6264f4", color: "#fff", fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 4px 12px rgba(98,100,244,0.25)" }}>
          🖨 Print / Save as PDF
        </button>
      </div>

      {/* Cover page */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "60px 48px 48px" }}>

        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingBottom: "20px", borderBottom: "3px solid #6264f4", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#6264f4",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Sora', sans-serif", color: "#fff", fontSize: "20px", fontWeight: "800" }}>A</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0f2d", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em" }}>ATRIOS</div>
              <div style={{ fontSize: "10px", color: "#8b8ab8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Talent Intelligence</div>
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#8b8ab8" }}>{dateStr}</div>
        </div>

        {/* Report type tag */}
        <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px",
          backgroundColor: "rgba(98,100,244,0.08)", color: "#6264f4",
          fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
          {payload.report_type === "shortlist" ? "Applied Shortlist Report" : "Full Matched Pool Report"}
        </div>

        {/* Title */}
        <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "'Sora', sans-serif",
          color: "#0f0f2d", lineHeight: "1.2", letterSpacing: "-0.025em", marginBottom: "8px" }}>
          {project.title}
        </div>

        {/* Client + Recruiter */}
        <div style={{ fontSize: "15px", color: "#3d3d6b", marginBottom: "40px" }}>
          Prepared for <strong>{client_name}</strong> · by {recruiter_name}
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "48px" }}>
          {[
            { label: "Applied",     value: summary.total_applied,    color: "#6264f4" },
            { label: "Shortlisted", value: summary.total_shortlisted, color: "#3BB273" },
            { label: "In Report",   value: summary.total_in_report,   color: "#0f0f2d" },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: "#f6f6f8", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "'Sora', sans-serif", color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#8b8ab8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Candidate index */}
        <div style={{ backgroundColor: "#f6f6f8", borderRadius: "12px", padding: "20px 24px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#8b8ab8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
            Candidates in this report
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {candidates.map((c, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "11px", color: "#c4b8e0", fontWeight: "700", minWidth: "20px" }}>{String(idx + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f0f2d" }}>{c.name || "—"}</span>
                <span style={{ fontSize: "12px", color: "#8b8ab8" }}>{c.current_designation || ""}{c.current_company ? ` · ${c.current_company}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate profiles */}
      {candidates.map((c, idx) => (
        <div key={c.candidate_id || idx} className="page-break"
          style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 48px 40px" }}>

          {/* Candidate header */}
          <div style={{ paddingBottom: "16px", borderBottom: "2px solid #6264f4", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
              <span style={{ fontSize: "11px", color: "#c4b8e0", fontWeight: "700" }}>{String(idx + 1).padStart(2, "0")} / {candidates.length}</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700", fontFamily: "'Sora', sans-serif", color: "#0f0f2d", marginBottom: "3px" }}>{c.name || "—"}</div>
            <div style={{ fontSize: "13px", color: "#3d3d6b" }}>{c.current_designation || ""}{c.current_company ? ` · ${c.current_company}` : ""}</div>
          </div>

          {/* Key facts */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px", fontSize: "12px", color: "#8b8ab8" }}>
            {c.total_experience != null && <span>💼 {c.total_experience} years exp</span>}
            {c.location          && <span>📍 {c.location}</span>}
            {c.notice_period != null && <span>⏱ {c.notice_period}d notice</span>}
            {c.email             && <span>✉ {c.email}</span>}
            {c.phone             && <span>📞 {c.phone}</span>}
          </div>

          {/* Matching skills */}
          {(c.matching_skills || []).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#8b8ab8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Relevant Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {c.matching_skills.map((s, i) => (
                  <span key={i} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backgroundColor: "rgba(59,178,115,0.12)", color: "#2a7a50", border: "1px solid rgba(59,178,115,0.2)" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter Note */}
          {c.recruiter_summary && (
            <div style={{ backgroundColor: "#fffbf0", border: "1px solid rgba(217,119,6,0.2)", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#d97706", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "'Sora', sans-serif" }}>Recruiter Note</div>
              <div style={{ fontSize: "13px", color: "#3d3d6b", lineHeight: "1.7" }}>{c.recruiter_summary}</div>
            </div>
          )}

          {/* Talint Assessment */}
          {c.talint_assessment && (
            <div style={{ backgroundColor: "rgba(98,100,244,0.05)", border: "1px solid rgba(98,100,244,0.15)", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#6264f4", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "'Sora', sans-serif" }}>Talint Assessment</div>
              <div style={{ fontSize: "13px", color: "#3d3d6b", lineHeight: "1.7" }}>{c.talint_assessment}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "24px", fontSize: "10px", color: "#c4b8e0" }}>
            Candidate {idx + 1} of {candidates.length} · ATRIOS Talint · {dateStr}
          </div>
        </div>
      ))}

      {/* Report footer */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "24px 48px 48px", borderTop: "1px solid #e8e5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#c4b8e0" }}>
          <span>ATRIOS Talent Intelligence · Confidential</span>
          <span>Generated {dateStr} · {recruiter_name}</span>
        </div>
      </div>
    </div>
  );
}
