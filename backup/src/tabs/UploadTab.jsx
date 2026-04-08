// ─── UPLOAD TAB ───────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import { C, S, fontH, font } from "../constants";
import { apiFetch } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";

// ProfileModal is rendered in App.jsx and triggered via onViewCandidate
export default function UploadTab({ onViewCandidate }) {
  const isMobile = useIsMobile();
  const [dragging, setDragging]   = useState(false);
  const [files, setFiles]         = useState([]);
  const [results, setResults]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const addFiles = (newFiles) =>
    setFiles(prev => [
      ...prev,
      ...Array.from(newFiles).filter(f =>
        [".pdf", ".docx", ".txt"].some(ext => f.name.toLowerCase().endsWith(ext))
      ),
    ]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, []);

  const uploadAll = async () => {
    if (!files.length) return;
    setUploading(true); setResults([]);
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    try {
      const res = await apiFetch("/api/v1/candidates/upload", { method: "POST", body: fd });
      setResults(await res.json());
    } catch (err) {
      setResults([{ filename: "Error", status: "failed", error: err.message }]);
    } finally {
      setUploading(false); setFiles([]);
    }
  };

  const viewProfile = async (r) => {
    if (!r.candidate_id) return;
    try {
      const res = await apiFetch(`/api/v1/candidates/${r.candidate_id}`);
      onViewCandidate(await res.json());
    } catch { if (r.preview) onViewCandidate(r.preview); }
  };

  const success = results.filter(r => r.status === "success").length;
  const failed  = results.filter(r => r.status === "failed").length;

  return (
    <div>
      {!isMobile && (
        <>
          <div style={S.pageTitle}>Upload CVs</div>
          <div style={S.pageSub}>AI-powered parsing · Files saved to cloud storage</div>
        </>
      )}

      <div style={isMobile ? S.cardMobile : S.card}>
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{ border: `2px dashed ${dragging ? C.primary : C.border}`, borderRadius: "12px",
            padding: isMobile ? "36px 20px" : "48px 24px", textAlign: "center", cursor: "pointer",
            transition: "all 0.2s", backgroundColor: dragging ? C.primaryDim : C.surface }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%",
            backgroundColor: dragging ? C.primary : C.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", transition: "all 0.2s" }}>
            <Icon n="upload_file" size={26} color={dragging ? "#fff" : C.primary} />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "5px", fontFamily: fontH }}>
            Drop CVs here or click to browse
          </div>
          <div style={{ fontSize: "12px", color: C.muted, marginBottom: "18px" }}>
            PDF, DOCX, TXT · Multiple files · Max 5MB each
          </div>
          <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt"
            style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
          <button style={S.btn("outline")} onClick={e => { e.stopPropagation(); inputRef.current.click(); }}>
            <Icon n="folder_open" size={14} />Browse Files
          </button>
        </div>

        {/* Security strip */}
        <div style={{ marginTop: "10px", padding: "9px 12px", backgroundColor: C.surface,
          borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.muted }}>
            <Icon n="verified_user" size={14} color={C.primary} />Secure transfer · AI-powered CV parsing
          </div>
          <Icon n="lock" size={15} color={C.primary} />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <>
            <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 12px", backgroundColor: C.surface, borderRadius: "8px",
                  border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <Icon n={f.name.endsWith(".pdf") ? "picture_as_pdf" : "description"} size={17} color={C.primary} />
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{f.name}</span>
                    <span style={{ fontSize: "11px", color: C.muted }}>{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.error }}>
                    <Icon n="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ ...S.row, marginTop: "12px" }}>
              <button style={S.btn("primary")} onClick={uploadAll} disabled={uploading}>
                <Icon n="rocket_launch" size={14} />
                {uploading ? "Processing..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
              </button>
              <button style={S.btn("outline")} onClick={() => setFiles([])}>
                <Icon n="clear_all" size={14} />Clear
              </button>
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={isMobile ? S.cardMobile : S.card}>
          <div style={{ ...S.row, marginBottom: "14px" }}>
            <span style={S.badge("success")}><Icon n="check_circle" size={12} />{success} uploaded</span>
            {failed > 0 && <span style={S.badge("error")}><Icon n="error" size={12} />{failed} failed</span>}
          </div>

          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {results.map((r, i) => (
                <div key={i} style={{ padding: "10px 12px", backgroundColor: C.surface,
                  borderRadius: "10px", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>{r.preview?.name || r.filename}</div>
                    <span style={S.badge(
                      r.status === "success" ? "success" : r.status === "duplicate" ? "warning" :
                      r.status === "updated" ? "admin" : "error"
                    )}>{r.status}</span>
                  </div>
                  {r.preview?.current_designation && (
                    <div style={{ fontSize: "12px", color: C.muted, marginTop: "3px" }}>
                      {r.preview.current_designation}
                    </div>
                  )}
                  {r.status === "success" && (
                    <button style={{ ...S.btn("outline", true), marginTop: "8px" }} onClick={() => viewProfile(r)}>
                      View Profile
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>{["Filename", "Status", "Parsed Name", "Exp", "Top Skills", "Action"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                    <td style={{ ...S.td, fontSize: "12px", fontFamily: font }}>{r.filename}</td>
                    <td style={S.td}>
                      <span style={S.badge(
                        r.status === "success" ? "success" : r.status === "duplicate" ? "warning" :
                        r.status === "updated" ? "admin" : "error"
                      )}>{r.status}</span>
                    </td>
                    <td style={S.td}>
                      <div style={{ fontWeight: "700" }}>{r.preview?.name || "—"}</div>
                      <div style={{ fontSize: "11px", color: C.muted }}>{r.preview?.current_designation || ""}</div>
                    </td>
                    <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600" }}>
                      {r.preview?.total_experience != null ? `${r.preview.total_experience}y` : "—"}
                    </td>
                    <td style={S.td}>
                      {(r.preview?.skills || []).slice(0, 3).map((s, j) => (
                        <span key={j} style={S.tag}>{s}</span>
                      ))}
                      {r.error && <span style={{ color: C.muted, fontSize: "12px" }}>{r.error}</span>}
                    </td>
                    <td style={S.td}>
                      {r.status === "success" && (
                        <button style={S.btn("outline", true)} onClick={() => viewProfile(r)}>View</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
