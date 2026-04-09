import { useState, useEffect } from "react";
import { C, S, fontH, fontB } from "../constants";
import { apiFetch } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import { ChangePasswordModal } from "../components/PasswordInput";
import {
  getExpiryState,
  ClientExpiryBanner,
  ClientExpiredModal,
  ClientHardExpiredScreen,
} from "./ClientComponents";
import ClientProjectsPage from "./ClientProjectsPage";
import ClientProjectDetailPage from "./ClientProjectDetailPage";
import ClientSearchPage from "./ClientSearchPage";

// ─── Tab pill nav ─────────────────────────────────────────────────────────────
function TabNav({ activeTab, onChange }) {
  const tabs = [
    { id: "mandates", icon: "work",   label: "Mandates" },
    { id: "search",   icon: "search", label: "Search"   },
  ];
  return (
    <div style={{
      display: "flex",
      gap: "4px",
      backgroundColor: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: "10px",
      padding: "4px",
    }}>
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: active ? "700" : "500",
              fontFamily: "inherit",
              color:           active ? C.primary : C.muted,
              backgroundColor: active ? C.white   : "transparent",
              boxShadow:       active ? `0 1px 3px rgba(0,0,0,0.08)` : "none",
              transition: "all 0.15s",
            }}
          >
            <Icon n={tab.icon} size={14} color={active ? C.primary : C.muted} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── ClientPortal ─────────────────────────────────────────────────────────────
export default function ClientPortal({ user, onLogout }) {
  const isMobile = useIsMobile();
  const [accessMeta,      setAccessMeta]      = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hardExpired,     setHardExpired]      = useState(false);
  const [showChangePw,    setShowChangePw]     = useState(false);
  const [activeTab,       setActiveTab]        = useState("mandates");

  // projects list — fetched once, passed down to search for mandate dropdown
  const [projects,        setProjects]         = useState([]);

  useEffect(() => {
    apiFetch("/api/v1/client/me")
      .then(r => {
        if (r.status === 403) { setHardExpired(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setAccessMeta(d); })
      .catch(() => {});
  }, []);

  // Fetch project list once for the mandate filter in search
  useEffect(() => {
    apiFetch("/api/v1/client/projects")
      .then(r => r.json())
      .then(d => setProjects(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  if (hardExpired) return <ClientHardExpiredScreen />;

  const expiryState = accessMeta
    ? getExpiryState(accessMeta.access_until, accessMeta.days_until_expiry)
    : "ok";

  const initials   = user.username.slice(0, 2).toUpperCase();
  const clientName = accessMeta?.client_name || user.username;

  // When switching tabs, clear the selected project so Back works cleanly
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "mandates") setSelectedProject(null);
  };

  return (
    <div style={S.app}>
      <header style={{ ...S.header, display: "flex" }}>
        <div style={S.logo}>
          <div style={S.logoIcon}>A</div>
          <div style={S.logoText}>Talent Intelligence</div>
        </div>

        {/* Tab nav — centred in header on desktop */}
        {!isMobile && (
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
          }}>
            <TabNav activeTab={activeTab} onChange={handleTabChange} />
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Client name label on desktop */}
          {!isMobile && (
            <div style={{
              fontSize: "12px", color: C.muted,
              paddingRight: "8px",
              borderRight: `1px solid ${C.border}`,
              marginRight: "4px",
            }}>
              {clientName}
            </div>
          )}

          {/* User chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "5px 12px 5px 5px", borderRadius: "24px",
            border: `1px solid ${C.border}`, backgroundColor: C.white,
          }}>
            <div style={{
              width: "27px", height: "27px", borderRadius: "50%",
              backgroundColor: C.primary, display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontWeight: "700",
              fontSize: "11px", fontFamily: fontH,
            }}>
              {initials}
            </div>
            {!isMobile && (
              <div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: C.text, lineHeight: 1.2 }}>
                  {user.username}
                </div>
                <div style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Client
                </div>
              </div>
            )}
          </div>

          {/* Change password */}
          <button
            style={{ ...S.btn("outline", true) }}
            onClick={() => setShowChangePw(true)}
            title="Change Password"
          >
            <Icon n="lock" size={13} />
            {!isMobile && "Change Password"}
          </button>

          {/* Sign out */}
          <button
            style={{ ...S.btn("outline", true), color: C.error, borderColor: "rgba(224,92,92,0.25)" }}
            onClick={onLogout}
          >
            <Icon n="logout" size={13} />Sign Out
          </button>
        </div>
      </header>

      {/* Grace-period blocking modal */}
      {expiryState === "grace" && <ClientExpiredModal />}

      {/* Change password modal */}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

      <main style={isMobile ? S.mainMobile : S.main}>
        {/* Warning banner — 1–14 days */}
        {expiryState === "warning" && accessMeta && (
          <ClientExpiryBanner daysLeft={accessMeta.days_until_expiry} />
        )}

        {/* Mobile tab nav — shown below banner, above content */}
        {isMobile && (
          <div style={{ marginBottom: "16px" }}>
            <TabNav activeTab={activeTab} onChange={handleTabChange} />
          </div>
        )}

        {/* Content routing */}
        {activeTab === "mandates" && (
          selectedProject ? (
            <ClientProjectDetailPage
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
            />
          ) : (
            <ClientProjectsPage onSelectProject={setSelectedProject} />
          )
        )}

        {activeTab === "search" && (
          <ClientSearchPage projects={projects} />
        )}
      </main>
    </div>
  );
}