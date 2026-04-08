// ─── SEARCH TAB ───────────────────────────────────────────────────────────────

import { useState } from "react";
import { C, S } from "../constants";
import { apiFetch, fmtDate, openSimilarWindow } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import { Pagination, StarBtn, CandidateCard } from "../components/Pagination";

export default function SearchTab({ onViewCandidate }) {
  const isMobile = useIsMobile();

  const [name, setName]               = useState("");
  const [skillInput, setSkillInput]   = useState("");
  const [skills, setSkills]           = useState([]);
  const [skillMatch, setSkillMatch]   = useState("OR");
  const [location, setLocation]       = useState("");
  const [company, setCompany]         = useState("");
  const [minExp, setMinExp]           = useState("");
  const [maxExp, setMaxExp]           = useState("");
  const [leadership, setLeadership]   = useState("");
  const [gender, setGender]           = useState("");
  const [minCtc, setMinCtc]           = useState("");
  const [maxCtc, setMaxCtc]           = useState("");
  const [sortBy, setSortBy]           = useState("newest");
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [educationLevel, setEducationLevel]   = useState("");
  const [tier1Only, setTier1Only]     = useState(false);
  const [companyType, setCompanyType] = useState("");
  const [workType, setWorkType]       = useState("");
  const [maxNotice, setMaxNotice]     = useState("");
  const [trajectory, setTrajectory]   = useState("");
  const [minAge, setMinAge]           = useState("");
  const [maxAge, setMaxAge]           = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage]               = useState(1);
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const [starredIds, setStarredIds]   = useState(new Set());

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(p => [...p, s]);
    setSkillInput("");
  };

  const buildBody = (p) => ({
    name: name || null, skill_keywords: skills, skill_match: skillMatch,
    location: location || null, company: company || null,
    min_experience: minExp ? parseFloat(minExp) : null,
    max_experience: maxExp ? parseFloat(maxExp) : null,
    is_leadership: leadership === "" ? null : leadership === "true",
    gender: gender || null,
    min_ctc: minCtc ? parseFloat(minCtc) : null,
    max_ctc: maxCtc ? parseFloat(maxCtc) : null,
    sort_by: sortBy, shortlisted_only: shortlistedOnly,
    page: p || page, page_size: 25,
    highest_education_level: educationLevel || null,
    tier1_institute: tier1Only ? true : null,
    current_company_type: companyType || null,
    current_work_type: workType || null,
    max_notice_period: maxNotice ? parseInt(maxNotice) : null,
    career_trajectory: trajectory || null,
    min_age: minAge ? parseInt(minAge) : null,
    max_age: maxAge ? parseInt(maxAge) : null,
  });

  const search = async (p = 1) => {
    setLoading(true); setSearched(true); setPage(p);
    try {
      const res  = await apiFetch("/api/v1/candidates/search", { method: "POST", body: JSON.stringify(buildBody(p)) });
      const json = await res.json();
      setData(json);
      const ns = new Set(starredIds);
      (json.results || []).forEach(c => { if (c.is_shortlisted) ns.add(c.id); });
      setStarredIds(ns);
    } catch { setData(null); } finally { setLoading(false); }
  };

  const toggleStar = (id) => setStarredIds(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const reset = () => {
    setName(""); setSkills([]); setSkillInput(""); setLocation(""); setCompany("");
    setMinExp(""); setMaxExp(""); setLeadership(""); setGender(""); setMinCtc(""); setMaxCtc("");
    setSortBy("newest"); setShortlistedOnly(false); setEducationLevel(""); setTier1Only(false);
    setCompanyType(""); setWorkType(""); setMaxNotice(""); setTrajectory("");
    setMinAge(""); setMaxAge(""); setData(null); setSearched(false); setPage(1);
  };

  const viewProfile = async (c) => {
    try { const res = await apiFetch(`/api/v1/candidates/${c.id}`); onViewCandidate(await res.json()); }
    catch { onViewCandidate(c); }
  };

  const results       = data?.results || [];
  const advancedCount = [educationLevel, companyType, workType, trajectory, maxNotice,
    tier1Only, minAge, maxAge, gender, leadership, minCtc, maxCtc]
    .filter(v => v !== "" && v !== false).length;

  return (
    <div>
      {!isMobile && (
        <>
          <div style={S.pageTitle}>Search Candidates</div>
          <div style={S.pageSub}>Combine any filters · Partial match on name, skills and company</div>
        </>
      )}

      <div style={isMobile ? S.cardMobile : S.card}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <div>
            <label style={S.label}>Name</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...S.input, paddingLeft: "36px" }} placeholder="Full or partial name"
                value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && search()} />
              <Icon n="person_search" size={15} color={C.muted}
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <div>
            <label style={S.label}>Location</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...S.input, paddingLeft: "36px" }} placeholder="e.g. Mumbai, Delhi"
                value={location} onChange={e => setLocation(e.target.value)} />
              <Icon n="location_on" size={15} color={C.muted}
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ ...S.label, marginBottom: 0 }}>Skills</label>
              <div style={{ display: "flex", gap: "2px", backgroundColor: C.surface, borderRadius: "7px", padding: "2px" }}>
                {["OR", "AND"].map(m => (
                  <button key={m} onClick={() => setSkillMatch(m)}
                    style={{ padding: "3px 9px", borderRadius: "5px", cursor: "pointer", fontSize: "11px",
                      fontWeight: "700", border: "none", transition: "all 0.15s",
                      backgroundColor: skillMatch === m ? C.primary : "transparent",
                      color: skillMatch === m ? "#fff" : C.muted }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "7px" }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Type skill + Enter"
                value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSkill()} />
              <button style={S.btn("outline", true)} onClick={addSkill}><Icon n="add" size={14} /></button>
            </div>
            {skills.length > 0 && (
              <div style={{ marginTop: "7px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {skills.map((s, i) => (
                  <span key={i} style={{ ...S.tag, cursor: "pointer" }}
                    onClick={() => setSkills(p => p.filter((_, j) => j !== i))}>{s} ×</span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={S.label}>Experience Range (years)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={S.input} type="number" placeholder="Min" value={minExp} onChange={e => setMinExp(e.target.value)} />
              <input style={S.input} type="number" placeholder="Max" value={maxExp} onChange={e => setMaxExp(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={() => setShowAdvanced(s => !s)}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none",
            border: `1px dashed ${C.borderMid}`, borderRadius: "8px", padding: "7px 14px",
            cursor: "pointer", fontSize: "12px", fontWeight: "600",
            color: showAdvanced ? C.primary : C.muted, width: "100%", justifyContent: "center",
            backgroundColor: showAdvanced ? C.primaryDim : "transparent", transition: "all 0.15s", marginBottom: "14px" }}>
          <Icon n={showAdvanced ? "keyboard_arrow_up" : "tune"} size={15} />
          {showAdvanced ? "Hide" : "Advanced Filters"}
          {!showAdvanced && advancedCount > 0 && (
            <span style={{ backgroundColor: C.primary, color: "#fff", borderRadius: "20px",
              padding: "1px 7px", fontSize: "10px", fontWeight: "700" }}>{advancedCount}</span>
          )}
        </button>

        {showAdvanced && (
          <div className="fade-up" style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
              <div><label style={S.label}>Company</label><input style={S.input} placeholder="e.g. Tata" value={company} onChange={e => setCompany(e.target.value)} /></div>
              <div><label style={S.label}>CTC Range (L)</label><div style={{ display: "flex", gap: "6px" }}><input style={S.input} type="number" placeholder="Min" value={minCtc} onChange={e => setMinCtc(e.target.value)} /><input style={S.input} type="number" placeholder="Max" value={maxCtc} onChange={e => setMaxCtc(e.target.value)} /></div></div>
              <div><label style={S.label}>Age Range</label><div style={{ display: "flex", gap: "6px" }}><input style={S.input} type="number" placeholder="Min" value={minAge} onChange={e => setMinAge(e.target.value)} /><input style={S.input} type="number" placeholder="Max" value={maxAge} onChange={e => setMaxAge(e.target.value)} /></div></div>
              <div><label style={S.label}>Max Notice (days)</label><input style={S.input} type="number" placeholder="e.g. 30" value={maxNotice} onChange={e => setMaxNotice(e.target.value)} /></div>
              <div><label style={S.label}>Education Level</label>
                <select style={S.select} value={educationLevel} onChange={e => setEducationLevel(e.target.value)}>
                  <option value="">Any</option><option value="phd">PhD</option>
                  <option value="post_graduate">Post Graduate</option><option value="graduate">Graduate</option>
                  <option value="high_school">High School</option>
                </select>
              </div>
              <div><label style={S.label}>Company Type</label>
                <select style={S.select} value={companyType} onChange={e => setCompanyType(e.target.value)}>
                  <option value="">Any</option><option value="mnc">MNC</option><option value="startup">Startup</option>
                  <option value="consulting">Consulting</option><option value="product">Product Co.</option>
                  <option value="govt">Govt / PSU</option><option value="ngo">NGO</option>
                </select>
              </div>
              <div><label style={S.label}>Work Type</label>
                <select style={S.select} value={workType} onChange={e => setWorkType(e.target.value)}>
                  <option value="">Any</option><option value="full_time">Full-time</option>
                  <option value="contract">Contract</option><option value="freelance">Freelance</option>
                  <option value="part_time">Part-time</option>
                </select>
              </div>
              <div><label style={S.label}>Career Trajectory</label>
                <select style={S.select} value={trajectory} onChange={e => setTrajectory(e.target.value)}>
                  <option value="">Any</option><option value="ascending">Ascending</option>
                  <option value="lateral">Lateral</option><option value="descending">Descending</option>
                </select>
              </div>
              <div><label style={S.label}>Level</label>
                <select style={S.select} value={leadership} onChange={e => setLeadership(e.target.value)}>
                  <option value="">All</option><option value="true">Leadership</option><option value="false">Non-Leadership</option>
                </select>
              </div>
              <div><label style={S.label}>Gender</label>
                <select style={S.select} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">All</option><option value="M">Male</option><option value="F">Female</option>
                </select>
              </div>
              <div><label style={S.label}>Sort By</label>
                <select style={S.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option><option value="oldest">Oldest First</option>
                  <option value="experience_desc">Most Experienced</option><option value="experience_asc">Least Experienced</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px",
                color: shortlistedOnly ? "#f59e0b" : C.muted, fontWeight: shortlistedOnly ? "600" : "400" }}>
                <input type="checkbox" checked={shortlistedOnly} onChange={e => setShortlistedOnly(e.target.checked)}
                  style={{ accentColor: "#f59e0b", width: "14px", height: "14px" }} />★ Shortlisted only
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px",
                color: tier1Only ? C.primary : C.muted, fontWeight: tier1Only ? "600" : "400" }}>
                <input type="checkbox" checked={tier1Only} onChange={e => setTier1Only(e.target.checked)}
                  style={{ accentColor: C.primary, width: "14px", height: "14px" }} />Tier 1 Institute only
              </label>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: `1px solid ${C.border}`, paddingTop: "14px", marginTop: "4px" }}>
          <button style={S.btn("outline")} onClick={reset}><Icon n="refresh" size={14} />Reset</button>
          <button style={{ ...S.btn("primary"), padding: "10px 28px", fontSize: "14px" }}
            onClick={() => search(1)} disabled={loading}>
            <Icon n="search" size={15} />{loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {searched && (
        <div style={isMobile ? {} : S.card}>
          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: C.muted }}>
              <Icon n="manage_search" size={44} color={C.border} style={{ display: "block", margin: "0 auto 14px" }} />
              <div style={{ fontSize: "15px", fontWeight: "600" }}>No results found</div>
              <div style={{ fontSize: "13px", marginTop: "5px" }}>Try adjusting your filters</div>
            </div>
          ) : isMobile ? (
            <div>
              <div style={{ fontSize: "12px", color: C.muted, marginBottom: "12px", padding: "0 2px" }}>
                <strong style={{ color: C.text }}>{data.total?.toLocaleString()}</strong> candidates found
              </div>
              {results.map((c, i) => (
                <CandidateCard key={i} c={c} isStarred={starredIds.has(c.id)}
                  onToggleStar={toggleStar} onView={viewProfile} />
              ))}
              <Pagination page={data.page} totalPages={data.total_pages} onChange={p => search(p)} />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "13px", color: C.muted }}>
                  <strong style={{ color: C.text }}>{data.total?.toLocaleString()}</strong> candidates · page {data.page} of {data.total_pages}
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>{["", "Name", "Designation", "Exp", "Location", "Company", "Skills", "CTC", "Added", ""].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {results.map((c, i) => {
                      const isStarred = starredIds.has(c.id);
                      return (
                        <tr key={i} style={{ backgroundColor: isStarred ? "rgba(245,158,11,0.04)" : "" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = isStarred ? "rgba(245,158,11,0.08)" : C.surface}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = isStarred ? "rgba(245,158,11,0.04)" : ""}>
                          <td style={{ ...S.td, padding: "8px 4px 8px 12px" }}>
                            <StarBtn candidateId={c.id} starred={isStarred} onToggle={toggleStar} />
                          </td>
                          <td style={{ ...S.td, maxWidth: "200px" }}>
                            <div style={{ fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || "—"}</div>
                            <div style={{ fontSize: "11px", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email || ""}</div>
                          </td>
                          <td style={{ ...S.td, fontSize: "12px", color: C.textMid, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.current_designation || "—"}</td>
                          <td style={{ ...S.td, fontSize: "12px", color: C.primary, fontWeight: "600", whiteSpace: "nowrap" }}>{c.total_experience != null ? `${c.total_experience}y` : "—"}</td>
                          <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.location || "—"}</td>
                          <td style={{ ...S.td, fontSize: "12px", color: C.muted, maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(c.metadata_json?.companies || []).slice(0, 1).join("") || "—"}</td>
                          <td style={S.td}>{(c.skills || []).slice(0, 2).map((s, j) => <span key={j} style={S.tag}>{s}</span>)}{(c.skills || []).length > 2 && <span style={{ fontSize: "11px", color: C.muted }}> +{c.skills.length - 2}</span>}</td>
                          <td style={{ ...S.td, fontSize: "12px", whiteSpace: "nowrap" }}>{c.current_ctc ? `${c.current_ctc}L` : "—"}</td>
                          <td style={{ ...S.td, fontSize: "11px", color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(c.created_at)}</td>
                          <td style={S.td}>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button style={S.btn("outline", true)} onClick={() => viewProfile(c)}>View</button>
                              <button className="similar-btn" style={S.btn("similar", true)}
                                onClick={() => openSimilarWindow(c)}>
                                <Icon n="hub" size={12} />Similar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={data.page} totalPages={data.total_pages} onChange={p => search(p)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
