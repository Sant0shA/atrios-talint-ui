// ─── PASSWORD COMPONENTS ──────────────────────────────────────────────────────
// PasswordInput, ChangePasswordModal, ResetPasswordModal

import { useState } from "react";
import { C, S, fontH } from "../constants";
import { apiFetch } from "../utils";
import { pwChecks, pwValid } from "../utils";
import Icon from "./Icon";

// ─── PASSWORD INPUT ───────────────────────────────────────────────────────────

export function PasswordInput({ value, onChange, placeholder = "Password", showStrength = false }) {
  const [show, setShow] = useState(false);
  const checks   = pwChecks(value);
  const metCount = checks.filter(c => c.met).length;
  const strength      = metCount <= 1 ? "Weak" : metCount <= 3 ? "Fair" : metCount === 4 ? "Good" : "Strong";
  const strengthColor = metCount <= 1 ? C.error : metCount <= 3 ? C.warning : metCount === 4 ? "#3b82f6" : C.success;

  return (
    <div>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...S.input, paddingRight: "42px" }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: C.muted,
            display: "flex", alignItems: "center", padding: 0 }}
        >
          <Icon n={show ? "visibility_off" : "visibility"} size={17} />
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ flex: 1, height: "4px", borderRadius: "4px", backgroundColor: C.border, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "4px", transition: "all 0.3s",
                width: `${(metCount / 5) * 100}%`, backgroundColor: strengthColor }} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: strengthColor, minWidth: "44px" }}>
              {strength}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {checks.map((ch, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px",
                color: ch.met ? C.success : C.muted, transition: "color 0.2s" }}>
                <Icon n={ch.met ? "check_circle" : "radio_button_unchecked"} size={14}
                  color={ch.met ? C.success : C.border} />
                {ch.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHANGE PASSWORD MODAL ────────────────────────────────────────────────────

export function ChangePasswordModal({ onClose }) {
  const [form, setForm]       = useState({ current_password: "", new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!form.current_password || !form.new_password || !form.confirm) { setMsg("All fields are required"); return; }
    if (!pwValid(form.new_password)) { setMsg("Password does not meet all requirements"); return; }
    if (form.new_password !== form.confirm) { setMsg("Passwords do not match"); return; }
    setLoading(true); setMsg("");
    try {
      const res = await apiFetch("/api/v1/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
      });
      const data = await res.json();
      if (res.ok) setDone(true); else setMsg(data.detail || "Failed");
    } catch { setMsg("Connection error"); } finally { setLoading(false); }
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "440px" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.primaryLight,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="lock" size={15} color={C.primary} />
            </div>
            <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: fontH }}>Change Password</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
            <Icon n="close" size={20} />
          </button>
        </div>

        {done ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.successLight,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon n="check_circle" size={28} color={C.success} />
            </div>
            <div style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px", fontFamily: fontH }}>Password Updated</div>
            <div style={{ fontSize: "13px", color: C.muted, marginBottom: "24px" }}>Your password has been changed successfully.</div>
            <button style={S.btn("outline")} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={S.modalBody}>
              <div style={{ marginBottom: "14px" }}>
                <label style={S.label}>Current Password</label>
                <PasswordInput value={form.current_password} placeholder="Enter current password"
                  onChange={e => setForm(p => ({ ...p, current_password: e.target.value }))} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={S.label}>New Password</label>
                <PasswordInput value={form.new_password} placeholder="Create a strong password" showStrength
                  onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Confirm New Password</label>
                <PasswordInput value={form.confirm} placeholder="Repeat new password"
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
                {form.confirm.length > 0 && form.confirm !== form.new_password && (
                  <div style={{ fontSize: "12px", color: C.error, marginTop: "5px",
                    display: "flex", alignItems: "center", gap: "5px" }}>
                    <Icon n="error" size={13} color={C.error} />Passwords do not match
                  </div>
                )}
              </div>
              {msg && (
                <div style={{ marginTop: "12px", fontSize: "13px", color: C.error,
                  display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon n="error" size={14} color={C.error} />{msg}
                </div>
              )}
            </div>
            <div style={S.modalFoot}>
              <button style={S.btn("primary")} onClick={submit}
                disabled={loading || !pwValid(form.new_password)}>
                <Icon n="lock_reset" size={15} />{loading ? "Updating..." : "Update Password"}
              </button>
              <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── RESET PASSWORD MODAL (admin use) ─────────────────────────────────────────

export function ResetPasswordModal({ user, onClose }) {
  const [form, setForm]       = useState({ new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!form.new_password || !form.confirm) { setMsg("Both fields required"); return; }
    if (!pwValid(form.new_password)) { setMsg("Password does not meet all requirements"); return; }
    if (form.new_password !== form.confirm) { setMsg("Passwords do not match"); return; }
    setLoading(true); setMsg("");
    try {
      const res = await apiFetch(`/api/v1/auth/reset-password/${user.id}`, {
        method: "POST",
        body: JSON.stringify({ new_password: form.new_password }),
      });
      const data = await res.json();
      if (res.ok) setDone(true); else setMsg(data.detail || "Reset failed");
    } catch { setMsg("Connection error"); } finally { setLoading(false); }
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "440px" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: C.warningLight,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="key" size={15} color={C.warning} />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: fontH }}>Reset Password</div>
              <div style={{ fontSize: "11px", color: C.muted }}>for {user.username}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
            <Icon n="close" size={20} />
          </button>
        </div>

        {done ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.successLight,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Icon n="check_circle" size={28} color={C.success} />
            </div>
            <div style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px", fontFamily: fontH }}>Password Reset</div>
            <div style={{ fontSize: "13px", color: C.muted, marginBottom: "24px" }}>
              Password for <strong>{user.username}</strong> updated.
            </div>
            <button style={S.btn("outline")} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={S.modalBody}>
              <div style={{ marginBottom: "14px" }}>
                <label style={S.label}>New Password</label>
                <PasswordInput value={form.new_password} placeholder="Create a strong password" showStrength
                  onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Confirm Password</label>
                <PasswordInput value={form.confirm} placeholder="Repeat new password"
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
                {form.confirm.length > 0 && form.confirm !== form.new_password && (
                  <div style={{ fontSize: "12px", color: C.error, marginTop: "5px",
                    display: "flex", alignItems: "center", gap: "5px" }}>
                    <Icon n="error" size={13} color={C.error} />Passwords do not match
                  </div>
                )}
              </div>
              {msg && (
                <div style={{ marginTop: "12px", fontSize: "13px", color: C.error,
                  display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon n="error" size={14} color={C.error} />{msg}
                </div>
              )}
            </div>
            <div style={S.modalFoot}>
              <button style={S.btn("primary")} onClick={submit}
                disabled={loading || !pwValid(form.new_password)}>
                <Icon n="lock_reset" size={15} />{loading ? "Resetting..." : "Reset Password"}
              </button>
              <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
