import { useState, useCallback, useRef, useEffect } from "react";

if (typeof document !== "undefined") {
  const f1 = document.createElement("link"); f1.rel = "stylesheet";
  f1.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(f1);
  const f2 = document.createElement("link"); f2.rel = "stylesheet";
  f2.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
  document.head.appendChild(f2);

  const favicon = document.createElement("link"); favicon.rel = "icon"; favicon.type = "image/svg+xml";
  favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%236264f4'/><text x='16' y='23' font-family='Sora,sans-serif' font-size='20' font-weight='800' fill='white' text-anchor='middle'>A</text></svg>`;
  document.head.appendChild(favicon);

  document.title = "Talint · ATRIOS";
  document.body.style.margin = "0";
  document.body.style.backgroundColor = "#f6f6f8";
  document.body.style.fontFamily = "'DM Sans', sans-serif";

  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    .ms { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal;
      line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block;
      white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-smoothing: antialiased; vertical-align: middle; }
    input, select, textarea, button { font-family: 'DM Sans', sans-serif; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #c4b8e0; border-radius: 3px; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #6264f4 !important; box-shadow: 0 0 0 3px rgba(98,100,244,0.12); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes dotWave { 0%,80%,100% { transform: translateY(0); opacity:0.35; } 40% { transform: translateY(-7px); opacity:1; } }
    .fade-up { animation: fadeUp 0.25s ease forwards; }
    .dot-wave span { display:inline-block; width:8px; height:8px; border-radius:50%; background:currentColor; margin:0 3px; animation: dotWave 1.2s ease-in-out infinite; }
    .dot-wave span:nth-child(2) { animation-delay: 0.15s; }
    .dot-wave span:nth-child(3) { animation-delay: 0.30s; }
    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .mobile-nav { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
    }
    @media (min-width: 768px) { .mobile-only { display: none !important; } }
    @media (max-width: 767px) { .desktop-only { display: none !important; } }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(98,100,244,0.12) !important; }
    .stat-card { transition: all 0.2s ease; }
    .log-row:hover td { background: #f8f7fe; }
    .resource-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(98,100,244,0.10) !important; border-color: #c4b8e0 !important; }
    .resource-card { transition: all 0.18s ease; }
    .similar-btn:hover { background: #b45309 !important; }
    .similar-btn { transition: background 0.15s; }
  `;
  document.head.appendChild(style);
}

const API = "https://atrios-talent-intelligence-engine-production.up.railway.app";

const C = {
  bg: "#f6f6f8", surface: "#f0f0f8", white: "#ffffff",
  border: "#e8e5f5", borderMid: "#d4cef0",
  primary: "#6264f4", primaryDark: "#4f51e0", primaryLight: "#eeeefd", primaryDim: "rgba(98,100,244,0.08)",
  similar: "#d97706", similarLight: "rgba(217,119,6,0.10)", similarDim: "rgba(217,119,6,0.08)",
  success: "#3BB273", successLight: "rgba(59,178,115,0.1)",
  error: "#e05c5c", errorLight: "rgba(224,92,92,0.1)",
  warning: "#d97706", warningLight: "rgba(217,119,6,0.1)",
  info: "#0ea5e9", infoLight: "rgba(14,165,233,0.1)",
  text: "#0f0f2d", textMid: "#3d3d6b", muted: "#8b8ab8",
};
const font = "'DM Mono', monospace";
const fontH = "'Sora', sans-serif";
const fontB = "'DM Sans', sans-serif";

const getToken = () => localStorage.getItem("ti_token");
const getUser = () => JSON.parse(localStorage.getItem("ti_user") || "null");
const setAuth = (t, u) => { localStorage.setItem("ti_token", t); localStorage.setItem("ti_user", JSON.stringify(u)); };
const clearAuth = () => { localStorage.removeItem("ti_token"); localStorage.removeItem("ti_user"); };

const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 401) { clearAuth(); window.location.reload(); }
  return res;
};

const useIsMobile = () => {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
};

const Icon = ({ n, size = 20, color, style: st = {} }) => (
  <span className="ms" style={{ fontSize: size, color: color || "inherit", ...st }}>{n}</span>
);

const companyTypeLabel = (v) => ({ mnc: "MNC", startup: "Startup", consulting: "Consulting", product: "Product Co.", govt: "Govt / PSU", ngo: "NGO", unknown: null })[v] || null;
const workTypeLabel = (v) => ({ full_time: "Full-time", contract: "Contract", freelance: "Freelance", part_time: "Part-time", unknown: null })[v] || null;
const trajectoryLabel = (v) => ({ ascending: "Ascending", lateral: "Lateral", descending: "Descending", unknown: null })[v] || null;
const educationLabel = (v) => ({ phd: "PhD", post_graduate: "Post Graduate", graduate: "Graduate", high_school: "High School", unknown: null })[v] || null;

const S = {
  app: { minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: fontB },
  header: { borderBottom: `1px solid ${C.border}`, padding: "0 28px", height: "60px", display: "flex",
    alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 1px 0 rgba(98,100,244,0.06)" },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: "34px", height: "34px", borderRadius: "10px", backgroundColor: C.primary,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: fontH, color: "#fff", fontSize: "17px", fontWeight: "800", letterSpacing: "-0.02em" },
  logoText: { fontSize: "15px", fontWeight: "700", color: C.text, letterSpacing: "-0.02em", fontFamily: fontH },
  nav: { display: "flex", gap: "2px" },
  navBtn: (a) => ({ padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px",
    backgroundColor: a ? C.primaryLight : "transparent",
    color: a ? C.primary : C.muted, transition: "all 0.15s", fontFamily: fontB }),
  mobileNav: { position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(16px)", borderTop: `1px solid ${C.border}`,
    display: "flex", justifyContent: "space-around", alignItems: "center",
    padding: "10px 8px 12px", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" },
  mobileNavBtn: (a) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
    border: "none", background: "none", cursor: "pointer", padding: "4px 16px", borderRadius: "10px",
    color: a ? C.primary : C.muted, fontFamily: fontB }),
  mobileHeader: { display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
    position: "sticky", top: 0, zIndex: 100, borderBottom: `1px solid ${C.border}` },
  main: { padding: "24px 28px", maxWidth: "1340px", margin: "0 auto" },
  mainMobile: { padding: "16px", paddingBottom: "80px" },
  pageTitle: { fontSize: "22px", fontWeight: "700", marginBottom: "3px", letterSpacing: "-0.025em", fontFamily: fontH },
  pageSub: { fontSize: "13px", color: C.muted, marginBottom: "20px" },
  card: { backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "14px",
    padding: "20px 22px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(98,100,244,0.04)" },
  cardMobile: { backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "16px",
    padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(98,100,244,0.06)" },
  input: { padding: "9px 13px", borderRadius: "10px", border: `1px solid ${C.border}`,
    backgroundColor: C.bg, color: C.text, fontSize: "13px", fontFamily: fontB,
    width: "100%", boxSizing: "border-box", transition: "all 0.15s" },
  select: { padding: "9px 13px", borderRadius: "10px", border: `1px solid ${C.border}`,
    backgroundColor: C.bg, color: C.text, fontSize: "13px", fontFamily: fontB,
    width: "100%", boxSizing: "border-box", cursor: "pointer" },
  btn: (v = "primary", sm = false) => ({
    padding: sm ? "6px 13px" : "9px 20px", borderRadius: "10px", cursor: "pointer",
    fontSize: sm ? "12px" : "13px", fontWeight: "600", fontFamily: fontB, transition: "all 0.15s",
    border: v === "outline" ? `1px solid ${C.border}` : "none",
    backgroundColor: v === "primary" ? C.primary : v === "success" ? C.success :
      v === "danger" ? C.error : v === "outline" ? "transparent" : v === "similar" ? C.similar : C.surface,
    color: v === "primary" || v === "success" || v === "danger" || v === "similar" ? "#fff" :
      v === "outline" ? C.muted : C.text,
    display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }),
  badge: (t) => ({ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "700",
    backgroundColor: t === "success" ? C.successLight : t === "error" ? C.errorLight :
      t === "warning" ? C.warningLight : t === "admin" ? C.primaryDim : t === "info" ? C.infoLight : "rgba(139,138,184,0.1)",
    color: t === "success" ? "#2a7a50" : t === "error" ? "#b84444" : t === "warning" ? C.warning :
      t === "admin" ? C.primary : t === "info" ? C.info : C.muted }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: "10px", fontWeight: "700", color: C.muted,
    textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `2px solid ${C.border}`,
    backgroundColor: "#f8f7fe", fontFamily: fontH },
  td: { padding: "11px 14px", fontSize: "13px", borderBottom: `1px solid ${C.border}`, verticalAlign: "middle" },
  tag: { display: "inline-block", padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
    backgroundColor: C.primaryDim, color: C.primary, margin: "2px", fontFamily: font,
    border: `1px solid rgba(98,100,244,0.15)` },
  modal: { position: "fixed", inset: 0, backgroundColor: "rgba(15,15,45,0.65)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px", backdropFilter: "blur(8px)" },
  modalWrap: { backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "20px",
    maxWidth: "480px", width: "100%", boxShadow: "0 32px 80px rgba(98,100,244,0.18)", overflow: "hidden" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 22px", borderBottom: `1px solid ${C.border}` },
  modalBody: { padding: "22px" },
  modalFoot: { padding: "14px 22px", backgroundColor: "#faf9fe", borderTop: `1px solid ${C.border}`,
    display: "flex", gap: "10px", flexDirection: "row-reverse" },
  row: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  label: { fontSize: "10px", color: C.muted, fontWeight: "700", textTransform: "uppercase",
    letterSpacing: "0.1em", marginBottom: "6px", display: "block", fontFamily: fontH },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  divider: { height: "1px", backgroundColor: C.border, margin: "16px 0" },
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

// ─── PASSWORD UTILS ───────────────────────────────────────────────────────────
const pwChecks = (v) => [
  { label: "At least 8 characters", met: v.length >= 8 },
  { label: "One uppercase letter", met: /[A-Z]/.test(v) },
  { label: "One lowercase letter", met: /[a-z]/.test(v) },
  { label: "One number", met: /[0-9]/.test(v) },
  { label: "One special character (!@#$...)", met: /[^A-Za-z0-9]/.test(v) },
];
const pwValid = (v) => pwChecks(v).every(c => c.met);

function PasswordInput({ value, onChange, placeholder = "Password", showStrength = false }) {
  const [show, setShow] = useState(false);
  const checks = pwChecks(value);
  const metCount = checks.filter(c => c.met).length;
  const strength = metCount <= 1 ? "Weak" : metCount <= 3 ? "Fair" : metCount === 4 ? "Good" : "Strong";
  const strengthColor = metCount <= 1 ? C.error : metCount <= 3 ? C.warning : metCount === 4 ? "#3b82f6" : C.success;
  return (
    <div>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          placeholder={placeholder} style={{ ...S.input, paddingRight: "42px" }} />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", padding: 0 }}>
          <Icon n={show ? "visibility_off" : "visibility"} size={17} />
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ flex: 1, height: "4px", borderRadius: "4px", backgroundColor: C.border, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "4px", transition: "all 0.3s", width: `${(metCount / 5) * 100}%`, backgroundColor: strengthColor }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: strengthColor, minWidth: "44px" }}>{strength}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {checks.map((ch, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: ch.met ? C.success : C.muted, transition: "color 0.2s" }}>
                <Icon n={ch.met ? "check_circle" : "radio_button_unchecked"} size={14} color={ch.met ? C.success : C.border} />
                {ch.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const submit = async () => {
    if (!form.current_password || !form.new_password || !form.confirm) { setMsg("All fields are required"); return; }
    if (!pwValid(form.new_password)) { setMsg("Password does not meet all requirements"); return; }
    if (form.new_password !== form.confirm) { setMsg("Passwords do not match"); return; }
    setLoading(true); setMsg("");
    try {
      const res = await apiFetch("/api/v1/auth/change-password", { method: "POST", body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }) });
      const data = await res.json();
      if (res.ok) setDone(true); else setMsg(data.detail || "Failed");
    } catch { setMsg("Connection error"); } finally { setLoading(false); }
  };
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "440px" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="lock" size={15} color={C.primary} />
            </div>
            <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: fontH }}>Change Password</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon n="close" size={20} /></button>
        </div>
        {done ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.successLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon n="check_circle" size={28} color={C.success} />
            </div>
            <div style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px", fontFamily: fontH }}>Password Updated</div>
            <div style={{ fontSize: "13px", color: C.muted, marginBottom: "24px" }}>Your password has been changed successfully.</div>
            <button style={S.btn("outline")} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={S.modalBody}>
              <div style={{ marginBottom: "14px" }}><label style={S.label}>Current Password</label><PasswordInput value={form.current_password} placeholder="Enter current password" onChange={e => setForm(p => ({ ...p, current_password: e.target.value }))} /></div>
              <div style={{ marginBottom: "14px" }}><label style={S.label}>New Password</label><PasswordInput value={form.new_password} placeholder="Create a strong password" showStrength={true} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} /></div>
              <div><label style={S.label}>Confirm New Password</label>
                <PasswordInput value={form.confirm} placeholder="Repeat new password" onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
                {form.confirm.length > 0 && form.confirm !== form.new_password && (
                  <div style={{ fontSize: "12px", color: C.error, marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}><Icon n="error" size={13} color={C.error} />Passwords do not match</div>
                )}
              </div>
              {msg && <div style={{ marginTop: "12px", fontSize: "13px", color: C.error, display: "flex", alignItems: "center", gap: "6px" }}><Icon n="error" size={14} color={C.error} />{msg}</div>}
            </div>
            <div style={S.modalFoot}>
              <button style={S.btn("primary")} onClick={submit} disabled={loading || !pwValid(form.new_password)}><Icon n="lock_reset" size={15} />{loading ? "Updating..." : "Update Password"}</button>
              <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose }) {
  const [form, setForm] = useState({ new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const submit = async () => {
    if (!form.new_password || !form.confirm) { setMsg("Both fields required"); return; }
    if (!pwValid(form.new_password)) { setMsg("Password does not meet all requirements"); return; }
    if (form.new_password !== form.confirm) { setMsg("Passwords do not match"); return; }
    setLoading(true); setMsg("");
    try {
      const res = await apiFetch(`/api/v1/auth/reset-password/${user.id}`, { method: "POST", body: JSON.stringify({ new_password: form.new_password }) });
      const data = await res.json();
      if (res.ok) setDone(true); else setMsg(data.detail || "Reset failed");
    } catch { setMsg("Connection error"); } finally { setLoading(false); }
  };
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "440px" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.warningLight, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="key" size={15} color={C.warning} /></div>
            <div><div style={{ fontSize: "16px", fontWeight: "700", fontFamily: fontH }}>Reset Password</div><div style={{ fontSize: "11px", color: C.muted }}>for {user.username}</div></div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon n="close" size={20} /></button>
        </div>
        {done ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.successLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Icon n="check_circle" size={28} color={C.success} /></div>
            <div style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px", fontFamily: fontH }}>Password Reset</div>
            <div style={{ fontSize: "13px", color: C.muted, marginBottom: "24px" }}>Password for <strong>{user.username}</strong> updated.</div>
            <button style={S.btn("outline")} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={S.modalBody}>
              <div style={{ marginBottom: "14px" }}><label style={S.label}>New Password</label><PasswordInput value={form.new_password} placeholder="Create a strong password" showStrength={true} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} /></div>
              <div><label style={S.label}>Confirm Password</label>
                <PasswordInput value={form.confirm} placeholder="Repeat new password" onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
                {form.confirm.length > 0 && form.confirm !== form.new_password && (
                  <div style={{ fontSize: "12px", color: C.error, marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}><Icon n="error" size={13} color={C.error} />Passwords do not match</div>
                )}
              </div>
              {msg && <div style={{ marginTop: "12px", fontSize: "13px", color: C.error, display: "flex", alignItems: "center", gap: "6px" }}><Icon n="error" size={14} color={C.error} />{msg}</div>}
            </div>
            <div style={S.modalFoot}>
              <button style={S.btn("primary")} onClick={submit} disabled={loading || !pwValid(form.new_password)}><Icon n="lock_reset" size={15} />{loading ? "Resetting..." : "Reset Password"}</button>
              <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();
  const submit = async () => {
    if (!form.username || !form.password) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { setError("Invalid username or password"); return; }
      const data = await res.json();
      setAuth(data.access_token, { username: data.username, role: data.role });
      onLogin({ username: data.username, role: data.role });
    } catch { setError("Connection failed."); } finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: `radial-gradient(ellipse at 65% 0%, rgba(98,100,244,0.14) 0%, transparent 55%), radial-gradient(ellipse at 10% 100%, rgba(98,100,244,0.07) 0%, transparent 50%)` }}>
      <div style={{ width: "100%", maxWidth: "380px", padding: isMobile ? "16px" : "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: C.primary,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
            fontFamily: fontH, color: "#fff", fontSize: "26px", fontWeight: "800" }}>A</div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: C.text, marginBottom: "5px", letterSpacing: "-0.025em", fontFamily: fontH }}>Talent Intelligence</div>
          <div style={{ fontSize: "13px", color: C.muted }}>ATRIOS · Sign in to your workspace</div>
        </div>
        <div style={S.card}>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Username</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...S.input, paddingLeft: "38px" }} type="text" placeholder="Enter your username"
                value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
              <Icon n="person" size={16} color={C.muted} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={S.label}>Password</label>
            <PasswordInput value={form.password} placeholder="Enter your password" onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          {error && <div style={{ color: C.error, fontSize: "13px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}><Icon n="error" size={14} color={C.error} />{error}</div>}
          <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "11px" }} onClick={submit} disabled={loading}>
            <Icon n="login" size={16} />{loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIMILARITY SEARCH WINDOW ─────────────────────────────────────────────────
function openSimilarWindow(candidate) {
  const params = new URLSearchParams({
    seed_id: candidate.id,
    seed_name: candidate.name || "Unknown",
    token: getToken() || "",
  });
  const url = `${window.location.origin}${window.location.pathname}#similar?${params.toString()}`;
  window.open(url, `similar_${candidate.id}`, "width=1100,height=800,scrollbars=yes,resizable=yes");
}

// ─── LOADING ANIMATION ────────────────────────────────────────────────────────
function SimilarLoader() {
  const messages = ["Scanning candidate profiles…", "Computing semantic similarity…", "Ranking by skill overlap…", "Finalising matches…"];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px" }}>
      {/* Animated logo mark */}
      <div style={{ position: "relative", width: "56px", height: "56px", marginBottom: "28px" }}>
        {/* Outer ring */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
          border: `2px solid ${C.border}` }} />
        {/* Spinning arc */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
          border: `2px solid transparent`,
          borderTopColor: C.similar, borderRightColor: C.similar,
          animation: "spin 1s cubic-bezier(0.4,0,0.2,1) infinite" }} />
        {/* Inner icon */}
        <div style={{ position: "absolute", inset: "12px", borderRadius: "50%",
          backgroundColor: C.similarLight,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="hub" size={16} color={C.similar} />
        </div>
      </div>
      {/* Wave dots */}
      <div className="dot-wave" style={{ color: C.similar, marginBottom: "16px", height: "16px", display: "flex", alignItems: "center" }}>
        <span /><span /><span />
      </div>
      {/* Cycling message */}
      <div key={msgIdx} style={{ fontSize: "13px", color: C.muted, fontWeight: "500",
        animation: "fadeUp 0.4s ease forwards" }}>
        {messages[msgIdx]}
      </div>
    </div>
  );
}

// ─── WEIGHT SLIDERS ───────────────────────────────────────────────────────────

// Similar candidates default (semantic-heavy, 3-factor)
const DEFAULT_WEIGHTS = { vector: 80, skill: 15, experience: 5 };

// Project match defaults (4-factor, NGO/Non-Tech profile)
const DEFAULT_PROJECT_WEIGHTS = { skill: 25, vector: 40, experience: 20, domain: 15 };

// Project scoring presets — must match SCORING_PRESETS in project_routes.py
const PROJECT_PRESETS = {
  ngo:        { label: "NGO / Social Sector", skill: 25, vector: 40, experience: 20, domain: 15 },
  technology: { label: "Technology",          skill: 50, vector: 25, experience: 20, domain:  5 },
  consulting: { label: "Consulting",          skill: 30, vector: 35, experience: 20, domain: 15 },
  bfsi:       { label: "BFSI",               skill: 35, vector: 30, experience: 15, domain: 20 },
  general:    { label: "General",             skill: 30, vector: 35, experience: 25, domain: 10 },
};

// ── 3-factor slider (used in Similar Candidates panel) ────────────────────────
function WeightSliders({ weights, onChange }) {
  const sliderConfig = [
    { key: "vector",     label: "Talint",     color: C.primary,  icon: "psychology"  },
    { key: "skill",      label: "Skills",     color: C.success,  icon: "construction" },
    { key: "experience", label: "Experience", color: C.similar,  icon: "timeline"    },
  ];

  const handleChange = (key, rawVal) => {
    const val = Math.max(0, Math.min(100, parseInt(rawVal) || 0));
    const others = sliderConfig.map(s => s.key).filter(k => k !== key);
    const remaining = 100 - val;
    const currentOtherTotal = others.reduce((s, k) => s + weights[k], 0);
    let updated = { ...weights, [key]: val };
    if (currentOtherTotal === 0) {
      updated[others[0]] = Math.floor(remaining / 2);
      updated[others[1]] = remaining - updated[others[0]];
    } else {
      others.forEach(k => {
        updated[k] = Math.round((weights[k] / currentOtherTotal) * remaining);
      });
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      if (total !== 100) updated[others[1]] += (100 - total);
    }
    onChange(updated);
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const isDefault = weights.vector === DEFAULT_WEIGHTS.vector &&
    weights.skill === DEFAULT_WEIGHTS.skill &&
    weights.experience === DEFAULT_WEIGHTS.experience;

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px", marginTop: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icon n="tune" size={14} color={C.muted} />
          <span style={{ ...S.label, marginBottom: 0 }}>Scoring Weights</span>
          <span style={{ fontSize: "10px", color: C.muted, backgroundColor: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "6px", padding: "1px 8px", fontFamily: font }}>
            tal·{weights.vector}% + skill·{weights.skill}% + exp·{weights.experience}%
          </span>
        </div>
        {!isDefault && (
          <button onClick={() => onChange({ ...DEFAULT_WEIGHTS })}
            style={{ fontSize: "11px", color: C.muted, background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "2px 6px",
              borderRadius: "6px", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            <Icon n="restart_alt" size={13} />Reset
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {sliderConfig.map(({ key, label, color, icon }) => (
          <div key={key} style={{ flex: "1", minWidth: "160px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n={icon} size={12} color={color} />
                <span style={{ fontSize: "11px", fontWeight: "600", color: C.textMid }}>{label}</span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color, fontFamily: font }}>{weights[key]}%</span>
            </div>
            <div style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: "4px",
                borderRadius: "4px", backgroundColor: C.border }} />
              <div style={{ position: "absolute", left: 0, height: "4px",
                borderRadius: "4px", backgroundColor: color, opacity: 0.35,
                width: `${weights[key]}%`, transition: "width 0.15s" }} />
              <input type="range" min="0" max="100" value={weights[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{ position: "relative", width: "100%", appearance: "none", WebkitAppearance: "none",
                  background: "transparent", cursor: "pointer", height: "20px", margin: 0,
                  accentColor: color }} />
            </div>
          </div>
        ))}
      </div>
      {total !== 100 && (
        <div style={{ fontSize: "11px", color: C.error, marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Icon n="warning" size={12} color={C.error} />Weights must sum to 100% (currently {total}%)
        </div>
      )}
    </div>
  );
}

// ── 4-factor number inputs (used in Project Match panel) ──────────────────────
function ProjectWeightSliders({ weights, onChange }) {
  const inputConfig = [
    { key: "skill",      label: "Skills",     color: C.success, icon: "construction" },
    { key: "vector",     label: "Semantic",   color: C.primary, icon: "psychology"   },
    { key: "experience", label: "Experience", color: C.similar, icon: "timeline"     },
    { key: "domain",     label: "Domain",     color: C.info,    icon: "domain"       },
  ];

  const total    = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid  = total === 100;
  const isDefault = JSON.stringify(weights) === JSON.stringify(DEFAULT_PROJECT_WEIGHTS);

  const handleChange = (key, raw) => {
    const val = Math.max(0, Math.min(100, parseInt(raw) || 0));
    onChange({ ...weights, [key]: val });
  };

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px", marginTop: "4px" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <Icon n="tune" size={14} color={C.muted} />
          <span style={{ ...S.label, marginBottom: 0 }}>Scoring Weights</span>
          <span style={{
            fontSize: "10px", color: isValid ? C.muted : C.error,
            backgroundColor: isValid ? C.surface : C.errorLight,
            border: `1px solid ${isValid ? C.border : "rgba(224,92,92,0.3)"}`,
            borderRadius: "6px", padding: "1px 8px", fontFamily: font,
            fontWeight: isValid ? "400" : "700", transition: "all 0.2s",
          }}>
            {isValid
              ? `skill·${weights.skill}% + sem·${weights.vector}% + exp·${weights.experience}% + dom·${weights.domain}%`
              : `sum = ${total}% — must equal 100%`}
          </span>
        </div>
        {!isDefault && (
          <button
            onClick={() => onChange({ ...DEFAULT_PROJECT_WEIGHTS })}
            style={{
              fontSize: "11px", color: C.muted, background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
              padding: "2px 6px", borderRadius: "6px", transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.primary}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>
            <Icon n="restart_alt" size={13} />Reset
          </button>
        )}
      </div>

      {/* Number inputs row */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {inputConfig.map(({ key, label, color, icon }) => (
          <div key={key} style={{ flex: "1", minWidth: "100px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px",
            }}>
              <Icon n={icon} size={12} color={color} />
              <span style={{ fontSize: "11px", fontWeight: "600", color: C.textMid }}>{label}</span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min="0"
                max="100"
                value={weights[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{
                  ...S.input,
                  fontFamily: font,
                  fontSize: "18px",
                  fontWeight: "700",
                  color,
                  textAlign: "center",
                  paddingRight: "22px",
                  border: `1.5px solid ${
                    weights[key] === 0
                      ? C.border
                      : `${color}55`
                  }`,
                  backgroundColor: weights[key] === 0 ? C.surface : `${color}08`,
                  transition: "all 0.15s",
                }}
              />
              <span style={{
                position: "absolute", right: "8px", top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px", fontWeight: "700", color, opacity: 0.6,
                pointerEvents: "none",
              }}>%</span>
            </div>
            {/* Bar indicator */}
            <div style={{
              height: "3px", borderRadius: "3px",
              backgroundColor: C.border, marginTop: "6px", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: "3px",
                backgroundColor: color,
                width: `${weights[key]}%`,
                transition: "width 0.2s ease",
                opacity: weights[key] === 0 ? 0 : 0.6,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Hint text */}
      <div style={{
        marginTop: "10px", fontSize: "11px",
        color: C.muted, display: "flex", alignItems: "center", gap: "5px",
      }}>
        <Icon n="info" size={12} color={C.muted} />
        Set any param to 0 to remove it · all four must add up to 100
      </div>

      {/* Error state */}
      {!isValid && (
        <div style={{
          marginTop: "8px", padding: "8px 12px", borderRadius: "8px",
          backgroundColor: C.errorLight,
          border: `1px solid rgba(224,92,92,0.25)`,
          fontSize: "12px", fontWeight: "600", color: C.error,
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <Icon n="warning" size={14} color={C.error} />
          Weights must sum to 100% · currently {total}% · adjust any field to balance
        </div>
      )}
    </div>
  );
}
// ─── SCORE PILL ───────────────────────────────────────────────────────────────
const ScorePill = ({ label, value, color }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "3px",
    padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700",
    backgroundColor: `${color}18`, color }}>
    {label}: {Math.round(value * 100)}%
  </span>
);

// ─── SIMILAR CANDIDATES PANEL (opens in new window) ──────────────────────────
function SimilarPanel({ seedId, seedName }) {
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ min_experience: "", max_experience: "", location: "" });
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });

  const search = async (p = 1) => {
    setLoading(true);
    try {
      const body = { page: p };
      if (filters.min_experience) body.min_experience = parseFloat(filters.min_experience);
      if (filters.max_experience) body.max_experience = parseFloat(filters.max_experience);
      if (filters.location) body.location = filters.location;
      // Send weights as 0–1 fractions
      body.vector_weight = weights.vector / 100;
      body.skill_weight = weights.skill / 100;
      body.experience_weight = weights.experience / 100;
      const res = await apiFetch(`/api/v1/candidates/${seedId}/similar`, { method: "POST", body: JSON.stringify(body) });
      setData(await res.json());
      setPage(p);
    } catch { setData(null); } finally { setLoading(false); }
  };

  useEffect(() => { search(1); }, []);

  const viewProfile = async (c) => {
    try { const res = await apiFetch(`/api/v1/candidates/${c.id}`); setSelected(await res.json()); }
    catch { setSelected(c); }
  };

  const handleReset = () => {
    const resetFilters = { min_experience: "", max_experience: "", location: "" };
    const resetWeights = { ...DEFAULT_WEIGHTS };
    setFilters(resetFilters);
    setWeights(resetWeights);
    // search with reset values directly
    setLoading(true);
    apiFetch(`/api/v1/candidates/${seedId}/similar`, {
      method: "POST",
      body: JSON.stringify({ page: 1, vector_weight: 0.6, skill_weight: 0.3, experience_weight: 0.1 })
    }).then(r => r.json()).then(d => { setData(d); setPage(1); }).catch(() => setData(null)).finally(() => setLoading(false));
  };

  const weightsChanged = weights.vector !== DEFAULT_WEIGHTS.vector ||
    weights.skill !== DEFAULT_WEIGHTS.skill ||
    weights.experience !== DEFAULT_WEIGHTS.experience;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: fontB }}>
      {/* Header */}
      <div style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 24px",
        display: "flex", alignItems: "center", gap: "14px",
        background: `linear-gradient(135deg, ${C.similar} 0%, #b45309 100%)` }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="hub" size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", fontFamily: fontH }}>
            Similar to: {seedName}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
            Ranked by ATRIOS Talint · skill overlap · experience match
          </div>
        </div>
        {data && !loading && (
          <div style={{ marginLeft: "auto", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px",
            padding: "6px 14px", fontSize: "13px", fontWeight: "700", color: "#fff" }}>
            {data.total} matches
          </div>
        )}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Filters + Weight sliders card */}
        <div style={{ ...S.card, marginBottom: "16px" }}>
          {/* Row 1 — existing filters */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "4px" }}>
            <div style={{ flex: "1", minWidth: "140px" }}>
              <label style={S.label}>Location contains</label>
              <input style={S.input} placeholder="e.g. Delhi, Mumbai" value={filters.location}
                onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && search(1)} />
            </div>
            <div style={{ flex: "1", minWidth: "100px" }}>
              <label style={S.label}>Min Experience (yrs)</label>
              <input style={S.input} type="number" placeholder="e.g. 8" value={filters.min_experience}
                onChange={e => setFilters(p => ({ ...p, min_experience: e.target.value }))} />
            </div>
            <div style={{ flex: "1", minWidth: "100px" }}>
              <label style={S.label}>Max Experience (yrs)</label>
              <input style={S.input} type="number" placeholder="e.g. 20" value={filters.max_experience}
                onChange={e => setFilters(p => ({ ...p, max_experience: e.target.value }))} />
            </div>
            <button style={{ ...S.btn("similar"), padding: "9px 20px" }} onClick={() => search(1)} disabled={loading}>
              <Icon n="filter_list" size={14} />{loading ? "Working…" : weightsChanged ? "Apply ✦" : "Apply"}
            </button>
            <button style={S.btn("outline")} onClick={handleReset} disabled={loading}>
              <Icon n="refresh" size={14} />Reset
            </button>
          </div>
          {/* Row 2 — weight sliders */}
          <WeightSliders weights={weights} onChange={setWeights} />
        </div>

        {/* Results */}
        {loading ? (
          <SimilarLoader />
        ) : !data || data.total === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
            <Icon n="hub" size={44} color={C.border} style={{ display: "block", margin: "0 auto 14px" }} />
            <div style={{ fontSize: "15px", fontWeight: "600", fontFamily: fontH }}>No similar candidates found</div>
            <div style={{ fontSize: "13px", marginTop: "5px" }}>Try relaxing the filters or adjusting weights</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["Match", "Name", "Designation", "Exp", "Location", "Skills", "Score Breakdown", ""].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.results || []).map((c, i) => (
                    <tr key={i}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                      <td style={{ ...S.td, width: "60px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <div style={{ fontSize: "17px", fontWeight: "800", fontFamily: fontH,
                            color: c.similarity_score >= 0.6 ? C.success : c.similarity_score >= 0.45 ? C.similar : C.muted }}>
                            {Math.round(c.similarity_score * 100)}
                          </div>
                          <div style={{ fontSize: "9px", color: C.muted, fontWeight: "700", textTransform: "uppercase" }}>match</div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ fontWeight: "700", fontFamily: fontH, fontSize: "13px" }}>{c.name || "—"}</div>
                        <div style={{ fontSize: "11px", color: C.muted }}>{c.current_company || ""}</div>
                      </td>
                      <td style={{ ...S.td, fontSize: "12px", color: C.textMid, maxWidth: "160px" }}>{c.current_designation || "—"}</td>
                      <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600", whiteSpace: "nowrap" }}>
                        {c.total_experience != null ? `${c.total_experience}y` : "—"}
                        {c.experience_delta != null && c.experience_delta > 0 && (
                          <div style={{ fontSize: "10px", color: C.muted }}>Δ{c.experience_delta}y</div>
                        )}
                      </td>
                      <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.location || "—"}</td>
                      <td style={S.td}>
                        {(c.matching_skills || []).length > 0 ? (
                          <div>
                            {c.matching_skills.slice(0, 2).map((s, j) => (
                              <span key={j} style={{ ...S.tag, backgroundColor: C.successLight, color: C.success, border: "1px solid rgba(59,178,115,0.2)" }}>{s}</span>
                            ))}
                            {c.matching_skills.length > 2 && <span style={{ fontSize: "10px", color: C.muted }}> +{c.matching_skills.length - 2}</span>}
                          </div>
                        ) : <span style={{ fontSize: "12px", color: C.muted }}>—</span>}
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          <ScorePill label="Sem" value={c.vector_score} color={C.primary} />
                          <ScorePill label="Skill" value={c.skill_score} color={C.success} />
                          <ScorePill label="Exp" value={c.experience_score} color={C.similar} />
                        </div>
                      </td>
                      <td style={S.td}>
                        <button style={S.btn("outline", true)} onClick={() => viewProfile(c)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.total_pages} onChange={p => search(p)} />
          </>
        )}
      </div>
      {selected && <ProfileModal candidate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ProfileModal({ candidate: init, onClose, onFindSimilar }) {
  const [c, setC] = useState(init);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: c.phone || "", location: c.location || "", recruiter_notes: c.recruiter_notes || "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [projects,     setProjects]     = useState([]);
  const [showProjDrop, setShowProjDrop] = useState(false);
  const [addingToProj, setAddingToProj] = useState(null);
  const [addedToProj,  setAddedToProj]  = useState(null);
  const isMobile = useIsMobile();
  if (!c) return null;
  const meta = c.metadata_json || {};
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
    } catch { }
    finally { setAddingToProj(null); }
  };

  return (
    <div style={{ ...S.modal, alignItems: isMobile ? "flex-end" : "center", padding: isMobile ? "0" : "16px" }} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: isMobile ? "100%" : "720px", width: "100%",
        maxHeight: isMobile ? "92vh" : "88vh", overflowY: "auto",
        borderRadius: isMobile ? "20px 20px 0 0" : "20px" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #9b8fd0 100%)`, padding: "20px 22px 18px" }}>
          {isMobile && <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.35)", margin: "0 auto 16px" }} />}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "19px", fontWeight: "700", color: "#fff", marginBottom: "2px", fontFamily: fontH }}>{c.name || "Unknown"}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>{c.current_designation || "No designation"}{c.current_company ? ` · ${c.current_company}` : ""}</div>
            </div>
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {/* Find Similar button */}
              <button className="similar-btn"
                onClick={() => { onClose(); openSimilarWindow(c); }}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: "600", backgroundColor: C.similar, color: "#fff",
                  display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n="hub" size={14} />Find Similar
              </button>
              {/* Add to Project button */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => { setShowProjDrop(p => !p); setAddedToProj(null); }}
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
                      <div style={{ padding: "12px 14px", fontSize: "13px", color: C.muted }}>
                        No active projects
                      </div>
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
              {c.cv_storage_url && (
                <a href={c.cv_storage_url} target="_blank" rel="noreferrer"
                  style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
                  <Icon n="open_in_new" size={14} />View CV
                </a>
              )}
              {!isMobile && <button onClick={() => { setEditing(!editing); setSaveMsg(""); }}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n={editing ? "close" : "edit"} size={14} />{editing ? "Cancel" : "Edit"}
              </button>}
              <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", cursor: "pointer", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon n="close" size={18} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
            <Pill label={c.is_leadership ? "Leadership" : null} />
            <Pill label={c.source} />
            <Pill label={c.total_experience != null ? `${c.total_experience}y exp` : null} bg="rgba(59,178,115,0.4)" />
            <Pill label={c.current_ctc ? `${c.current_ctc}L CTC` : null} />
          </div>
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
        <div style={{ padding: "18px 22px" }}>
          {c.ai_cv_summary && !editing && (
            <div style={{ backgroundColor: C.primaryDim, border: `1px solid rgba(98,100,244,0.18)`, borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", color: C.primary, fontWeight: "700", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fontH }}>AI Summary</div>
              <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{c.ai_cv_summary}</div>
            </div>
          )}
          {c.recruiter_notes && !editing && (
            <div style={{ backgroundColor: C.warningLight, border: `1px solid rgba(217,119,6,0.18)`, borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", color: C.warning, fontWeight: "700", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: fontH }}>Recruiter Notes</div>
              <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{c.recruiter_notes}</div>
            </div>
          )}
          {editing && (
            <div style={{ backgroundColor: C.primaryDim, border: `1px solid rgba(98,100,244,0.2)`, borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: C.primary, fontWeight: "700", marginBottom: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Edit Contact Info</div>
              <div style={S.grid2}>
                <div><label style={S.label}>Phone</label><input style={S.input} value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><label style={S.label}>Location</label><input style={S.input} value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} /></div>
              </div>
              <div style={{ marginTop: "10px" }}><label style={S.label}>Recruiter Notes</label>
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
            return <Section key={key} title={key.replace(/_/g, " ").toUpperCase()}>{Array.isArray(val) ? <div>{val.map((v, i) => <span key={i} style={S.tag}>{v}</span>)}</div> : <div style={{ fontSize: "13px" }}>{String(val)}</div>}</Section>;
          })}
          <div style={{ marginTop: "16px", padding: "10px 12px", backgroundColor: C.surface, borderRadius: "8px", display: "flex", gap: "16px" }}>
            {c.parse_model && <span style={{ fontSize: "11px", color: C.muted }}>Model: <span style={{ fontFamily: font }}>{c.parse_model}</span></span>}
            {c.parse_version && <span style={{ fontSize: "11px", color: C.muted }}>Parse v{c.parse_version}</span>}
            {c.source_file && <span style={{ fontSize: "11px", color: C.muted, fontFamily: font }}>{c.source_file}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarBtn({ candidateId, starred, onToggle }) {
  const [loading, setLoading] = useState(false);
  const toggle = async (e) => {
    e.stopPropagation(); setLoading(true);
    try { await apiFetch(`/api/v1/candidates/${candidateId}/shortlist`, { method: "POST" }); onToggle(candidateId); }
    finally { setLoading(false); }
  };
  return (
    <button onClick={toggle} disabled={loading}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px",
        color: starred ? "#f59e0b" : C.border, transition: "all 0.15s", padding: "2px 6px",
        filter: starred ? "drop-shadow(0 0 4px rgba(245,158,11,0.5))" : "none" }}>★</button>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center", padding: "20px 0 4px" }}>
      <button style={{ ...S.btn("outline", true), opacity: page <= 1 ? 0.4 : 1 }} disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon n="chevron_left" size={14} />Prev</button>
      {pages[0] > 1 && <><button style={S.btn("outline", true)} onClick={() => onChange(1)}>1</button>{pages[0] > 2 && <span style={{ color: C.muted }}>…</span>}</>}
      {pages.map(p => <button key={p} style={{ ...S.btn(p === page ? "primary" : "outline", true), minWidth: "34px", justifyContent: "center" }} onClick={() => onChange(p)}>{p}</button>)}
      {pages[pages.length - 1] < totalPages && <><span style={{ color: C.muted }}>…</span><button style={S.btn("outline", true)} onClick={() => onChange(totalPages)}>{totalPages}</button></>}
      <button style={{ ...S.btn("outline", true), opacity: page >= totalPages ? 0.4 : 1 }} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next<Icon n="chevron_right" size={14} /></button>
      <span style={{ fontSize: "12px", color: C.muted, fontFamily: font }}>Page {page} of {totalPages}</span>
    </div>
  );
}

function CandidateCard({ c, isStarred, onToggleStar, onView }) {
  return (
    <div className="fade-up" style={{ ...S.cardMobile, cursor: "pointer" }} onClick={() => onView(c)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "15px", fontFamily: fontH, color: C.text }}>{c.name || "—"}</div>
          <div style={{ fontSize: "12px", color: C.primary, fontWeight: "600", marginTop: "1px" }}>{c.current_designation || "—"}</div>
        </div>
        <StarBtn candidateId={c.id} starred={isStarred} onToggle={onToggleStar} />
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "12px", color: C.muted }}>
        {c.total_experience != null && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon n="work_history" size={13} />{c.total_experience}y exp</span>}
        {c.location && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon n="location_on" size={13} />{c.location}</span>}
        {c.current_ctc && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Icon n="currency_rupee" size={13} />{c.current_ctc}L</span>}
      </div>
      {(c.skills || []).length > 0 && (
        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap" }}>
          {c.skills.slice(0, 3).map((s, i) => <span key={i} style={S.tag}>{s}</span>)}
          {c.skills.length > 3 && <span style={{ fontSize: "11px", color: C.muted, padding: "2px 6px" }}>+{c.skills.length - 3}</span>}
        </div>
      )}
    </div>
  );
}

// ─── SEARCH TAB ───────────────────────────────────────────────────────────────
function SearchTab() {
  const isMobile = useIsMobile();
  const [name, setName] = useState(""); const [skillInput, setSkillInput] = useState(""); const [skills, setSkills] = useState([]);
  const [skillMatch, setSkillMatch] = useState("OR"); const [location, setLocation] = useState(""); const [company, setCompany] = useState("");
  const [minExp, setMinExp] = useState(""); const [maxExp, setMaxExp] = useState(""); const [leadership, setLeadership] = useState("");
  const [gender, setGender] = useState(""); const [minCtc, setMinCtc] = useState(""); const [maxCtc, setMaxCtc] = useState("");
  const [sortBy, setSortBy] = useState("newest"); const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [educationLevel, setEducationLevel] = useState(""); const [tier1Only, setTier1Only] = useState(false);
  const [companyType, setCompanyType] = useState(""); const [workType, setWorkType] = useState("");
  const [maxNotice, setMaxNotice] = useState(""); const [trajectory, setTrajectory] = useState("");
  const [minAge, setMinAge] = useState(""); const [maxAge, setMaxAge] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1); const [data, setData] = useState(null); const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); const [selected, setSelected] = useState(null);
  const [starredIds, setStarredIds] = useState(new Set());

  const addSkill = () => { const s = skillInput.trim(); if (s && !skills.includes(s)) setSkills(p => [...p, s]); setSkillInput(""); };
  const buildBody = (p) => ({
    name: name || null, skill_keywords: skills, skill_match: skillMatch,
    location: location || null, company: company || null,
    min_experience: minExp ? parseFloat(minExp) : null, max_experience: maxExp ? parseFloat(maxExp) : null,
    is_leadership: leadership === "" ? null : leadership === "true", gender: gender || null,
    min_ctc: minCtc ? parseFloat(minCtc) : null, max_ctc: maxCtc ? parseFloat(maxCtc) : null,
    sort_by: sortBy, shortlisted_only: shortlistedOnly, page: p || page, page_size: 25,
    highest_education_level: educationLevel || null, tier1_institute: tier1Only ? true : null,
    current_company_type: companyType || null, current_work_type: workType || null,
    max_notice_period: maxNotice ? parseInt(maxNotice) : null, career_trajectory: trajectory || null,
    min_age: minAge ? parseInt(minAge) : null, max_age: maxAge ? parseInt(maxAge) : null,
  });

  const search = async (p = 1) => {
    setLoading(true); setSearched(true); setPage(p);
    try {
      const res = await apiFetch("/api/v1/candidates/search", { method: "POST", body: JSON.stringify(buildBody(p)) });
      const json = await res.json(); setData(json);
      const ns = new Set(starredIds); (json.results || []).forEach(c => { if (c.is_shortlisted) ns.add(c.id); }); setStarredIds(ns);
    } catch { setData(null); } finally { setLoading(false); }
  };

  const toggleStar = (id) => setStarredIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const reset = () => {
    setName(""); setSkills([]); setSkillInput(""); setLocation(""); setCompany(""); setMinExp(""); setMaxExp("");
    setLeadership(""); setGender(""); setMinCtc(""); setMaxCtc(""); setSortBy("newest"); setShortlistedOnly(false);
    setEducationLevel(""); setTier1Only(false); setCompanyType(""); setWorkType(""); setMaxNotice(""); setTrajectory("");
    setMinAge(""); setMaxAge(""); setData(null); setSearched(false); setPage(1);
  };
  const viewProfile = async (c) => { try { const res = await apiFetch(`/api/v1/candidates/${c.id}`); setSelected(await res.json()); } catch { setSelected(c); } };
  const results = data?.results || [];
  const advancedCount = [educationLevel, companyType, workType, trajectory, maxNotice, tier1Only, minAge, maxAge, gender, leadership, minCtc, maxCtc].filter(v => v !== "" && v !== false).length;

  return (
    <div>
      {!isMobile && <><div style={S.pageTitle}>Search Candidates</div><div style={S.pageSub}>Combine any filters · Partial match on name, skills and company</div></>}
      <div style={isMobile ? S.cardMobile : S.card}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <div>
            <label style={S.label}>Name</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...S.input, paddingLeft: "36px" }} placeholder="Full or partial name" value={name}
                onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} />
              <Icon n="person_search" size={15} color={C.muted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <div>
            <label style={S.label}>Location</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...S.input, paddingLeft: "36px" }} placeholder="e.g. Mumbai, Delhi" value={location}
                onChange={e => setLocation(e.target.value)} />
              <Icon n="location_on" size={15} color={C.muted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ ...S.label, marginBottom: 0 }}>Skills</label>
              <div style={{ display: "flex", gap: "2px", backgroundColor: C.surface, borderRadius: "7px", padding: "2px" }}>
                {["OR", "AND"].map(m => <button key={m} onClick={() => setSkillMatch(m)} style={{ padding: "3px 9px", borderRadius: "5px", cursor: "pointer", fontSize: "11px", fontWeight: "700", border: "none", transition: "all 0.15s", backgroundColor: skillMatch === m ? C.primary : "transparent", color: skillMatch === m ? "#fff" : C.muted }}>{m}</button>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: "7px" }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Type skill + Enter" value={skillInput}
                onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} />
              <button style={S.btn("outline", true)} onClick={addSkill}><Icon n="add" size={14} /></button>
            </div>
            {skills.length > 0 && <div style={{ marginTop: "7px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {skills.map((s, i) => <span key={i} style={{ ...S.tag, cursor: "pointer" }} onClick={() => setSkills(p => p.filter((_, j) => j !== i))}>{s} ×</span>)}
            </div>}
          </div>
          <div>
            <label style={S.label}>Experience Range (years)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={S.input} type="number" placeholder="Min" value={minExp} onChange={e => setMinExp(e.target.value)} />
              <input style={S.input} type="number" placeholder="Max" value={maxExp} onChange={e => setMaxExp(e.target.value)} />
            </div>
          </div>
        </div>
        <button onClick={() => setShowAdvanced(s => !s)}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: `1px dashed ${C.borderMid}`,
            borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
            color: showAdvanced ? C.primary : C.muted, width: "100%", justifyContent: "center",
            backgroundColor: showAdvanced ? C.primaryDim : "transparent", transition: "all 0.15s", marginBottom: "14px" }}>
          <Icon n={showAdvanced ? "keyboard_arrow_up" : "tune"} size={15} />
          {showAdvanced ? "Hide" : "Advanced Filters"}
          {!showAdvanced && advancedCount > 0 && (
            <span style={{ backgroundColor: C.primary, color: "#fff", borderRadius: "20px", padding: "1px 7px", fontSize: "10px", fontWeight: "700" }}>{advancedCount}</span>
          )}
        </button>
        {showAdvanced && (
          <div className="fade-up" style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
              <div><label style={S.label}>Company</label><input style={S.input} placeholder="e.g. Tata" value={company} onChange={e => setCompany(e.target.value)} /></div>
              <div><label style={S.label}>CTC Range (L)</label><div style={{ display: "flex", gap: "6px" }}><input style={S.input} type="number" placeholder="Min" value={minCtc} onChange={e => setMinCtc(e.target.value)} /><input style={S.input} type="number" placeholder="Max" value={maxCtc} onChange={e => setMaxCtc(e.target.value)} /></div></div>
              <div><label style={S.label}>Age Range</label><div style={{ display: "flex", gap: "6px" }}><input style={S.input} type="number" placeholder="Min" value={minAge} onChange={e => setMinAge(e.target.value)} /><input style={S.input} type="number" placeholder="Max" value={maxAge} onChange={e => setMaxAge(e.target.value)} /></div></div>
              <div><label style={S.label}>Max Notice (days)</label><input style={S.input} type="number" placeholder="e.g. 30" value={maxNotice} onChange={e => setMaxNotice(e.target.value)} /></div>
              <div><label style={S.label}>Education Level</label>
                <select style={S.select} value={educationLevel} onChange={e => setEducationLevel(e.target.value)}>
                  <option value="">Any</option><option value="phd">PhD</option>
                  <option value="post_graduate">Post Graduate</option><option value="graduate">Graduate</option>
                  <option value="high_school">High School</option>
                </select>
              </div>
              <div><label style={S.label}>Company Type</label>
                <select style={S.select} value={companyType} onChange={e => setCompanyType(e.target.value)}>
                  <option value="">Any</option><option value="mnc">MNC</option><option value="startup">Startup</option>
                  <option value="consulting">Consulting</option><option value="product">Product Co.</option>
                  <option value="govt">Govt / PSU</option><option value="ngo">NGO</option>
                </select>
              </div>
              <div><label style={S.label}>Work Type</label>
                <select style={S.select} value={workType} onChange={e => setWorkType(e.target.value)}>
                  <option value="">Any</option><option value="full_time">Full-time</option>
                  <option value="contract">Contract</option><option value="freelance">Freelance</option>
                  <option value="part_time">Part-time</option>
                </select>
              </div>
              <div><label style={S.label}>Career Trajectory</label>
                <select style={S.select} value={trajectory} onChange={e => setTrajectory(e.target.value)}>
                  <option value="">Any</option><option value="ascending">Ascending</option>
                  <option value="lateral">Lateral</option><option value="descending">Descending</option>
                </select>
              </div>
              <div><label style={S.label}>Level</label>
                <select style={S.select} value={leadership} onChange={e => setLeadership(e.target.value)}>
                  <option value="">All</option><option value="true">Leadership</option><option value="false">Non-Leadership</option>
                </select>
              </div>
              <div><label style={S.label}>Gender</label>
                <select style={S.select} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">All</option><option value="M">Male</option><option value="F">Female</option>
                </select>
              </div>
              <div><label style={S.label}>Sort By</label>
                <select style={S.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option><option value="oldest">Oldest First</option>
                  <option value="experience_desc">Most Experienced</option><option value="experience_asc">Least Experienced</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: shortlistedOnly ? "#f59e0b" : C.muted, fontWeight: shortlistedOnly ? "600" : "400" }}>
                <input type="checkbox" checked={shortlistedOnly} onChange={e => setShortlistedOnly(e.target.checked)} style={{ accentColor: "#f59e0b", width: "14px", height: "14px" }} />★ Shortlisted only
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: tier1Only ? C.primary : C.muted, fontWeight: tier1Only ? "600" : "400" }}>
                <input type="checkbox" checked={tier1Only} onChange={e => setTier1Only(e.target.checked)} style={{ accentColor: C.primary, width: "14px", height: "14px" }} />Tier 1 Institute only
              </label>
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: "14px", marginTop: "4px" }}>
          <button style={S.btn("outline")} onClick={reset}><Icon n="refresh" size={14} />Reset</button>
          <button style={{ ...S.btn("primary"), padding: "10px 28px", fontSize: "14px" }} onClick={() => search(1)} disabled={loading}>
            <Icon n="search" size={15} />{loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      {searched && (
        <div style={isMobile ? {} : S.card}>
          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>
              <Icon n="manage_search" size={44} color={C.border} style={{ display: "block", margin: "0 auto 14px" }} />
              <div style={{ fontSize: "15px", fontWeight: "600", fontFamily: fontH }}>No results found</div>
              <div style={{ fontSize: "13px", marginTop: "5px" }}>Try adjusting your filters</div>
            </div>
          ) : isMobile ? (
            <div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "12px", padding: "0 2px" }}>
                <strong style={{ color: C.text }}>{data.total?.toLocaleString()}</strong> candidates found
              </div>
              {results.map((c, i) => (
                <CandidateCard key={i} c={c} isStarred={starredIds.has(c.id)} onToggleStar={toggleStar} onView={viewProfile} />
              ))}
              <Pagination page={data.page} totalPages={data.total_pages} onChange={p => search(p)} />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "13px", color: C.muted }}>
                  <strong style={{ color: C.text }}>{data.total?.toLocaleString()}</strong> candidates · page {data.page} of {data.total_pages}
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead><tr>{["", "Name", "Designation", "Exp", "Location", "Company", "Skills", "CTC", "Added", ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {results.map((c, i) => {
                      const isStarred = starredIds.has(c.id);
                      return (
                        <tr key={i} style={{ backgroundColor: isStarred ? "rgba(245,158,11,0.04)" : "" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = isStarred ? "rgba(245,158,11,0.08)" : C.surface}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = isStarred ? "rgba(245,158,11,0.04)" : ""}>
                          <td style={{ ...S.td, padding: "8px 4px 8px 12px" }}><StarBtn candidateId={c.id} starred={isStarred} onToggle={toggleStar} /></td>
                          <td style={{ ...S.td, maxWidth: "200px" }}>
                            <div style={{ fontWeight: "700", fontFamily: fontH, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || "—"}</div>
                            <div style={{ fontSize: "11px", color: C.muted, fontFamily: font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.email || ""}>{c.email || ""}</div>
                          </td>
                          <td style={{ ...S.td, fontSize: "12px", color: C.textMid, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.current_designation || "—"}</td>
                          <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600", whiteSpace: "nowrap" }}>{c.total_experience != null ? `${c.total_experience}y` : "—"}</td>
                          <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.location || ""}>{c.location || "—"}</td>
                          <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(c.metadata_json?.companies || []).slice(0, 1).join("") || "—"}</td>
                          <td style={S.td}>{(c.skills || []).slice(0, 2).map((s, j) => <span key={j} style={S.tag}>{s}</span>)}{(c.skills || []).length > 2 && <span style={{ fontSize: "11px", color: C.muted }}> +{c.skills.length - 2}</span>}</td>
                          <td style={{ ...S.td, fontFamily: font, fontSize: "12px", whiteSpace: "nowrap" }}>{c.current_ctc ? `${c.current_ctc}L` : "—"}</td>
                          <td style={{ ...S.td, fontSize: "11px", color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(c.created_at)}</td>
                          <td style={S.td}>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button style={S.btn("outline", true)} onClick={() => viewProfile(c)}>View</button>
                              <button className="similar-btn" style={{ ...S.btn("similar", true) }} onClick={() => openSimilarWindow(c)}>
                                <Icon n="hub" size={12} />Similar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={data.page} totalPages={data.total_pages} onChange={p => search(p)} />
            </>
          )}
        </div>
      )}
      {selected && <ProfileModal candidate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── UPLOAD TAB ───────────────────────────────────────────────────────────────
function UploadTab() {
  const isMobile = useIsMobile();
  const [dragging, setDragging] = useState(false); const [files, setFiles] = useState([]); const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false); const [selected, setSelected] = useState(null); const inputRef = useRef();
  const addFiles = (newFiles) => setFiles(prev => [...prev, ...Array.from(newFiles).filter(f => [".pdf", ".docx", ".txt"].some(ext => f.name.toLowerCase().endsWith(ext)))]);
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }, []);
  const uploadAll = async () => {
    if (!files.length) return; setUploading(true); setResults([]);
    const fd = new FormData(); files.forEach(f => fd.append("files", f));
    try { const res = await apiFetch("/api/v1/candidates/upload", { method: "POST", body: fd }); setResults(await res.json()); }
    catch (err) { setResults([{ filename: "Error", status: "failed", error: err.message }]); }
    finally { setUploading(false); setFiles([]); }
  };
  const viewProfile = async (r) => {
    if (!r.candidate_id) return;
    try { const res = await apiFetch(`/api/v1/candidates/${r.candidate_id}`); setSelected(await res.json()); }
    catch { if (r.preview) setSelected(r.preview); }
  };
  const success = results.filter(r => r.status === "success").length;
  const failed = results.filter(r => r.status === "failed").length;
  return (
    <div>
      {!isMobile && <><div style={S.pageTitle}>Upload CVs</div><div style={S.pageSub}>AI-powered parsing · Files saved to cloud storage</div></>}
      <div style={isMobile ? S.cardMobile : S.card}>
        <div onClick={() => inputRef.current.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)} onDrop={onDrop}
          style={{ border: `2px dashed ${dragging ? C.primary : C.border}`, borderRadius: "12px",
            padding: isMobile ? "36px 20px" : "48px 24px", textAlign: "center", cursor: "pointer",
            transition: "all 0.2s", backgroundColor: dragging ? C.primaryDim : C.surface }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: dragging ? C.primary : C.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", transition: "all 0.2s" }}>
            <Icon n="upload_file" size={26} color={dragging ? "#fff" : C.primary} />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "5px", fontFamily: fontH }}>Drop CVs here or click to browse</div>
          <div style={{ fontSize: "12px", color: C.muted, marginBottom: "18px" }}>PDF, DOCX, TXT · Multiple files · Max 5MB each</div>
          <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
          <button style={S.btn("outline")} onClick={e => { e.stopPropagation(); inputRef.current.click(); }}><Icon n="folder_open" size={14} />Browse Files</button>
        </div>
        <div style={{ marginTop: "10px", padding: "9px 12px", backgroundColor: C.surface, borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.muted }}>
            <Icon n="verified_user" size={14} color={C.primary} />Secure transfer · AI-powered CV parsing
          </div>
          <Icon n="lock" size={15} color={C.primary} />
        </div>
        {files.length > 0 && (
          <>
            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", backgroundColor: C.surface, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <Icon n={f.name.endsWith(".pdf") ? "picture_as_pdf" : "description"} size={17} color={C.primary} />
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{f.name}</span>
                    <span style={{ fontSize: "11px", color: C.muted }}>{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: C.error }}><Icon n="close" size={16} /></button>
                </div>
              ))}
            </div>
            <div style={{ ...S.row, marginTop: "12px" }}>
              <button style={S.btn("primary")} onClick={uploadAll} disabled={uploading}>
                <Icon n="rocket_launch" size={14} />{uploading ? "Processing..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
              </button>
              <button style={S.btn("outline")} onClick={() => setFiles([])}><Icon n="clear_all" size={14} />Clear</button>
            </div>
          </>
        )}
      </div>
      {results.length > 0 && (
        <div style={isMobile ? S.cardMobile : S.card}>
          <div style={{ ...S.row, marginBottom: "14px" }}>
            <span style={S.badge("success")}><Icon n="check_circle" size={12} />{success} uploaded</span>
            {failed > 0 && <span style={S.badge("error")}><Icon n="error" size={12} />{failed} failed</span>}
          </div>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {results.map((r, i) => (
                <div key={i} style={{ padding: "10px 12px", backgroundColor: C.surface, borderRadius: "10px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>{r.preview?.name || r.filename}</div>
                    <span style={S.badge(r.status === "success" ? "success" : r.status === "duplicate" ? "warning" : r.status === "updated" ? "admin" : "error")}>{r.status}</span>
                  </div>
                  {r.preview?.current_designation && <div style={{ fontSize: "12px", color: C.muted, marginTop: "3px" }}>{r.preview.current_designation}</div>}
                  {r.status === "success" && <button style={{ ...S.btn("outline", true), marginTop: "8px" }} onClick={() => viewProfile(r)}>View Profile</button>}
                </div>
              ))}
            </div>
          ) : (
            <table style={S.table}>
              <thead><tr>{["Filename", "Status", "Parsed Name", "Exp", "Top Skills", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface} onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                    <td style={{ ...S.td, fontSize: "12px", fontFamily: font }}>{r.filename}</td>
                    <td style={S.td}><span style={S.badge(r.status === "success" ? "success" : r.status === "duplicate" ? "warning" : r.status === "updated" ? "admin" : "error")}>{r.status}</span></td>
                    <td style={S.td}><div style={{ fontWeight: "700" }}>{r.preview?.name || "—"}</div><div style={{ fontSize: "11px", color: C.muted }}>{r.preview?.current_designation || ""}</div></td>
                    <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600" }}>{r.preview?.total_experience != null ? `${r.preview.total_experience}y` : "—"}</td>
                    <td style={S.td}>{(r.preview?.skills || []).slice(0, 3).map((s, j) => <span key={j} style={S.tag}>{s}</span>)}{r.error && <span style={{ color: C.muted, fontSize: "12px" }}>{r.error}</span>}</td>
                    <td style={S.td}>{r.status === "success" && <button style={S.btn("outline", true)} onClick={() => viewProfile(r)}>View</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {selected && <ProfileModal candidate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── RESOURCES TAB ────────────────────────────────────────────────────────────
function ResourcesTab({ isAdmin }) {
  const isMobile = useIsMobile();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // resource being edited
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "", icon_name: "open_in_new", display_order: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
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
    setForm({ title: r.title, description: r.description || "", url: r.url, icon_name: r.icon_name || "open_in_new", display_order: r.display_order, is_active: r.is_active });
    setShowAdd(false);
  };

  const iconOptions = [
    { value: "open_in_new", label: "External Link" },
    { value: "work", label: "Work / ATS" },
    { value: "description", label: "Document" },
    { value: "travel_explore", label: "Explore" },
    { value: "code", label: "Code / Tech" },
    { value: "filter_alt", label: "Filter / Screen" },
    { value: "smart_toy", label: "AI Assistant" },
    { value: "psychology", label: "Intelligence" },
    { value: "hub", label: "Network" },
    { value: "analytics", label: "Analytics" },
  ];

  const ResourceForm = () => (
    <div style={{ ...S.card, border: `1px solid ${C.borderMid}`, backgroundColor: "#faf9fe" }}>
      <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "14px", fontFamily: fontH, color: C.primary }}>
        {editing ? "Edit Resource" : "Add New Resource"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <label style={S.label}>Title *</label>
          <input style={S.input} placeholder="e.g. ARP – ATS" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div>
          <label style={S.label}>URL *</label>
          <input style={S.input} placeholder="https://..." value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
        </div>
        <div>
          <label style={S.label}>Description</label>
          <input style={S.input} placeholder="Short description shown on card" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Icon</label>
            <select style={S.select} value={form.icon_name} onChange={e => setForm(p => ({ ...p, icon_name: e.target.value }))}>
              {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ width: "80px" }}>
            <label style={S.label}>Order</label>
            <input style={S.input} type="number" min="0" value={form.display_order} onChange={e => setForm(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>
      </div>
      {editing && (
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: C.textMid, marginBottom: "12px" }}>
          <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: C.primary }} />
          Active (visible to team)
        </label>
      )}
      {msg && <div style={{ fontSize: "12px", color: msg === "Updated" || msg === "Created" ? C.success : C.error, marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
        <Icon n={msg === "Updated" || msg === "Created" ? "check_circle" : "error"} size={13} />{msg}
      </div>}
      <div style={S.row}>
        <button style={S.btn("primary", true)} onClick={save} disabled={saving}><Icon n="save" size={13} />{saving ? "Saving…" : editing ? "Save Changes" : "Add Resource"}</button>
        <button style={S.btn("outline", true)} onClick={() => { setEditing(null); setShowAdd(false); resetForm(); setMsg(""); }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          {!isMobile && <div style={S.pageTitle}>Resources</div>}
          <div style={{ fontSize: "13px", color: C.muted, marginTop: isMobile ? 0 : "3px" }}>Quick access to ATRIOS tools and assistants</div>
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
          <div style={{ width: "28px", height: "28px", border: `3px solid ${C.primary}`, borderTopColor: "transparent",
            borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
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
                opacity: r.is_active ? 1 : 0.55,
                display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "11px", backgroundColor: C.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon n={r.icon_name || "open_in_new"} size={20} color={C.primary} />
                </div>
                {!r.is_active && <span style={{ ...S.badge(""), fontSize: "10px" }}>Hidden</span>}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH, color: C.text, marginBottom: "4px" }}>{r.title}</div>
                {r.description && <div style={{ fontSize: "12px", color: C.muted, lineHeight: "1.5" }}>{r.description}</div>}
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
                    <button style={S.btn("danger", true)} onClick={() => deleteResource(r.id)} disabled={deletingId === r.id}>
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

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
function MiniBar({ data, color = C.primary, height = 40 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: `${height}px` }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.label}: ${d.value}`} style={{ flex: 1, borderRadius: "3px 3px 0 0",
          backgroundColor: color, opacity: 0.7 + (d.value / max) * 0.3,
          height: `${Math.max(3, (d.value / max) * height)}px`, transition: "height 0.3s ease", cursor: "default" }} />
      ))}
    </div>
  );
}

// ─── SOURCE DONUT ─────────────────────────────────────────────────────────────
function SourceDonut({ data, total }) {
  const colors = [C.primary, C.success, "#f59e0b", C.info, "#ec4899", "#8b5cf6"];
  let offset = 0;
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0);
  const r = 34, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="10" />
        {entries.map(([key, val], i) => {
          const pct = val / total;
          const dash = pct * circ;
          const seg = (
            <circle key={key} cx={cx} cy={cy} r={r} fill="none"
              stroke={colors[i % colors.length]} strokeWidth="10"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset * circ + circ / 4}
              style={{ transition: "stroke-dasharray 0.5s ease" }} />
          );
          offset += pct;
          return seg;
        })}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.text} fontFamily={fontH}>{total}</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily={fontB}>total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {entries.map(([key, val], i) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: colors[i % colors.length], flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: C.textMid, fontWeight: "500" }}>{key}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: C.text, fontFamily: font }}>{val}</span>
            <span style={{ fontSize: "10px", color: C.muted }}>({Math.round(val / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOCATION PIE CHART ───────────────────────────────────────────────────────
function LocationPieChart({ data, skill, total, onClose }) {
  const colors = [C.primary, C.success, "#f59e0b", C.info, "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#a855f7", "#64748b"];
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0);
  const r = 70, cx = 90, cy = 90, circ = 2 * Math.PI * r;
  const [hovered, setHovered] = useState(null);
  let offset = 0;
  const segments = entries.map(([city, val], i) => {
    const pct = val / total;
    const dash = pct * circ;
    const seg = { city, val, pct, dash, offset, color: colors[i % colors.length] };
    offset += pct;
    return seg;
  });

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "580px" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="pie_chart" size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Location Breakdown</div>
              <div style={{ fontSize: "11px", color: C.muted }}>{total} candidates with "{skill}"</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon n="close" size={20} /></button>
        </div>
        <div style={{ padding: "24px", display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
          {/* SVG Pie */}
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="2" />
            {segments.map((seg, i) => (
              <circle key={seg.city} cx={cx} cy={cy} r={r} fill="none"
                stroke={seg.color}
                strokeWidth={hovered === seg.city ? 28 : 22}
                strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
                strokeDashoffset={-seg.offset * circ + circ / 4}
                style={{ transition: "stroke-width 0.15s", cursor: "pointer" }}
                onMouseEnter={() => setHovered(seg.city)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            {hovered ? (
              <>
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize="20" fontWeight="800" fill={C.text} fontFamily={fontH}>
                  {segments.find(s => s.city === hovered)?.val}
                </text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill={C.muted} fontFamily={fontB}>{hovered}</text>
                <text x={cx} y={cy + 24} textAnchor="middle" fontSize="10" fill={C.primary} fontFamily={fontB} fontWeight="700">
                  {Math.round((segments.find(s => s.city === hovered)?.pct || 0) * 100)}%
                </text>
              </>
            ) : (
              <>
                <text x={cx} y={cy - 5} textAnchor="middle" fontSize="22" fontWeight="800" fill={C.text} fontFamily={fontH}>{total}</text>
                <text x={cx} y={cy + 13} textAnchor="middle" fontSize="10" fill={C.muted} fontFamily={fontB}>candidates</text>
              </>
            )}
          </svg>
          {/* Legend */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
            {segments.map((seg) => (
              <div key={seg.city}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", borderRadius: "8px",
                  backgroundColor: hovered === seg.city ? `${seg.color}12` : "transparent",
                  cursor: "default", transition: "background 0.15s" }}
                onMouseEnter={() => setHovered(seg.city)}
                onMouseLeave={() => setHovered(null)}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: seg.color, flexShrink: 0 }} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: C.text, flex: 1 }}>{seg.city}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", fontFamily: font, color: seg.color }}>{seg.val}</span>
                <span style={{ fontSize: "11px", color: C.muted, minWidth: "36px", textAlign: "right" }}>
                  {Math.round(seg.pct * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN TAB ────────────────────────────────────────────────────────────────
function AdminTab() {
  const isMobile = useIsMobile();
  const [section, setSection] = useState("dashboard");
  const [users, setUsers] = useState([]); const [allLogs, setAllLogs] = useState([]); const [stats, setStats] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user" });
  const [msg, setMsg] = useState(""); const [resetTarget, setResetTarget] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("");
  const [skillSearchResults, setSkillSearchResults] = useState(null);
  const [skillSearching, setSkillSearching] = useState(false);
  const [locationData, setLocationData] = useState(null); // {skill, total, by_location}
  const [logPage, setLogPage] = useState(1);
  const [logUserFilter, setLogUserFilter] = useState("all");
  const [logActionFilter, setLogActionFilter] = useState("all");
  const LOG_PAGE_SIZE = 20;

  const load = async () => {
    try {
      const [uRes, lRes, sRes] = await Promise.all([
        apiFetch("/api/v1/auth/users"),
        apiFetch("/api/v1/auth/audit-logs"),
        apiFetch("/api/v1/candidates/count")
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
    if (res.ok) { setMsg("User created"); setNewUser({ username: "", email: "", password: "", role: "user" }); load(); setTimeout(() => setMsg(""), 4000); }
    else { const e = await res.json(); setMsg(e.detail || "Failed"); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await apiFetch(`/api/v1/auth/users/${id}`, { method: "DELETE" }); load();
  };

  const getDateBounds = () => {
    const now = new Date();
    if (dateFilter === "today") { const start = new Date(now); start.setHours(0,0,0,0); return { start, label: "Today" }; }
    if (dateFilter === "week") { const start = new Date(now); start.setDate(now.getDate() - 7); return { start, label: "Last 7 days" }; }
    if (dateFilter === "month") { const start = new Date(now); start.setDate(now.getDate() - 30); return { start, label: "Last 30 days" }; }
    return { start: null, label: "All time" };
  };

  const filterLogsByDate = (logs) => {
    const { start } = getDateBounds();
    if (!start) return logs;
    return logs.filter(l => new Date(l.created_at) >= start);
  };

  const periodLogs = filterLogsByDate(allLogs);
  const periodUploads = periodLogs.filter(l => l.action === "bulk_upload").length;
  const periodViews = periodLogs.filter(l => l.action === "view_profile").length;
  const periodCreated = periodLogs.filter(l => l.detail?.includes("created")).length;
  const periodDuplicates = periodLogs.filter(l => l.detail?.includes("duplicate")).length;

  const buildSparkline = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const value = allLogs.filter(l => l.action === "bulk_upload" && new Date(l.created_at) >= start && new Date(l.created_at) <= end).length;
      days.push({ label, value });
    }
    return days;
  };

  const userActivity = users.map(u => ({
    username: u.username,
    uploads: allLogs.filter(l => l.username === u.username && l.action === "bulk_upload").length,
    views: allLogs.filter(l => l.username === u.username && l.action === "view_profile").length,
    logins: allLogs.filter(l => l.username === u.username && l.action === "login").length,
    lastSeen: allLogs.filter(l => l.username === u.username).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at,
  })).sort((a,b) => b.uploads - a.uploads);

  const searchBySkill = async (skillOverride) => {
    const skill = skillOverride || skillFilter;
    if (!skill.trim()) return;
    setSkillSearching(true);
    try {
      const res = await apiFetch("/api/v1/candidates/search", {
        method: "POST",
        body: JSON.stringify({ skill_keywords: [skill.trim()], skill_match: "OR", page: 1, page_size: 1 })
      });
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
      if (res.ok) {
        const data = await res.json();
        setLocationData(data);
      }
    } catch {}
  };

  const filteredLogs = allLogs.filter(l => {
    if (logUserFilter !== "all" && l.username !== logUserFilter) return false;
    if (logActionFilter !== "all" && l.action !== logActionFilter) return false;
    return true;
  });
  const logTotalPages = Math.max(1, Math.ceil(filteredLogs.length / LOG_PAGE_SIZE));
  const pagedLogs = filteredLogs.slice((logPage - 1) * LOG_PAGE_SIZE, logPage * LOG_PAGE_SIZE);
  const uniqueLogUsers = [...new Set(allLogs.map(l => l.username))];
  const uniqueLogActions = [...new Set(allLogs.map(l => l.action))];

  const sideItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "users", icon: "group", label: "Team" },
    { key: "logs", icon: "history", label: "Logs" }
  ];

  const actionBadgeType = (action) => {
    if (action === "login") return "success";
    if (action === "bulk_upload") return "warning";
    if (action?.includes("delete")) return "error";
    if (action?.includes("password")) return "admin";
    if (action === "view_profile") return "info";
    return "";
  };

  return (
    <div>
      {!isMobile && <><div style={S.pageTitle}>Admin Panel</div><div style={S.pageSub}>Manage team access and system statistics</div></>}
      {isMobile ? (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
            {sideItems.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setSection(key)} style={{ ...S.btn(section === key ? "primary" : "outline", true), whiteSpace: "nowrap" }}>
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
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "9px 11px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: fontB, fontSize: "13px", fontWeight: "600", textAlign: "left", transition: "all 0.15s", marginBottom: "2px",
                  backgroundColor: section === key ? C.primary : "transparent", color: section === key ? "#fff" : C.textMid }}>
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
      {locationData && (
        <LocationPieChart
          data={locationData.by_location}
          skill={locationData.skill}
          total={locationData.total}
          onClose={() => setLocationData(null)}
        />
      )}
    </div>
  );

  function renderAdminContent() {
    if (section === "dashboard") return (
      <div className="fade-up">
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: fontH }}>Period:</span>
          {[["today", "Today"], ["week", "Last 7 days"], ["month", "Last 30 days"], ["all", "All time"]].map(([val, label]) => (
            <button key={val} onClick={() => setDateFilter(val)}
              style={{ padding: "5px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600", fontFamily: fontB, transition: "all 0.15s",
                backgroundColor: dateFilter === val ? C.primary : C.surface, color: dateFilter === val ? "#fff" : C.muted }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { label: "Total Candidates", value: stats?.total?.toLocaleString() ?? "—", icon: "people", color: C.primary, bg: C.primaryLight },
            { label: "Uploads (period)", value: periodUploads, icon: "upload_file", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "New CVs (period)", value: periodCreated, icon: "person_add", color: C.success, bg: C.successLight },
            { label: "Profile Views", value: periodViews, icon: "visibility", color: C.info, bg: C.infoLight },
            { label: "Duplicates (period)", value: periodDuplicates, icon: "content_copy", color: C.muted, bg: C.surface },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="stat-card" style={{ ...S.card, marginBottom: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: fontH, lineHeight: "1.3" }}>{label}</div>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon n={icon} size={15} color={color} />
                </div>
              </div>
              <div style={{ fontSize: "26px", fontWeight: "800", color, fontFamily: fontH, letterSpacing: "-0.02em" }}>{value ?? "—"}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          <div style={S.card}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: fontH }}>Source Breakdown</div>
            {stats ? <SourceDonut data={stats.by_source} total={stats.total} /> : <div style={{ color: C.muted, fontSize: "13px" }}>Loading…</div>}
          </div>
          <div style={S.card}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: fontH }}>Upload Activity (7 days)</div>
            <MiniBar data={buildSparkline()} color={C.primary} height={52} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              {buildSparkline().map((d, i) => (
                <div key={i} style={{ fontSize: "9px", color: C.muted, textAlign: "center", flex: 1 }}>{d.label.split(" ")[0]}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Pool Lookup with location chart */}
        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", fontFamily: fontH, display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon n="auto_awesome" size={13} color={C.primary} />Skill Pool Lookup
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <input style={{ ...S.input, maxWidth: "260px" }} placeholder="e.g. Python, Project Management, NGO" value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)} onKeyDown={e => e.key === "Enter" && searchBySkill()} />
            <button style={S.btn("primary", true)} onClick={() => searchBySkill()} disabled={skillSearching || !skillFilter.trim()}>
              <Icon n="query_stats" size={14} />{skillSearching ? "Searching…" : "Check Pool"}
            </button>
            {skillSearchResults && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", borderRadius: "10px",
                backgroundColor: C.primaryDim, border: `1px solid rgba(98,100,244,0.2)` }}>
                <Icon n="groups" size={16} color={C.primary} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
                  <strong style={{ color: C.primary, fontFamily: fontH, fontSize: "17px" }}>{skillSearchResults.count}</strong>
                  {" "}candidates with <strong>"{skillSearchResults.skill}"</strong>
                </span>
                {/* Location chart button */}
                <button style={{ ...S.btn("outline", true), padding: "4px 10px", fontSize: "11px" }}
                  onClick={() => showLocationChart(skillSearchResults.skill)}>
                  <Icon n="pie_chart" size={12} />By Location
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: "10px", display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {["Python", "Project Management", "NGO", "Fundraising", "Data Analysis", "Excel", "Communications"].map(s => (
              <button key={s} onClick={() => { setSkillFilter(s); searchBySkill(s); }}
                style={{ padding: "3px 10px", borderRadius: "20px", border: `1px solid ${C.border}`, cursor: "pointer", fontSize: "11px", fontWeight: "600",
                  backgroundColor: skillFilter === s ? C.primaryDim : "transparent",
                  color: skillFilter === s ? C.primary : C.muted, fontFamily: fontB }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontFamily: fontH, display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon n="leaderboard" size={13} color={C.primary} />Team Activity (all time)
          </div>
          <table style={S.table}>
            <thead><tr>{["User", "Role", "Uploads", "Profile Views", "Logins", "Last Active"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {userActivity.map((u, i) => (
                <tr key={i} className="log-row">
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: C.primary, fontFamily: fontH }}>
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: "600", fontSize: "13px" }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={S.td}><span style={S.badge(users.find(x => x.username === u.username)?.role === "admin" ? "admin" : "")}>{users.find(x => x.username === u.username)?.role || "user"}</span></td>
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
            <div><label style={S.label}>Password</label><PasswordInput value={newUser.password} placeholder="Strong password" showStrength={true} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} /></div>
            <div><label style={S.label}>Role</label><select style={S.select} value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}><option value="user">User</option><option value="admin">Admin</option></select></div>
            <div style={{ paddingTop: isMobile ? 0 : "22px" }}>
              <button style={{ ...S.btn("success"), width: isMobile ? "100%" : "auto", justifyContent: "center", padding: "10px 18px" }} onClick={createUser} disabled={!pwValid(newUser.password)}><Icon n="person_add" size={14} />Create</button>
            </div>
          </div>
          {msg && <div style={{ marginTop: "10px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", color: msg === "User created" ? C.success : C.error }}>
            <Icon n={msg === "User created" ? "check_circle" : "error"} size={14} color={msg === "User created" ? C.success : C.error} />{msg}
          </div>}
        </div>
        <div style={isMobile ? {} : S.card}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {users.map((u, i) => (
                <div key={i} style={S.cardMobile}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>{u.username}</div>
                      <div style={{ fontSize: "12px", color: C.muted }}>{u.email}</div>
                    </div>
                    <span style={S.badge(u.role === "admin" ? "admin" : "")}>{u.role}</span>
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
              <thead><tr>{["Username", "Email", "Role", "Status", "Last Login", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="log-row">
                    <td style={{ ...S.td, fontFamily: font, fontWeight: "600" }}>{u.username}</td>
                    <td style={{ ...S.td, fontSize: "13px", color: C.textMid }}>{u.email}</td>
                    <td style={S.td}><span style={S.badge(u.role === "admin" ? "admin" : "")}>{u.role}</span></td>
                    <td style={S.td}><span style={S.badge(u.is_active ? "success" : "error")}>{u.is_active ? "Active" : "Inactive"}</span></td>
                    <td style={{ ...S.td, fontSize: "12px", color: C.muted }}>{u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}</td>
                    <td style={S.td}><div style={S.row}>
                      <button style={S.btn("outline", true)} onClick={() => setResetTarget(u)}><Icon n="key" size={13} />Reset PW</button>
                      <button style={S.btn("danger", true)} onClick={() => deleteUser(u.id)}><Icon n="delete" size={13} />Delete</button>
                    </div></td>
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
              <select style={{ ...S.select, width: "auto", paddingLeft: "32px", fontSize: "12px" }}
                value={logUserFilter} onChange={e => { setLogUserFilter(e.target.value); setLogPage(1); }}>
                <option value="all">All users</option>
                {uniqueLogUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <Icon n="person" size={13} color={C.muted} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <div style={{ position: "relative" }}>
              <select style={{ ...S.select, width: "auto", paddingLeft: "32px", fontSize: "12px" }}
                value={logActionFilter} onChange={e => { setLogActionFilter(e.target.value); setLogPage(1); }}>
                <option value="all">All actions</option>
                {uniqueLogActions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <Icon n="filter_list" size={13} color={C.muted} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            {(logUserFilter !== "all" || logActionFilter !== "all") && (
              <button style={S.btn("outline", true)} onClick={() => { setLogUserFilter("all"); setLogActionFilter("all"); setLogPage(1); }}>
                <Icon n="close" size={12} />Clear
              </button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          {Object.entries(filteredLogs.reduce((acc, l) => { acc[l.action] = (acc[l.action] || 0) + 1; return acc; }, {}))
            .sort((a,b) => b[1] - a[1]).slice(0, 5).map(([action, count]) => (
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
            <thead><tr>{["Time", "User", "Action", "Detail"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pagedLogs.map((l, i) => (
                <tr key={i} className="log-row">
                  <td style={{ ...S.td, fontSize: "11px", fontFamily: font, color: C.muted, whiteSpace: "nowrap" }}>{new Date(l.created_at).toLocaleString()}</td>
                  <td style={{ ...S.td, fontFamily: font, fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "700", color: C.primary, fontFamily: fontH, flexShrink: 0 }}>
                        {l.username?.slice(0, 2).toUpperCase()}
                      </div>
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
          <span style={{ fontSize: "12px", color: C.muted }}>
            Showing <strong>{((logPage - 1) * LOG_PAGE_SIZE) + 1}–{Math.min(logPage * LOG_PAGE_SIZE, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong>
          </span>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button style={{ ...S.btn("outline", true), opacity: logPage <= 1 ? 0.4 : 1 }} disabled={logPage <= 1} onClick={() => setLogPage(1)}><Icon n="first_page" size={14} /></button>
            <button style={{ ...S.btn("outline", true), opacity: logPage <= 1 ? 0.4 : 1 }} disabled={logPage <= 1} onClick={() => setLogPage(p => p - 1)}><Icon n="chevron_left" size={14} />Prev</button>
            {Array.from({ length: Math.min(5, logTotalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(logPage - 2, logTotalPages - 4)) + i;
              return p <= logTotalPages ? <button key={p} style={{ ...S.btn(p === logPage ? "primary" : "outline", true), minWidth: "34px", justifyContent: "center" }} onClick={() => setLogPage(p)}>{p}</button> : null;
            })}
            <button style={{ ...S.btn("outline", true), opacity: logPage >= logTotalPages ? 0.4 : 1 }} disabled={logPage >= logTotalPages} onClick={() => setLogPage(p => p + 1)}>Next<Icon n="chevron_right" size={14} /></button>
            <button style={{ ...S.btn("outline", true), opacity: logPage >= logTotalPages ? 0.4 : 1 }} disabled={logPage >= logTotalPages} onClick={() => setLogPage(logTotalPages)}><Icon n="last_page" size={14} /></button>
          </div>
        </div>
      </div>
    );
  }
}

// ─── APPLY PAGE (public, no auth) ────────────────────────────────────────────
const APPLY_MESSAGES = [
  "Uploading your CV...",
  "Extracting your experience...",
  "Parsing your skills...",
  "Building your profile...",
  "Almost there...",
];

function ApplyPage({ slug }) {
  const [job,       setJob]       = useState(null);
  const [pageState, setPageState] = useState("form");
  const [form,      setForm]      = useState({ name: "", email: "", phone: "" });
  const [file,      setFile]      = useState(null);
  const [fileErr,   setFileErr]   = useState("");
  const [error,     setError]     = useState("");
  const [message,   setMessage]   = useState("");
  const [msgIdx,    setMsgIdx]    = useState(0);

  useEffect(() => {
    if (pageState !== "submitting") return;
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % APPLY_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [pageState]);

  useEffect(() => {
    fetch(`${API}/apply/${slug}`)
      .then(r => {
        if (r.status === 410) throw new Error("closed");
        if (!r.ok) throw new Error("notfound");
        return r.json();
      })
      .then(d => {
        if (!d.apply_enabled) { setPageState("closed"); return; }
        setJob(d);
      })
      .catch(e => setPageState(e.message === "closed" ? "closed" : "notfound"));
  }, [slug]);

  const handleFile = e => {
    const f = e.target.files[0];
    setFileErr("");
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(ext)) { setFileErr("Please upload a PDF or Word (.docx) document."); return; }
    if (f.size > 5 * 1024 * 1024)       { setFileErr("File must be under 5 MB."); return; }
    if (f.size < 20 * 1024)              { setFileErr("File seems too small. Please check your CV."); return; }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    if (!file) { setError("Please attach your CV."); return; }
    setPageState("submitting"); setError("");
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim());
    if (form.phone.trim()) fd.append("phone", form.phone.trim());
    fd.append("file", file);
    try {
      const r = await fetch(`${API}/apply/${slug}`, { method: "POST", body: fd });
      const d = await r.json();
      if (r.ok) {
        setMessage(d.message || `Thank you ${form.name.trim()}! Your application has been received.`);
        setPageState("success");
      } else if (r.status === 429) {
        setError("You have already submitted recently. Please try again tomorrow.");
        setPageState("form");
      } else {
        setError(d.detail || "Something went wrong. Please try again.");
        setPageState("form");
      }
    } catch {
      setError("Network error. Please check your connection.");
      setPageState("form");
    }
  };

  const wrap = { minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "24px", fontFamily: fontB };
  const card = { background: C.white, borderRadius: "16px", padding: "40px 48px", maxWidth: "540px",
    width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" };
  const inp  = { width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: `1.5px solid ${C.border}`, fontSize: "15px", fontFamily: fontB,
    outline: "none", boxSizing: "border-box", marginTop: "6px" };
  const primaryBtn = { background: C.primary, color: "#fff", border: "none", borderRadius: "8px",
    padding: "12px 28px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: fontB };

  if (pageState === "notfound")
    return <div style={wrap}><div style={{ ...card, textAlign: "center" }}><p style={{ color: C.error }}>This job link is not valid or has expired.</p></div></div>;

  if (pageState === "closed" || (job && !job.apply_enabled))
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
          <h2 style={{ color: C.text, fontFamily: fontH, marginBottom: "8px" }}>Applications Closed</h2>
          <p style={{ color: C.muted }}>Applications for this role are currently closed.</p>
        </div>
      </div>
    );

  if (!job && pageState === "form")
    return <div style={wrap}><p style={{ color: C.muted }}>Loading…</p></div>;

  if (pageState === "submitting")
    return (
      <div style={wrap}>
        <div className="fade-up" style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{
            width: "40px", height: "40px",
            border: `3px solid ${C.primary}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px"
          }} />
          <div key={msgIdx} style={{
            fontSize: "15px", fontWeight: "600",
            fontFamily: fontH, color: C.text,
            animation: "fadeUp 0.3s ease forwards"
          }}>
            {APPLY_MESSAGES[msgIdx]}
          </div>
          <div style={{ fontSize: "12px", color: C.muted, marginTop: "8px" }}>
            This takes 10–20 seconds
          </div>
        </div>
      </div>
    );

  if (pageState === "success")
    return (
      <div style={wrap}>
        <div className="fade-up" style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.success,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Icon n="check" size={28} color="#fff" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: "700", fontFamily: fontH, marginBottom: "10px", color: C.text }}>
            Application Received
          </div>
          <div style={{ fontSize: "14px", color: C.muted, lineHeight: "1.6" }}>{message}</div>
        </div>
      </div>
    );

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", color: C.primary, fontWeight: "700", letterSpacing: "1px",
            textTransform: "uppercase", marginBottom: "8px" }}>ATRIOS Talint</div>
          <h1 style={{ fontFamily: fontH, fontSize: "22px", color: C.text, margin: "0 0 8px" }}>{job.project_title}</h1>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {job.location         && <span style={{ fontSize: "13px", color: C.muted }}>📍 {job.location}</span>}
            {job.experience_range && <span style={{ fontSize: "13px", color: C.muted }}>💼 {job.experience_range}</span>}
          </div>
        </div>
        {job.jd_public_summary && (
          <div style={{ background: C.surface, borderRadius: "10px", padding: "14px 16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "14px", color: C.text, lineHeight: "1.7", margin: 0 }}>{job.jd_public_summary}</p>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>Full Name *</label>
            <input style={inp} placeholder="Priya Sharma" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>Email *</label>
            <input style={inp} type="email" placeholder="priya@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>Phone</label>
            <input style={inp} type="tel" placeholder="+91 98765 43210" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>
              CV / Resume * <span style={{ fontWeight: "400", color: C.muted }}>(PDF or Word, max 5 MB)</span>
            </label>
            <input style={{ ...inp, paddingTop: "8px", paddingBottom: "8px", cursor: "pointer" }}
              type="file" accept=".pdf,.docx" onChange={handleFile} />
            {file    && <div style={{ fontSize: "12px", color: C.success, marginTop: "4px" }}>✓ {file.name}</div>}
            {fileErr && <div style={{ fontSize: "12px", color: C.error,   marginTop: "4px" }}>{fileErr}</div>}
          </div>
          {error && (
            <div style={{ background: C.errorLight, borderRadius: "8px", padding: "10px 14px",
              fontSize: "13px", color: C.error }}>{error}</div>
          )}
          <button style={primaryBtn} onClick={handleSubmit}>Submit Application</button>
          <p style={{ fontSize: "12px", color: C.muted, margin: 0, textAlign: "center" }}>
            Your information is kept confidential and used only for recruitment purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
// ─── PROJECTS TAB ─────────────────────────────────────────────────────────────
function ProjectsTab({ onViewCandidate }) {
  const isMobile = useIsMobile();
  const [view,           setView]     = useState("list");
  const [projects,       setProjects] = useState([]);
  const [selProject,     setSel]      = useState(null);
  const [showArchived,   setShowArc]  = useState(false);
  const [loading,        setLoading]  = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [noteVal,        setNoteVal]        = useState("");
  const [noteSaving,     setNoteSaving]     = useState(false);
  const [noteMsg,        setNoteMsg]        = useState("");

  // Kebab menu state — tracks which card's menu is open
  const [openMenuId, setOpenMenuId] = useState(null);
  const [archiving,  setArchiving]  = useState(null);  // project id being archived

  const fetchProjects = useCallback(async (archived) => {
    setLoading(true);
    try {
      const r = await apiFetch(`/api/v1/projects?archived=${archived}`);
      const d = await r.json();
      setProjects(d.projects || []);
    } catch { setProjects([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(showArchived); }, [showArchived]);

  // Close kebab menu on outside click
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
    } catch { setNoteMsg("error"); }
    finally { setNoteSaving(false); }
  };

  const handleArchive = async (e, p) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setArchiving(p.id);
    try {
      await apiFetch(`/api/v1/projects/${p.id}/archive`, { method: "PATCH" });
      fetchProjects(showArchived);
    } finally { setArchiving(null); }
  };

  const handleUnarchive = async (e, p) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setArchiving(p.id);
    try {
      await apiFetch(`/api/v1/projects/${p.id}/unarchive`, { method: "PATCH" });
      fetchProjects(showArchived);
    } finally { setArchiving(null); }
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

  return (
    <div>
      {!isMobile && (
        <>
          <div style={S.pageTitle}>Projects</div>
          <div style={S.pageSub}>Manage hiring projects · match candidates · share apply links</div>
        </>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <label style={{ fontSize: "13px", color: C.muted, display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArc(e.target.checked)}
            style={{ accentColor: C.primary }} />
          Show Archived
        </label>
        <button style={S.btn("primary", true)} onClick={() => setView("create")}>
          <Icon n="add" size={14} />New Project
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
          <div style={{ width: "28px", height: "28px", border: `3px solid ${C.primary}`,
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
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

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "16px",
      }}>
        {projects.map(p => (
          <div key={p.id}
            style={{
              backgroundColor: C.white, borderRadius: "14px",
              border: `1px solid ${p.is_archived ? C.border : C.borderMid}`,
              padding: "20px 22px", cursor: "pointer",
              opacity: p.is_archived ? 0.65 : 1,
              boxShadow: "0 1px 4px rgba(98,100,244,0.04)",
              transition: "box-shadow 0.15s, transform 0.15s",
              position: "relative",   // needed for kebab dropdown positioning
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(98,100,244,0.10)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(98,100,244,0.04)";
              e.currentTarget.style.transform = "";
            }}
            onClick={() => { setSel(p); setView("detail"); }}>

            {/* Archive-prompted banner */}
            {p.archive_prompted && !p.is_archived && (
              <div style={{
                background: C.warningLight, border: `1px solid rgba(217,119,6,0.25)`,
                borderRadius: "8px", padding: "8px 12px", marginBottom: "12px",
                fontSize: "12px", color: C.warning,
              }}
                onClick={e => e.stopPropagation()}>
                ⏰ Inactive for 3 months — Archive it?
                <span style={{ marginLeft: "8px", fontWeight: "700", cursor: "pointer", color: C.primary }}
                  onClick={e => handleArchive(e, p)}>Archive</span>
                <span style={{ marginLeft: "8px", fontWeight: "700", cursor: "pointer", color: C.muted }}
                  onClick={e => { e.stopPropagation(); fetchProjects(showArchived); }}>Keep Active</span>
              </div>
            )}

            {/* Title */}
            <div style={{ fontFamily: fontH, fontSize: "15px", fontWeight: "700",
              color: C.text, marginBottom: "10px", paddingRight: "28px" }}>
              {p.title}
            </div>

            {/* Meta row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: C.muted }}>{p.candidate_count ?? 0} candidates</span>
              {p.inbound_count > 0 && (
                <span style={S.badge("success")}>{p.inbound_count} Applied</span>
              )}
              {p.match_score_range && (
                <span style={{ fontSize: "12px", color: C.muted }}>
                  Top: <span style={{ color: scoreColor(p.match_score_range.max), fontWeight: "700" }}>
                    {Math.round(p.match_score_range.max * 100)}%
                  </span>
                </span>
              )}
              {p.is_archived && (
                <span style={S.badge("")}>Archived</span>
              )}
            </div>

            {/* Footer row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: C.muted }}>
                {fmtDate(p.last_activity_at || p.created_at)}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* Edit note button — active projects only */}
                {!p.is_archived && (
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer",
                      padding: "3px 5px", color: C.muted, display: "flex",
                      alignItems: "center", borderRadius: "6px" }}
                    title="Edit recruiter note"
                    onClick={e => {
                      e.stopPropagation();
                      setEditingProject(p);
                      setNoteVal(p.client_note || "");
                      setNoteMsg("");
                    }}>
                    <Icon n="edit_note" size={16} />
                  </button>
                )}

                {/* Apply link badge */}
                {p.apply_enabled && !p.is_archived
                  ? <span style={S.badge("info")}>Apply Link On</span>
                  : !p.is_archived && <span style={S.badge("")}>Link Off</span>
                }

                {/* ── Kebab menu ────────────────────────────────────────── */}
                <div style={{ position: "relative" }}>
                  <button
                    title="More options"
                    onClick={e => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === p.id ? null : p.id);
                    }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: "3px 5px", color: C.muted, display: "flex",
                      alignItems: "center", borderRadius: "6px",
                      opacity: archiving === p.id ? 0.5 : 1,
                    }}
                    disabled={archiving === p.id}>
                    {archiving === p.id
                      ? <div style={{ width: "14px", height: "14px",
                          border: `2px solid ${C.muted}`, borderTopColor: "transparent",
                          borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      : <Icon n="more_vert" size={18} />
                    }
                  </button>

                  {/* Dropdown */}
                  {openMenuId === p.id && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: "absolute", right: 0, bottom: "calc(100% + 4px)",
                        backgroundColor: C.white, border: `1px solid ${C.border}`,
                        borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                        minWidth: "160px", zIndex: 200, overflow: "hidden",
                      }}>
                      {!p.is_archived ? (
                        <button
                          onClick={e => handleArchive(e, p)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center",
                            gap: "8px", padding: "10px 14px", background: "none",
                            border: "none", cursor: "pointer", fontSize: "13px",
                            color: C.textMid, fontFamily: fontB, textAlign: "left",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                          <Icon n="inventory_2" size={15} color={C.muted} />
                          Archive project
                        </button>
                      ) : (
                        <button
                          onClick={e => handleUnarchive(e, p)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center",
                            gap: "8px", padding: "10px 14px", background: "none",
                            border: "none", cursor: "pointer", fontSize: "13px",
                            color: C.textMid, fontFamily: fontB, textAlign: "left",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                          <Icon n="unarchive" size={15} color={C.success} />
                          Unarchive project
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {/* ── end kebab ─────────────────────────────────────────── */}

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Recruiter Note Modal */}
      {editingProject && (
        <div style={S.modal} onClick={() => setEditingProject(null)}>
          <div style={{ ...S.modalWrap, maxWidth: "500px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div>
                <div style={{ fontWeight: "700", fontFamily: fontH, fontSize: "15px" }}>
                  Edit Recruiter Note
                </div>
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>
                  {editingProject.title}
                </div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}
                onClick={() => setEditingProject(null)}>
                <Icon n="close" size={20} />
              </button>
            </div>
            <div style={S.modalBody}>
              <div style={S.label}>
                Recruiter / Client Note
                <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0,
                  color: C.muted, marginLeft: "6px" }}>internal only · improves matching</span>
              </div>
              <textarea
                style={{ ...S.input, resize: "vertical", minHeight: "100px" }}
                placeholder="e.g. Client prefers ex-BFSI background. NGO experience a plus. Avoid notice > 60 days."
                value={noteVal}
                onChange={e => setNoteVal(e.target.value)}
              />
              {noteMsg === "saved" && (
                <div style={{ fontSize: "12px", color: C.success, marginTop: "8px" }}>
                  ✓ Saved — re-run Match on this project to apply changes
                </div>
              )}
              {noteMsg === "error" && (
                <div style={{ fontSize: "12px", color: C.error, marginTop: "8px" }}>
                  Failed to save. Please try again.
                </div>
              )}
            </div>
            <div style={S.modalFoot}>
              <button style={{ ...S.btn("primary"), opacity: noteSaving ? 0.6 : 1 }}
                onClick={saveNote} disabled={noteSaving}>
                <Icon n="save" size={14} />{noteSaving ? "Saving…" : "Save Note"}
              </button>
              <button style={S.btn("outline")} onClick={() => setEditingProject(null)} disabled={noteSaving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CREATE PROJECT ───────────────────────────────────────────────────────────
//
// Handles new project creation:
//   1. Form — title, sector dropdown, JD, client note
//      - Sector dropdown fetched from GET /api/v1/sectors
//      - Live # hashtag preview for #min_exp, #max_exp, #skills
//      - #company_type hashtag still works as correction path
//      - Inline collapsible guide with copy-paste template
//   2. POST /api/v1/projects/preview → parse only, NO DB write (2–4s)
//   3. ParseReviewModal — recruiter reviews parsed fields
//      → Go Back: returns to form (fields preserved), zero orphans
//      → Confirm: POST /api/v1/projects → creates project exactly once
//
// Depends on:
//   ParseReviewModal — defined in // ─── PROJECT PARSE REVIEW MODAL ───
//   C, S, Icon, font, fontH, fontB, useIsMobile — global app constants
//   apiFetch — global fetch helper

// ---------------------------------------------------------------------------
// Shared helpers — also used by ParseReviewModal, defined here first
// ---------------------------------------------------------------------------

function parseHashtagsFromNote(note, sectorMap) {
  const result = { company_type: null, min_exp: null, max_exp: null, skills: [] };
  if (!note) return result;

  const kvPattern = /#(company_type|min_exp|max_exp)\s*:\s*([^\s#]+)/gi;
  let cleaned = note;
  const validTypes = sectorMap || {};
  let m;

  while ((m = kvPattern.exec(note)) !== null) {
    const key = m[1].toLowerCase();
    const val = m[2].trim().toLowerCase();
    if (key === "company_type") {
      if (validTypes[val]) result.company_type = val;
    } else if (key === "min_exp") {
      const n = parseInt(val);
      if (!isNaN(n)) result.min_exp = n;
    } else if (key === "max_exp") {
      const n = parseInt(val);
      if (!isNaN(n)) result.max_exp = n;
    }
    cleaned = cleaned.replace(m[0], "");
  }

  const skillPattern = /#([^#\n]+)/g;
  while ((m = skillPattern.exec(cleaned)) !== null) {
    const skill = m[1].trim().replace(/[.,;:!?]+$/, "").trim();
    if (skill && skill.length >= 2) result.skills.push(skill.toLowerCase());
  }

  return result;
}

const GUIDE_TEMPLATE =
  `#min_exp:3  #max_exp:8\n#fundraising #donor management #grant writing #stakeholder engagement\n\n// To override sector: #company_type:ngo`;


// ---------------------------------------------------------------------------
// LiveHashtagPreview
// ---------------------------------------------------------------------------
function LiveHashtagPreview({ note, sectorMap, sectorLabels }) {
  const parsed = parseHashtagsFromNote(note, sectorMap);
  const hasAny = parsed.company_type
    || parsed.min_exp !== null
    || parsed.max_exp !== null
    || parsed.skills.length > 0;

  if (!hasAny) return null;

  return (
    <div style={{
      marginTop: "10px", padding: "10px 13px", borderRadius: "10px",
      backgroundColor: "rgba(98,100,244,0.05)",
      border: "1px solid rgba(98,100,244,0.15)",
    }}>
      <div style={{
        fontSize: "10px", fontWeight: "700", color: C.primary,
        textTransform: "uppercase", letterSpacing: "0.1em",
        marginBottom: "8px", fontFamily: fontH,
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <Icon n="auto_awesome" size={12} color={C.primary} />
        Detected # overrides
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {parsed.company_type && (
          <span style={{
            padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
            backgroundColor: "rgba(217,119,6,0.1)", color: C.warning, fontFamily: font,
            border: "1px solid rgba(217,119,6,0.2)",
          }}>
            🏢 {sectorLabels[parsed.company_type] || parsed.company_type}
            <span style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.8 }}>
              (overrides dropdown)
            </span>
          </span>
        )}
        {parsed.min_exp !== null && (
          <span style={{
            padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
            backgroundColor: "rgba(59,178,115,0.1)", color: "#2a7a50", fontFamily: font,
          }}>↑ min {parsed.min_exp} yrs</span>
        )}
        {parsed.max_exp !== null && (
          <span style={{
            padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
            backgroundColor: "rgba(59,178,115,0.1)", color: "#2a7a50", fontFamily: font,
          }}>↓ max {parsed.max_exp} yrs</span>
        )}
        {parsed.skills.map((s, i) => (
          <span key={i} style={{
            padding: "2px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
            backgroundColor: C.primaryDim, color: C.primary, fontFamily: font,
            border: "1px solid rgba(98,100,244,0.15)",
          }}>#{s}</span>
        ))}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// InlineGuide
// ---------------------------------------------------------------------------
function InlineGuide({ expanded, onToggle, sectors }) {
  const [copied, setCopied] = useState(false);

  const copyTemplate = () => {
    navigator.clipboard.writeText(GUIDE_TEMPLATE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      borderRadius: "10px", border: `1px solid ${C.border}`,
      backgroundColor: "#faf9fe", overflow: "hidden", marginTop: "6px",
    }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "9px 13px",
        background: "none", border: "none", cursor: "pointer",
        color: C.primary, fontFamily: fontB,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px",
          fontSize: "12px", fontWeight: "600" }}>
          <Icon n="tips_and_updates" size={14} color={C.primary} />
          How to write a strong brief — and use{" "}
          <code style={{ backgroundColor: C.primaryDim, padding: "1px 5px",
            borderRadius: "4px", fontFamily: font, fontSize: "11px" }}>#</code>{" "}overrides
        </div>
        <Icon n={expanded ? "expand_less" : "expand_more"} size={16} color={C.muted} />
      </button>

      {expanded && (
        <div style={{ padding: "0 13px 13px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "13px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: "8px", fontFamily: fontH }}>Job Description</div>
              {[
                ["check_circle", C.success, "Paste the full JD — don't summarise"],
                ["check_circle", C.success, "Include responsibilities, requirements, sector context"],
                ["check_circle", C.success, "Longer JDs produce better skill extraction"],
                ["cancel",       C.error,   "Don't remove company name if it signals sector"],
              ].map(([icon, color, text], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px",
                  fontSize: "12px", color: C.textMid, marginBottom: "6px", lineHeight: "1.5" }}>
                  <Icon n={icon} size={13} color={color} style={{ marginTop: "2px", flexShrink: 0 }} />
                  {text}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: "8px", fontFamily: fontH }}>Client / Recruiter Note</div>
              {[
                ["check_circle", C.success, "Add context the JD doesn't state — deal-breakers, preferences"],
                ["check_circle", C.success, "Use #skill to add skills the parser might miss"],
                ["check_circle", C.success, "#min_exp / #max_exp override parsed experience band"],
                ["check_circle", C.success, "#company_type:sector overrides the dropdown for quick fix"],
                ["cancel",       C.error,   "Don't repeat what's already clear in the JD"],
              ].map(([icon, color, text], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px",
                  fontSize: "12px", color: C.textMid, marginBottom: "6px", lineHeight: "1.5" }}>
                  <Icon n={icon} size={13} color={color} style={{ marginTop: "2px", flexShrink: 0 }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "12px", borderRadius: "8px",
            backgroundColor: "#f0f0f8", border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 11px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: fontH }}>
                # override template — paste into Client Note
              </span>
              <button onClick={copyTemplate} style={{
                display: "flex", alignItems: "center", gap: "4px", fontSize: "11px",
                fontWeight: "600", color: copied ? C.success : C.primary,
                background: "none", border: "none", cursor: "pointer",
                fontFamily: fontB, padding: "2px 0",
              }}>
                <Icon n={copied ? "check" : "content_copy"} size={13}
                  color={copied ? C.success : C.primary} />
                {copied ? "Copied!" : "Copy template"}
              </button>
            </div>
            <pre style={{ margin: 0, padding: "10px 12px", fontSize: "12px", fontFamily: font,
              color: C.primary, lineHeight: "1.7", overflowX: "auto", whiteSpace: "pre-wrap" }}>
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
                  <code style={{ backgroundColor: C.primaryDim, color: C.primary,
                    padding: "1px 5px", borderRadius: "4px",
                    fontFamily: font, fontSize: "10px" }}>{s.value}</code>
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


// ---------------------------------------------------------------------------
// CreateProjectModal
// ---------------------------------------------------------------------------
function CreateProjectModal({ onCreated, onCancel }) {
  const isMobile = useIsMobile();

  const [form, setForm] = useState({
    title: "", jd_text: "", company_type: "", client_note: "",
  });
  const [parsing,    setParsing]    = useState(false);   // preview call in flight
  const [confirming, setConfirming] = useState(false);   // create call in flight
  const [error,      setError]      = useState("");
  const [guideOpen,  setGuideOpen]  = useState(false);
  const [preview,    setPreview]    = useState(null);    // parsed data, no DB write yet

  const [sectors,      setSectors]      = useState([]);
  const [sectorMap,    setSectorMap]    = useState({});
  const [sectorLabels, setSectorLabels] = useState({});

  useEffect(() => {
    apiFetch("/api/v1/sectors")
      .then(r => r.json())
      .then(d => {
        const list = d.sectors || [];
        setSectors(list);
        const map = {}, labels = {};
        list.forEach(s => { map[s.value] = true; labels[s.value] = s.label; });
        setSectorMap(map);
        setSectorLabels(labels);
      })
      .catch(() => {});
  }, []);

  // Step 1 — call /preview, NO DB write, show review modal
  const handlePreview = async () => {
    if (!form.title.trim())                    { setError("Project title is required."); return; }
    if (form.jd_text.trim().length < 50)       { setError("Please paste the full job description (at least 50 characters)."); return; }
    setParsing(true); setError("");
    try {
      const r = await apiFetch("/api/v1/projects/preview", {
        method: "POST",
        body: JSON.stringify({
          title:        form.title.trim(),
          jd_text:      form.jd_text.trim(),
          company_type: form.company_type || null,
          client_note:  form.client_note.trim() || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.detail || "Failed to parse JD."); setParsing(false); return; }
      setPreview(d);
    } catch {
      setError("Network error.");
    } finally {
      setParsing(false);
    }
  };

  // Step 2a — recruiter happy → POST /projects (creates project exactly once)
  const handleConfirm = async () => {
    setConfirming(true); setError("");
    try {
      const r = await apiFetch("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          title:        form.title.trim(),
          jd_text:      form.jd_text.trim(),
          company_type: form.company_type || null,
          client_note:  form.client_note.trim() || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.detail || "Failed to create project."); setConfirming(false); return; }
      onCreated(d);
    } catch {
      setError("Network error.");
      setConfirming(false);
    }
  };

  // Step 2b — recruiter not happy → back to form, fields preserved, zero orphans
  const handleBack = () => setPreview(null);

  const ta = { ...S.input, resize: "vertical", marginTop: "6px" };

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
          <button style={S.btn("outline", true)} onClick={onCancel} disabled={parsing}>
            <Icon n="arrow_back" size={14} />Back
          </button>
        </div>

        <div style={{ ...S.card, maxWidth: "680px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <div>
              <label style={S.label}>Project Title *</label>
              <input style={ta} placeholder="e.g. Senior PM — FinTech · HDFC"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div>
              <label style={S.label}>
                Sector / Company Type
                <span style={{ fontWeight: "400", color: C.muted, textTransform: "none", letterSpacing: 0 }}>
                  {" "}(recommended — improves domain matching)
                </span>
              </label>
              <select style={S.select} value={form.company_type}
                onChange={e => setForm(f => ({ ...f, company_type: e.target.value }))}>
                <option value="">— Let AI infer from JD —</option>
                {sectors.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px" }}>
                Explicit selection overrides AI inference. Correct later via{" "}
                <code style={{ backgroundColor: C.primaryDim, color: C.primary,
                  padding: "1px 5px", borderRadius: "4px", fontFamily: font,
                  fontSize: "10px" }}>#company_type:value</code> in the client note.
              </div>
            </div>

            <div>
              <label style={S.label}>Job Description *</label>
              <textarea style={{ ...ta, height: "220px" }} placeholder="Paste the full JD here…"
                value={form.jd_text}
                onChange={e => setForm(f => ({ ...f, jd_text: e.target.value }))} />
            </div>

            <div>
              <label style={S.label}>
                Client / Recruiter Note
                <span style={{ fontWeight: "400", color: C.muted, textTransform: "none", letterSpacing: 0 }}>
                  {" "}(optional, internal only)
                </span>
              </label>
              <textarea style={{ ...ta, height: "90px" }}
                placeholder={"Context, deal-breakers, preferences.\nUse # to override: #min_exp:3  #max_exp:8  #fundraising  #company_type:ngo"}
                value={form.client_note}
                onChange={e => setForm(f => ({ ...f, client_note: e.target.value }))} />

              <LiveHashtagPreview note={form.client_note} sectorMap={sectorMap} sectorLabels={sectorLabels} />

              <div style={{ fontSize: "11px", color: C.muted, marginTop: "6px" }}>
                Never shown to candidates · Use{" "}
                <code style={{ backgroundColor: C.primaryDim, color: C.primary,
                  padding: "1px 5px", borderRadius: "4px", fontFamily: font,
                  fontSize: "10px" }}>#</code>{" "}
                overrides to correct AI extraction after reviewing
              </div>

              <InlineGuide expanded={guideOpen} onToggle={() => setGuideOpen(o => !o)} sectors={sectors} />
            </div>

            {error && (
              <div style={{ background: C.errorLight, borderRadius: "8px",
                padding: "10px 14px", fontSize: "13px", color: C.error }}>{error}</div>
            )}

            {parsing && (
              <div style={{ textAlign: "center", color: C.muted, fontSize: "14px", padding: "8px 0" }}>
                <div className="dot-wave" style={{ display: "inline-flex", gap: "4px", marginRight: "8px" }}>
                  <span /><span /><span />
                </div>
                Parsing JD… (2–4 seconds)
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={onCancel} disabled={parsing}>Cancel</button>
              <button style={{ ...S.btn("primary"), opacity: parsing ? 0.6 : 1 }}
                onClick={handlePreview} disabled={parsing}>
                <Icon n="manage_search" size={15} />
                {parsing ? "Parsing…" : "Parse & Review"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <ParseReviewModal
          parsed={preview}
          form={form}
          sectorLabels={sectorLabels}
          sectorMap={sectorMap}
          onConfirm={handleConfirm}
          onBack={handleBack}
          confirming={confirming}
          error={error}
        />
      )}
    </>
  );
}

// ─── PROJECT PARSE REVIEW MODAL ──────────────────────────────────────────────
//
// Shown after POST /api/v1/projects returns parsed data.
// Recruiter reviews extracted fields before confirming.
//
// Props:
//   parsed       — response from POST /projects
//   form         — { title, company_type, client_note } from create form
//   sectorLabels — { value: label } map from fetched sectors
//   sectorMap    — { value: true } set for hashtag validation
//   onConfirm    — called when recruiter clicks "Confirm & Create Project"
//   onBack       — called when recruiter clicks "Go Back & Edit"
//   confirming   — bool, disables buttons while navigating away
//
// Depends on:
//   parseHashtagsFromNote() — defined in // ─── CREATE PROJECT ───
//   C, S, Icon, font, fontH, fontB — global app constants

function ParseReviewModal({ parsed, form, sectorLabels, sectorMap, onConfirm, onBack, confirming }) {
  const hashParsed = parseHashtagsFromNote(form.client_note, sectorMap);

  // Skills: merge parsed base + hashtag additions, deduplicated
  const displaySkills = (() => {
    const base   = (parsed.must_have_skills || []).map(s => s.toLowerCase());
    const tags   = hashParsed.skills;
    const seen   = new Set(base);
    const merged = [...base];
    tags.forEach(s => { if (!seen.has(s)) { seen.add(s); merged.push(s); } });
    return { base, tags, merged };
  })();

  // company_type priority: hashtag > form dropdown > parsed
  const displayCompanyType = hashParsed.company_type || form.company_type || parsed.company_type;
  const ctSource = hashParsed.company_type ? "hashtag"
    : form.company_type ? "dropdown"
    : parsed.company_type ? "parser"
    : null;

  // min/max experience: hashtag > parsed
  const displayMinExp = hashParsed.min_exp !== null ? hashParsed.min_exp : parsed.min_experience;
  const displayMaxExp = hashParsed.max_exp !== null ? hashParsed.max_exp : parsed.max_experience;

  const hasWarnings = (
    !displayCompanyType ||
    displayMinExp === null ||
    displayMaxExp === null ||
    displaySkills.merged.length === 0
  );

  const ctSourceBadge = ctSource ? (
    <span style={{
      fontSize: "10px", color: ctSource === "hashtag" ? C.warning : C.primary,
      backgroundColor: ctSource === "hashtag" ? "rgba(217,119,6,0.1)" : C.primaryDim,
      padding: "1px 6px", borderRadius: "4px", fontFamily: font,
    }}>
      via {ctSource}
    </span>
  ) : null;

  // Reusable field card
  const Field = ({ label, value, warn, children }) => (
    <div style={{
      padding: "12px 14px", borderRadius: "10px",
      backgroundColor: warn  ? "rgba(217,119,6,0.06)"
                      : value ? "rgba(59,178,115,0.05)"
                      : C.surface,
      border: `1px solid ${
        warn  ? "rgba(217,119,6,0.2)"
              : value ? "rgba(59,178,115,0.2)"
              : C.border
      }`,
    }}>
      <div style={{
        fontSize: "10px", fontWeight: "700", color: C.muted,
        textTransform: "uppercase", letterSpacing: "0.1em",
        marginBottom: "6px", fontFamily: fontH,
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <Icon
          n={value ? "check_circle" : "warning"} size={12}
          color={value ? C.success : warn ? C.warning : C.muted}
        />
        {label}
      </div>
      {children || (
        <div style={{ fontSize: "13px", color: value ? C.text : C.muted, fontWeight: "600" }}>
          {value !== null && value !== undefined
            ? String(value)
            : <span style={{ color: C.warning, fontStyle: "italic", fontWeight: "400" }}>
                null — not extracted
              </span>
          }
        </div>
      )}
    </div>
  );

  return (
    <div style={S.modal} onClick={e => e.stopPropagation()}>
      <div style={{
        ...S.modalWrap, maxWidth: "560px", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header ── */}
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "9px",
              backgroundColor: C.primaryLight,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon n="manage_search" size={17} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>
                Review Parsed Data
              </div>
              <div style={{ fontSize: "11px", color: C.muted }}>
                Verify before confirming — go back to fix via # or dropdown if needed
              </div>
            </div>
          </div>
          {hasWarnings && (
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              fontSize: "11px", fontWeight: "700", color: C.warning,
              backgroundColor: C.warningLight, padding: "4px 10px", borderRadius: "20px",
            }}>
              <Icon n="warning" size={13} color={C.warning} />
              Needs review
            </div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ ...S.modalBody, overflowY: "auto", flex: 1 }}>

          {/* Project title */}
          <div style={{ marginBottom: "4px", fontSize: "12px", color: C.muted }}>Project</div>
          <div style={{
            fontSize: "15px", fontWeight: "700", color: C.text,
            marginBottom: "16px", fontFamily: fontH,
          }}>
            {form.title}
          </div>

          {/* Company type + experience band */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>

            <Field label="Sector / Company Type" value={displayCompanyType} warn={!displayCompanyType}>
              {displayCompanyType ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>
                    {sectorLabels[displayCompanyType] || displayCompanyType}
                  </span>
                  {ctSourceBadge}
                </div>
              ) : null}
            </Field>

            <Field
              label="Experience Band"
              value={displayMinExp !== null || displayMaxExp !== null
                ? `${displayMinExp ?? "?"} – ${displayMaxExp ?? "?"} yrs`
                : null}
              warn={displayMinExp === null && displayMaxExp === null}
            >
              {(displayMinExp !== null || displayMaxExp !== null) ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: C.text }}>
                    {displayMinExp ?? "?"} – {displayMaxExp ?? "?"} yrs
                  </span>
                  {(hashParsed.min_exp !== null || hashParsed.max_exp !== null) && (
                    <span style={{
                      fontSize: "10px", color: C.primary, backgroundColor: C.primaryDim,
                      padding: "1px 6px", borderRadius: "4px", fontFamily: font,
                    }}>via #</span>
                  )}
                </div>
              ) : null}
            </Field>
          </div>

          {/* Must-have skills */}
          <div style={{
            padding: "12px 14px", borderRadius: "10px", marginBottom: "10px",
            backgroundColor: displaySkills.merged.length > 0
              ? "rgba(59,178,115,0.05)" : C.surface,
            border: `1px solid ${displaySkills.merged.length > 0
              ? "rgba(59,178,115,0.2)" : C.border}`,
          }}>
            <div style={{
              fontSize: "10px", fontWeight: "700", color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "8px", fontFamily: fontH,
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <Icon
                n={displaySkills.merged.length > 0 ? "check_circle" : "warning"}
                size={12}
                color={displaySkills.merged.length > 0 ? C.success : C.warning}
              />
              Must-Have Skills ({displaySkills.merged.length})
            </div>

            {displaySkills.merged.length > 0 ? (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {displaySkills.merged.map((s, i) => {
                    const fromHash = displaySkills.tags.includes(s) && !displaySkills.base.includes(s);
                    return (
                      <span key={i} style={{
                        padding: "2px 9px", borderRadius: "6px",
                        fontSize: "11px", fontWeight: "600", fontFamily: font,
                        backgroundColor: fromHash ? C.primaryDim : "rgba(59,178,115,0.1)",
                        color: fromHash ? C.primary : "#2a7a50",
                        border: `1px solid ${fromHash
                          ? "rgba(98,100,244,0.2)" : "rgba(59,178,115,0.2)"}`,
                      }}>
                        {fromHash ? "#" : ""}{s}
                      </span>
                    );
                  })}
                </div>
                {displaySkills.tags.length > 0 && displaySkills.base.length > 0 && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: C.muted }}>
                    <span style={{ color: "#2a7a50", fontWeight: "600" }}>■</span> from JD
                    &nbsp;&nbsp;
                    <span style={{ color: C.primary, fontWeight: "600" }}>#</span> added via hashtag
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: "12px", color: C.warning, fontStyle: "italic" }}>
                No skills extracted — go back and add #skills to the client note
              </div>
            )}
          </div>

          {/* JD Summary */}
          {parsed.jd_summary && (
            <div style={{
              padding: "12px 14px", borderRadius: "10px",
              backgroundColor: C.surface, border: `1px solid ${C.border}`,
            }}>
              <div style={{
                fontSize: "10px", fontWeight: "700", color: C.muted,
                textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: "6px", fontFamily: fontH,
              }}>
                JD Summary (AI-generated)
              </div>
              <div style={{ fontSize: "12px", color: C.textMid, lineHeight: "1.6" }}>
                {parsed.jd_summary}
              </div>
            </div>
          )}

          {/* Warning banner */}
          {hasWarnings && (
            <div style={{
              marginTop: "12px", padding: "10px 13px", borderRadius: "10px",
              backgroundColor: C.warningLight,
              border: "1px solid rgba(217,119,6,0.25)",
              fontSize: "12px", color: C.warning, lineHeight: "1.6",
            }}>
              <div style={{ fontWeight: "700", marginBottom: "3px",
                display: "flex", alignItems: "center", gap: "5px" }}>
                <Icon n="info" size={13} color={C.warning} />
                Missing fields will reduce match quality
              </div>
              Go back and fix using the sector dropdown or # overrides in the Client Note.
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={S.modalFoot}>
          <button
            style={{ ...S.btn("primary"), opacity: confirming ? 0.65 : 1 }}
            onClick={onConfirm}
            disabled={confirming}
          >
            <Icon n="check" size={15} />
            {confirming ? "Creating…" : "Confirm & Create Project"}
          </button>
          <button
            style={S.btn("outline")}
            onClick={onBack}
            disabled={confirming}
          >
            <Icon n="arrow_back" size={14} />
            Go Back & Edit
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── BULK CV UPLOAD ───────────────────────────────────────────────────────────
//
// Modal for uploading multiple CVs directly to a project pool.
// Called from ProjectDetailPage header — project is pre-selected.
//
// Flow:
//   1. File selection (drag/drop or browse) — up to 50 PDFs/docx
//   2. Validation pass (type, size) — client side before any upload
//   3. Processing screen — batches of 10 concurrent requests
//      Real per-file progress. "Do not refresh" warning.
//   4. Summary screen — success/duplicate/failed counts + failed filenames
//
// Each file calls POST /api/v1/projects/{project_id}/bulk-upload individually.
// Source tag on backend: apply_link (lands in Applied tab).
//
// Depends on:
//   C, S, Icon, font, fontH, fontB, useIsMobile — global app constants
//   apiFetch — global fetch helper

const BULK_MAX_FILES  = 50;
const BULK_BATCH_SIZE = 10;
const BULK_MAX_MB     = 5;

function BulkCvUploadModal({ project, onClose, onComplete }) {
  const [stage,    setStage]    = useState("select");   // select | processing | done
  const [files,    setFiles]    = useState([]);
  const [dragging, setDragging] = useState(false);
  const [results,  setResults]  = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [current,  setCurrent]  = useState("");         // filename being processed
  const inputRef = useRef();

  // ── File validation ─────────────────────────────────────────────────────────
  const validateAndAdd = (incoming) => {
    const valid = Array.from(incoming).filter(f => {
      const ext = f.name.split(".").pop().toLowerCase();
      return ["pdf", "docx"].includes(ext) && f.size <= BULK_MAX_MB * 1024 * 1024;
    });
    setFiles(prev => {
      const combined = [...prev, ...valid];
      return combined.slice(0, BULK_MAX_FILES);  // hard cap at 50
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    validateAndAdd(e.dataTransfer.files);
  }, []);

  const removeFile = (i) => setFiles(p => p.filter((_, j) => j !== i));

  // ── Processing — batches of 10 ──────────────────────────────────────────────
  const startUpload = async () => {
    if (!files.length) return;
    setStage("processing");
    setProgress({ done: 0, total: files.length });
    setResults([]);

    const allResults = [];

    // Process in batches of BULK_BATCH_SIZE
    for (let i = 0; i < files.length; i += BULK_BATCH_SIZE) {
      const batch = files.slice(i, i + BULK_BATCH_SIZE);

      await Promise.all(batch.map(async (file) => {
        setCurrent(file.name);
        try {
          const fd = new FormData();
          fd.append("file", file);
          const r = await apiFetch(
            `/api/v1/projects/${project.id}/bulk-upload`,
            { method: "POST", body: fd }
          );
          const d = await r.json();
          allResults.push({ ...d, filename: file.name });
        } catch (err) {
          allResults.push({
            status:   "failed",
            filename: file.name,
            error:    "Network error",
          });
        }
        setProgress(p => ({ ...p, done: p.done + 1 }));
      }));
    }

    setResults(allResults);
    setStage("done");
    onComplete?.();  // trigger fetchCandidates on the parent
  };

  // ── Summary counts ───────────────────────────────────────────────────────────
  const nSuccess   = results.filter(r => r.status === "success").length;
  const nDuplicate = results.filter(r => r.status === "duplicate").length;
  const nFailed    = results.filter(r => r.status === "failed").length;
  const failedList = results.filter(r => r.status === "failed");

  const pct = progress.total > 0
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  // Estimated time remaining (rough: ~4s per file average)
  const remaining = progress.total - progress.done;
  const estSecs   = remaining * 4;
  const estLabel  = estSecs > 60
    ? `~${Math.ceil(estSecs / 60)} min remaining`
    : estSecs > 0 ? `~${estSecs}s remaining` : "";

  return (
    <div style={S.modal} onClick={stage === "processing" ? undefined : onClose}>
      <div
        style={{ ...S.modalWrap, maxWidth: "560px", maxHeight: "90vh",
          display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px",
              backgroundColor: C.primaryLight,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="upload_file" size={17} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>
                Upload CVs to Project
              </div>
              <div style={{ fontSize: "11px", color: C.muted,
                maxWidth: "300px", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {project.title}
              </div>
            </div>
          </div>
          {stage !== "processing" && (
            <button onClick={onClose}
              style={{ background: "none", border: "none",
                cursor: "pointer", color: C.muted }}>
              <Icon n="close" size={20} />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ ...S.modalBody, overflowY: "auto", flex: 1 }}>

          {/* ══ STAGE: SELECT ══════════════════════════════════════════════ */}
          {stage === "select" && (
            <>
              {/* Drop zone */}
              <div
                onClick={() => inputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                style={{
                  border: `2px dashed ${dragging ? C.primary : C.border}`,
                  borderRadius: "12px",
                  padding: "32px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: dragging ? C.primaryDim : C.surface,
                  marginBottom: "14px",
                }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "50%",
                  backgroundColor: dragging ? C.primary : C.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px", transition: "all 0.2s" }}>
                  <Icon n="upload_file" size={22} color={dragging ? "#fff" : C.primary} />
                </div>
                <div style={{ fontSize: "14px", fontWeight: "700",
                  marginBottom: "4px", fontFamily: fontH }}>
                  Drop CVs here or click to browse
                </div>
                <div style={{ fontSize: "12px", color: C.muted, marginBottom: "14px" }}>
                  PDF, DOCX · Max {BULK_MAX_MB}MB each · Up to {BULK_MAX_FILES} files
                </div>
                <input ref={inputRef} type="file" multiple
                  accept=".pdf,.docx" style={{ display: "none" }}
                  onChange={e => validateAndAdd(e.target.files)} />
                <button style={S.btn("outline")}
                  onClick={e => { e.stopPropagation(); inputRef.current.click(); }}>
                  <Icon n="folder_open" size={14} />Browse Files
                </button>
              </div>

              {/* Info strip */}
              <div style={{ fontSize: "11px", color: C.muted, marginBottom: "14px",
                display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon n="info" size={13} color={C.muted} />
                CVs will be parsed, embedded, and added to the Applied pool.
                Duplicates are detected automatically.
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    fontFamily: fontH, marginBottom: "2px" }}>
                    {files.length} file{files.length > 1 ? "s" : ""} selected
                    {files.length === BULK_MAX_FILES && (
                      <span style={{ color: C.warning, marginLeft: "8px",
                        fontWeight: "600", textTransform: "none" }}>
                        (max reached)
                      </span>
                    )}
                  </div>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "8px 11px",
                      backgroundColor: C.surface, borderRadius: "8px",
                      border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icon
                          n={f.name.endsWith(".pdf") ? "picture_as_pdf" : "description"}
                          size={15} color={C.primary}
                        />
                        <span style={{ fontSize: "12px", fontWeight: "500",
                          maxWidth: "320px", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.name}
                        </span>
                        <span style={{ fontSize: "11px", color: C.muted, flexShrink: 0 }}>
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <button onClick={() => removeFile(i)}
                        style={{ background: "none", border: "none",
                          cursor: "pointer", color: C.error, flexShrink: 0 }}>
                        <Icon n="close" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ══ STAGE: PROCESSING ══════════════════════════════════════════ */}
          {stage === "processing" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>

              {/* Do not refresh warning */}
              <div style={{ backgroundColor: C.warningLight,
                border: `1px solid rgba(217,119,6,0.3)`,
                borderRadius: "10px", padding: "10px 16px",
                marginBottom: "24px",
                display: "flex", alignItems: "center", gap: "8px",
                fontSize: "13px", fontWeight: "700", color: C.warning }}>
                <Icon n="warning" size={16} color={C.warning} />
                Do not close or refresh this window
              </div>

              {/* Animated icon */}
              <div style={{ width: "56px", height: "56px", borderRadius: "50%",
                backgroundColor: C.primaryLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                animation: "pulse 1.8s ease-in-out infinite" }}>
                <Icon n="upload_file" size={26} color={C.primary} />
              </div>

              {/* Count */}
              <div style={{ fontSize: "22px", fontWeight: "800",
                fontFamily: fontH, color: C.text, marginBottom: "4px" }}>
                {progress.done} <span style={{ color: C.muted, fontSize: "16px" }}>
                  of {progress.total}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "6px" }}>
                CVs processed
              </div>

              {/* Current file */}
              {current && (
                <div style={{ fontSize: "12px", color: C.primary, marginBottom: "16px",
                  maxWidth: "380px", margin: "0 auto 16px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  ⟳ {current}
                </div>
              )}

              {/* Progress bar */}
              <div style={{ height: "8px", borderRadius: "8px",
                backgroundColor: C.border, overflow: "hidden",
                margin: "0 auto 10px", maxWidth: "380px" }}>
                <div style={{ height: "100%", borderRadius: "8px",
                  backgroundColor: C.primary,
                  width: `${pct}%`,
                  transition: "width 0.4s ease" }} />
              </div>

              <div style={{ fontSize: "12px", color: C.muted }}>
                {pct}% complete {estLabel && `· ${estLabel}`}
              </div>

              {/* Running tally */}
              {results.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center",
                  gap: "16px", marginTop: "20px", fontSize: "12px" }}>
                  <span style={{ color: C.success, fontWeight: "700" }}>
                    ✓ {results.filter(r => r.status === "success").length} parsed
                  </span>
                  {results.filter(r => r.status === "duplicate").length > 0 && (
                    <span style={{ color: C.warning, fontWeight: "700" }}>
                      ⟳ {results.filter(r => r.status === "duplicate").length} duplicate
                    </span>
                  )}
                  {results.filter(r => r.status === "failed").length > 0 && (
                    <span style={{ color: C.error, fontWeight: "700" }}>
                      ✗ {results.filter(r => r.status === "failed").length} failed
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ STAGE: DONE ════════════════════════════════════════════════ */}
          {stage === "done" && (
            <div>
              {/* Result summary */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%",
                  backgroundColor: nFailed === results.length ? C.errorLight : C.successLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px" }}>
                  <Icon
                    n={nFailed === results.length ? "error" : "check_circle"}
                    size={28}
                    color={nFailed === results.length ? C.error : C.success}
                  />
                </div>
                <div style={{ fontSize: "17px", fontWeight: "700",
                  fontFamily: fontH, marginBottom: "6px" }}>
                  Upload Complete
                </div>
                <div style={{ display: "flex", justifyContent: "center",
                  gap: "12px", flexWrap: "wrap" }}>
                  {nSuccess > 0 && (
                    <span style={S.badge("success")}>
                      <Icon n="check_circle" size={12} />
                      {nSuccess} added
                    </span>
                  )}
                  {nDuplicate > 0 && (
                    <span style={S.badge("warning")}>
                      <Icon n="content_copy" size={12} />
                      {nDuplicate} duplicate
                    </span>
                  )}
                  {nFailed > 0 && (
                    <span style={S.badge("error")}>
                      <Icon n="error" size={12} />
                      {nFailed} failed
                    </span>
                  )}
                </div>
              </div>

              {/* Failed file list */}
              {failedList.length > 0 && (
                <div style={{ borderRadius: "10px", border: `1px solid ${C.errorLight}`,
                  backgroundColor: "rgba(224,92,92,0.04)", overflow: "hidden" }}>
                  <div style={{ padding: "9px 13px", borderBottom: `1px solid ${C.errorLight}`,
                    fontSize: "11px", fontWeight: "700", color: C.error,
                    textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: fontH }}>
                    Failed files
                  </div>
                  {failedList.map((r, i) => (
                    <div key={i} style={{ padding: "8px 13px",
                      borderBottom: i < failedList.length - 1
                        ? `1px solid ${C.errorLight}` : "none",
                      fontSize: "12px" }}>
                      <div style={{ fontWeight: "600", color: C.text,
                        marginBottom: "2px" }}>{r.filename}</div>
                      <div style={{ color: C.muted }}>{r.error || "Unknown error"}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Instruction */}
              {(nSuccess + nDuplicate) > 0 && (
                <div style={{ marginTop: "14px", fontSize: "12px", color: C.muted,
                  display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon n="info" size={13} color={C.muted} />
                  Candidates are in the Applied tab. Run Match to score them.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={S.modalFoot}>
          {stage === "select" && (
            <>
              <button
                style={{ ...S.btn("primary"), opacity: files.length === 0 ? 0.5 : 1 }}
                onClick={startUpload}
                disabled={files.length === 0}
              >
                <Icon n="rocket_launch" size={15} />
                Upload {files.length > 0 ? `${files.length} CV${files.length > 1 ? "s" : ""}` : "CVs"}
              </button>
              <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            </>
          )}
          {stage === "processing" && (
            <button style={{ ...S.btn("outline"), opacity: 0.5, cursor: "not-allowed" }} disabled>
              Processing — please wait…
            </button>
          )}
          {stage === "done" && (
            <button style={S.btn("primary")} onClick={onClose}>
              <Icon n="check" size={15} />Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── QUALITY BADGE ────────────────────────────────────────────────────────────
function QualityBadge({ label, score, rationale }) {
  const [hovered, setHovered] = useState(false);

  const cfg = {
    "Strong fit":   { text: "#3B6D11", bg: "#EAF3DE" },
    "Probable fit": { text: "#854F0B", bg: "#FAEEDA" },
    "Weak fit":     { text: "#A32D2D", bg: "#FCEBEB" },
  };
  const c = cfg[label] || { text: C.muted, bg: C.surface };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 999,
          fontSize: 11, fontWeight: 600, cursor: "default",
          background: c.bg, color: c.text, fontFamily: fontB,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text, flexShrink: 0 }} />
        {label}
      </span>

      {hovered && score != null && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)",
          background: C.white, border: `1px solid ${C.borderMid}`,
          borderRadius: 10, padding: "10px 14px",
          minWidth: 200, maxWidth: 240, zIndex: 200,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          fontFamily: fontB, pointerEvents: "none",
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1, fontFamily: fontH }}>
            {Math.round(score)}
            <span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>/100</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Quality score</div>
          {rationale && (
            <div style={{
              fontSize: 12, color: C.muted, lineHeight: 1.5,
              borderTop: `1px solid ${C.border}`, paddingTop: 6,
            }}>
              {rationale}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PROJECT DETAIL PAGE ──────────────────────────────────────────────────────
function ProjectDetailPage({ project: initProject, onBack, onViewCandidate }) {
  const isMobile = useIsMobile();
  const [project,          setProject]          = useState(initProject);
  const [candidates,       setCandidates]       = useState([]);
  const [total,            setTotal]            = useState(0);
  const [matching,         setMatching]         = useState(false);
  const [matchMsg,         setMatchMsg]         = useState("");
  const [copiedLink,       setCopied]           = useState(false);
  const [poolTab,          setPoolTab]          = useState('matched');
  const [showReport,       setShowReport]       = useState(false);
  const [showMatchPanel,   setShowMatchPanel]   = useState(false);
  const [showBulkUpload,   setShowBulkUpload]   = useState(false);
  const [matchWeights,     setMatchWeights]     = useState({ ...DEFAULT_PROJECT_WEIGHTS });
  const [selectedPreset,   setSelectedPreset]   = useState("ngo");
  const [removeConfirm,    setRemoveConfirm]    = useState(null);
  const [qualityRunning,   setQualityRunning]   = useState(false);
  const [qualityMsg,                       setQualityMsg]                    =  useState("");
  const [qualityAppliedMsg,    setQualityAppliedMsg]    = useState("");
  const [qualityFilter,    setQualityFilter]    = useState("all");
  const [selectedIds,      setSelectedIds]      = useState(new Set());
  const [bulkRemoveConfirm, setBulkRemoveConfirm] = useState(false);
  const [bulkRemoving,     setBulkRemoving]     = useState(false);

  const applyUrl = `${window.location.origin}/apply/${project.apply_slug}`;

  const fetchCandidates = async () => {
    try {
      const r = await apiFetch(`/api/v1/projects/${project.id}/candidates?page=1&page_size=500`);
      const d = await r.json();
      setCandidates(d.candidates || []);
      setTotal(d.total || 0);
    } catch {
      setCandidates([]);
    }
  };

  useEffect(() => { fetchCandidates(); }, [project.id]);

  // Clear selection when switching tabs
  const switchTab = (tab) => {
    setPoolTab(tab);
    setQualityFilter("all");
    setSelectedIds(new Set());
    setQualityAppliedMsg("");
  };

  const applyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    const p = PROJECT_PRESETS[presetKey];
    if (p) {
      setMatchWeights({ skill: p.skill, vector: p.vector, experience: p.experience, domain: p.domain });
    }
  };

  const runMatch = async () => {
    setMatching(true);
    setMatchMsg("");
    try {
      const weightTotal = Object.values(matchWeights).reduce((a, b) => a + b, 0);
      if (weightTotal !== 100) {
        setMatchMsg("Weights must sum to 100% before running match.");
        setMatching(false);
        return;
      }
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
      if (!r.ok) {
        setMatchMsg(d.detail || "Match failed.");
      } else {
        setMatchMsg(`✓ ${d.candidates_matched} candidates matched`);
        setShowMatchPanel(false);
        setSelectedIds(new Set());
        fetchCandidates();
      }
    } catch {
      setMatchMsg("Network error.");
    } finally {
      setMatching(false);
    }
  };

 const runQualityScore = async (scope = "all") => {
    const isApplied = scope === "applied";
    if (isApplied) {
    setQualityAppliedMsg("");
    } else {
    setQualityRunning(true);
    setQualityMsg("");
   }
  try {
    const r = await apiFetch(
      `/api/v1/projects/${project.id}/quality-score?scope=${scope}`,
      { method: "POST" }
    );
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
  } finally {
    if (!isApplied) setQualityRunning(false);
  }
};

  const toggleApplyLink = async () => {
    const r = await apiFetch(`/api/v1/projects/${project.id}`, {
      method: "PATCH",
      body: JSON.stringify({ apply_enabled: !project.apply_enabled }),
    });
    if (r.ok) setProject(p => ({ ...p, apply_enabled: !p.apply_enabled }));
  };

  const viewCandidate = async (candidateId) => {
    try {
      const res = await apiFetch(`/api/v1/candidates/${candidateId}`);
      onViewCandidate(await res.json());
    } catch {}
  };

  const removeCand = async (candidateId) => {
    await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "remove" }),
    });
    setRemoveConfirm(null);
    fetchCandidates();
  };

  const restoreCand = async (candidateId) => {
    await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "add" }),
    });
    fetchCandidates();
  };

  const handleAddCandidate = async (candidateId) => {
    await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "add", action_source: "apply_link_add" }),
    });
    fetchCandidates();
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const activeIds = displayCandidates.filter(c => c.is_active).map(c => c.candidate_id);
    const allSelected = activeIds.every(id => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeIds));
    }
  };

  // ── Bulk remove ────────────────────────────────────────────────────────────
  const confirmBulkRemove = () => setBulkRemoveConfirm(true);

  const executeBulkRemove = async () => {
    setBulkRemoving(true);
    try {
      for (const candidateId of selectedIds) {
        await apiFetch(`/api/v1/projects/${project.id}/candidates/${candidateId}`, {
          method: "PATCH",
          body: JSON.stringify({ action: "remove" }),
        });
      }
      setSelectedIds(new Set());
      setBulkRemoveConfirm(false);
      fetchCandidates();
    } catch {
      setBulkRemoveConfirm(false);
    } finally {
      setBulkRemoving(false);
    }
  };

  const scoreColor = s => !s ? C.muted : s >= 0.7 ? C.success : s >= 0.5 ? C.warning : C.error;
  const scoreBg    = s => !s ? C.surface : s >= 0.7 ? C.successLight : s >= 0.5 ? C.warningLight : C.errorLight;
  const srcBadge = src =>
    src === "apply_link"     ? { type: "success", label: "Applied" }  :
    src === "apply_link_add" ? { type: "success", label: "Promoted" } :
    src === "manual_add"     ? { type: "",        label: "Manual" }   :
                               { type: "admin",   label: "Auto" };

  const matchedCandidates     = candidates.filter(c => c.source !== 'apply_link');
  const appliedCandidates     = candidates.filter(c => c.source === 'apply_link');
  const shortlistedCandidates = candidates.filter(c => c.source === 'apply_link_add' && c.is_active);
  const reportAvailable       = matchedCandidates.filter(c => c.is_active).length > 0;
  const weightsChanged        = JSON.stringify(matchWeights) !== JSON.stringify(DEFAULT_PROJECT_WEIGHTS);

  const tabCandidates = poolTab === 'matched' ? matchedCandidates : appliedCandidates;
  const displayCandidates = qualityFilter === "all"
    ? tabCandidates
    : qualityFilter === "unscored"
      ? tabCandidates.filter(c => !c.quality_label)
      : tabCandidates.filter(c => c.quality_label === {
          strong:   "Strong fit",
          probable: "Probable fit",
          weak:     "Weak fit",
        }[qualityFilter]);

  const anyScored      = candidates.some(c => c.quality_label != null);
  const activeDisplayIds = displayCandidates.filter(c => c.is_active).map(c => c.candidate_id);
  const allSelected    = activeDisplayIds.length > 0 && activeDisplayIds.every(id => selectedIds.has(id));
  const someSelected   = selectedIds.size > 0;

  return (
    <div>
      {/* ── Header row ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
        <button style={{ ...S.btn("outline", true), marginTop: "2px" }} onClick={onBack}>
          <Icon n="arrow_back" size={14} />Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ ...S.pageTitle, marginBottom: "2px" }}>{project.title}</div>
          <div style={{ fontSize: "12px", color: C.muted }}>
            Created {fmtDate(project.created_at)}
            {project.last_matched_at && ` · Last matched ${fmtDate(project.last_matched_at)}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {reportAvailable && !project.is_archived && (
            <button style={S.btn("outline", true)} onClick={() => setShowReport(true)}>
              <Icon n="summarize" size={13} />Generate Report
            </button>
          )}
          {!project.is_archived && (
            <button style={S.btn("outline", true)} onClick={() => setShowBulkUpload(true)}>
              <Icon n="upload_file" size={13} />Upload CVs
            </button>
          )}
          {!project.is_archived && (
            <button
              style={{ ...S.btn("outline", true), opacity: qualityRunning ? 0.6 : 1 }}
              onClick={runQualityScore}
              disabled={qualityRunning}
            >
              <Icon n="verified" size={13} />{qualityRunning ? "Scoring…" : "Quality Check"}
            </button>
          )}
          <button
            style={{
              ...S.btn(project.is_archived ? "outline" : "primary", true),
              opacity: project.is_archived ? 0.5 : 1,
            }}
            onClick={() => { if (!project.is_archived) setShowMatchPanel(p => !p); }}
            disabled={project.is_archived}
          >
            <Icon n="hub" size={13} />Run Match
          </button>
        </div>
      </div>

      {/* ── Match panel ── */}
      {showMatchPanel && !project.is_archived && (
        <div className="fade-up" style={{ ...S.card, marginBottom: "16px", border: `1px solid ${C.borderMid}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", fontFamily: fontH, color: C.text, display: "flex", alignItems: "center", gap: "7px" }}>
              <Icon n="hub" size={15} color={C.primary} />Match Settings
            </div>
            <button onClick={() => { setShowMatchPanel(false); setMatchMsg(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
              <Icon n="close" size={18} />
            </button>
          </div>
          <div style={{ marginBottom: "4px" }}>
            <label style={S.label}>Scoring Profile</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
              {Object.entries(PROJECT_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  style={{
                    padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                    cursor: "pointer",
                    border: `1px solid ${selectedPreset === key ? C.primary : C.border}`,
                    backgroundColor: selectedPreset === key ? C.primaryDim : "transparent",
                    color: selectedPreset === key ? C.primary : C.muted,
                    transition: "all 0.15s", fontFamily: fontB,
                  }}
                >
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
                <Icon n={matchMsg.startsWith("✓") ? "check_circle" : "error"} size={14} color={matchMsg.startsWith("✓") ? C.success : C.error} />
                {matchMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Match result message (panel closed) ── */}
      {matchMsg && !showMatchPanel && (
        <div style={{
          background: matchMsg.startsWith("✓") ? C.successLight : C.errorLight,
          border: `1px solid ${matchMsg.startsWith("✓") ? "rgba(59,178,115,0.25)" : "rgba(224,92,92,0.25)"}`,
          borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
          fontSize: "13px", color: matchMsg.startsWith("✓") ? "#2a7a50" : C.error,
        }}>
          {matchMsg}
        </div>
      )}

      {/* ── Quality check result message ── */}
      {qualityMsg && (
        <div style={{
          background: qualityMsg.startsWith("✓") ? C.successLight : C.errorLight,
          border: `1px solid ${qualityMsg.startsWith("✓") ? "rgba(59,178,115,0.25)" : "rgba(224,92,92,0.25)"}`,
          borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
          fontSize: "13px", color: qualityMsg.startsWith("✓") ? "#2a7a50" : C.error,
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <Icon n={qualityMsg.startsWith("✓") ? "verified" : "error"} size={14} color={qualityMsg.startsWith("✓") ? C.success : C.error} />
          {qualityMsg}
        </div>
      )}

      {/* ── Apply link card ── */}
      <div style={{ ...S.card, display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={S.label}>Apply Link</div>
          <div style={{ fontSize: "12px", color: project.apply_enabled ? C.primary : C.muted, fontFamily: font, wordBreak: "break-all" }}>
            {applyUrl}
          </div>
        </div>
        <button style={S.btn("outline", true)} onClick={() => { navigator.clipboard.writeText(applyUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
          <Icon n={copiedLink ? "check" : "content_copy"} size={13} />{copiedLink ? "Copied!" : "Copy"}
        </button>
        <button style={S.btn(project.apply_enabled ? "danger" : "success", true)} onClick={toggleApplyLink}>
          <Icon n={project.apply_enabled ? "link_off" : "link"} size={13} />
          {project.apply_enabled ? "Disable Link" : "Enable Link"}
        </button>
      </div>

      {/* ── Pool counts ── */}
      <div style={{ fontSize: "13px", color: C.muted, marginBottom: "12px" }}>
        {matchedCandidates.length} matched · {appliedCandidates.length} applied
      </div>

      {/* ── Tab toggle ── */}
<div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center", flexWrap: "wrap" }}>
  <button
    style={{ padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", backgroundColor: poolTab === "matched" ? C.primary : C.surface, color: poolTab === "matched" ? "#fff" : C.muted }}
    onClick={() => switchTab("matched")}
  >
    <Icon n="auto_awesome" size={13} />{` Matched (${matchedCandidates.length})`}
  </button>
  <button
    style={{ padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", backgroundColor: poolTab === "applied" ? C.success : C.surface, color: poolTab === "applied" ? "#fff" : C.muted }}
    onClick={() => switchTab("applied")}
  >
    <Icon n="inbox" size={13} />{` Applied (${appliedCandidates.length})`}
  </button>

  {poolTab === "applied" && appliedCandidates.length > 0 && !project.is_archived && (
    <>
      <div style={{ width: "1px", height: "24px", backgroundColor: C.border, margin: "0 4px" }} />
      <button
        style={{
          ...S.btn("outline", true),
          fontSize: "12px",
          color: C.success,
          borderColor: "rgba(59,178,115,0.4)",
          opacity: qualityRunning ? 0.5 : 1,
        }}
        onClick={() => runQualityScore("applied")}
        disabled={qualityRunning}
        title="Score only inbound applicants — saves GPT cost vs scoring full pool"
      >
        <Icon n="verified" size={13} color={C.success} />
        Score Applied
      </button>
      {qualityAppliedMsg && (
        <span style={{
          fontSize: "12px",
          color: qualityAppliedMsg.startsWith("✓") ? C.success : C.error,
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          <Icon
            n={qualityAppliedMsg.startsWith("✓") ? "check_circle" : "error"}
            size={13}
            color={qualityAppliedMsg.startsWith("✓") ? C.success : C.error}
          />
          {qualityAppliedMsg}
        </span>
      )}
    </>
  )}
</div>

      {/* ── Quality filter pills ── */}
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
            <button
              key={f.key}
              onClick={() => { setQualityFilter(f.key); setSelectedIds(new Set()); }}
              style={{
                padding: "4px 12px", borderRadius: 999, fontSize: 12, fontFamily: fontB,
                border: `1px solid ${qualityFilter === f.key ? (f.border || C.borderMid) : C.border}`,
                background: qualityFilter === f.key ? `${(f.color || C.muted)}18` : "transparent",
                color: qualityFilter === f.key ? (f.color || C.muted) : C.muted,
                cursor: "pointer", fontWeight: qualityFilter === f.key ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ fontSize: "11px", color: C.muted, fontFamily: fontB }}>{displayCandidates.length} shown</span>
        </div>
      )}

      {/* ── Bulk action bar (desktop + matched tab only) ── */}
      {!isMobile && poolTab === "matched" && someSelected && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "10px 16px", marginBottom: "12px",
          backgroundColor: C.errorLight,
          border: `1px solid rgba(224,92,92,0.25)`,
          borderRadius: "10px",
        }}>
          <span style={{ fontSize: "13px", color: C.error, fontWeight: "600", fontFamily: fontB }}>
            {selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <button
            style={{ ...S.btn("danger", true) }}
            onClick={confirmBulkRemove}
          >
            <Icon n="person_remove" size={13} />Remove Selected
          </button>
          <button
            style={{ ...S.btn("outline", true), fontSize: "12px" }}
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Candidate list ── */}
      {displayCandidates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>
          <Icon n="people" size={40} color={C.border} style={{ display: "block", margin: "0 auto 12px" }} />
          {poolTab === "matched"
            ? "No matched candidates yet. Click Run Match to build the pool."
            : "No applied candidates yet. Share the apply link or upload CVs directly."}
        </div>
      ) : isMobile ? (
        /* ── Mobile cards ── */
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayCandidates.map(c => {
            const badge = srcBadge(c.source);
            const score = c.match_score;
            return (
              <div key={c.candidate_id} style={{ ...S.cardMobile, opacity: c.is_active ? 1 : 0.45 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH }}>{c.name || "—"}</div>
                    <div style={{ fontSize: "12px", color: C.muted }}>
                      {[c.current_designation, c.current_company].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    {score != null && (
                      <span style={{ background: scoreBg(score), color: scoreColor(score), padding: "3px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>
                        {Math.round(score * 100)}%
                      </span>
                    )}
                    {c.quality_label && (
                      <QualityBadge label={c.quality_label} score={c.quality_score} rationale={c.quality_rationale} />
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={S.badge(badge.type)}>{badge.label}</span>
                  <button style={S.btn("outline", true)} onClick={() => viewCandidate(c.candidate_id)}><Icon n="person" size={12} />View</button>
                  <button className="similar-btn" style={S.btn("similar", true)} onClick={() => openSimilarWindow({ id: c.candidate_id, name: c.name })}><Icon n="hub" size={12} />Similar</button>
                  {poolTab === "applied" && (
                    <button style={{ ...S.btn("outline", true), fontSize: "11px" }} onClick={() => handleAddCandidate(c.candidate_id)}><Icon n="add" size={12} /> Add to Matched</button>
                  )}
                  {c.is_active
                    ? <button style={S.btn("danger", true)} onClick={() => setRemoveConfirm(c)}>Remove</button>
                    : <button style={S.btn("success", true)} onClick={() => restoreCand(c.candidate_id)}>Restore</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Desktop table ── */
        <div style={{ backgroundColor: C.white, borderRadius: "14px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {poolTab === "matched" && (
                  <th style={{ ...S.th, width: "36px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      style={{ cursor: "pointer", accentColor: C.primary }}
                      title="Select all"
                    />
                  </th>
                )}
                {["Match", "Name", "Designation", "Exp", "Location", "Score Breakdown", "Quality", "Source", "Actions"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayCandidates.map(c => {
                const badge = srcBadge(c.source);
                const isSelected = selectedIds.has(c.candidate_id);
                return (
                  <tr
                    key={c.candidate_id}
                    style={{ opacity: c.is_active ? 1 : 0.4, backgroundColor: isSelected ? C.primaryDim : "" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = C.surface; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = isSelected ? C.primaryDim : ""; }}
                  >
                    {/* Checkbox — matched tab only */}
                    {poolTab === "matched" && (
                      <td style={{ ...S.td, width: "36px", textAlign: "center" }}>
                        {c.is_active && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(c.candidate_id)}
                            style={{ cursor: "pointer", accentColor: C.primary }}
                          />
                        )}
                      </td>
                    )}

                    {/* Match % */}
                    <td style={{ ...S.td, width: "60px", textAlign: "center" }}>
                      {c.match_score != null ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <div style={{ fontSize: "17px", fontWeight: "800", fontFamily: fontH, color: c.match_score >= 0.70 ? C.success : c.match_score >= 0.50 ? C.similar : C.error }}>
                            {Math.round(c.match_score * 100)}
                          </div>
                          <div style={{ fontSize: "9px", color: C.muted, fontWeight: "700", textTransform: "uppercase" }}>match</div>
                        </div>
                      ) : <span style={{ fontSize: "13px", color: C.muted }}>—</span>}
                    </td>

                    {/* Name */}
                    <td style={{ ...S.td, maxWidth: "180px" }}>
                      <div style={{ fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || "—"}</div>
                      <div style={{ fontSize: "11px", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.current_company || "—"}</div>
                    </td>

                    {/* Designation */}
                    <td style={{ ...S.td, fontSize: "12px", color: C.textMid, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.current_designation || "—"}
                    </td>

                    {/* Exp */}
                    <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600", whiteSpace: "nowrap" }}>
                      {c.total_experience != null ? `${c.total_experience}y` : "—"}
                    </td>

                    {/* Location */}
                    <td style={{ ...S.td, color: C.muted, fontSize: "12px", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.location || ""}>
                      {c.location || "—"}
                    </td>

                    {/* Score breakdown */}
                    <td style={S.td}>
                      {c.match_score != null ? (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          <ScorePill label="Skill" value={c.skill_score ?? 0} color={C.success} />
                          <ScorePill label="Sem"   value={c.vector_score ?? 0} color={C.primary} />
                          <ScorePill label="Exp"   value={c.experience_score ?? 0} color={C.similar} />
                          {c.domain_score != null && <ScorePill label="Dom" value={c.domain_score} color={C.info} />}
                        </div>
                      ) : <span style={{ fontSize: "12px", color: C.muted }}>—</span>}
                    </td>

                    {/* Quality */}
                    <td style={{ ...S.td, textAlign: "center" }}>
                      {c.quality_label
                        ? <QualityBadge label={c.quality_label} score={c.quality_score} rationale={c.quality_rationale} />
                        : <span style={{ fontSize: "12px", color: C.muted }}>—</span>}
                    </td>

                    {/* Source */}
                    <td style={S.td}><span style={S.badge(badge.type)}>{badge.label}</span></td>

                    {/* Actions */}
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button style={S.btn("outline", true)} onClick={() => viewCandidate(c.candidate_id)}><Icon n="person" size={12} />View</button>
                        <button className="similar-btn" style={S.btn("similar", true)} onClick={() => openSimilarWindow({ id: c.candidate_id, name: c.name })}><Icon n="hub" size={12} />Similar</button>
                        {poolTab === "applied" && (
                          <button style={{ ...S.btn("outline", true), fontSize: "11px" }} onClick={() => handleAddCandidate(c.candidate_id)}><Icon n="add" size={12} /> Add to Matched</button>
                        )}
                        {c.is_active
                          ? <button style={S.btn("danger", true)} onClick={() => setRemoveConfirm(c)}>Remove</button>
                          : <button style={S.btn("success", true)} onClick={() => restoreCand(c.candidate_id)}>Restore</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Generate Report Modal ── */}
      {showReport && (
        <GenerateReportModal
          project={project}
          allCandidates={candidates}
          matchedCandidates={matchedCandidates.filter(c => c.is_active)}
          shortlistedCandidates={shortlistedCandidates}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* ── Bulk CV Upload Modal ── */}
      {showBulkUpload && (
        <BulkCvUploadModal
          project={project}
          onClose={() => setShowBulkUpload(false)}
          onComplete={fetchCandidates}
        />
      )}

      {/* ── Single remove confirmation modal ── */}
      {removeConfirm && (
        <div style={S.modal} onClick={() => setRemoveConfirm(null)}>
          <div style={{ ...S.modalWrap, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.errorLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon n="person_remove" size={15} color={C.error} />
                </div>
                <span style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Remove Candidate</span>
              </div>
              <button onClick={() => setRemoveConfirm(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
                <Icon n="close" size={20} />
              </button>
            </div>
            <div style={S.modalBody}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: C.text, marginBottom: "6px", fontFamily: fontH }}>
                {removeConfirm.name || "This candidate"}
              </div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "16px" }}>
                {[removeConfirm.current_designation, removeConfirm.current_company].filter(Boolean).join(" · ")}
              </div>
              <div style={{ backgroundColor: C.warningLight, border: `1px solid rgba(217,119,6,0.25)`, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: C.warning, lineHeight: "1.6", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Icon n="warning" size={15} color={C.warning} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  This candidate will be permanently removed from this project.{" "}
                  <strong>This only affects this project</strong> — they remain in the candidate database and can still match on other projects.
                </span>
              </div>
            </div>
            <div style={S.modalFoot}>
              <button style={S.btn("danger")} onClick={() => removeCand(removeConfirm.candidate_id)}>
                <Icon n="person_remove" size={14} />Confirm Remove
              </button>
              <button style={S.btn("outline")} onClick={() => setRemoveConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk remove confirmation modal ── */}
      {bulkRemoveConfirm && (
        <div style={S.modal} onClick={() => setBulkRemoveConfirm(false)}>
          <div style={{ ...S.modalWrap, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.errorLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon n="group_remove" size={15} color={C.error} />
                </div>
                <span style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Remove {selectedIds.size} Candidate{selectedIds.size > 1 ? "s" : ""}</span>
              </div>
              <button onClick={() => setBulkRemoveConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
                <Icon n="close" size={20} />
              </button>
            </div>
            <div style={S.modalBody}>
              <div style={{ backgroundColor: C.errorLight, border: `1px solid rgba(224,92,92,0.25)`, borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: C.error, lineHeight: "1.6", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Icon n="warning" size={15} color={C.error} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>{selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""}</strong> will be permanently removed from this project.
                  They remain in the candidate database and can still match on other projects.
                </span>
              </div>
            </div>
            <div style={S.modalFoot}>
              <button style={{ ...S.btn("danger"), opacity: bulkRemoving ? 0.6 : 1 }} onClick={executeBulkRemove} disabled={bulkRemoving}>
                <Icon n="group_remove" size={14} />{bulkRemoving ? "Removing…" : `Remove ${selectedIds.size}`}
              </button>
              <button style={S.btn("outline")} onClick={() => setBulkRemoveConfirm(false)} disabled={bulkRemoving}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── GENERATE REPORT MODAL ────────────────────────────────────────────────────
function GenerateReportModal({ project, allCandidates, matchedCandidates, shortlistedCandidates, onClose }) {
  const [step,          setStep]          = useState('type');
  const [reportType,    setReportType]    = useState(null);
  const [clientName,    setClientName]    = useState("");
  const [contextNote,   setContextNote]   = useState(project.client_note || "");
  const [recruiterNote, setRecruiterNote] = useState("");
  const [clientNameErr, setClientNameErr] = useState("");
  const [progress,      setProgress]      = useState([]);
  const [reportPayload, setReportPayload] = useState(null);

  const user = getUser();
  const candidatesForReport = reportType === 'shortlist' ? shortlistedCandidates : matchedCandidates;
  const reportTitle = reportType === 'shortlist'
    ? `Applied Candidate Shortlist — ${project.title}`
    : `Candidate Matched Report — ${project.title}`;
  const appliedCount = allCandidates.filter(c =>
    (c.source === 'apply_link' || c.source === 'apply_link_add') && c.is_active
  ).length;
  const promotedCount = shortlistedCandidates.length;

  const selectType = (type) => { setReportType(type); setStep('details'); };

  const goToNotes = () => {
    if (!clientName.trim()) { setClientNameErr("Client name is required"); return; }
    setClientNameErr("");
    setStep('notes');
  };

  const generate = async () => {
    setStep('generating');
    const candidates = candidatesForReport;
    const progressSteps = [
      { label: "Fetching full candidate profiles", done: false },
      { label: "Generating AI assessments", done: false },
      { label: "Assembling report", done: false },
    ];
    setProgress(progressSteps.map(s => ({ ...s })));

    try {
      // Step 1: fetch full profiles
      const fullProfiles = await Promise.all(
        candidates.map(async c => {
          try {
            const r = await apiFetch(`/api/v1/candidates/${c.candidate_id}`);
            return await r.json();
          } catch { return null; }
        })
      );
      setProgress(p => p.map((s, i) => i === 0 ? { ...s, done: true } : s));

      // Step 2: parse recruiter notes using --- delimiter
      // Format: "Name\ncontent\n---\nName\ncontent"
      const noteMap = {};
      if (recruiterNote.trim()) {
        const blocks = recruiterNote.split(/\n?---\n?/).map(b => b.trim()).filter(Boolean);
        for (const block of blocks) {
          const lines = block.split('\n');
          const nameLine = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();
          for (const cand of candidates) {
            const fn = (cand.name || "").split(" ")[0];
            if (fn && nameLine.toLowerCase().includes(fn.toLowerCase())) {
              noteMap[cand.candidate_id] = content;
              break;
            }
          }
        }
      }

      // Step 3: generate assessments
      const assessments = {};
      await Promise.all(
        candidates.map(async (c, idx) => {
          const full = fullProfiles[idx];
          if (!full) { assessments[c.candidate_id] = { recruiter_summary: "", talint_assessment: "" }; return; }

          const firstName = (full.name || "").split(" ")[0];

          // Recruiter note: use --- delimited block matching this candidate's name
          const recruiterSummary = noteMap[c.candidate_id] || "";

          // Talint assessment: /briefing endpoint, strip markdown, first paragraph only
          let talintAssessment = "";
          try {
            const r = await apiFetch(
              `/api/v1/projects/${project.id}/candidates/${c.candidate_id}/briefing`,
              { method: "POST" }
            );
            const d = await r.json();
            const raw = d.briefing || "";
            // Strip all markdown formatting
            const cleaned = raw
              .replace(/^#{1,3}\s+/gm, '')
              .replace(/\*\*(.*?)\*\*/g, "$1")
              .replace(/\*(.*?)\*/g, "$1")
              .trim();
            // Find first paragraph that is not just a section label
            const sectionLabel = /^(summary|strengths|match rationale|development areas)[:\s]*/i;
            const paragraphs = cleaned.split(/\n\n+/);
            const firstReal = paragraphs.find(p => !sectionLabel.test(p.trim())) || paragraphs[0] || "";
            talintAssessment = firstReal.replace(sectionLabel, '').trim();
          } catch { talintAssessment = ""; }

          assessments[c.candidate_id] = { recruiter_summary: recruiterSummary, talint_assessment: talintAssessment };
        })
      );
      setProgress(p => p.map((s, i) => i === 1 ? { ...s, done: true } : s));

      // Step 3: assemble payload
      const scores = candidates.map(c => c.match_score).filter(Boolean);
      const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      const payload = {
        report_type:    reportType,
        report_title:   reportTitle,
        generated_at:   new Date().toISOString(),
        client_name:    clientName.trim(),
        recruiter_name: user?.username || "ATRIOS",
        project: {
          id: project.id, title: project.title,
          created_at: project.created_at, last_matched_at: project.last_matched_at,
        },
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
          ...c,
          ...fullProfiles[idx],
          recruiter_summary: assessments[c.candidate_id]?.recruiter_summary || "",
          talint_assessment: assessments[c.candidate_id]?.talint_assessment || "",
        })),
      };

      setProgress(p => p.map((s, i) => i === 2 ? { ...s, done: true } : s));
      setReportPayload(payload);
      setStep('done');

    } catch (err) {
      setStep('details');
    }
  };

  // Write to localStorage then open new window — retry loop in ReportPrintView handles timing
  const printReport = () => {
    const key = `talint_report_${project.id}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(reportPayload));
    const url = `${window.location.origin}${window.location.pathname}#report?key=${key}`;
    window.open(url, `report_${project.id}`, "width=900,height=1100,scrollbars=yes,resizable=yes");
  };

  const typeCard = (type, icon, title, subtitle, count, countLabel) => (
    <div
      onClick={() => count > 0 && selectType(type)}
      style={{
        border: `2px solid ${count > 0 ? C.borderMid : C.border}`,
        borderRadius: "12px", padding: "18px 20px", cursor: count > 0 ? "pointer" : "not-allowed",
        opacity: count > 0 ? 1 : 0.45, transition: "all 0.15s", marginBottom: "10px",
        backgroundColor: C.white,
      }}
      onMouseEnter={e => { if (count > 0) { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.backgroundColor = C.primaryLight; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = count > 0 ? C.borderMid : C.border; e.currentTarget.style.backgroundColor = C.white; }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: C.primaryDim,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon n={icon} size={20} color={C.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH, color: C.text, marginBottom: "3px" }}>{title}</div>
          <div style={{ fontSize: "12px", color: C.muted, lineHeight: "1.5" }}>{subtitle}</div>
          <div style={{ marginTop: "8px" }}>
            <span style={{ ...S.badge(count > 0 ? "admin" : ""), fontSize: "11px" }}>
              {count} {countLabel}
            </span>
          </div>
        </div>
        {count > 0 && <Icon n="chevron_right" size={20} color={C.muted} />}
      </div>
    </div>
  );

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "520px" }} onClick={e => e.stopPropagation()}>

        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {step !== 'type' && step !== 'done' && (
              <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: "2px" }}
                onClick={() => setStep(step === 'details' ? 'type' : step === 'notes' ? 'details' : 'type')}>
                <Icon n="arrow_back" size={18} />
              </button>
            )}
            <div>
              <div style={{ fontWeight: "700", fontFamily: fontH, fontSize: "15px" }}>
                {step === 'type'       && "Generate Report"}
                {step === 'details'    && (reportType === 'shortlist' ? "Applied Shortlist Report" : "Full Matched Pool Report")}
                {step === 'notes'      && "Recruiter Notes"}
                {step === 'generating' && "Generating Report…"}
                {step === 'done'       && "Report Ready"}
              </div>
              {step !== 'type' && (
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "1px" }}>{project.title}</div>
              )}
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }} onClick={onClose}>
            <Icon n="close" size={20} />
          </button>
        </div>

        <div style={S.modalBody}>

          {step === 'type' && (
            <div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "16px" }}>
                Choose the type of report to generate for this project.
              </div>
              {typeCard('shortlist', 'how_to_reg', 'Applied Shortlist Report',
                'Candidates who applied via link and were promoted by your team. For clients evaluating your application sorting service.',
                promotedCount, `promoted candidate${promotedCount !== 1 ? 's' : ''}`)}
              {typeCard('matched', 'groups', 'Full Matched Pool Report',
                'All active candidates in the Matched tab — auto-matched, manually added, and promoted. For team use or full client briefings.',
                matchedCandidates.length, `matched candidate${matchedCandidates.length !== 1 ? 's' : ''}`)}
            </div>
          )}

          {step === 'details' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={S.label}>Client Name *</label>
                <input style={{ ...S.input, marginTop: "4px" }}
                  placeholder="e.g. HDFC Bank, Teach For India"
                  value={clientName}
                  onChange={e => { setClientName(e.target.value); setClientNameErr(""); }} />
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

          {step === 'notes' && (
            <div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "12px", lineHeight: "1.6" }}>
                Add notes per candidate. Start each section with the candidate name, then their note. Separate candidates with a line containing only <strong>---</strong>
              </div>
              <label style={S.label}>Free-format notes</label>
              <textarea
                style={{ ...S.input, resize: "vertical", minHeight: "130px", marginTop: "4px" }}
                placeholder={`Prachi Jain\nSenior leader with 25 years experience. CTC 31L. Notice 60 days. Open to relocate.\n---\nArooje Sajjad\nGrant management expert. Contract ending Mar 2026. CTC 40L. Notice 30 days.\n---\nMyron Anthony\nStrong global profile. Can join immediately. CTC 32L.`}
                value={recruiterNote} onChange={e => setRecruiterNote(e.target.value)} />
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "6px" }}>
                Use <strong>---</strong> on its own line to separate candidates · Leave blank to skip recruiter notes
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div style={{ padding: "8px 0" }}>
              {progress.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0",
                  borderBottom: i < progress.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  {s.done ? (
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: C.successLight,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon n="check" size={14} color={C.success} />
                    </div>
                  ) : (
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%",
                      border: `2px solid ${C.primary}`, borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: "13px", color: s.done ? C.muted : C.text, fontWeight: s.done ? "400" : "600" }}>
                    {s.label}
                  </span>
                </div>
              ))}
              <div style={{ fontSize: "12px", color: C.muted, marginTop: "16px", textAlign: "center" }}>
                Generating {candidatesForReport.length} AI assessment{candidatesForReport.length !== 1 ? "s" : ""}… this takes 10–20 seconds
              </div>
            </div>
          )}

          {step === 'done' && reportPayload && (
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.successLight,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon n="check_circle" size={28} color={C.success} />
              </div>
              <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: fontH, color: C.text, marginBottom: "6px" }}>
                {reportType === 'shortlist' ? "Applied Shortlist Report" : "Full Matched Pool Report"}
              </div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "20px" }}>
                {clientName} · {candidatesForReport.length} candidate{candidatesForReport.length !== 1 ? "s" : ""}
              </div>
              <button style={{ ...S.btn("primary"), justifyContent: "center", padding: "10px 28px" }} onClick={printReport}>
                <Icon n="print" size={15} />Print / Save as PDF
              </button>
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "10px" }}>
                Opens in new window · File → Print → Save as PDF
              </div>
            </div>
          )}
        </div>

        {(step === 'details' || step === 'notes') && (
          <div style={S.modalFoot}>
            {step === 'details' && (
              <>
                <button style={S.btn("primary")} onClick={goToNotes}>Next <Icon n="arrow_forward" size={14} /></button>
                <button style={S.btn("outline")} onClick={() => setStep('type')}>Back</button>
              </>
            )}
            {step === 'notes' && (
              <>
                <button style={S.btn("primary")} onClick={generate}><Icon n="auto_awesome" size={14} />Generate</button>
                <button style={S.btn("outline")} onClick={() => setStep('details')}>Back</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REPORT PRINT VIEW ────────────────────────────────────────────────────────
// Renders at hash #report?key=... — reads payload from localStorage with retry loop
function ReportPrintView() {
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
        clearInterval(interval);
        setError(true);
        return;
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

  const { report_title, client_name, recruiter_name, generated_at, project, summary, candidates } = payload;
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

      {/* Print button — hidden on print */}
      <div className="no-print" style={{ position: "fixed", top: "16px", right: "16px", zIndex: 100 }}>
        <button onClick={() => window.print()}
          style={{ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
            backgroundColor: "#6264f4", color: "#fff", fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 4px 12px rgba(98,100,244,0.25)" }}>
          🖨 Print / Save as PDF
        </button>
      </div>

      {/* ── COVER PAGE ── */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "60px 48px 48px" }}>

        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingBottom: "20px", borderBottom: "3px solid #6264f4", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#6264f4",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Sora', sans-serif", color: "#fff", fontSize: "20px", fontWeight: "800" }}>A</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0f2d",
                fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em" }}>ATRIOS</div>
              <div style={{ fontSize: "10px", color: "#8b8ab8", textTransform: "uppercase",
                letterSpacing: "0.1em" }}>Talent Intelligence</div>
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#8b8ab8" }}>{dateStr}</div>
        </div>

        {/* Report type tag */}
        <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px",
          backgroundColor: "rgba(98,100,244,0.08)", color: "#6264f4",
          fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: "16px" }}>
          {payload.report_type === 'shortlist' ? "Applied Shortlist Report" : "Full Matched Pool Report"}
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

        {/* Summary stats — 3 cards, no scores */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "48px" }}>
          {[
            { label: "Applied",     value: summary.total_applied,     color: "#6264f4" },
            { label: "Shortlisted", value: summary.total_shortlisted,  color: "#3BB273" },
            { label: "In Report",   value: summary.total_in_report,    color: "#0f0f2d" },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: "#f6f6f8", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "'Sora', sans-serif",
                color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#8b8ab8", fontWeight: "600",
                textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Candidate index */}
        <div style={{ backgroundColor: "#f6f6f8", borderRadius: "12px", padding: "20px 24px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#8b8ab8",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
            Candidates in this report
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {candidates.map((c, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "11px", color: "#c4b8e0", fontWeight: "700", minWidth: "20px" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f0f2d" }}>{c.name || "—"}</span>
                <span style={{ fontSize: "12px", color: "#8b8ab8" }}>
                  {c.current_designation || ""}
                  {c.current_company ? ` · ${c.current_company}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CANDIDATE PROFILES ── */}
      {candidates.map((c, idx) => (
        <div key={c.candidate_id || idx} className="page-break"
          style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 48px 40px" }}>

          {/* Candidate header */}
          <div style={{ paddingBottom: "16px", borderBottom: "2px solid #6264f4", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
              <span style={{ fontSize: "11px", color: "#c4b8e0", fontWeight: "700" }}>
                {String(idx + 1).padStart(2, "0")} / {candidates.length}
              </span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700", fontFamily: "'Sora', sans-serif",
              color: "#0f0f2d", marginBottom: "3px" }}>{c.name || "—"}</div>
            <div style={{ fontSize: "13px", color: "#3d3d6b" }}>
              {c.current_designation || ""}
              {c.current_company ? ` · ${c.current_company}` : ""}
            </div>
          </div>

          {/* Key facts row */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px",
            fontSize: "12px", color: "#8b8ab8" }}>
            {c.total_experience != null && <span>💼 {c.total_experience} years exp</span>}
            {c.location          && <span>📍 {c.location}</span>}
            {c.notice_period != null && <span>⏱ {c.notice_period}d notice</span>}
            {c.email             && <span>✉ {c.email}</span>}
            {c.phone             && <span>📞 {c.phone}</span>}
          </div>

          {/* Matching skills */}
          {(c.matching_skills || []).length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#8b8ab8",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                Relevant Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {c.matching_skills.map((s, i) => (
                  <span key={i} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
                    fontWeight: "600", backgroundColor: "rgba(59,178,115,0.12)", color: "#2a7a50",
                    border: "1px solid rgba(59,178,115,0.2)" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter Note — from free-text note or AI-generated profile snapshot */}
          {c.recruiter_summary && (
            <div style={{ backgroundColor: "#fffbf0", border: "1px solid rgba(217,119,6,0.2)",
              borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#d97706",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px",
                fontFamily: "'Sora', sans-serif" }}>
                Recruiter Note
              </div>
              <div style={{ fontSize: "13px", color: "#3d3d6b", lineHeight: "1.7" }}>
                {c.recruiter_summary}
              </div>
            </div>
          )}

          {/* Talint Assessment */}
          {c.talint_assessment && (
            <div style={{ backgroundColor: "rgba(98,100,244,0.05)",
              border: "1px solid rgba(98,100,244,0.15)", borderRadius: "10px",
              padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#6264f4",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px",
                fontFamily: "'Sora', sans-serif" }}>
                Talint Assessment
              </div>
              <div style={{ fontSize: "13px", color: "#3d3d6b", lineHeight: "1.7" }}>
                {c.talint_assessment}
              </div>
            </div>
          )}

          {/* Candidate footer */}
          <div style={{ marginTop: "24px", fontSize: "10px", color: "#c4b8e0" }}>
            Candidate {idx + 1} of {candidates.length} · ATRIOS Talint · {dateStr}
          </div>
        </div>
      ))}

      {/* Report footer */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "24px 48px 48px",
        borderTop: "1px solid #e8e5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#c4b8e0" }}>
          <span>ATRIOS Talent Intelligence · Confidential</span>
          <span>Generated {dateStr} · {recruiter_name}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(getUser);
  const [tab, setTab] = useState("search");
  const [showChangePw, setShowChangePw] = useState(false);
  const [modalCand, setModalCand] = useState(null);
  const [projectsKey, setProjectsKey] = useState(0);  // ← increments on Projects tab click → resets to list view
  const isMobile = useIsMobile();

  // Handle similar window rendering via hash
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  if (hash.startsWith("#similar?")) {
    const params = new URLSearchParams(hash.replace("#similar?", ""));
    const seedId = params.get("seed_id");
    const seedName = params.get("seed_name");
    const token = params.get("token");
    if (token) localStorage.setItem("ti_token", token);
    if (seedId) return <SimilarPanel seedId={parseInt(seedId)} seedName={seedName || "Unknown"} />;
  }
  if (hash.startsWith("#report?")) {
    return <ReportPrintView />;
  }

  // Public apply page — render before auth check
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (path.startsWith("/apply/")) {
    const slug = path.split("/apply/")[1];
    if (slug) return <ApplyPage slug={slug} />;
  }

  const handleLogout = () => { clearAuth(); setUser(null); };
  if (!user) return <LoginPage onLogin={setUser} />;

  const tabs = [
    { key: "search",    icon: "search",        label: "Search"    },
    { key: "upload",    icon: "upload_file",   label: "Upload"    },
    { key: "projects",  icon: "work",          label: "Projects"  },
    { key: "resources", icon: "link",          label: "Resources" },
    ...(user.role === "admin" ? [{ key: "admin", icon: "shield_person", label: "Admin" }] : []),
  ];
  const initials = user.username.slice(0, 2).toUpperCase();

  // Nav click handler — resets ProjectsTab to list view on every Projects click
  const handleTabClick = (key) => {
    if (key === "projects") setProjectsKey(k => k + 1);
    setTab(key);
  };

  return (
    <div style={S.app}>
      <header style={{ ...S.header, display: isMobile ? "none" : "flex" }}>
        <div style={S.logo}>
          <div style={S.logoIcon}>A</div>
          <div style={S.logoText}>Talent Intelligence</div>
        </div>
        <nav style={S.nav}>
          {tabs.map(({ key, icon, label }) => (
            <button key={key} style={S.navBtn(tab === key)} onClick={() => handleTabClick(key)}>
              <Icon n={icon} size={14} />{label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => setShowChangePw(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 12px 5px 5px", borderRadius: "24px", border: `1px solid ${C.border}`, backgroundColor: C.white, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ width: "27px", height: "27px", borderRadius: "50%", backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "11px", fontFamily: fontH }}>{initials}</div>
            <div><div style={{ fontSize: "12px", fontWeight: "600", color: C.text, lineHeight: 1.2 }}>{user.username}</div><div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{user.role}</div></div>
          </button>
          <button style={{ ...S.btn("outline", true), color: C.error, borderColor: "rgba(224,92,92,0.25)" }} onClick={handleLogout}>
            <Icon n="logout" size={13} />Sign Out
          </button>
        </div>
      </header>

      {isMobile && (
        <header style={S.mobileHeader}>
          <div style={S.logo}>
            <div style={{ ...S.logoIcon, width: "30px", height: "30px", fontSize: "14px" }}>A</div>
            <div style={{ ...S.logoText, fontSize: "14px" }}>Talent Intelligence</div>
          </div>
          <button onClick={() => setShowChangePw(true)}
            style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "12px", border: "none", cursor: "pointer", fontFamily: fontH }}>
            {initials}
          </button>
        </header>
      )}

      <main style={isMobile ? S.mainMobile : S.main}>
        {tab === "search"    && <SearchTab />}
        {tab === "upload"    && <UploadTab />}
        {tab === "projects"  && <ProjectsTab key={projectsKey} onViewCandidate={setModalCand} />}
        {tab === "resources" && <ResourcesTab isAdmin={user.role === "admin"} />}
        {tab === "admin"     && user.role === "admin" && <AdminTab />}
      </main>

      {isMobile && (
        <nav style={S.mobileNav} className="mobile-nav">
          {tabs.map(({ key, icon, label }) => (
            <button key={key} style={S.mobileNavBtn(tab === key)} onClick={() => handleTabClick(key)}>
              <Icon n={icon} size={tab === key ? 22 : 20} color={tab === key ? C.primary : C.muted} />
              <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
            </button>
          ))}
          <button style={S.mobileNavBtn(false)} onClick={handleLogout}>
            <Icon n="logout" size={20} color={C.error} />
            <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: C.error }}>Out</span>
          </button>
        </nav>
      )}

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
      {modalCand && <ProfileModal candidate={modalCand} onClose={() => setModalCand(null)} />}
    </div>
  );
}