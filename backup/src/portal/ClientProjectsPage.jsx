import { useState, useEffect } from "react";
import { C, S, fontH, fontB } from "../constants";
import { apiFetch, fmtDate } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";

// ─── CLIENT PROJECT CARD ──────────────────────────────────────────────────────
function ClientProjectCard({ project, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: C.white, borderRadius: "14px",
        border: `1px solid ${C.borderMid}`,
        padding: "20px 22px", cursor: "pointer",
        boxShadow: "0 1px 4px rgba(98,100,244,0.04)",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(98,100,244,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(98,100,244,0.04)";
        e.currentTarget.style.transform = "";
      }}
    >
      <div style={{ fontFamily: fontH, fontSize: "15px", fontWeight: "700",
        color: C.text, marginBottom: "10px" }}>
        {project.title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "12px", color: C.muted }}>
          {project.visible_candidate_count} applicant{project.visible_candidate_count !== 1 ? "s" : ""}
        </span>
        {project.apply_enabled
          ? <span style={S.badge("info")}>Applications Open</span>
          : <span style={S.badge("")}>Closed</span>
        }
      </div>
      <div style={{ fontSize: "11px", color: C.muted }}>
        Created {fmtDate(project.created_at)}
      </div>
    </div>
  );
}

// ─── CLIENT PROJECTS PAGE ─────────────────────────────────────────────────────
export default function ClientProjectsPage({ onSelectProject }) {
  const isMobile = useIsMobile();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    apiFetch("/api/v1/client/projects")
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
      <div style={{ width: "28px", height: "28px", border: `3px solid ${C.primary}`,
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
      Loading your mandates…
    </div>
  );

  if (projects.length === 0) return (
    <div style={{ textAlign: "center", padding: "72px 0", color: C.muted }}>
      <Icon n="work_off" size={44} color={C.border} style={{ display: "block", margin: "0 auto 14px" }} />
      <div style={{ fontSize: "15px", fontWeight: "600", fontFamily: fontH }}>No active mandates</div>
      <div style={{ fontSize: "13px", marginTop: "6px" }}>
        Contact your ATRIOS account manager to get started.
      </div>
    </div>
  );

  return (
    <div>
      <div style={S.pageTitle}>Your Mandates</div>
      <div style={{ ...S.pageSub, marginBottom: "24px" }}>
        Click a mandate to view applicants
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "16px",
      }}>
        {projects.map(p => (
          <ClientProjectCard key={p.id} project={p} onClick={() => onSelectProject(p)} />
        ))}
      </div>
    </div>
  );
}
