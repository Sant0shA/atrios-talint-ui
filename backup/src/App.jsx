import { useState } from "react";
import { C, S, fontH, fontB, getUser, setAuth, clearAuth } from "./constants";
import { useIsMobile } from "./hooks";
import Icon from "./components/Icon";
import LoginPage from "./components/LoginPage";
import ProfileModal from "./components/ProfileModal";
import SimilarPanel from "./components/SimilarPanel";
import { ChangePasswordModal } from "./components/PasswordInput";
import SearchTab from "./tabs/SearchTab";
import UploadTab from "./tabs/UploadTab";
import ResourcesTab from "./tabs/ResourcesTab";
import AdminTab from "./tabs/AdminTab";
import ProjectsTab from "./projects/ProjectsTab";
import ClientPortal from "./portal/ClientPortal";
import ApplyPage from "./pages/ApplyPage";
import ReportPrintView from "./projects/ReportPrintView";

// ─── CSS injection — fonts, animations, scrollbar, class names ────────────────
// fade-up, dot-wave, similar-btn, resource-card, stat-card, log-row, mobile-nav
// are all defined here. Do NOT remove this block.
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

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,        setUser]        = useState(getUser);
  const [tab,         setTab]         = useState("search");
  const [showChangePw,setShowChangePw]= useState(false);
  const [modalCand,   setModalCand]   = useState(null);
  const [projectsKey, setProjectsKey] = useState(0); // increments on Projects click → resets to list view
  const isMobile = useIsMobile();

  // ── Hash routing (opens in new window) ──────────────────────────────────────
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  if (hash.startsWith("#similar?")) {
    const params = new URLSearchParams(hash.replace("#similar?", ""));
    const seedId   = params.get("seed_id");
    const seedName = params.get("seed_name");
    const token    = params.get("token");
    if (token) localStorage.setItem("ti_token", token);
    if (seedId) return <SimilarPanel seedId={parseInt(seedId)} seedName={seedName || "Unknown"} />;
  }
  if (hash.startsWith("#report?")) return <ReportPrintView />;

  // ── Path routing — public apply page (no auth required) ─────────────────────
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (path.startsWith("/apply/")) {
    const slug = path.split("/apply/")[1];
    if (slug) return <ApplyPage slug={slug} />;
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  const handleLogout = () => { clearAuth(); setUser(null); };
  if (!user) return <LoginPage onLogin={setUser} />;

  // ── Client role → separate portal ───────────────────────────────────────────
  if (user.role === "client")
    return <ClientPortal user={user} onLogout={handleLogout} />;

  // ── Internal recruiter / admin app ──────────────────────────────────────────
  const tabs = [
    { key: "search",    icon: "search",        label: "Search"    },
    { key: "upload",    icon: "upload_file",   label: "Upload"    },
    { key: "projects",  icon: "work",          label: "Projects"  },
    { key: "resources", icon: "link",          label: "Resources" },
    ...(user.role === "admin" ? [{ key: "admin", icon: "shield_person", label: "Admin" }] : []),
  ];
  const initials = user.username.slice(0, 2).toUpperCase();

  // Incrementing projectsKey forces ProjectsTab remount → resets to list view
  const handleTabClick = (key) => {
    if (key === "projects") setProjectsKey(k => k + 1);
    setTab(key);
  };

  return (
    <div style={S.app}>

      {/* ── Desktop header ── */}
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
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 12px 5px 5px",
              borderRadius: "24px", border: `1px solid ${C.border}`, backgroundColor: C.white,
              cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ width: "27px", height: "27px", borderRadius: "50%", backgroundColor: C.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: "700", fontSize: "11px", fontFamily: fontH }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: C.text, lineHeight: 1.2 }}>{user.username}</div>
              <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{user.role}</div>
            </div>
          </button>
          <button style={{ ...S.btn("outline", true), color: C.error, borderColor: "rgba(224,92,92,0.25)" }}
            onClick={handleLogout}>
            <Icon n="logout" size={13} />Sign Out
          </button>
        </div>
      </header>

      {/* ── Mobile header ── */}
      {isMobile && (
        <header style={S.mobileHeader}>
          <div style={S.logo}>
            <div style={{ ...S.logoIcon, width: "30px", height: "30px", fontSize: "14px" }}>A</div>
            <div style={{ ...S.logoText, fontSize: "14px" }}>Talent Intelligence</div>
          </div>
          <button onClick={() => setShowChangePw(true)}
            style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: C.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: "700", fontSize: "12px", border: "none",
              cursor: "pointer", fontFamily: fontH }}>
            {initials}
          </button>
        </header>
      )}

      {/* ── Main content ── */}
      <main style={isMobile ? S.mainMobile : S.main}>
        {tab === "search"    && <SearchTab onViewCandidate={setModalCand} />}
        {tab === "upload"    && <UploadTab onViewCandidate={setModalCand} />}
        {tab === "projects"  && <ProjectsTab key={projectsKey} onViewCandidate={setModalCand} />}
        {tab === "resources" && <ResourcesTab isAdmin={user.role === "admin"} />}
        {tab === "admin"     && user.role === "admin" && <AdminTab />}
      </main>

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <nav style={S.mobileNav} className="mobile-nav">
          {tabs.map(({ key, icon, label }) => (
            <button key={key} style={S.mobileNavBtn(tab === key)} onClick={() => handleTabClick(key)}>
              <Icon n={icon} size={tab === key ? 22 : 20} color={tab === key ? C.primary : C.muted} />
              <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
              </span>
            </button>
          ))}
          <button style={S.mobileNavBtn(false)} onClick={handleLogout}>
            <Icon n="logout" size={20} color={C.error} />
            <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: C.error }}>
              Out
            </span>
          </button>
        </nav>
      )}

      {/* ── Global modals ── */}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
      {modalCand    && <ProfileModal candidate={modalCand} onClose={() => setModalCand(null)} />}

    </div>
  );
}
