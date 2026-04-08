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

export default function ClientPortal({ user, onLogout }) {
  const isMobile = useIsMobile();
  const [accessMeta,      setAccessMeta]      = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hardExpired,     setHardExpired]      = useState(false);
  const [showChangePw,    setShowChangePw]     = useState(false);

  useEffect(() => {
    apiFetch("/api/v1/client/me")
      .then(r => {
        if (r.status === 403) { setHardExpired(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setAccessMeta(d); })
      .catch(() => {});
  }, []);

  if (hardExpired) return <ClientHardExpiredScreen />;

  const expiryState = accessMeta
    ? getExpiryState(accessMeta.access_until, accessMeta.days_until_expiry)
    : "ok";

  const initials   = user.username.slice(0, 2).toUpperCase();
  const clientName = accessMeta?.client_name || user.username;

  return (
    <div style={S.app}>
      <header style={{ ...S.header, display: "flex" }}>
        <div style={S.logo}>
          <div style={S.logoIcon}>A</div>
          <div style={S.logoText}>Talent Intelligence</div>
        </div>

        {!isMobile && (
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)",
            fontSize: "13px", fontWeight: "600", color: C.muted }}>
            {clientName}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* User chip */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px",
            padding: "5px 12px 5px 5px", borderRadius: "24px",
            border: `1px solid ${C.border}`, backgroundColor: C.white }}>
            <div style={{ width: "27px", height: "27px", borderRadius: "50%",
              backgroundColor: C.primary, display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontWeight: "700",
              fontSize: "11px", fontFamily: fontH }}>
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
          <button style={{ ...S.btn("outline", true) }}
            onClick={() => setShowChangePw(true)} title="Change Password">
            <Icon n="lock" size={13} />
            {!isMobile && "Change Password"}
          </button>

          {/* Sign out */}
          <button style={{ ...S.btn("outline", true), color: C.error,
            borderColor: "rgba(224,92,92,0.25)" }} onClick={onLogout}>
            <Icon n="logout" size={13} />Sign Out
          </button>
        </div>
      </header>

      {/* Grace-period blocking modal */}
      {expiryState === "grace" && <ClientExpiredModal />}

      {/* Change password modal */}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

      <main style={isMobile ? S.mainMobile : S.main}>
        {/* Warning banner — 1-14 days */}
        {expiryState === "warning" && accessMeta && (
          <ClientExpiryBanner daysLeft={accessMeta.days_until_expiry} />
        )}

        {selectedProject ? (
          <ClientProjectDetailPage
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
          />
        ) : (
          <ClientProjectsPage onSelectProject={setSelectedProject} />
        )}
      </main>
    </div>
  );
}
