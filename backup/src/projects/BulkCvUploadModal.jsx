// ─── BULK CV UPLOAD MODAL ─────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import { C, S, fontH, fontB } from "../constants";
import { apiFetch } from "../utils";
import Icon from "../components/Icon";

const BULK_MAX_FILES  = 50;
const BULK_BATCH_SIZE = 10;
const BULK_MAX_MB     = 5;

export default function BulkCvUploadModal({ project, onClose, onComplete }) {
  const [stage,    setStage]    = useState("select");
  const [files,    setFiles]    = useState([]);
  const [dragging, setDragging] = useState(false);
  const [results,  setResults]  = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [current,  setCurrent]  = useState("");
  const inputRef = useRef();

  const validateAndAdd = (incoming) => {
    const valid = Array.from(incoming).filter(f => {
      const ext = f.name.split(".").pop().toLowerCase();
      return ["pdf", "docx"].includes(ext) && f.size <= BULK_MAX_MB * 1024 * 1024;
    });
    setFiles(prev => [...prev, ...valid].slice(0, BULK_MAX_FILES));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); validateAndAdd(e.dataTransfer.files);
  }, []);

  const removeFile = (i) => setFiles(p => p.filter((_, j) => j !== i));

  const startUpload = async () => {
    if (!files.length) return;
    setStage("processing");
    setProgress({ done: 0, total: files.length });
    setResults([]);
    const allResults = [];

    for (let i = 0; i < files.length; i += BULK_BATCH_SIZE) {
      const batch = files.slice(i, i + BULK_BATCH_SIZE);
      await Promise.all(batch.map(async (file) => {
        setCurrent(file.name);
        try {
          const fd = new FormData();
          fd.append("file", file);
          const r = await apiFetch(`/api/v1/projects/${project.id}/bulk-upload`, { method: "POST", body: fd });
          const d = await r.json();
          allResults.push({ ...d, filename: file.name });
        } catch {
          allResults.push({ status: "failed", filename: file.name, error: "Network error" });
        }
        setProgress(p => ({ ...p, done: p.done + 1 }));
      }));
    }

    setResults(allResults);
    setStage("done");
    onComplete?.();
  };

  const nSuccess   = results.filter(r => r.status === "success").length;
  const nDuplicate = results.filter(r => r.status === "duplicate").length;
  const nFailed    = results.filter(r => r.status === "failed").length;
  const failedList = results.filter(r => r.status === "failed");
  const pct        = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const remaining  = progress.total - progress.done;
  const estSecs    = remaining * 4;
  const estLabel   = estSecs > 60 ? `~${Math.ceil(estSecs / 60)} min remaining`
                   : estSecs > 0  ? `~${estSecs}s remaining` : "";

  return (
    <div style={S.modal} onClick={stage === "processing" ? undefined : onClose}>
      <div style={{ ...S.modalWrap, maxWidth: "560px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="upload_file" size={17} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Upload CVs to Project</div>
              <div style={{ fontSize: "11px", color: C.muted, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.title}</div>
            </div>
          </div>
          {stage !== "processing" && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
              <Icon n="close" size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ ...S.modalBody, overflowY: "auto", flex: 1 }}>

          {/* SELECT */}
          {stage === "select" && (
            <>
              <div onClick={() => inputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)} onDrop={onDrop}
                style={{ border: `2px dashed ${dragging ? C.primary : C.border}`, borderRadius: "12px",
                  padding: "32px 20px", textAlign: "center", cursor: "pointer",
                  transition: "all 0.2s", backgroundColor: dragging ? C.primaryDim : C.surface, marginBottom: "14px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%",
                  backgroundColor: dragging ? C.primary : C.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", transition: "all 0.2s" }}>
                  <Icon n="upload_file" size={22} color={dragging ? "#fff" : C.primary} />
                </div>
                <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px", fontFamily: fontH }}>Drop CVs here or click to browse</div>
                <div style={{ fontSize: "12px", color: C.muted, marginBottom: "14px" }}>PDF, DOCX · Max {BULK_MAX_MB}MB each · Up to {BULK_MAX_FILES} files</div>
                <input ref={inputRef} type="file" multiple accept=".pdf,.docx" style={{ display: "none" }} onChange={e => validateAndAdd(e.target.files)} />
                <button style={S.btn("outline")} onClick={e => { e.stopPropagation(); inputRef.current.click(); }}>
                  <Icon n="folder_open" size={14} />Browse Files
                </button>
              </div>
              <div style={{ fontSize: "11px", color: C.muted, marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon n="info" size={13} color={C.muted} />CVs will be parsed, embedded, and added to the Applied pool. Duplicates are detected automatically.
              </div>
              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: fontH, marginBottom: "2px" }}>
                    {files.length} file{files.length > 1 ? "s" : ""} selected
                    {files.length === BULK_MAX_FILES && <span style={{ color: C.warning, marginLeft: "8px", fontWeight: "600", textTransform: "none" }}>(max reached)</span>}
                  </div>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 11px", backgroundColor: C.surface, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icon n={f.name.endsWith(".pdf") ? "picture_as_pdf" : "description"} size={15} color={C.primary} />
                        <span style={{ fontSize: "12px", fontWeight: "500", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        <span style={{ fontSize: "11px", color: C.muted, flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.error, flexShrink: 0 }}>
                        <Icon n="close" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PROCESSING */}
          {stage === "processing" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ backgroundColor: C.warningLight, border: `1px solid rgba(217,119,6,0.3)`, borderRadius: "10px", padding: "10px 16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", color: C.warning }}>
                <Icon n="warning" size={16} color={C.warning} />Do not close or refresh this window
              </div>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "pulse 1.8s ease-in-out infinite" }}>
                <Icon n="upload_file" size={26} color={C.primary} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: "800", fontFamily: fontH, color: C.text, marginBottom: "4px" }}>
                {progress.done} <span style={{ color: C.muted, fontSize: "16px" }}>of {progress.total}</span>
              </div>
              <div style={{ fontSize: "13px", color: C.muted, marginBottom: "6px" }}>CVs processed</div>
              {current && (
                <div style={{ fontSize: "12px", color: C.primary, marginBottom: "16px", maxWidth: "380px", margin: "0 auto 16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>⟳ {current}</div>
              )}
              <div style={{ height: "8px", borderRadius: "8px", backgroundColor: C.border, overflow: "hidden", margin: "0 auto 10px", maxWidth: "380px" }}>
                <div style={{ height: "100%", borderRadius: "8px", backgroundColor: C.primary, width: `${pct}%`, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ fontSize: "12px", color: C.muted }}>{pct}% complete {estLabel && `· ${estLabel}`}</div>
              {results.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px", fontSize: "12px" }}>
                  <span style={{ color: C.success, fontWeight: "700" }}>✓ {results.filter(r => r.status === "success").length} parsed</span>
                  {results.filter(r => r.status === "duplicate").length > 0 && <span style={{ color: C.warning, fontWeight: "700" }}>⟳ {results.filter(r => r.status === "duplicate").length} duplicate</span>}
                  {results.filter(r => r.status === "failed").length > 0 && <span style={{ color: C.error, fontWeight: "700" }}>✗ {results.filter(r => r.status === "failed").length} failed</span>}
                </div>
              )}
            </div>
          )}

          {/* DONE */}
          {stage === "done" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: nFailed === results.length ? C.errorLight : C.successLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Icon n={nFailed === results.length ? "error" : "check_circle"} size={28} color={nFailed === results.length ? C.error : C.success} />
                </div>
                <div style={{ fontSize: "17px", fontWeight: "700", fontFamily: fontH, marginBottom: "6px" }}>Upload Complete</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                  {nSuccess > 0 && <span style={S.badge("success")}><Icon n="check_circle" size={12} />{nSuccess} added</span>}
                  {nDuplicate > 0 && <span style={S.badge("warning")}><Icon n="content_copy" size={12} />{nDuplicate} duplicate</span>}
                  {nFailed > 0 && <span style={S.badge("error")}><Icon n="error" size={12} />{nFailed} failed</span>}
                </div>
              </div>
              {failedList.length > 0 && (
                <div style={{ borderRadius: "10px", border: `1px solid ${C.errorLight}`, backgroundColor: "rgba(224,92,92,0.04)", overflow: "hidden" }}>
                  <div style={{ padding: "9px 13px", borderBottom: `1px solid ${C.errorLight}`, fontSize: "11px", fontWeight: "700", color: C.error, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: fontH }}>Failed files</div>
                  {failedList.map((r, i) => (
                    <div key={i} style={{ padding: "8px 13px", borderBottom: i < failedList.length - 1 ? `1px solid ${C.errorLight}` : "none", fontSize: "12px" }}>
                      <div style={{ fontWeight: "600", color: C.text, marginBottom: "2px" }}>{r.filename}</div>
                      <div style={{ color: C.muted }}>{r.error || "Unknown error"}</div>
                    </div>
                  ))}
                </div>
              )}
              {(nSuccess + nDuplicate) > 0 && (
                <div style={{ marginTop: "14px", fontSize: "12px", color: C.muted, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon n="info" size={13} color={C.muted} />Candidates are in the Applied tab. Run Match to score them.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={S.modalFoot}>
          {stage === "select" && (
            <>
              <button style={{ ...S.btn("primary"), opacity: files.length === 0 ? 0.5 : 1 }} onClick={startUpload} disabled={files.length === 0}>
                <Icon n="rocket_launch" size={15} />Upload {files.length > 0 ? `${files.length} CV${files.length > 1 ? "s" : ""}` : "CVs"}
              </button>
              <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            </>
          )}
          {stage === "processing" && (
            <button style={{ ...S.btn("outline"), opacity: 0.5, cursor: "not-allowed" }} disabled>Processing — please wait…</button>
          )}
          {stage === "done" && (
            <button style={S.btn("primary")} onClick={onClose}><Icon n="check" size={15} />Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
