// ─── RESOURCES TAB ────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { C, S, fontH } from "../constants";
import { apiFetch } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";

export default function ResourcesTab({ isAdmin }) {
  const isMobile = useIsMobile();
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [form,       setForm]       = useState({ title: "", description: "", url: "", icon_name: "open_in_new", display_order: 0, is_active: true });
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? "/api/v1/resources/all" : "/api/v1/resources";
      const res = await apiFetch(endpoint);
      setResources(await res.json());
    } catch { setResources([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title: "", description: "", url: "", icon_name: "open_in_new", display_order: 0, is_active: true });

  const save = async () => {
    if (!form.title || !form.url) { setMsg("Title and URL are required"); return; }
    setSaving(true); setMsg("");
    try {
      const isEdit = !!editing;
      const res = await apiFetch(
        isEdit ? `/api/v1/resources/${editing.id}` : "/api/v1/resources",
        { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(form) }
      );
      if (res.ok) {
        setMsg(isEdit ? "Updated" : "Created");
        setEditing(null); setShowAdd(false); resetForm();
        load();
        setTimeout(() => setMsg(""), 3000);
      } else {
        const e = await res.json(); setMsg(e.detail || "Failed");
      }
    } catch { setMsg("Error saving"); } finally { setSaving(false); }
  };

  const deleteResource = async (id) => {
    if (!confirm("Delete this resource?")) return;
    setDeletingId(id);
    try { await apiFetch(`/api/v1/resources/${id}`, { method: "DELETE" }); load(); }
    finally { setDeletingId(null); }
  };

  const startEdit = (r) => {
    setEditing(r);
    setForm({ title: r.title, description: r.description || "", url: r.url,
      icon_name: r.icon_name || "open_in_new", display_order: r.display_order, is_active: r.is_active });
    setShowAdd(false);
  };

  const iconOptions = [
    { value: "open_in_new", label: "External Link" },
    { value: "work",        label: "Work / ATS" },
    { value: "description", label: "Document" },
    { value: "travel_explore", label: "Explore" },
    { value: "code",        label: "Code / Tech" },
    { value: "filter_alt",  label: "Filter / Screen" },
    { value: "smart_toy",   label: "AI Assistant" },
    { value: "psychology",  label: "Intelligence" },
    { value: "hub",         label: "Network" },
    { value: "analytics",   label: "Analytics" },
  ];

  const ResourceForm = () => (
    <div style={{ ...S.card, border: `1px solid ${C.borderMid}`, backgroundColor: "#faf9fe" }}>
      <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "14px", fontFamily: fontH, color: C.primary }}>
        {editing ? "Edit Resource" : "Add New Resource"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <label style={S.label}>Title *</label>
          <input style={S.input} placeholder="e.g. ARP – ATS" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div>
          <label style={S.label}>URL *</label>
          <input style={S.input} placeholder="https://..." value={form.url}
            onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
        </div>
        <div>
          <label style={S.label}>Description</label>
          <input style={S.input} placeholder="Short description shown on card" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Icon</label>
            <select style={S.select} value={form.icon_name}
              onChange={e => setForm(p => ({ ...p, icon_name: e.target.value }))}>
              {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ width: "80px" }}>
            <label style={S.label}>Order</label>
            <input style={S.input} type="number" min="0" value={form.display_order}
              onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>
      </div>
      {editing && (
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
          fontSize: "13px", color: C.textMid, marginBottom: "12px" }}>
          <input type="checkbox" checked={form.is_active}
            onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
            style={{ accentColor: C.primary }} />
          Active (visible to team)
        </label>
      )}
      {msg && (
        <div style={{ fontSize: "12px", color: msg === "Updated" || msg === "Created" ? C.success : C.error,
          marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
          <Icon n={msg === "Updated" || msg === "Created" ? "check_circle" : "error"} size={13} />{msg}
        </div>
      )}
      <div style={S.row}>
        <button style={S.btn("primary", true)} onClick={save} disabled={saving}>
          <Icon n="save" size={13} />{saving ? "Saving…" : editing ? "Save Changes" : "Add Resource"}
        </button>
        <button style={S.btn("outline", true)}
          onClick={() => { setEditing(null); setShowAdd(false); resetForm(); setMsg(""); }}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          {!isMobile && <div style={S.pageTitle}>Resources</div>}
          <div style={{ fontSize: "13px", color: C.muted, marginTop: isMobile ? 0 : "3px" }}>
            Quick access to ATRIOS tools and assistants
          </div>
        </div>
        {isAdmin && !editing && !showAdd && (
          <button style={S.btn("primary", true)} onClick={() => setShowAdd(true)}>
            <Icon n="add" size={14} />Add Resource
          </button>
        )}
      </div>

      {(showAdd || editing) && isAdmin && <ResourceForm />}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
          <div style={{ width: "28px", height: "28px", border: `3px solid ${C.primary}`,
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          Loading resources…
        </div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
          <Icon n="link_off" size={44} color={C.border} style={{ display: "block", margin: "0 auto 14px" }} />
          <div style={{ fontSize: "15px", fontWeight: "600", fontFamily: fontH }}>No resources yet</div>
          {isAdmin && <div style={{ fontSize: "13px", marginTop: "5px" }}>Click "Add Resource" to add the first one</div>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {resources.map((r) => (
            <div key={r.id} className="resource-card"
              style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "14px",
                padding: "18px 20px", boxShadow: "0 1px 4px rgba(98,100,244,0.04)",
                opacity: r.is_active ? 1 : 0.55, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "11px",
                  backgroundColor: C.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon n={r.icon_name || "open_in_new"} size={20} color={C.primary} />
                </div>
                {!r.is_active && <span style={{ ...S.badge(""), fontSize: "10px" }}>Hidden</span>}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH,
                  color: C.text, marginBottom: "4px" }}>{r.title}</div>
                {r.description && (
                  <div style={{ fontSize: "12px", color: C.muted, lineHeight: "1.5" }}>{r.description}</div>
                )}
              </div>
              <div style={{ marginTop: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
                <a href={r.url} target="_blank" rel="noreferrer"
                  style={{ ...S.btn("primary", true), textDecoration: "none", flex: 1, justifyContent: "center" }}>
                  <Icon n="open_in_new" size={13} />Open
                </a>
                {isAdmin && (
                  <>
                    <button style={S.btn("outline", true)} onClick={() => startEdit(r)}>
                      <Icon n="edit" size={13} />
                    </button>
                    <button style={S.btn("danger", true)} onClick={() => deleteResource(r.id)}
                      disabled={deletingId === r.id}>
                      <Icon n="delete" size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
