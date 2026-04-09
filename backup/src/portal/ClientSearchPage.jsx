import { useState, useEffect, useCallback } from "react";
import { C, S, fontH } from "../constants";
import { apiFetch } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";
import { clientSourceBadge } from "./ClientComponents";

// ─── Skill tag input ──────────────────────────────────────────────────────────
function SkillTagInput({ skills, onChange }) {
  const [input, setInput] = useState("");

  const addSkill = (value) => {
    const trimmed = value.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setInput("");
  };

  const removeSkill = (skill) => onChange(skills.filter(s => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === "Backspace" && !input && skills.length) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: "8px",
      padding: "6px 8px",
      backgroundColor: C.surface,
      minHeight: "38px",
      display: "flex",
      flexWrap: "wrap",
      gap: "5px",
      alignItems: "center",
      cursor: "text",
    }}
      onClick={() => document.getElementById("skill-input-field").focus()}
    >
      {skills.map(skill => (
        <span key={skill} style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          fontSize: "12px", padding: "2px 8px", borderRadius: "20px",
          backgroundColor: "rgba(98,100,244,0.10)", color: C.primary,
          fontWeight: "600",
        }}>
          {skill}
          <span
            onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
            style={{ cursor: "pointer", opacity: 0.7, fontSize: "14px", lineHeight: 1 }}
          >×</span>
        </span>
      ))}
      <input
        id="skill-input-field"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addSkill(input); }}
        placeholder={skills.length ? "" : "Type a skill, press Enter…"}
        style={{
          border: "none", outline: "none", background: "transparent",
          fontSize: "13px", color: C.text, flex: 1, minWidth: "120px",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "rgba(98,100,244,0.12)",  color: C.primary   },
  { bg: "rgba(59,178,115,0.12)",  color: "#2a8a5e"   },
  { bg: "rgba(217,119,6,0.12)",   color: "#92400E"   },
  { bg: "rgba(14,165,233,0.12)",  color: "#0369a1"   },
  { bg: "rgba(236,72,153,0.12)",  color: "#9d174d"   },
];

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const idx = (name || "").charCodeAt(0) % AVATAR_COLORS.length;
  const { bg, color } = AVATAR_COLORS[idx];
  return (
    <div style={{
      width: "40px", height: "40px", borderRadius: "50%",
      backgroundColor: bg, color, fontWeight: "700",
      fontSize: "13px", display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0, fontFamily: fontH,
    }}>
      {initials}
    </div>
  );
}

// ─── Candidate result card ────────────────────────────────────────────────────
function CandidateCard({ c }) {
  const badge = clientSourceBadge(c.source);

  return (
    <div style={{
      backgroundColor: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: "12px",
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      transition: "border-color 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderMid}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <Avatar name={c.name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + designation */}
        <div style={{ fontWeight: "700", fontSize: "14px", fontFamily: fontH,
          color: C.text, marginBottom: "1px" }}>
          {c.name || "—"}
        </div>
        <div style={{ fontSize: "12px", color: C.muted, marginBottom: "8px" }}>
          {[c.current_designation, c.current_company].filter(Boolean).join(" · ") || "—"}
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px",
          flexWrap: "wrap", marginBottom: "8px" }}>
          {c.location && (
            <span style={{ fontSize: "12px", color: C.muted,
              display: "flex", alignItems: "center", gap: "3px" }}>
              <Icon n="location_on" size={12} />
              {c.location}
            </span>
          )}
          {c.total_experience != null && (
            <span style={{ fontSize: "12px", color: C.muted,
              display: "flex", alignItems: "center", gap: "3px" }}>
              <Icon n="work_history" size={12} />
              {c.total_experience} yrs
            </span>
          )}
          <span style={S.badge(badge.type)}>{badge.label}</span>
        </div>

        {/* Project pills */}
        {c.projects && c.projects.length > 0 && (
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {c.projects.map(proj => (
              <span key={proj} style={{
                fontSize: "11px", padding: "2px 9px", borderRadius: "20px",
                background: C.surface, border: `1px solid ${C.border}`,
                color: C.muted,
              }}>
                {proj}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* View CV */}
      <div style={{ flexShrink: 0 }}>
        {c.cv_storage_url ? (
          <a
            href={c.cv_storage_url}
            target="_blank"
            rel="noreferrer"
            style={{
              ...S.btn("outline", true),
              fontSize: "12px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Icon n="open_in_new" size={12} />View CV
          </a>
        ) : (
          <span style={{ fontSize: "12px", color: C.muted }}>No CV</span>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 0", color: C.muted }}>
      <Icon n="search_off" size={40} color={C.border}
        style={{ display: "block", margin: "0 auto 12px" }} />
      <div style={{ fontSize: "14px", fontWeight: "600", fontFamily: fontH,
        color: C.text, marginBottom: "6px" }}>
        {hasFilters ? "No candidates match your filters" : "No candidates found"}
      </div>
      <div style={{ fontSize: "13px" }}>
        {hasFilters
          ? "Try adjusting your search or clearing some filters."
          : "Candidates will appear here once your mandates have applicants."}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ClientSearchPage({ projects }) {
  const isMobile = useIsMobile();

  // Filter state
  const [q,             setQ]             = useState("");
  const [skills,        setSkills]        = useState([]);
  const [location,      setLocation]      = useState("");
  const [minExp,        setMinExp]        = useState("");
  const [maxExp,        setMaxExp]        = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  // Results state
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const hasFilters = !!(q || skills.length || location || minExp || maxExp || projectFilter);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q)             params.set("q", q);
      if (skills.length) params.set("skills", skills.join(","));
      if (location)      params.set("location", location);
      if (minExp)        params.set("min_experience", minExp);
      if (maxExp)        params.set("max_experience", maxExp);
      if (projectFilter) params.set("project_id", projectFilter);

      const res  = await apiFetch(`/api/v1/client/candidates/search?${params}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (_) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q, skills, location, minExp, maxExp, projectFilter]);

  // Auto-search when filters change (debounced 400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [runSearch]);

  // Initial load — fetch all on mount
  useEffect(() => { runSearch(); }, []); // eslint-disable-line

  const clearAll = () => {
    setQ(""); setSkills([]); setLocation("");
    setMinExp(""); setMaxExp(""); setProjectFilter("");
  };

  const filterPanel = (
    <div style={{
      backgroundColor: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: "14px",
      padding: "16px",
    }}>
      {/* Name search */}
      <div style={{ marginBottom: "16px" }}>
        <div style={S.label}>Name</div>
        <div style={{ position: "relative" }}>
          <Icon n="search" size={14} style={{
            position: "absolute", left: "10px", top: "50%",
            transform: "translateY(-50%)", color: C.muted, pointerEvents: "none",
          }} />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name…"
            style={{ paddingLeft: "32px", width: "100%", fontSize: "13px" }}
          />
        </div>
      </div>

      <div style={{ height: "0.5px", background: C.border, margin: "0 0 16px" }} />

      {/* Skills */}
      <div style={{ marginBottom: "16px" }}>
        <div style={S.label}>Skills</div>
        <SkillTagInput skills={skills} onChange={setSkills} />
        <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px" }}>
          Press Enter to add a skill
        </div>
      </div>

      <div style={{ height: "0.5px", background: C.border, margin: "0 0 16px" }} />

      {/* Location */}
      <div style={{ marginBottom: "16px" }}>
        <div style={S.label}>Location</div>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ width: "100%", fontSize: "13px" }}
        >
          <option value="">Any location</option>
          <option>Mumbai</option>
          <option>Bengaluru</option>
          <option>Delhi NCR</option>
          <option>Pune</option>
          <option>Hyderabad</option>
          <option>Chennai</option>
          <option>Kolkata</option>
        </select>
      </div>

      <div style={{ height: "0.5px", background: C.border, margin: "0 0 16px" }} />

      {/* Experience */}
      <div style={{ marginBottom: "16px" }}>
        <div style={S.label}>Experience (years)</div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="number" min="0" max="40"
            value={minExp}
            onChange={e => setMinExp(e.target.value)}
            placeholder="Min"
            style={{ flex: 1, fontSize: "13px" }}
          />
          <span style={{ fontSize: "12px", color: C.muted }}>–</span>
          <input
            type="number" min="0" max="40"
            value={maxExp}
            onChange={e => setMaxExp(e.target.value)}
            placeholder="Max"
            style={{ flex: 1, fontSize: "13px" }}
          />
        </div>
      </div>

      {/* Mandate filter — only if client has multiple projects */}
      {projects && projects.length > 1 && (
        <>
          <div style={{ height: "0.5px", background: C.border, margin: "0 0 16px" }} />
          <div style={{ marginBottom: "16px" }}>
            <div style={S.label}>Mandate</div>
            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              style={{ width: "100%", fontSize: "13px" }}
            >
              <option value="">All mandates</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {hasFilters && (
        <>
          <div style={{ height: "0.5px", background: C.border, margin: "0 0 12px" }} />
          <button
            onClick={clearAll}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "12px", color: C.muted, padding: 0,
              fontFamily: "inherit",
            }}
          >
            Clear all filters
          </button>
        </>
      )}
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={S.pageTitle}>Search Candidates</div>
        <div style={{ ...S.pageSub, marginTop: "4px" }}>
          Searching across all your active mandates
        </div>
      </div>

      {isMobile ? (
        // Mobile: stacked layout
        <div>
          {filterPanel}
          <div style={{ height: "16px" }} />
          <ResultsArea
            loading={loading}
            results={results}
            searched={searched}
            hasFilters={hasFilters}
          />
        </div>
      ) : (
        // Desktop: side-by-side
        <div style={{
          display: "grid",
          gridTemplateColumns: "236px minmax(0,1fr)",
          gap: "16px",
          alignItems: "start",
        }}>
          {filterPanel}
          <ResultsArea
            loading={loading}
            results={results}
            searched={searched}
            hasFilters={hasFilters}
          />
        </div>
      )}
    </div>
  );
}

// ─── Results area (extracted for reuse in both layouts) ───────────────────────
function ResultsArea({ loading, results, searched, hasFilters }) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
        <div style={{
          width: "26px", height: "26px",
          border: `3px solid ${C.primary}`,
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 12px",
        }} />
        Searching…
      </div>
    );
  }

  if (searched && results.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  if (!searched) return null;

  return (
    <div>
      {/* Result count */}
      <div style={{
        fontSize: "13px", color: C.muted,
        marginBottom: "12px",
      }}>
        <span style={{ fontWeight: "600", color: C.text }}>{results.length}</span>
        {" "}candidate{results.length !== 1 ? "s" : ""} found
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {results.map(c => (
          <CandidateCard key={c.candidate_id} c={c} />
        ))}
      </div>
    </div>
  );
}
