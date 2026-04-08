// ─── ADMIN TAB ────────────────────────────────────────────────────────────────
// Includes ClientsAdminSection (clients management section)

import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font } from "../constants";
import { apiFetch, fmtDateTime, pwValid } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import { PasswordInput, ResetPasswordModal } from "../components/PasswordInput";
import { MiniBar, SourceDonut, LocationPieChart } from "../components/Charts";

// ══════════════════════════════════════════════════════════════════════════════
// CLIENTS ADMIN SECTION
// ══════════════════════════════════════════════════════════════════════════════

function ClientsAdminSection() {
  const isMobile = useIsMobile();
  const [clients,       setClients]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showCreate,    setShowCreate]    = useState(false);
  const [showCreds,     setShowCreds]     = useState(null);
  const [creating,      setCreating]      = useState(false);
  const [form, setForm] = useState({ name: "", contact_name: "", contact_email: "", access_until: "" });
  const [formErr,       setFormErr]       = useState("");
  const [activateTarget, setActivateTarget] = useState(null);
  const [activateDate,   setActivateDate]   = useState("");
  const [activating,     setActivating]     = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/api/v1/admin/clients"); setClients(await r.json()); }
    catch { setClients([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createClient = async () => {
    if (!form.name.trim())         { setFormErr("Company name is required"); return; }
    if (!form.contact_name.trim()) { setFormErr("Contact name is required"); return; }
    if (!form.access_until)        { setFormErr("Access until date is required"); return; }
    setCreating(true); setFormErr("");
    try {
      const r = await apiFetch("/api/v1/admin/clients", {
        method: "POST",
        body: JSON.stringify({
          name:          form.name.trim(),
          contact_name:  form.contact_name.trim(),
          contact_email: form.contact_email.trim() || null,
          access_until:  form.access_until,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setFormErr(d.detail || "Failed to create client"); return; }
      setShowCreds({ username: d.username, temporary_password: d.temporary_password, client_name: d.client.name });
      setShowCreate(false);
      setForm({ name: "", contact_name: "", contact_email: "", access_until: "" });
      load();
    } catch { setFormErr("Network error"); } finally { setCreating(false); }
  };

  const deactivate = async (clientId) => {
    if (!confirm("Immediately block this client from logging in?")) return;
    await apiFetch(`/api/v1/admin/clients/${clientId}/deactivate`, { method: "PATCH" });
    load();
  };

  const openActivate = (client) => {
    setActivateTarget(client);
    if (client.access_until) {
      setActivateDate(client.access_until);
    } else {
      const d = new Date(); d.setDate(d.getDate() + 90);
      setActivateDate(d.toISOString().slice(0, 10));
    }
  };

  const confirmActivate = async () => {
    if (!activateDate) return;
    setActivating(true);
    try {
      const endpoint = activateTarget.is_active
        ? `/api/v1/admin/clients/${activateTarget.id}/extend`
        : `/api/v1/admin/clients/${activateTarget.id}/activate`;
      await apiFetch(endpoint, { method: "PATCH", body: JSON.stringify({ access_until: activateDate }) });
      setActivateTarget(null); load();
    } finally { setActivating(false); }
  };

  const statusBadge = (c) => {
    if (!c.is_active) return { type: "", label: "Inactive" };
    if (c.days_until_expiry === null) return { type: "success", label: "Active" };
    if (c.days_until_expiry <= 0)  return { type: "error",   label: "Expired" };
    if (c.days_until_expiry <= 14) return { type: "warning", label: `Expiring in ${c.days_until_expiry}d` };
    return { type: "success", label: `Active · ${c.days_until_expiry}d left` };
  };

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", fontFamily: fontH, display: "flex", alignItems: "center", gap: "7px" }}>
          <Icon n="business" size={17} color={C.primary} />Client Accounts
        </div>
        <button style={S.btn("primary", true)} onClick={() => { setShowCreate(true); setFormErr(""); }}>
          <Icon n="add" size={14} />New Client
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ ...S.card, border: `1px solid ${C.borderMid}`, backgroundColor: "#faf9fe", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", fontFamily: fontH, color: C.primary, marginBottom: "14px" }}>Create New Client</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div><label style={S.label}>Company Name *</label><input style={S.input} placeholder="e.g. Teach For India" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label style={S.label}>Contact Person *</label><input style={S.input} placeholder="Primary contact name" value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} /></div>
            <div><label style={S.label}>Contact Email</label><input style={S.input} type="email" placeholder="contact@client.com" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} /></div>
            <div><label style={S.label}>Access Until *</label><input style={S.input} type="date" min={minDateStr} value={form.access_until} onChange={e => setForm(p => ({ ...p, access_until: e.target.value }))} /></div>
          </div>
          <div style={{ backgroundColor: C.primaryDim, border: `1px solid rgba(98,100,244,0.15)`, borderRadius: "8px", padding: "10px 13px", marginBottom: "12px", fontSize: "12px", color: C.textMid, display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <Icon n="info" size={14} color={C.primary} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>A login account will be created automatically. The username and password are shown <strong>once only</strong> — copy and share with the client.</span>
          </div>
          {formErr && <div style={{ fontSize: "12px", color: C.error, marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}><Icon n="error" size={13} color={C.error} />{formErr}</div>}
          <div style={S.row}>
            <button style={{ ...S.btn("primary", true), opacity: creating ? 0.6 : 1 }} onClick={createClient} disabled={creating}>
              <Icon n="person_add" size={13} />{creating ? "Creating…" : "Create Client"}
            </button>
            <button style={S.btn("outline", true)} onClick={() => { setShowCreate(false); setFormErr(""); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Credentials modal */}
      {showCreds && (
        <div style={S.modal} onClick={() => setShowCreds(null)}>
          <div style={{ ...S.modalWrap, maxWidth: "460px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.successLight, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="key" size={15} color={C.success} /></div>
                <div><div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Client Created</div><div style={{ fontSize: "11px", color: C.muted }}>{showCreds.client_name}</div></div>
              </div>
            </div>
            <div style={S.modalBody}>
              <div style={{ backgroundColor: C.warningLight, border: `1px solid rgba(217,119,6,0.3)`, borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontSize: "13px", color: "#92400E", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Icon n="warning" size={15} color={C.warning} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>These credentials are shown <strong>once only</strong> and cannot be retrieved again.</span>
              </div>
              {[{ label: "Username", value: showCreds.username }, { label: "Password", value: showCreds.temporary_password }].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: "12px" }}>
                  <div style={S.label}>{label}</div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1, padding: "9px 13px", borderRadius: "10px", backgroundColor: C.surface, border: `1px solid ${C.border}`, fontFamily: font, fontSize: "14px", fontWeight: "700", color: C.text }}>{value}</div>
                    <button style={S.btn("outline", true)} onClick={() => navigator.clipboard.writeText(value)}><Icon n="content_copy" size={14} />Copy</button>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: "12px", color: C.muted }}>The account is currently <strong>inactive</strong>. Activate it from the client list when ready.</div>
            </div>
            <div style={S.modalFoot}>
              <button style={S.btn("primary")} onClick={() => setShowCreds(null)}><Icon n="check" size={14} />Done — I've copied the credentials</button>
            </div>
          </div>
        </div>
      )}

      {/* Activate/Extend modal */}
      {activateTarget && (
        <div style={S.modal} onClick={() => setActivateTarget(null)}>
          <div style={{ ...S.modalWrap, maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>{activateTarget.is_active ? "Extend Access" : "Activate Client"}</div>
              <button onClick={() => setActivateTarget(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon n="close" size={20} /></button>
            </div>
            <div style={S.modalBody}>
              <div style={{ fontSize: "13px", color: C.textMid, marginBottom: "14px" }}>{activateTarget.name} · {activateTarget.contact_name}</div>
              <label style={S.label}>Access Until *</label>
              <input style={{ ...S.input, marginTop: "4px" }} type="date" min={minDateStr} value={activateDate} onChange={e => setActivateDate(e.target.value)} />
            </div>
            <div style={S.modalFoot}>
              <button style={{ ...S.btn("primary"), opacity: activating ? 0.6 : 1 }} onClick={confirmActivate} disabled={activating || !activateDate}>
                <Icon n="check" size={14} />{activating ? "Saving…" : activateTarget.is_active ? "Extend" : "Activate"}
              </button>
              <button style={S.btn("outline")} onClick={() => setActivateTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Client list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
          <div style={{ width: "24px", height: "24px", border: `3px solid ${C.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />Loading clients…
        </div>
      ) : clients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
          <Icon n="business" size={36} color={C.border} style={{ display: "block", margin: "0 auto 12px" }} />
          <div style={{ fontSize: "14px", fontWeight: "600", fontFamily: fontH }}>No clients yet</div>
          <div style={{ fontSize: "13px", marginTop: "5px" }}>Click "New Client" to add one</div>
        </div>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {clients.map(c => {
            const badge = statusBadge(c);
            return (
              <div key={c.id} style={S.cardMobile}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div><div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>{c.name}</div><div style={{ fontSize: "12px", color: C.muted }}>{c.contact_name}</div></div>
                  <span style={S.badge(badge.type)}>{badge.label}</span>
                </div>
                <div style={{ fontSize: "12px", color: C.muted, marginBottom: "10px" }}>{c.project_count} project{c.project_count !== 1 ? "s" : ""}{c.access_until && ` · Until ${c.access_until}`}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button style={S.btn("outline", true)} onClick={() => openActivate(c)}><Icon n={c.is_active ? "date_range" : "check_circle"} size={13} />{c.is_active ? "Extend" : "Activate"}</button>
                  {c.is_active && <button style={S.btn("danger", true)} onClick={() => deactivate(c.id)}><Icon n="block" size={13} />Deactivate</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <table style={S.table}>
          <thead><tr>{["Client", "Contact", "Projects", "Status", "Access Until", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {clients.map(c => {
              const badge = statusBadge(c);
              return (
                <tr key={c.id} className="log-row">
                  <td style={S.td}><div style={{ fontWeight: "700", fontSize: "13px" }}>{c.name}</div></td>
                  <td style={{ ...S.td, fontSize: "12px", color: C.muted }}>{c.contact_name}{c.contact_email && <div style={{ fontSize: "11px" }}>{c.contact_email}</div>}</td>
                  <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600" }}>{c.project_count}</td>
                  <td style={S.td}><span style={S.badge(badge.type)}>{badge.label}</span></td>
                  <td style={{ ...S.td, fontSize: "12px", color: C.muted }}>{c.access_until || "—"}</td>
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={S.btn("outline", true)} onClick={() => openActivate(c)}><Icon n={c.is_active ? "date_range" : "check_circle"} size={13} />{c.is_active ? "Extend" : "Activate"}</button>
                      {c.is_active && <button style={S.btn("danger", true)} onClick={() => deactivate(c.id)}><Icon n="block" size={13} />Deactivate</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN TAB
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminTab() {
  const isMobile = useIsMobile();
  const [section,          setSection]          = useState("dashboard");
  const [users,            setUsers]            = useState([]);
  const [allLogs,          setAllLogs]          = useState([]);
  const [stats,            setStats]            = useState(null);
  const [newUser,          setNewUser]          = useState({ username: "", email: "", password: "", role: "user" });
  const [msg,              setMsg]              = useState("");
  const [resetTarget,      setResetTarget]      = useState(null);
  const [dateFilter,       setDateFilter]       = useState("all");
  const [skillFilter,      setSkillFilter]      = useState("");
  const [skillSearchResults, setSkillSearchResults] = useState(null);
  const [skillSearching,   setSkillSearching]   = useState(false);
  const [locationData,     setLocationData]     = useState(null);
  const [logPage,          setLogPage]          = useState(1);
  const [logUserFilter,    setLogUserFilter]    = useState("all");
  const [logActionFilter,  setLogActionFilter]  = useState("all");
  const LOG_PAGE_SIZE = 20;

  const load = async () => {
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        apiFetch("/api/v1/auth/users"),
        apiFetch("/api/v1/auth/audit-logs"),
        apiFetch("/api/v1/candidates/count"),
      ]);
      setUsers(await uRes.json());
      setAllLogs(await lRes.json());
      setStats(await sRes.json());
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) return;
    if (!pwValid(newUser.password)) { setMsg("Password does not meet security requirements"); return; }
    const res = await apiFetch("/api/v1/auth/users", { method: "POST", body: JSON.stringify(newUser) });
    if (res.ok) {
      setMsg("User created");
      setNewUser({ username: "", email: "", password: "", role: "user" });
      load(); setTimeout(() => setMsg(""), 4000);
    } else { const e = await res.json(); setMsg(e.detail || "Failed"); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await apiFetch(`/api/v1/auth/users/${id}`, { method: "DELETE" }); load();
  };

  const getDateBounds = () => {
    const now = new Date();
    if (dateFilter === "today") { const start = new Date(now); start.setHours(0,0,0,0); return { start }; }
    if (dateFilter === "week")  { const start = new Date(now); start.setDate(now.getDate()-7); return { start }; }
    if (dateFilter === "month") { const start = new Date(now); start.setDate(now.getDate()-30); return { start }; }
    return { start: null };
  };

  const filterLogsByDate = (logs) => {
    const { start } = getDateBounds();
    if (!start) return logs;
    return logs.filter(l => new Date(l.created_at) >= start);
  };

  const periodLogs       = filterLogsByDate(allLogs);
  const periodUploads    = periodLogs.filter(l => l.action === "bulk_upload").length;
  const periodViews      = periodLogs.filter(l => l.action === "view_profile").length;
  const periodCreated    = periodLogs.filter(l => l.detail?.includes("created")).length;
  const periodDuplicates = periodLogs.filter(l => l.detail?.includes("duplicate")).length;

  const buildSparkline = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const start = new Date(d); start.setHours(0,0,0,0);
      const end   = new Date(d); end.setHours(23,59,59,999);
      const value = allLogs.filter(l => l.action === "bulk_upload" && new Date(l.created_at) >= start && new Date(l.created_at) <= end).length;
      days.push({ label, value });
    }
    return days;
  };

  const userActivity = users.map(u => ({
    username: u.username,
    uploads:  allLogs.filter(l => l.username === u.username && l.action === "bulk_upload").length,
    views:    allLogs.filter(l => l.username === u.username && l.action === "view_profile").length,
    logins:   allLogs.filter(l => l.username === u.username && l.action === "login").length,
    lastSeen: allLogs.filter(l => l.username === u.username).sort((a,b) => new Date(b.created_at)-new Date(a.created_at))[0]?.created_at,
  })).sort((a,b) => b.uploads - a.uploads);

  const searchBySkill = async (skillOverride) => {
    const skill = skillOverride || skillFilter;
    if (!skill.trim()) return;
    setSkillSearching(true);
    try {
      const res = await apiFetch("/api/v1/candidates/search", { method: "POST", body: JSON.stringify({ skill_keywords: [skill.trim()], skill_match: "OR", page: 1, page_size: 1 }) });
      const data = await res.json();
      setSkillSearchResults({ skill: skill.trim(), count: data.total || 0 });
    } catch { setSkillSearchResults({ skill: skill.trim(), count: "—" }); }
    finally { setSkillSearching(false); }
  };

  const showLocationChart = async (skill) => {
    const s = skill || skillFilter;
    if (!s.trim()) return;
    try {
      const res = await apiFetch(`/api/v1/skills/${encodeURIComponent(s.trim())}/locations`);
      if (res.ok) { const data = await res.json(); setLocationData(data); }
    } catch {}
  };

  const filteredLogs    = allLogs.filter(l => {
    if (logUserFilter !== "all" && l.username !== logUserFilter) return false;
    if (logActionFilter !== "all" && l.action !== logActionFilter) return false;
    return true;
  });
  const logTotalPages   = Math.max(1, Math.ceil(filteredLogs.length / LOG_PAGE_SIZE));
  const pagedLogs       = filteredLogs.slice((logPage-1)*LOG_PAGE_SIZE, logPage*LOG_PAGE_SIZE);
  const uniqueLogUsers  = [...new Set(allLogs.map(l => l.username))];
  const uniqueLogActions = [...new Set(allLogs.map(l => l.action))];

  const sideItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "users",     icon: "group",     label: "Team"      },
    { key: "clients",   icon: "business",  label: "Clients"   },
    { key: "logs",      icon: "history",   label: "Logs"      },
  ];

  const actionBadgeType = (action) => {
    if (action === "login")           return "success";
    if (action === "bulk_upload")     return "warning";
    if (action?.includes("delete"))   return "error";
    if (action?.includes("password")) return "admin";
    if (action === "view_profile")    return "info";
    return "";
  };

  function renderAdminContent() {
    if (section === "dashboard") return (
      <div className="fade-up">
        {/* Period filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: fontH }}>Period:</span>
          {[["today","Today"],["week","Last 7 days"],["month","Last 30 days"],["all","All time"]].map(([val,label]) => (
            <button key={val} onClick={() => setDateFilter(val)}
              style={{ padding: "5px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600", fontFamily: fontB, transition: "all 0.15s", backgroundColor: dateFilter===val ? C.primary : C.surface, color: dateFilter===val ? "#fff" : C.muted }}>{label}</button>
          ))}
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { label: "Total Candidates", value: stats?.total?.toLocaleString() ?? "—", icon: "people",       color: C.primary, bg: C.primaryLight },
            { label: "Uploads (period)", value: periodUploads,    icon: "upload_file",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "New CVs (period)", value: periodCreated,    icon: "person_add",   color: C.success, bg: C.successLight },
            { label: "Profile Views",    value: periodViews,      icon: "visibility",   color: C.info,    bg: C.infoLight },
            { label: "Duplicates (period)", value: periodDuplicates, icon: "content_copy", color: C.muted, bg: C.surface },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="stat-card" style={{ ...S.card, marginBottom: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: fontH, lineHeight: "1.3" }}>{label}</div>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon n={icon} size={15} color={color} /></div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: "800", color, fontFamily: fontH, letterSpacing: "-0.02em" }}>{value ?? "—"}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          <div style={S.card}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: fontH }}>Source Breakdown</div>
            {stats ? <SourceDonut data={stats.by_source} total={stats.total} /> : <div style={{ color: C.muted, fontSize: "13px" }}>Loading…</div>}
          </div>
          <div style={S.card}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: fontH }}>Upload Activity (7 days)</div>
            <MiniBar data={buildSparkline()} color={C.primary} height={52} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              {buildSparkline().map((d, i) => <div key={i} style={{ fontSize: "9px", color: C.muted, textAlign: "center", flex: 1 }}>{d.label.split(" ")[0]}</div>)}
            </div>
          </div>
        </div>

        {/* Skill pool lookup */}
        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontFamily: fontH, display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon n="auto_awesome" size={13} color={C.primary} />Skill Pool Lookup
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <input style={{ ...S.input, maxWidth: "260px" }} placeholder="e.g. Python, Project Management, NGO"
              value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchBySkill()} />
            <button style={S.btn("primary", true)} onClick={() => searchBySkill()} disabled={skillSearching || !skillFilter.trim()}>
              <Icon n="query_stats" size={14} />{skillSearching ? "Searching…" : "Check Pool"}
            </button>
            {skillSearchResults && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", borderRadius: "10px", backgroundColor: C.primaryDim, border: `1px solid rgba(98,100,244,0.2)` }}>
                <Icon n="groups" size={16} color={C.primary} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
                  <strong style={{ color: C.primary, fontFamily: fontH, fontSize: "17px" }}>{skillSearchResults.count}</strong> candidates with <strong>"{skillSearchResults.skill}"</strong>
                </span>
                <button style={{ ...S.btn("outline", true), padding: "4px 10px", fontSize: "11px" }} onClick={() => showLocationChart(skillSearchResults.skill)}>
                  <Icon n="pie_chart" size={12} />By Location
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: "10px", display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {["Python","Project Management","NGO","Fundraising","Data Analysis","Excel","Communications"].map(s => (
              <button key={s} onClick={() => { setSkillFilter(s); searchBySkill(s); }}
                style={{ padding: "3px 10px", borderRadius: "20px", border: `1px solid ${C.border}`, cursor: "pointer", fontSize: "11px", fontWeight: "600", backgroundColor: skillFilter===s ? C.primaryDim : "transparent", color: skillFilter===s ? C.primary : C.muted, fontFamily: fontB }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Team activity */}
        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: fontH, display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon n="leaderboard" size={13} color={C.primary} />Team Activity (all time)
          </div>
          <table style={S.table}>
            <thead><tr>{["User","Role","Uploads","Profile Views","Logins","Last Active"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {userActivity.map((u, i) => (
                <tr key={i} className="log-row">
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: C.primary, fontFamily: fontH }}>{u.username.slice(0,2).toUpperCase()}</div>
                      <span style={{ fontWeight: "600", fontSize: "13px" }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={S.td}><span style={S.badge(users.find(x => x.username===u.username)?.role==="admin" ? "admin" : "")}>{users.find(x => x.username===u.username)?.role || "user"}</span></td>
                  <td style={{ ...S.td, fontFamily: font, fontWeight: "700", color: C.primary }}>{u.uploads}</td>
                  <td style={{ ...S.td, fontFamily: font, color: C.info, fontWeight: "600" }}>{u.views}</td>
                  <td style={{ ...S.td, fontFamily: font, color: C.muted }}>{u.logins}</td>
                  <td style={{ ...S.td, fontSize: "12px", color: C.muted }}>{u.lastSeen ? fmtDateTime(u.lastSeen) : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    if (section === "users") return (
      <>
        <div style={isMobile ? S.cardMobile : S.card}>
          <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "7px", fontFamily: fontH }}>
            <Icon n="person_add" size={17} color={C.primary} />Add New User
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "start" }}>
            <div><label style={S.label}>Username</label><input style={S.input} type="text" placeholder="username" value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} /></div>
            <div><label style={S.label}>Email</label><input style={S.input} type="email" placeholder="user@atrios.in" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label style={S.label}>Password</label><PasswordInput value={newUser.password} placeholder="Strong password" showStrength onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} /></div>
            <div><label style={S.label}>Role</label>
              <select style={S.select} value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                <option value="user">User</option><option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ paddingTop: isMobile ? 0 : "22px" }}>
              <button style={{ ...S.btn("success"), width: isMobile ? "100%" : "auto", justifyContent: "center", padding: "10px 18px" }} onClick={createUser} disabled={!pwValid(newUser.password)}>
                <Icon n="person_add" size={14} />Create
              </button>
            </div>
          </div>
          {msg && <div style={{ marginTop: "10px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", color: msg==="User created" ? C.success : C.error }}><Icon n={msg==="User created" ? "check_circle" : "error"} size={14} color={msg==="User created" ? C.success : C.error} />{msg}</div>}
        </div>
        <div style={isMobile ? {} : S.card}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {users.map((u, i) => (
                <div key={i} style={S.cardMobile}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div><div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>{u.username}</div><div style={{ fontSize: "12px", color: C.muted }}>{u.email}</div></div>
                    <span style={S.badge(u.role==="admin" ? "admin" : "")}>{u.role}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: `1px solid ${C.border}` }}>
                    <button style={S.btn("outline", true)} onClick={() => setResetTarget(u)}><Icon n="key" size={13} />Reset PW</button>
                    <button style={S.btn("danger", true)} onClick={() => deleteUser(u.id)}><Icon n="delete" size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table style={S.table}>
              <thead><tr>{["Username","Email","Role","Status","Last Login","Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="log-row">
                    <td style={{ ...S.td, fontFamily: font, fontWeight: "600" }}>{u.username}</td>
                    <td style={{ ...S.td, fontSize: "13px", color: C.textMid }}>{u.email}</td>
                    <td style={S.td}><span style={S.badge(u.role==="admin" ? "admin" : "")}>{u.role}</span></td>
                    <td style={S.td}><span style={S.badge(u.is_active ? "success" : "error")}>{u.is_active ? "Active" : "Inactive"}</span></td>
                    <td style={{ ...S.td, fontSize: "12px", color: C.muted }}>{u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}</td>
                    <td style={S.td}>
                      <div style={S.row}>
                        <button style={S.btn("outline", true)} onClick={() => setResetTarget(u)}><Icon n="key" size={13} />Reset PW</button>
                        <button style={S.btn("danger", true)} onClick={() => deleteUser(u.id)}><Icon n="delete" size={13} />Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );

    if (section === "logs") return (
      <div style={S.card}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>
            <Icon n="history" size={17} color={C.primary} />Audit Logs
            <span style={{ fontSize: "12px", fontWeight: "500", color: C.muted, fontFamily: font }}>({filteredLogs.length} entries)</span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <select style={{ ...S.select, width: "auto", paddingLeft: "32px", fontSize: "12px" }} value={logUserFilter} onChange={e => { setLogUserFilter(e.target.value); setLogPage(1); }}>
                <option value="all">All users</option>
                {uniqueLogUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <Icon n="person" size={13} color={C.muted} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative" }}>
              <select style={{ ...S.select, width: "auto", paddingLeft: "32px", fontSize: "12px" }} value={logActionFilter} onChange={e => { setLogActionFilter(e.target.value); setLogPage(1); }}>
                <option value="all">All actions</option>
                {uniqueLogActions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <Icon n="filter_list" size={13} color={C.muted} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            {(logUserFilter !== "all" || logActionFilter !== "all") && (
              <button style={S.btn("outline", true)} onClick={() => { setLogUserFilter("all"); setLogActionFilter("all"); setLogPage(1); }}><Icon n="close" size={12} />Clear</button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          {Object.entries(filteredLogs.reduce((acc,l) => { acc[l.action]=(acc[l.action]||0)+1; return acc; }, {}))
            .sort((a,b) => b[1]-a[1]).slice(0,5)
            .map(([action,count]) => (
              <span key={action} style={{ ...S.badge(actionBadgeType(action)), cursor: "pointer" }}
                onClick={() => { setLogActionFilter(action); setLogPage(1); }}>
                {action}: {count}
              </span>
            ))}
        </div>

        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pagedLogs.map((l, i) => (
              <div key={i} style={{ padding: "10px", backgroundColor: C.surface, borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontFamily: font, fontSize: "12px", fontWeight: "600" }}>{l.username}</span>
                  <span style={S.badge(actionBadgeType(l.action))}>{l.action}</span>
                </div>
                <div style={{ fontSize: "11px", color: C.muted }}>{new Date(l.created_at).toLocaleString()}</div>
                {l.detail && <div style={{ fontSize: "12px", color: C.textMid, marginTop: "3px" }}>{l.detail}</div>}
              </div>
            ))}
          </div>
        ) : (
          <table style={S.table}>
            <thead><tr>{["Time","User","Action","Detail"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pagedLogs.map((l, i) => (
                <tr key={i} className="log-row">
                  <td style={{ ...S.td, fontSize: "11px", fontFamily: font, color: C.muted, whiteSpace: "nowrap" }}>{new Date(l.created_at).toLocaleString()}</td>
                  <td style={{ ...S.td, fontFamily: font, fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "700", color: C.primary, fontFamily: fontH, flexShrink: 0 }}>{l.username?.slice(0,2).toUpperCase()}</div>
                      <span style={{ fontWeight: "600" }}>{l.username}</span>
                    </div>
                  </td>
                  <td style={S.td}><span style={S.badge(actionBadgeType(l.action))}>{l.action}</span></td>
                  <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: `1px solid ${C.border}`, marginTop: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: C.muted }}>Showing <strong>{(logPage-1)*LOG_PAGE_SIZE+1}</strong>–<strong>{Math.min(logPage*LOG_PAGE_SIZE, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong></span>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button style={{ ...S.btn("outline", true), opacity: logPage<=1?0.4:1 }} disabled={logPage<=1} onClick={() => setLogPage(1)}><Icon n="first_page" size={14} /></button>
            <button style={{ ...S.btn("outline", true), opacity: logPage<=1?0.4:1 }} disabled={logPage<=1} onClick={() => setLogPage(p=>p-1)}><Icon n="chevron_left" size={14} />Prev</button>
            {Array.from({ length: Math.min(5, logTotalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(logPage-2, logTotalPages-4)) + i;
              return p <= logTotalPages ? <button key={p} style={{ ...S.btn(p===logPage?"primary":"outline", true), minWidth: "34px", justifyContent: "center" }} onClick={() => setLogPage(p)}>{p}</button> : null;
            })}
            <button style={{ ...S.btn("outline", true), opacity: logPage>=logTotalPages?0.4:1 }} disabled={logPage>=logTotalPages} onClick={() => setLogPage(p=>p+1)}>Next<Icon n="chevron_right" size={14} /></button>
            <button style={{ ...S.btn("outline", true), opacity: logPage>=logTotalPages?0.4:1 }} disabled={logPage>=logTotalPages} onClick={() => setLogPage(logTotalPages)}><Icon n="last_page" size={14} /></button>
          </div>
        </div>
      </div>
    );

    if (section === "clients") return <ClientsAdminSection />;
    return null;
  }

  return (
    <div>
      {!isMobile && <><div style={S.pageTitle}>Admin Panel</div><div style={S.pageSub}>Manage team access and system statistics</div></>}
      {isMobile ? (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
            {sideItems.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setSection(key)} style={{ ...S.btn(section===key?"primary":"outline", true), whiteSpace: "nowrap" }}>
                <Icon n={icon} size={14} />{label}
              </button>
            ))}
          </div>
          {renderAdminContent()}
        </div>
      ) : (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          <div style={{ width: "200px", flexShrink: 0, backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "10px" }}>
            <div style={{ fontSize: "9px", fontWeight: "700", color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px 10px", fontFamily: fontH }}>Menu</div>
            {sideItems.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setSection(key)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 11px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: fontB, fontSize: "13px", fontWeight: "600", textAlign: "left", transition: "all 0.15s", marginBottom: "2px", backgroundColor: section===key ? C.primary : "transparent", color: section===key ? "#fff" : C.textMid }}>
                <Icon n={icon} size={16} />{label}
              </button>
            ))}
            <div style={{ margin: "10px 2px", height: "1px", backgroundColor: C.border }} />
            <div style={{ padding: "10px", backgroundColor: C.surface, borderRadius: "9px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: C.primary, marginBottom: "2px", fontFamily: fontH }}>ATRIOS</div>
              <div style={{ fontSize: "10px", color: C.muted }}>Talent Intelligence</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>{renderAdminContent()}</div>
        </div>
      )}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
      {locationData && <LocationPieChart data={locationData.by_location} skill={locationData.skill} total={locationData.total} onClose={() => setLocationData(null)} />}
    </div>
  );
}
