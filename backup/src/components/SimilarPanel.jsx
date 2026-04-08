// ─── SIMILAR PANEL (opens in new window via hash routing) ────────────────────
// Also includes SimilarLoader animation

import { useState, useEffect } from "react";
import { C, S, fontH, fontB, font, DEFAULT_WEIGHTS } from "../constants";
import { apiFetch } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "./Icon";
import { Pagination } from "./Pagination";
import { ScorePill } from "./ScorePills";
import { WeightSliders } from "./WeightSliders";
import ProfileModal from "./ProfileModal";

// ─── LOADING ANIMATION ────────────────────────────────────────────────────────

function SimilarLoader() {
  const messages = ["Scanning candidate profiles…", "Computing semantic similarity…", "Ranking by skill overlap…", "Finalising matches…"];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px" }}>
      <div style={{ position: "relative", width: "56px", height: "56px", marginBottom: "28px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.border}` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid transparent`,
          borderTopColor: C.similar, borderRightColor: C.similar,
          animation: "spin 1s cubic-bezier(0.4,0,0.2,1) infinite" }} />
        <div style={{ position: "absolute", inset: "12px", borderRadius: "50%", backgroundColor: C.similarLight,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="hub" size={16} color={C.similar} />
        </div>
      </div>
      <div className="dot-wave" style={{ color: C.similar, marginBottom: "16px", height: "16px", display: "flex", alignItems: "center" }}>
        <span /><span /><span />
      </div>
      <div key={msgIdx} style={{ fontSize: "13px", color: C.muted, fontWeight: "500", animation: "fadeUp 0.4s ease forwards" }}>
        {messages[msgIdx]}
      </div>
    </div>
  );
}

// ─── SIMILAR PANEL ────────────────────────────────────────────────────────────

export default function SimilarPanel({ seedId, seedName }) {
  const isMobile = useIsMobile();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ min_experience: "", max_experience: "", location: "" });
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });

  const search = async (p = 1) => {
    setLoading(true);
    try {
      const body = { page: p };
      if (filters.min_experience) body.min_experience = parseFloat(filters.min_experience);
      if (filters.max_experience) body.max_experience = parseFloat(filters.max_experience);
      if (filters.location)       body.location = filters.location;
      body.vector_weight     = weights.vector / 100;
      body.skill_weight      = weights.skill / 100;
      body.experience_weight = weights.experience / 100;
      const res = await apiFetch(`/api/v1/candidates/${seedId}/similar`, { method: "POST", body: JSON.stringify(body) });
      setData(await res.json());
      setPage(p);
    } catch { setData(null); } finally { setLoading(false); }
  };

  useEffect(() => { search(1); }, []);

  const viewProfile = async (c) => {
    try { const res = await apiFetch(`/api/v1/candidates/${c.id}`); setSelected(await res.json()); }
    catch { setSelected(c); }
  };

  const handleReset = () => {
    const resetFilters = { min_experience: "", max_experience: "", location: "" };
    setFilters(resetFilters);
    setWeights({ ...DEFAULT_WEIGHTS });
    setLoading(true);
    apiFetch(`/api/v1/candidates/${seedId}/similar`, {
      method: "POST",
      body: JSON.stringify({ page: 1, vector_weight: 0.6, skill_weight: 0.3, experience_weight: 0.1 }),
    }).then(r => r.json()).then(d => { setData(d); setPage(1); }).catch(() => setData(null)).finally(() => setLoading(false));
  };

  const weightsChanged = weights.vector !== DEFAULT_WEIGHTS.vector ||
    weights.skill !== DEFAULT_WEIGHTS.skill ||
    weights.experience !== DEFAULT_WEIGHTS.experience;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: fontB }}>
      {/* Header */}
      <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: "14px",
        background: `linear-gradient(135deg, ${C.similar} 0%, #b45309 100%)` }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="hub" size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", fontFamily: fontH }}>Similar to: {seedName}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>Ranked by ATRIOS Talint · skill overlap · experience match</div>
        </div>
        {data && !loading && (
          <div style={{ marginLeft: "auto", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px",
            padding: "6px 14px", fontSize: "13px", fontWeight: "700", color: "#fff" }}>
            {data.total} matches
          </div>
        )}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Filters card */}
        <div style={{ ...S.card, marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "4px" }}>
            <div style={{ flex: "1", minWidth: "140px" }}>
              <label style={S.label}>Location contains</label>
              <input style={S.input} placeholder="e.g. Delhi, Mumbai" value={filters.location}
                onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && search(1)} />
            </div>
            <div style={{ flex: "1", minWidth: "100px" }}>
              <label style={S.label}>Min Experience (yrs)</label>
              <input style={S.input} type="number" placeholder="e.g. 8" value={filters.min_experience}
                onChange={e => setFilters(p => ({ ...p, min_experience: e.target.value }))} />
            </div>
            <div style={{ flex: "1", minWidth: "100px" }}>
              <label style={S.label}>Max Experience (yrs)</label>
              <input style={S.input} type="number" placeholder="e.g. 20" value={filters.max_experience}
                onChange={e => setFilters(p => ({ ...p, max_experience: e.target.value }))} />
            </div>
            <button style={{ ...S.btn("similar"), padding: "9px 20px" }} onClick={() => search(1)} disabled={loading}>
              <Icon n="filter_list" size={14} />{loading ? "Working…" : weightsChanged ? "Apply ✦" : "Apply"}
            </button>
            <button style={S.btn("outline")} onClick={handleReset} disabled={loading}>
              <Icon n="refresh" size={14} />Reset
            </button>
          </div>
          <WeightSliders weights={weights} onChange={setWeights} />
        </div>

        {/* Results */}
        {loading ? (
          <SimilarLoader />
        ) : !data || data.total === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
            <Icon n="hub" size={44} color={C.border} style={{ display: "block", margin: "0 auto 14px" }} />
            <div style={{ fontSize: "15px", fontWeight: "600", fontFamily: fontH }}>No similar candidates found</div>
            <div style={{ fontSize: "13px", marginTop: "5px" }}>Try relaxing the filters or adjusting weights</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>{["Match","Name","Designation","Exp","Location","Skills","Score Breakdown",""].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {(data.results || []).map((c, i) => (
                    <tr key={i}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                      <td style={{ ...S.td, width: "60px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <div style={{ fontSize: "17px", fontWeight: "800", fontFamily: fontH,
                            color: c.similarity_score >= 0.6 ? C.success : c.similarity_score >= 0.45 ? C.similar : C.muted }}>
                            {Math.round(c.similarity_score * 100)}
                          </div>
                          <div style={{ fontSize: "9px", color: C.muted, fontWeight: "700", textTransform: "uppercase" }}>match</div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <div style={{ fontWeight: "700", fontFamily: fontH, fontSize: "13px" }}>{c.name || "—"}</div>
                        <div style={{ fontSize: "11px", color: C.muted }}>{c.current_company || ""}</div>
                      </td>
                      <td style={{ ...S.td, fontSize: "12px", color: C.textMid, maxWidth: "160px" }}>{c.current_designation || "—"}</td>
                      <td style={{ ...S.td, fontFamily: font, fontSize: "12px", color: C.primary, fontWeight: "600", whiteSpace: "nowrap" }}>
                        {c.total_experience != null ? `${c.total_experience}y` : "—"}
                        {c.experience_delta != null && c.experience_delta > 0 && (
                          <div style={{ fontSize: "10px", color: C.muted }}>Δ{c.experience_delta}y</div>
                        )}
                      </td>
                      <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.location || "—"}</td>
                      <td style={S.td}>
                        {(c.matching_skills || []).length > 0 ? (
                          <div>
                            {c.matching_skills.slice(0, 2).map((s, j) => (
                              <span key={j} style={{ ...S.tag, backgroundColor: C.successLight, color: C.success, border: "1px solid rgba(59,178,115,0.2)" }}>{s}</span>
                            ))}
                            {c.matching_skills.length > 2 && <span style={{ fontSize: "10px", color: C.muted }}> +{c.matching_skills.length - 2}</span>}
                          </div>
                        ) : <span style={{ fontSize: "12px", color: C.muted }}>—</span>}
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          <ScorePill label="Sem"  value={c.vector_score}     color={C.primary} />
                          <ScorePill label="Skill" value={c.skill_score}      color={C.success} />
                          <ScorePill label="Exp"  value={c.experience_score} color={C.similar} />
                        </div>
                      </td>
                      <td style={S.td}>
                        <button style={S.btn("outline", true)} onClick={() => viewProfile(c)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.total_pages} onChange={p => search(p)} />
          </>
        )}
      </div>
      {selected && <ProfileModal candidate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
