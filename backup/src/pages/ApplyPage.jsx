import { useState, useEffect } from "react";
import { C, fontH, fontB, API } from "../constants";
import Icon from "../components/Icon";

const APPLY_MESSAGES = [
  "Uploading your CV...",
  "Extracting your experience...",
  "Parsing your skills...",
  "Building your profile...",
  "Almost there...",
];

export default function ApplyPage({ slug }) {
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
    if (f.size < 20 * 1024)             { setFileErr("File seems too small. Please check your CV."); return; }
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

  // ── Local styles (self-contained — this page has no nav/shell) ──────────────
  const wrap = {
    minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "24px", fontFamily: fontB,
  };
  const card = {
    background: C.white, borderRadius: "16px", padding: "40px 48px",
    maxWidth: "540px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  };
  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: `1.5px solid ${C.border}`, fontSize: "15px", fontFamily: fontB,
    outline: "none", boxSizing: "border-box", marginTop: "6px",
  };
  const primaryBtn = {
    background: C.primary, color: "#fff", border: "none", borderRadius: "8px",
    padding: "12px 28px", fontSize: "15px", fontWeight: "600",
    cursor: "pointer", fontFamily: fontB,
  };

  // ── States ──────────────────────────────────────────────────────────────────
  if (pageState === "notfound")
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: "center" }}>
          <p style={{ color: C.error }}>This job link is not valid or has expired.</p>
        </div>
      </div>
    );

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
            border: `3px solid ${C.primary}`, borderTopColor: "transparent",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }} />
          <div key={msgIdx} style={{
            fontSize: "15px", fontWeight: "600", fontFamily: fontH,
            color: C.text, animation: "fadeUp 0.3s ease forwards",
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
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            backgroundColor: C.success, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 20px",
          }}>
            <Icon n="check" size={28} color="#fff" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: "700", fontFamily: fontH,
            marginBottom: "10px", color: C.text }}>
            Application Received
          </div>
          <div style={{ fontSize: "14px", color: C.muted, lineHeight: "1.6" }}>{message}</div>
        </div>
      </div>
    );

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", color: C.primary, fontWeight: "700",
            letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
            ATRIOS Talint
          </div>
          <h1 style={{ fontFamily: fontH, fontSize: "22px", color: C.text, margin: "0 0 8px" }}>
            {job.project_title}
          </h1>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {job.location         && <span style={{ fontSize: "13px", color: C.muted }}>📍 {job.location}</span>}
            {job.experience_range && <span style={{ fontSize: "13px", color: C.muted }}>💼 {job.experience_range}</span>}
          </div>
        </div>

        {job.jd_public_summary && (
          <div style={{ background: C.surface, borderRadius: "10px",
            padding: "14px 16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "14px", color: C.text, lineHeight: "1.7", margin: 0 }}>
              {job.jd_public_summary}
            </p>
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
              CV / Resume *{" "}
              <span style={{ fontWeight: "400", color: C.muted }}>(PDF or Word, max 5 MB)</span>
            </label>
            <input style={{ ...inp, paddingTop: "8px", paddingBottom: "8px", cursor: "pointer" }}
              type="file" accept=".pdf,.docx" onChange={handleFile} />
            {file    && <div style={{ fontSize: "12px", color: C.success, marginTop: "4px" }}>✓ {file.name}</div>}
            {fileErr && <div style={{ fontSize: "12px", color: C.error,   marginTop: "4px" }}>{fileErr}</div>}
          </div>

          {error && (
            <div style={{ background: C.errorLight, borderRadius: "8px",
              padding: "10px 14px", fontSize: "13px", color: C.error }}>
              {error}
            </div>
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
