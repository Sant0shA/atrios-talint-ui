import { useState } from "react";
import { C, S, fontH, fontB } from "../constants";
import Icon from "../components/Icon";

// ─── EXPIRY STATE ─────────────────────────────────────────────────────────────
// Returns: 'ok' | 'warning' | 'grace' | 'expired'
export function getExpiryState(access_until, days_until_expiry) {
  if (!access_until) return "ok";
  if (days_until_expiry === null || days_until_expiry === undefined) return "ok";
  if (days_until_expiry > 14)  return "ok";
  if (days_until_expiry > 0)   return "warning";   // 1–14 days left
  if (days_until_expiry >= -7) return "grace";     // 0 to -7 days (grace window)
  return "expired";                                 // beyond grace → hard block
}

// ─── CLIENT EXPIRY BANNER ─────────────────────────────────────────────────────
// Amber dismissible banner — shown when 1–14 days until expiry.
// Dismissed once per calendar day via localStorage key.
export function ClientExpiryBanner({ daysLeft, onDismiss }) {
  const WARNING_KEY = `client_warning_dismissed_${new Date().toISOString().slice(0, 10)}`;
  const [visible, setVisible] = useState(() => !localStorage.getItem(WARNING_KEY));

  const dismiss = () => {
    localStorage.setItem(WARNING_KEY, "1");
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div style={{
      backgroundColor: C.warningLight,
      border: `1px solid rgba(217,119,6,0.3)`,
      borderRadius: "10px",
      padding: "11px 16px",
      margin: "0 0 16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13px",
      color: "#92400E",
    }}>
      <Icon n="schedule" size={17} color={C.warning} />
      <span style={{ flex: 1 }}>
        Your access to this portal expires in{" "}
        <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>.
        Please contact ATRIOS to renew your contract.
      </span>
      <button onClick={dismiss}
        style={{ background: "none", border: "none", cursor: "pointer",
          color: C.warning, padding: "2px", display: "flex", alignItems: "center" }}>
        <Icon n="close" size={16} />
      </button>
    </div>
  );
}

// ─── CLIENT EXPIRED MODAL ─────────────────────────────────────────────────────
// Grace-period blocking overlay — no close button, cannot be dismissed.
export function ClientExpiredModal() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(15,15,45,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: "16px",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        backgroundColor: C.white, borderRadius: "20px", maxWidth: "420px", width: "100%",
        padding: "36px 32px", textAlign: "center",
        boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          backgroundColor: C.warningLight,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px",
        }}>
          <Icon n="lock_clock" size={28} color={C.warning} />
        </div>
        <div style={{ fontSize: "18px", fontWeight: "700", fontFamily: fontH,
          color: C.text, marginBottom: "10px" }}>
          Your Access Has Expired
        </div>
        <div style={{ fontSize: "14px", color: C.muted, lineHeight: "1.7", marginBottom: "20px" }}>
          Your access to the ATRIOS Talint portal has expired.
          Please contact your ATRIOS account manager to renew your contract.
        </div>
        <a href="mailto:admin@atrios.in"
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "10px 22px", borderRadius: "10px",
            backgroundColor: C.primary, color: "#fff",
            fontWeight: "600", fontSize: "13px", textDecoration: "none",
            fontFamily: fontB,
          }}>
          <Icon n="mail" size={15} />admin@atrios.in
        </a>
      </div>
    </div>
  );
}

// ─── CLIENT HARD EXPIRED SCREEN ───────────────────────────────────────────────
// Full-page block shown after server returns CLIENT_ACCESS_EXPIRED (beyond +7 days grace).
export function ClientHardExpiredScreen() {
  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: "380px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          backgroundColor: C.errorLight,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon n="lock" size={30} color={C.error} />
        </div>
        <div style={{ fontSize: "20px", fontWeight: "700", fontFamily: fontH,
          color: C.text, marginBottom: "10px" }}>
          Portal Access Ended
        </div>
        <div style={{ fontSize: "14px", color: C.muted, lineHeight: "1.7", marginBottom: "24px" }}>
          Your portal access has ended. Please reach out to your ATRIOS contact to continue.
        </div>
        <a href="mailto:admin@atrios.in"
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "10px 22px", borderRadius: "10px",
            backgroundColor: C.primary, color: "#fff",
            fontWeight: "600", fontSize: "13px", textDecoration: "none",
          }}>
          <Icon n="mail" size={15} />Contact ATRIOS
        </a>
      </div>
    </div>
  );
}

// ─── CLIENT SCORE PILL ────────────────────────────────────────────────────────
// Simpler score pill for client view — no sub-score tooltips.
export function ClientScorePill({ score }) {
  if (score == null) return <span style={{ fontSize: "13px", color: C.muted }}>—</span>;
  const pct   = Math.round(score * 100);
  const color = score >= 0.7 ? C.success : score >= 0.5 ? C.warning : C.error;
  const bg    = score >= 0.7 ? C.successLight : score >= 0.5 ? C.warningLight : C.errorLight;
  return (
    <span style={{
      backgroundColor: bg, color, padding: "3px 10px",
      borderRadius: "20px", fontSize: "13px", fontWeight: "700",
    }}>
      {pct}%
    </span>
  );
}

// ─── CLIENT SOURCE BADGE ──────────────────────────────────────────────────────
// Pure function — returns { label, type } with client-friendly labels.
export function clientSourceBadge(source) {
  if (source === "apply_link")     return { label: "Applied",  type: "success" };
  if (source === "apply_link_add") return { label: "Promoted", type: "warning" };
  return                                  { label: "Uploaded", type: ""        };
}
