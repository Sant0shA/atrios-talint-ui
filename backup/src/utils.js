// ─── UTILS ────────────────────────────────────────────────────────────────────
// Pure utility functions — no React, no JSX
// Import these wherever needed

import { API, getToken, clearAuth } from './constants';

// ─── API FETCH ────────────────────────────────────────────────────────────────

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 401) { clearAuth(); window.location.reload(); }
  return res;
};

// ─── DATE FORMATTERS ─────────────────────────────────────────────────────────

export const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

// ─── PASSWORD UTILS ───────────────────────────────────────────────────────────

export const pwChecks = (v) => [
  { label: "At least 8 characters",            met: v.length >= 8 },
  { label: "One uppercase letter",              met: /[A-Z]/.test(v) },
  { label: "One lowercase letter",              met: /[a-z]/.test(v) },
  { label: "One number",                        met: /[0-9]/.test(v) },
  { label: "One special character (!@#$...)",   met: /[^A-Za-z0-9]/.test(v) },
];

export const pwValid = (v) => pwChecks(v).every(c => c.met);

// ─── LABEL HELPERS ────────────────────────────────────────────────────────────

export const companyTypeLabel = (v) =>
  ({ mnc: "MNC", startup: "Startup", consulting: "Consulting", product: "Product Co.",
     govt: "Govt / PSU", ngo: "NGO", unknown: null })[v] || null;

export const workTypeLabel = (v) =>
  ({ full_time: "Full-time", contract: "Contract", freelance: "Freelance",
     part_time: "Part-time", unknown: null })[v] || null;

export const trajectoryLabel = (v) =>
  ({ ascending: "Ascending", lateral: "Lateral", descending: "Descending", unknown: null })[v] || null;

export const educationLabel = (v) =>
  ({ phd: "PhD", post_graduate: "Post Graduate", graduate: "Graduate",
     high_school: "High School", unknown: null })[v] || null;

// ─── SIMILAR WINDOW ───────────────────────────────────────────────────────────
// Opens the similar candidates panel in a new browser window
// Used in: SearchTab, ProjectDetailPage, ProfileModal

export const openSimilarWindow = (candidate) => {
  const params = new URLSearchParams({
    seed_id:   candidate.id,
    seed_name: candidate.name || "Unknown",
    token:     getToken() || "",
  });
  const url = `${window.location.origin}${window.location.pathname}#similar?${params.toString()}`;
  window.open(url, `similar_${candidate.id}`, "width=1100,height=800,scrollbars=yes,resizable=yes");
};

// ─── GUIDE TEMPLATE ───────────────────────────────────────────────────────────
// Used in CreateProjectModal → InlineGuide

export const GUIDE_TEMPLATE =
  `#min_exp:3  #max_exp:8\n#fundraising #donor management #grant writing #stakeholder engagement\n\n// To override sector: #company_type:ngo`;

// ─── HASHTAG PARSER ───────────────────────────────────────────────────────────
// Used in CreateProjectModal and ParseReviewModal

export const parseHashtagsFromNote = (note, sectorMap) => {
  const result = { company_type: null, min_exp: null, max_exp: null, skills: [] };
  if (!note) return result;

  const kvPattern = /#(company_type|min_exp|max_exp)\s*:\s*([^\s#]+)/gi;
  let cleaned = note;
  const validTypes = sectorMap || {};
  let m;

  while ((m = kvPattern.exec(note)) !== null) {
    const key = m[1].toLowerCase();
    const val = m[2].trim().toLowerCase();
    if (key === "company_type") {
      if (validTypes[val]) result.company_type = val;
    } else if (key === "min_exp") {
      const n = parseInt(val);
      if (!isNaN(n)) result.min_exp = n;
    } else if (key === "max_exp") {
      const n = parseInt(val);
      if (!isNaN(n)) result.max_exp = n;
    }
    cleaned = cleaned.replace(m[0], "");
  }

  const skillPattern = /#([^#\n]+)/g;
  while ((m = skillPattern.exec(cleaned)) !== null) {
    const skill = m[1].trim().replace(/[.,;:!?]+$/, "").trim();
    if (skill && skill.length >= 2) result.skills.push(skill.toLowerCase());
  }

  return result;
};

// ─── DOMAIN TIER LABEL ────────────────────────────────────────────────────────
// Used in SimilarPanel, ProjectDetailPage score breakdown tooltip

export const domainTierLabel = (score) => {
  if (score == null)              return null;
  if (score >= 1.0)               return { label: "Ideal · Sub-domain",    color: "#3B6D11", bg: "#EAF3DE" };
  if (score >= 0.90)              return { label: "Ideal · Also-relevant", color: "#3B6D11", bg: "#EAF3DE" };
  if (score >= 0.70)              return { label: "Ideal · Broad sector",  color: "#3B6D11", bg: "#EAF3DE" };
  if (score >= 0.55)              return { label: "Accept · Sub-domain",   color: "#185FA5", bg: "#E6F1FB" };
  if (score >= 0.45)              return { label: "Acceptable",            color: "#185FA5", bg: "#E6F1FB" };
  if (score >= 0.35)              return { label: "Acceptable · Weak",     color: "#854F0B", bg: "#FAEEDA" };
  return                                 { label: "No domain match",       color: "#A32D2D", bg: "#FCEBEB" };
};
