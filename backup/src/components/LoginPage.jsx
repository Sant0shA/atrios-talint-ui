// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

import { useState } from "react";
import { C, S, fontH, API, setAuth } from "../constants";
import { useIsMobile } from "../hooks";
import { PasswordInput } from "./PasswordInput";
import Icon from "./Icon";

export default function LoginPage({ onLogin }) {
  const [form, setForm]       = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const isMobile              = useIsMobile();

  const submit = async () => {
    if (!form.username || !form.password) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { setError("Invalid username or password"); return; }
      const data = await res.json();
      setAuth(data.access_token, {
        username:  data.username,
        role:      data.role,
        client_id: data.client_id ?? null,
      });
      onLogin({ username: data.username, role: data.role, client_id: data.client_id ?? null });
    } catch { setError("Connection failed."); } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: `radial-gradient(ellipse at 65% 0%, rgba(98,100,244,0.14) 0%, transparent 55%),
                        radial-gradient(ellipse at 10% 100%, rgba(98,100,244,0.07) 0%, transparent 50%)`,
    }}>
      <div style={{ width: "100%", maxWidth: "380px", padding: isMobile ? "16px" : "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px", backgroundColor: C.primary,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
            fontFamily: fontH, color: "#fff", fontSize: "26px", fontWeight: "800",
          }}>A</div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: C.text, marginBottom: "5px",
            letterSpacing: "-0.025em", fontFamily: fontH }}>Talent Intelligence</div>
          <div style={{ fontSize: "13px", color: C.muted }}>ATRIOS · Sign in to your workspace</div>
        </div>

        <div style={S.card}>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Username</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...S.input, paddingLeft: "38px" }}
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && submit()}
                autoFocus
              />
              <Icon n="person" size={16} color={C.muted}
                style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={S.label}>Password</label>
            <PasswordInput
              value={form.password}
              placeholder="Enter your password"
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>

          {error && (
            <div style={{ color: C.error, fontSize: "13px", marginBottom: "14px",
              display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon n="error" size={14} color={C.error} />{error}
            </div>
          )}

          <button
            style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "11px" }}
            onClick={submit}
            disabled={loading}
          >
            <Icon n="login" size={16} />{loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
