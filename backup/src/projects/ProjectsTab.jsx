// ─── PROJECTS TAB ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { C, S, fontH, fontB } from "../constants";
import { apiFetch, fmtDate } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import CreateProjectModal from "./CreateProjectModal";
import ProjectDetailPage from "./ProjectDetailPage";

export default function ProjectsTab({ onViewCandidate }) {
  const isMobile = useIsMobile();
  const [view,            setView]           = useState("list");
  const [projects,        setProjects]       = useState([]);
  const [clients,         setClients]        = useState([]);
  const [selProject,      setSel]            = useState(null);
  const [showArchived,    setShowArc]        = useState(false);
  const [loading,         setLoading]        = useState(false);
  const [expandedClients, setExpandedClients] = useState(new Set(["all"]));
  const [editingProject,  setEditingProject] = useState(null);
  const [noteVal,         setNoteVal]        = useState("");
  const [noteSaving,      setNoteSaving]     = useState(false);
  const [noteMsg,         setNoteMsg]        = useState("");
  const [openMenuId,      setOpenMenuId]     = useState(null);
  const [archiving,       setArchiving]      = useState(null);

  const fetchProjects = useCallback(async (archived) => {
    setLoading(true);
    try {
      const r = await apiFetch(`/api/v1/projects?archived=${archived}`);
      const d = await r.json();
      setProjects(d.projects || []);
    } catch { setProjects([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(showArchived); }, [showArchived]);

  useEffect(() => {
    apiFetch("/api/v1/admin/clients/simple")
      .then(r => r.json())
      .then(d => setClients(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  const saveNote = async () => {
    setNoteSaving(true); setNoteMsg("");
    try {
      const r = await apiFetch(`/api/v1/projects/${editingProject.id}`, {
        method: "PATCH",
        body: JSON.stringify({ client_note: noteVal.trim() || null }),
      });
      if (r.ok) {
        setNoteMsg("saved");
        fetchProjects(showArchived);
        setTimeout(() => { setEditingProject(null); setNoteMsg(""); }, 1500);
      } else { setNoteMsg("error"); }
    } catch { setNoteMsg("error"); } finally { setNoteSaving(false); }
  };

  const handleArchive = async (e, p) => {
    e.stopPropagation(); setOpenMenuId(null); setArchiving(p.id);
    try { await apiFetch(`/api/v1/projects/${p.id}/archive`, { method: "PATCH" }); fetchProjects(showArchived); }
    finally { setArchiving(null); }
  };

  const handleUnarchive = async (e, p) => {
    e.stopPropagation(); setOpenMenuId(null); setArchiving(p.id);
    try { await apiFetch(`/api/v1/projects/${p.id}/unarchive`, { method: "PATCH" }); fetchProjects(showArchived); }
    finally { setArchiving(null); }
  };

  const toggleClient = (key) => {
    setExpandedClients(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  if (view === "create")
    return <CreateProjectModal
      onCreated={() => { fetchProjects(showArchived); setView("list"); }}
      onCancel={() => setView("list")} />;

  if (view === "detail" && selProject)
    return <ProjectDetailPage
      project={selProject}
      onBack={() => { setView("list"); fetchProjects(showArchived); }}
      onViewCandidate={onViewCandidate} />;

  const scoreColor = s => s >= 0.7 ? C.success : s >= 0.5 ? C.warning : C.error;

  // Group projects by client
  const grouped = {};
  projects.forEach(p => {
    const key = p.client_id ? String(p.client_id) : "__none__";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  const groupOrder = clients
    .filter(c => grouped[String(c.id)])
    .map(c => ({ key: String(c.id), label: c.name, color: C.primary }));
  if (grouped["__none__"]) {
    groupOrder.push({ key: "__none__", label: "No Client Linked", color: C.muted });
  }

  const renderProjectCard = (p) => (
    <div key={p.id}
      style={{ backgroundColor: C.white, borderRadius: "12px",
        border: `1px solid ${p.is_archived ? C.border : C.borderMid}`,
        padding: "16px 18px", cursor: "pointer",
        opacity: p.is_archived ? 0.65 : 1,
        boxShadow: "0 1px 4px rgba(98,100,244,0.04)",
        transition: "box-shadow 0.15s, transform 0.15s",
        position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(98,100,244,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(98,100,244,0.04)"; e.currentTarget.style.transform = ""; }}
      onClick={() => { setSel(p); setView("detail"); }}>

      {p.archive_prompted && !p.is_archived && (
        <div style={{ background: C.warningLight, border: `1px solid rgba(217,119,6,0.25)`, borderRadius: "8px", padding: "7px 10px", marginBottom: "10px", fontSize: "11px", color: C.warning }}
          onClick={e => e.stopPropagation()}>
          ⏰ Inactive 3 months —
          <span style={{ marginLeft: "6px", fontWeight: "700", cursor: "pointer", color: C.primary }} onClick={e => handleArchive(e, p)}>Archive</span>
          <span style={{ marginLeft: "6px", fontWeight: "700", cursor: "pointer", color: C.muted }} onClick={e => { e.stopPropagation(); fetchProjects(showArchived); }}>Keep</span>
        </div>
      )}

      <div style={{ fontFamily: fontH, fontSize: "14px", fontWeight: "700", color: C.text, marginBottom: "8px", paddingRight: "24px" }}>
        {p.title}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        <span style={{ fontSize: "11px", color: C.muted }}>{p.candidate_count ?? 0} candidates</span>
        {p.inbound_count > 0 && <span style={S.badge("success")}>{p.inbound_count} Applied</span>}
        {p.match_score_range && (
          <span style={{ fontSize: "11px", color: C.muted }}>
            Top: <span style={{ color: scoreColor(p.match_score_range.max), fontWeight: "700" }}>
              {Math.round(p.match_score_range.max * 100)}%
            </span>
          </span>
        )}
        {p.is_archived && <span style={S.badge("")}>Archived</span>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: C.muted }}>{fmtDate(p.last_activity_at || p.created_at)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          {!p.is_archived && (
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: C.muted, display: "flex", alignItems: "center", borderRadius: "5px" }}
              title="Edit note"
              onClick={e => { e.stopPropagation(); setEditingProject(p); setNoteVal(p.client_note || ""); setNoteMsg(""); }}>
              <Icon n="edit_note" size={15} />
            </button>
          )}
          {p.apply_enabled && !p.is_archived
            ? <span style={S.badge("info")}>Link On</span>
            : !p.is_archived && <span style={S.badge("")}>Link Off</span>
          }
          <div style={{ position: "relative" }}>
            <button title="More"
              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: C.muted, display: "flex", alignItems: "center", borderRadius: "5px", opacity: archiving === p.id ? 0.5 : 1 }}
              disabled={archiving === p.id}>
              {archiving === p.id
                ? <div style={{ width: "13px", height: "13px", border: `2px solid ${C.muted}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : <Icon n="more_vert" size={16} />}
            </button>
            {openMenuId === p.id && (
              <div onClick={e => e.stopPropagation()}
                style={{ position: "absolute", right: 0, bottom: "calc(100% + 4px)", backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: "150px", zIndex: 200, overflow: "hidden" }}>
                {!p.is_archived ? (
                  <button onClick={e => handleArchive(e, p)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "9px 13px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.textMid, fontFamily: fontB, textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <Icon n="inventory_2" size={14} color={C.muted} />Archive
                  </button>
                ) : (
                  <button onClick={e => handleUnarchive(e, p)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "9px 13px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.textMid, fontFamily: fontB, textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <Icon n="unarchive" size={14} color={C.success} />Unarchive
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {!isMobile && (
        <>
          <div style={S.pageTitle}>Projects</div>
          <div style={S.pageSub}>Grouped by client · click a project to open</div>
        </>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", color: C.muted, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArc(e.target.checked)} style={{ accentColor: C.primary }} />
          Show Archived
        </label>
        <button style={S.btn("primary", true)} onClick={() => setView("create")}>
          <Icon n="add" size={14} />New Project
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
          <div style={{ width: "28px", height: "28px", border: `3px solid ${C.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          Loading projects…
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div style={{ textAlign: "center", padding: "72px 0" }}>
          <Icon n="work" size={48} color={C.border} style={{ display: "block", margin: "0 auto 14px" }} />
          <div style={{ fontSize: "15px", fontWeight: "600", color: C.textMid, fontFamily: fontH, marginBottom: "6px" }}>
            No {showArchived ? "archived" : "active"} projects yet
          </div>
          {!showArchived && (
            <button style={{ ...S.btn("primary"), marginTop: "8px" }} onClick={() => setView("create")}>
              <Icon n="add" size={14} />Create your first project
            </button>
          )}
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {groupOrder.map(({ key, label, color }) => {
            const clientProjects = grouped[key] || [];
            const isExpanded = expandedClients.has(key);
            return (
              <div key={key} style={{ backgroundColor: C.white, borderRadius: "14px", border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(98,100,244,0.04)", overflow: "hidden" }}>
                <div onClick={() => toggleClient(key)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", cursor: "pointer",
                    backgroundColor: isExpanded ? `${color}08` : C.white,
                    borderBottom: isExpanded ? `1px solid ${C.border}` : "none", transition: "background 0.15s" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon n="business" size={16} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH, color: C.text }}>{label}</div>
                    <div style={{ fontSize: "11px", color: C.muted }}>{clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""}</div>
                  </div>
                  <Icon n={isExpanded ? "expand_less" : "expand_more"} size={20} color={C.muted} />
                </div>
                {isExpanded && (
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", padding: "14px 16px" }}>
                    {clientProjects.map(p => renderProjectCard(p))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Recruiter Note Modal */}
      {editingProject && (
        <div style={S.modal} onClick={() => setEditingProject(null)}>
          <div style={{ ...S.modalWrap, maxWidth: "500px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div>
                <div style={{ fontWeight: "700", fontFamily: fontH, fontSize: "15px" }}>Edit Recruiter Note</div>
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>{editingProject.title}</div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }} onClick={() => setEditingProject(null)}>
                <Icon n="close" size={20} />
              </button>
            </div>
            <div style={S.modalBody}>
              <div style={S.label}>Recruiter / Client Note</div>
              <textarea style={{ ...S.input, resize: "vertical", minHeight: "100px" }}
                placeholder="e.g. Client prefers ex-BFSI background…"
                value={noteVal} onChange={e => setNoteVal(e.target.value)} />
              {noteMsg === "saved" && <div style={{ fontSize: "12px", color: C.success, marginTop: "8px" }}>✓ Saved</div>}
              {noteMsg === "error" && <div style={{ fontSize: "12px", color: C.error, marginTop: "8px" }}>Failed to save.</div>}
            </div>
            <div style={S.modalFoot}>
              <button style={{ ...S.btn("primary"), opacity: noteSaving ? 0.6 : 1 }} onClick={saveNote} disabled={noteSaving}>
                <Icon n="save" size={14} />{noteSaving ? "Saving…" : "Save Note"}
              </button>
              <button style={S.btn("outline")} onClick={() => setEditingProject(null)} disabled={noteSaving}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
