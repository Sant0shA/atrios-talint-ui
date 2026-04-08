// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// Extracted from App.jsx — import these in every component that needs them

export const getToken = () => localStorage.getItem("ti_token");
export const getUser  = () => JSON.parse(localStorage.getItem("ti_user") || "null");
export const setAuth  = (t, u) => { localStorage.setItem("ti_token", t); localStorage.setItem("ti_user", JSON.stringify(u)); };
export const clearAuth = () => { localStorage.removeItem("ti_token"); localStorage.removeItem("ti_user"); };
export const API = "https://atrios-talent-intelligence-engine-production.up.railway.app";


export const C = {
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

export const font  = "'DM Mono', monospace";
export const fontH = "'Sora', sans-serif";
export const fontB = "'DM Sans', sans-serif";

export const S = {
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

// ─── PROJECT WEIGHT DEFAULTS & PRESETS ────────────────────────────────────────
// Used by WeightSliders, ProjectWeightSliders, and ProjectDetailPage

export const DEFAULT_WEIGHTS = { vector: 80, skill: 15, experience: 5 };

export const DEFAULT_PROJECT_WEIGHTS = { skill: 25, vector: 40, experience: 20, domain: 15 };

export const PROJECT_PRESETS = {
  ngo:        { label: "NGO / Social Sector", skill: 25, vector: 40, experience: 20, domain: 15 },
  technology: { label: "Technology",          skill: 50, vector: 25, experience: 20, domain:  5 },
  consulting: { label: "Consulting",          skill: 30, vector: 35, experience: 20, domain: 15 },
  bfsi:       { label: "BFSI",               skill: 35, vector: 30, experience: 15, domain: 20 },
  general:    { label: "General",             skill: 30, vector: 35, experience: 25, domain: 10 },
};
