// ─── HIRING BRIEF FLOW ────────────────────────────────────────────────────────
// Full-screen 7-step wizard that builds a structured hiring brief
// Props: { jobTitle, jdText, parsedSkills, onComplete, onCancel }
// onComplete called with: { structured, generated_brief, recruiter_note, client_note }

import { useState } from "react";
import { C, S, fontH, fontB } from "../constants";
import { apiFetch } from "../utils";
import { useIsMobile } from "../hooks";
import Icon from "../components/Icon";

export default function HiringBriefFlow({ jobTitle, jdText, parsedSkills = [], onComplete, onCancel }) {
  const isMobile = useIsMobile();

  const [step,          setStep]          = useState(0);
  const [generating,    setGenerating]    = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState("");
  const [recruiterNote, setRecruiterNote] = useState("");
  const [genError,      setGenError]      = useState("");

  const [ans, setAns] = useState({
    exp_min: "", exp_max: "", exp_flexible: false,
    domain_ideal: [], domain_acceptable: [], domain_reject: "",
    target_companies: "",
    ideal_sub_domain_primary: "", ideal_sub_domain_also: [],
    acceptable_sub_domains: {},
    must_have: [], custom_must: "",
    good_to_have: [],
    positive_signals: "",
    dealbreakers: [], dealbreaker_custom: "",
    adjacent_backgrounds: "", transferable_signals: "",
  });

  const setA      = (key, val) => setAns(a => ({ ...a, [key]: val }));
  const toggleArr = (key, val) => setAns(a => ({
    ...a,
    [key]: a[key].includes(val) ? a[key].filter(x => x !== val) : [...a[key], val],
  }));

  const DOMAIN_OPTIONS = [
    "MNC / Large Indian Corporate", "Big 4 / Consulting", "BFSI", "FMCG / Consumer",
    "IT / Tech / Startup", "NGO / Social Sector", "PSU / Government",
    "Manufacturing / Industrial", "Healthcare / Pharma", "Any",
  ];

  const SUB_DOMAIN_OPTIONS = {
    "NGO / Social Sector": ["Livelihoods","Rural Development","Public Health","Education","Microfinance","Fundraising / Philanthropy","Advocacy / Policy","WASH / Sanitation","Gender & Rights"],
    "BFSI": ["Wealth Management","Retail Banking","Investment Banking","Microfinance","Insurance","Capital Markets","Fintech"],
    "Big 4 / Consulting": ["Strategy","Operations","Risk & Compliance","Financial Advisory","Technology Consulting","HR Consulting"],
    "Healthcare / Pharma": ["Clinical Research","Public Health","MedTech","Hospital Operations","Pharma Sales","Regulatory Affairs"],
    "IT / Tech / Startup": ["Product Management","Engineering","Data & AI","Cybersecurity","Cloud / DevOps","SaaS / B2B"],
  };

  const DEALBREAKER_OPTIONS = [
    "Less than minimum experience", "Never worked in this industry",
    "Too many job changes (3+ in 5 years)", "Career gap of more than 1 year",
    "Currently in a completely different role", "Overqualified / Too senior", "Location doesn't match",
  ];

  // ── Generate brief ─────────────────────────────────────────────────────────
  const generateBrief = async () => {
    setGenerating(true); setGenError("");
    const mustHave   = [...ans.must_have, ...ans.custom_must.split(",").map(s => s.trim()).filter(Boolean)];
    const niceToHave = parsedSkills.filter(s => !mustHave.includes(s));
    const structured = {
      experience: { min: ans.exp_min ? parseInt(ans.exp_min) : null, max: ans.exp_max ? parseInt(ans.exp_max) : null, flexible: ans.exp_flexible },
      domain: {
        ideal: ans.domain_ideal,
        ideal_sub_domain: { primary: ans.ideal_sub_domain_primary || null, also_relevant: ans.ideal_sub_domain_also },
        acceptable: ans.domain_acceptable,
        acceptable_sub_domains: ans.acceptable_sub_domains,
        reject: ans.domain_reject ? [ans.domain_reject] : [],
      },
      target_companies: ans.target_companies ? ans.target_companies.split(",").map(s => s.trim()).filter(Boolean) : [],
      must_have_skills: mustHave,
      good_to_have_skills: ans.good_to_have,
      nice_to_have_skills: niceToHave,
      irrelevant_skills: [],
      strong_positive_signals: ans.positive_signals ? ans.positive_signals.split("\n").map(s => s.trim()).filter(Boolean) : [],
      dealbreakers: [...ans.dealbreakers, ...ans.dealbreaker_custom.split("\n").map(s => s.trim()).filter(Boolean)],
      strong_negative_signals: [],
      adjacent_backgrounds: ans.adjacent_backgrounds ? ans.adjacent_backgrounds.split("\n").map(s => s.trim()).filter(Boolean) : [],
      transferable_signals: ans.transferable_signals ? ans.transferable_signals.split("\n").map(s => s.trim()).filter(Boolean) : [],
    };

    const prompt = `You are a senior recruiter at ATRIOS talent firm.

A recruiter has completed a structured hiring brief for the role: "${jobTitle}"

Here is the structured input they provided:

EXPERIENCE:
Min: ${structured.experience.min ?? "Not specified"} years
Max: ${structured.experience.max ?? "Not specified"} years
Flexible: ${structured.experience.flexible ? "Yes" : "No"}

TARGET BACKGROUNDS:
Ideal: ${structured.domain.ideal.join(", ") || "Not specified"}
Acceptable: ${structured.domain.acceptable.join(", ") || "Not specified"}
Reject: ${structured.domain.reject.join(", ") || "None"}
Specific companies: ${structured.target_companies.join(", ") || "None"}

MUST-HAVE SKILLS:
${structured.must_have_skills.join(", ") || "Not specified"}

LOWER PRIORITY SKILLS:
${structured.nice_to_have_skills.join(", ") || "None"}

SKILLS TO IGNORE:
${structured.irrelevant_skills.join(", ") || "None"}

WHAT GOOD EXPERIENCE LOOKS LIKE (actual responsibilities):
${structured.strong_positive_signals.join("\n") || "Not specified"}

DEALBREAKERS:
${structured.dealbreakers.join("\n") || "None specified"}

IF IDEAL CANDIDATE UNAVAILABLE:
Adjacent backgrounds: ${structured.adjacent_backgrounds.join("\n") || "Not specified"}
Why they'd still work: ${structured.transferable_signals.join("\n") || "Not specified"}

Generate a concise, professional Hiring Brief using EXACTLY this format:

TARGET PROFILE
[2-3 sentences describing the ideal candidate background and experience level]

✅ MUST-HAVE SKILLS
[bullet list of must-have skills]

WHAT GOOD EXPERIENCE LOOKS LIKE
[bullet list of real responsibilities/work experience that signals a strong candidate]

ACCEPTABLE BACKGROUNDS
[brief description of ideal vs acceptable backgrounds]

🚫 DEALBREAKERS
[bullet list of immediate rejection criteria]

IF IDEAL CANDIDATE IS NOT AVAILABLE
[2-3 sentences on adjacent talent pool and why they'd still work]

Keep it under 300 words. Be specific and direct. Write for a recruiter who will use this to brief their team and screen CVs.`;

    try {
      const res  = await apiFetch("/api/v1/projects/generate-brief", { method: "POST", body: JSON.stringify({ prompt }) });
      const data = await res.json();
      const text = data.content || "";
      if (!text) throw new Error("Empty response");
      setGeneratedBrief(text.trim());
      setStep(8);
    } catch { setGenError("Failed to generate brief. Please try again."); }
    finally { setGenerating(false); }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = () => { if (step === 7) generateBrief(); else setStep(s => s + 1); };
  const goBack = () => {
    if (step === 0) { onCancel(); }
    else if (step === 8) { setStep(7); setGeneratedBrief(""); }
    else { setStep(s => s - 1); }
  };

  // ── Confirm ────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    const mustHave   = [...ans.must_have, ...ans.custom_must.split(",").map(s => s.trim()).filter(Boolean)];
    const niceToHave = parsedSkills.filter(s => !mustHave.includes(s));
    const structured = {
      experience: { min: ans.exp_min ? parseInt(ans.exp_min) : null, max: ans.exp_max ? parseInt(ans.exp_max) : null, flexible: ans.exp_flexible },
      domain: { ideal: ans.domain_ideal, acceptable: ans.domain_acceptable, reject: ans.domain_reject ? [ans.domain_reject] : [] },
      target_companies: ans.target_companies ? ans.target_companies.split(",").map(s => s.trim()).filter(Boolean) : [],
      must_have_skills: mustHave,
      nice_to_have_skills: niceToHave,
      irrelevant_skills: [],
      strong_positive_signals: ans.positive_signals ? ans.positive_signals.split("\n").map(s => s.trim()).filter(Boolean) : [],
      dealbreakers: [...ans.dealbreakers, ...ans.dealbreaker_custom.split("\n").map(s => s.trim()).filter(Boolean)],
      adjacent_backgrounds: ans.adjacent_backgrounds ? ans.adjacent_backgrounds.split("\n").map(s => s.trim()).filter(Boolean) : [],
      transferable_signals: ans.transferable_signals ? ans.transferable_signals.split("\n").map(s => s.trim()).filter(Boolean) : [],
    };
    const finalNote = recruiterNote.trim()
      ? `${generatedBrief}\n\n---\nAdditional Notes:\n${recruiterNote.trim()}`
      : generatedBrief;
    onComplete({ structured, generated_brief: generatedBrief, recruiter_note: recruiterNote, client_note: finalNote });
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const ta = { padding: "10px 13px", borderRadius: "10px", border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, fontSize: "13px", fontFamily: fontB, width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: "1.5" };
  const chip = (active, color = C.primary, lightColor = C.primaryLight) => ({ padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s", fontFamily: fontB, border: `1px solid ${active ? color : C.border}`, backgroundColor: active ? lightColor : C.white, color: active ? color : C.muted, userSelect: "none" });
  const hint = (text) => <div style={{ fontSize: "11px", color: C.muted, fontStyle: "italic", marginTop: "6px" }}>{text}</div>;
  const qLabel = (text) => <div style={{ fontSize: "15px", fontWeight: "700", color: C.text, fontFamily: fontH, marginBottom: "6px", lineHeight: "1.4" }}>{text}</div>;
  const qSub   = (text) => <div style={{ fontSize: "12px", color: C.muted, marginBottom: "16px", lineHeight: "1.5" }}>{text}</div>;

  const progress = step === 0 ? 0 : step === 8 ? 100 : Math.round((step / 7) * 100);

  // ── Step renderers ─────────────────────────────────────────────────────────

  const renderIntro = () => (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "18px", backgroundColor: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <Icon n="auto_awesome" size={32} color={C.primary} />
      </div>
      <div style={{ fontSize: "22px", fontWeight: "800", fontFamily: fontH, marginBottom: "10px" }}>Build Your Hiring Brief</div>
      <div style={{ fontSize: "14px", color: C.muted, lineHeight: "1.6", maxWidth: "420px", margin: "0 auto 12px" }}>
        Answer 7 quick questions about <strong style={{ color: C.text }}>{jobTitle}</strong>. This takes under 3 minutes and will significantly improve your candidate match quality.
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "24px 0", flexWrap: "wrap" }}>
        {[{ icon: "target", label: "Better matches" }, { icon: "speed", label: "3 minutes" }, { icon: "insights", label: "Smarter shortlist" }].map(({ icon, label }) => (
          <div key={icon} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.muted, fontWeight: "600" }}>
            <Icon n={icon} size={15} color={C.primary} />{label}
          </div>
        ))}
      </div>
    </div>
  );

  const renderQ1 = () => (
    <div>
      {qLabel("What is the actual experience range you will consider?")}
      {qSub("The JD may say one thing. We want to know what you will really accept.")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div><label style={S.label}>Minimum years</label><input type="number" min="0" max="40" style={{ ...S.input, marginTop: "4px" }} placeholder="e.g. 3" value={ans.exp_min} onChange={e => setA("exp_min", e.target.value)} /></div>
        <div><label style={S.label}>Maximum years</label><input type="number" min="0" max="40" style={{ ...S.input, marginTop: "4px" }} placeholder="e.g. 8" value={ans.exp_max} onChange={e => setA("exp_max", e.target.value)} /></div>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "12px 14px", borderRadius: "10px", border: `1px solid ${ans.exp_flexible ? C.primary : C.border}`, backgroundColor: ans.exp_flexible ? C.primaryLight : C.white, transition: "all 0.15s" }}>
        <input type="checkbox" checked={ans.exp_flexible} onChange={e => setA("exp_flexible", e.target.checked)} style={{ accentColor: C.primary, width: "16px", height: "16px" }} />
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>The client says X years but will accept less for a strong profile</div>
          <div style={{ fontSize: "11px", color: C.muted }}>Check this if experience is flexible for exceptional candidates</div>
        </div>
      </label>
    </div>
  );

  const renderQ2 = () => {
    const idealSubs   = ans.domain_ideal.flatMap(d => SUB_DOMAIN_OPTIONS[d] || []);
    const hasIdealSub = idealSubs.length > 0;
    return (
      <div>
        {qLabel("Which backgrounds are IDEAL vs ACCEPTABLE for this role?")}
        {qSub("Select in each column. Ideal candidates rank higher in matching.")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {/* Ideal column */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: C.success, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Icon n="star" size={12} color={C.success} /> Ideal
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {DOMAIN_OPTIONS.map(opt => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "500", padding: "7px 10px", borderRadius: "8px", border: `1px solid ${ans.domain_ideal.includes(opt) ? C.success : C.border}`, backgroundColor: ans.domain_ideal.includes(opt) ? "rgba(59,178,115,0.06)" : C.white, transition: "all 0.12s", color: C.text }}>
                  <input type="checkbox" checked={ans.domain_ideal.includes(opt)}
                    onChange={() => { toggleArr("domain_ideal", opt); if (ans.domain_ideal.includes(opt)) { setA("ideal_sub_domain_primary", ""); setA("ideal_sub_domain_also", []); } }}
                    style={{ accentColor: C.success, width: "14px", height: "14px" }} />{opt}
                </label>
              ))}
            </div>
          </div>
          {/* Acceptable column */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: C.warning, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Icon n="check" size={12} color={C.warning} /> Acceptable
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {DOMAIN_OPTIONS.map(opt => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "500", padding: "7px 10px", borderRadius: "8px", border: `1px solid ${ans.domain_acceptable.includes(opt) ? C.warning : C.border}`, backgroundColor: ans.domain_acceptable.includes(opt) ? "rgba(217,119,6,0.06)" : C.white, transition: "all 0.12s", color: C.text }}>
                  <input type="checkbox" checked={ans.domain_acceptable.includes(opt)}
                    onChange={() => { toggleArr("domain_acceptable", opt); if (ans.domain_acceptable.includes(opt)) { const u = { ...ans.acceptable_sub_domains }; delete u[opt]; setA("acceptable_sub_domains", u); } }}
                    style={{ accentColor: C.warning, width: "14px", height: "14px" }} />{opt}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Ideal sub-domains */}
        {hasIdealSub && (
          <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "10px", border: `1px solid ${C.border}`, backgroundColor: "rgba(59,178,115,0.03)" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: C.success, marginBottom: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Icon n="account_tree" size={13} color={C.success} />Sub-sector focus within ideal domain
            </div>
            <div style={{ fontSize: "11px", color: C.muted, marginBottom: "10px" }}>Candidates matching the primary sub-sector rank highest. Select one primary, optionally mark others as also relevant.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {idealSubs.map(sub => {
                const isPrimary = ans.ideal_sub_domain_primary === sub;
                const isAlso    = ans.ideal_sub_domain_also.includes(sub);
                return (
                  <div key={sub} style={{ display: "flex", borderRadius: "20px", overflow: "hidden", border: `1px solid ${isPrimary ? C.success : isAlso ? "#6264f4" : C.border}`, fontSize: "11px", fontWeight: "600" }}>
                    <button onClick={() => setA("ideal_sub_domain_primary", isPrimary ? "" : sub)}
                      style={{ padding: "4px 10px", border: "none", cursor: "pointer", background: isPrimary ? C.success : C.white, color: isPrimary ? C.white : C.text, transition: "all 0.12s" }}
                      title="Set as primary sub-sector">{isPrimary ? "★ " : ""}{sub}</button>
                    {!isPrimary && (
                      <button onClick={() => toggleArr("ideal_sub_domain_also", sub)}
                        style={{ padding: "4px 8px", border: "none", borderLeft: `1px solid ${isAlso ? "#6264f4" : C.border}`, cursor: "pointer", background: isAlso ? "#6264f418" : C.white, color: isAlso ? "#6264f4" : C.muted, transition: "all 0.12s", fontSize: "10px" }}
                        title="Mark as also relevant">{isAlso ? "✓" : "+"}</button>
                    )}
                  </div>
                );
              })}
            </div>
            {ans.ideal_sub_domain_primary && (
              <div style={{ fontSize: "11px", color: C.muted, marginTop: "8px" }}>
                Primary: <span style={{ color: C.success, fontWeight: "600" }}>{ans.ideal_sub_domain_primary}</span>
                {ans.ideal_sub_domain_also.length > 0 && ` · Also relevant: ${ans.ideal_sub_domain_also.join(", ")}`}
              </div>
            )}
          </div>
        )}

        {/* Acceptable sub-domains */}
        {ans.domain_acceptable.filter(d => SUB_DOMAIN_OPTIONS[d]?.length > 0).map(domain => (
          <div key={domain} style={{ marginBottom: "12px", padding: "12px 14px", borderRadius: "10px", border: `1px solid ${C.border}`, backgroundColor: "rgba(217,119,6,0.03)" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: C.warning, marginBottom: "4px" }}>
              Preferred sub-sector within {domain}<span style={{ fontSize: "10px", fontWeight: "400", color: C.muted, marginLeft: "6px" }}>optional</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
              {SUB_DOMAIN_OPTIONS[domain].map(sub => {
                const selected = ans.acceptable_sub_domains[domain] === sub;
                return (
                  <button key={sub} onClick={() => setA("acceptable_sub_domains", { ...ans.acceptable_sub_domains, [domain]: selected ? "" : sub })}
                    style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", border: `1px solid ${selected ? C.warning : C.border}`, background: selected ? "rgba(217,119,6,0.08)" : C.white, color: selected ? C.warning : C.muted, cursor: "pointer", transition: "all 0.12s" }}>
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div><label style={S.label}>Specific companies to prioritise (optional)</label><input style={{ ...S.input, marginTop: "4px" }} placeholder="e.g. Tata, Unilever, McKinsey, Big 4" value={ans.target_companies} onChange={e => setA("target_companies", e.target.value)} /></div>
        <div style={{ marginTop: "12px" }}><label style={S.label}>Backgrounds to REJECT (optional)</label><input style={{ ...S.input, marginTop: "4px" }} placeholder="e.g. Pure tech companies, Government only, Sales background" value={ans.domain_reject} onChange={e => setA("domain_reject", e.target.value)} /></div>
      </div>
    );
  };

  const renderQ3 = () => {
    const skills = parsedSkills.length > 0 ? parsedSkills : [];
    return (
      <div>
        {qLabel("Which skills are absolutely required?")}
        {qSub("Tap to mark as MUST HAVE. Everything you don't tap = considered but lower priority.")}
        {skills.length > 0 ? (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
              {skills.map(s => (
                <span key={s} onClick={() => toggleArr("must_have", s)} style={chip(ans.must_have.includes(s))}>
                  {ans.must_have.includes(s) && <Icon n="check" size={12} color={C.primary} />}{" "}{s}
                </span>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: C.muted }}><span style={{ color: C.primary, fontWeight: "700" }}>■</span> Tapped = MUST HAVE &nbsp;<span style={{ color: C.muted }}>■</span> Untapped = lower priority</div>
          </div>
        ) : (
          <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: C.surface, border: `1px solid ${C.border}`, fontSize: "12px", color: C.muted, marginBottom: "16px" }}>No skills extracted from JD yet — type them below</div>
        )}
        <div>
          <label style={S.label}>Add skills not listed above</label>
          <input style={{ ...S.input, marginTop: "4px" }} placeholder="e.g. Grant writing, P&L management, Stakeholder engagement" value={ans.custom_must} onChange={e => setA("custom_must", e.target.value)} />
          {hint("Separate multiple skills with a comma")}
        </div>
      </div>
    );
  };

  const renderQ4 = () => {
    const skills = parsedSkills.length > 0 ? parsedSkills : [];
    return (
      <div>
        {qLabel("Are there any skills that are good to have but not essential?")}
        {qSub("These will get a small score bonus in matching but won't block a candidate who's missing them. Skip if all selected skills are must-haves.")}
        {skills.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {skills.map(s => (
              <span key={s} onClick={() => toggleArr("good_to_have", s)} style={chip(ans.good_to_have.includes(s), C.similar, "rgba(217,119,6,0.08)")}>
                {ans.good_to_have.includes(s) && <Icon n="thumb_up" size={12} color={C.similar} />}{" "}{s}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: C.surface, border: `1px solid ${C.border}`, fontSize: "12px", color: C.muted }}>No skills extracted from JD — this step can be skipped</div>
        )}
        {hint("Tap a skill to mark it as good to have. These feed the bonus tier in skill scoring.")}
      </div>
    );
  };

  const renderQ5 = () => (
    <div>
      {qLabel("What kind of work should this person have actually done?")}
      {qSub("Think in terms of real responsibilities — not tools or job titles. This is the most important question.")}
      <textarea style={{ ...ta, height: "140px" }}
        placeholder={"e.g.\nManaged P&L of a business unit\nLed teams across multiple locations\nWorked directly with government or institutional stakeholders\nBuilt a program or team from scratch"}
        value={ans.positive_signals} onChange={e => setA("positive_signals", e.target.value)} />
      {hint("Write one responsibility per line. Be as specific as possible.")}
    </div>
  );

  const renderQ6 = () => (
    <div>
      {qLabel("What would make you reject a candidate immediately?")}
      {qSub("Select all that apply. Add role-specific dealbreakers below.")}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {DEALBREAKER_OPTIONS.map(opt => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${ans.dealbreakers.includes(opt) ? C.error : C.border}`, backgroundColor: ans.dealbreakers.includes(opt) ? "rgba(224,92,92,0.05)" : C.white, transition: "all 0.12s" }}>
            <input type="checkbox" checked={ans.dealbreakers.includes(opt)} onChange={() => toggleArr("dealbreakers", opt)} style={{ accentColor: C.error, width: "15px", height: "15px" }} />
            <span style={{ fontSize: "13px", color: C.text, fontWeight: "500" }}>{opt}</span>
          </label>
        ))}
      </div>
      <label style={S.label}>Role-specific dealbreakers (important)</label>
      <textarea style={{ ...ta, height: "80px" }}
        placeholder={"e.g.\nNo NGO / social impact experience\nNever managed a P&L\nNo stakeholder-facing roles"}
        value={ans.dealbreaker_custom} onChange={e => setA("dealbreaker_custom", e.target.value)} />
      {hint("Write one dealbreaker per line")}
    </div>
  );

  const renderQ7 = () => (
    <div>
      {qLabel("If the ideal candidate is not available, where else should we look?")}
      {qSub("This helps us find great candidates who don't tick every box but would still succeed in this role.")}
      <div style={{ marginBottom: "16px" }}>
        <label style={S.label}>Alternative backgrounds to consider</label>
        <textarea style={{ ...ta, height: "100px", marginTop: "4px" }}
          placeholder={"e.g.\nEx-consultant moving into industry ops\nFMCG sales background for rural distribution role\nCorporate CSR transitioning to NGO program management"}
          value={ans.adjacent_backgrounds} onChange={e => setA("adjacent_backgrounds", e.target.value)} />
        {hint("Write one background per line")}
      </div>
      <div>
        <label style={S.label}>Why would they still work for this role?</label>
        <textarea style={{ ...ta, height: "80px", marginTop: "4px" }}
          placeholder={"e.g.\nStrong stakeholder management transfers well\nHas managed similar scale even in a different sector"}
          value={ans.transferable_signals} onChange={e => setA("transferable_signals", e.target.value)} />
        {hint("Write one reason per line")}
      </div>
    </div>
  );

  const renderReview = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(59,178,115,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon n="check_circle" size={20} color={C.success} />
        </div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: fontH }}>Hiring Brief Generated</div>
          <div style={{ fontSize: "12px", color: C.muted }}>Review below — this will be used to improve your candidate matches</div>
        </div>
      </div>
      <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px 18px", marginBottom: "16px", whiteSpace: "pre-wrap", fontSize: "13px", lineHeight: "1.7", color: C.text, maxHeight: "300px", overflowY: "auto" }}>
        {generatedBrief}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: C.muted, marginBottom: "16px", padding: "8px 12px", backgroundColor: C.primaryLight, borderRadius: "8px" }}>
        <Icon n="lock" size={13} color={C.primary} />
        <span>This brief is <strong style={{ color: C.primary }}>internal only</strong> — never shown to candidates</span>
      </div>
      <div>
        <label style={S.label}>Additional notes <span style={{ fontWeight: "400", color: C.muted, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
        <textarea style={{ ...ta, height: "70px", marginTop: "4px" }}
          placeholder="Any other context, #hashtag overrides, or instructions not covered above…"
          value={recruiterNote} onChange={e => setRecruiterNote(e.target.value)} />
      </div>
      <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: C.warningLight, borderRadius: "8px", fontSize: "11px", color: C.warning, display: "flex", gap: "6px" }}>
        <Icon n="info" size={13} color={C.warning} />
        To change the brief, click Back and restart from Q1. The brief cannot be edited directly.
      </div>
    </div>
  );

  const STEPS = [
    { q: 1, title: "Experience",           render: renderQ1 },
    { q: 2, title: "Backgrounds",          render: renderQ2 },
    { q: 3, title: "Must-Have Skills",     render: renderQ3 },
    { q: 4, title: "Lower Priority Skills",render: renderQ4 },
    { q: 5, title: "Good Experience",      render: renderQ5 },
    { q: 6, title: "Dealbreakers",         render: renderQ6 },
    { q: 7, title: "Adjacent Talent",      render: renderQ7 },
  ];
  const currentQ = step > 0 && step < 8 ? STEPS[step - 1] : null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: C.bg, zIndex: 900, display: "flex", flexDirection: "column", overflowY: "auto" }}>

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.white, padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={goBack} style={{ ...S.btn("outline", true), padding: "6px 12px" }}>
            <Icon n="arrow_back" size={14} /> Back
          </button>
          <div style={{ fontSize: "13px", color: C.muted, fontFamily: fontH }}>
            {step === 0 && "Hiring Brief Builder"}
            {currentQ && `Q${currentQ.q} / 7 — ${currentQ.title}`}
            {step === 8 && "Review Brief"}
          </div>
        </div>
        <div style={{ fontSize: "11px", color: C.muted, fontWeight: "600", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{jobTitle}</div>
      </div>

      {/* Progress bar */}
      {step > 0 && (
        <div style={{ height: "3px", backgroundColor: C.border, flexShrink: 0 }}>
          <div style={{ height: "100%", backgroundColor: C.primary, width: `${progress}%`, transition: "width 0.3s ease" }} />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "20px 16px" : "32px 24px" }}>
        <div style={{ width: "100%", maxWidth: "620px" }}>

          {/* Step dots */}
          {step > 0 && step < 8 && (
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "28px" }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ width: i + 1 === step ? "24px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: i + 1 <= step ? C.primary : C.border, transition: "all 0.3s", opacity: i + 1 <= step ? 1 : 0.4 }} />
              ))}
            </div>
          )}

          {/* Card */}
          <div style={{ ...S.card, padding: isMobile ? "20px" : "28px" }}>
            {step === 0 && renderIntro()}
            {currentQ && currentQ.render()}
            {step === 8 && renderReview()}
          </div>

          {/* Error */}
          {genError && (
            <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: C.errorLight, borderRadius: "8px", fontSize: "13px", color: C.error }}>{genError}</div>
          )}

          {/* CTA buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", gap: "10px" }}>
            <div style={{ fontSize: "11px", color: C.muted }}>
              {step > 0 && step < 8 && `${step} of 7 questions`}
              {step === 8 && "Ready to confirm"}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {step === 0 && <button style={S.btn("primary")} onClick={goNext}><Icon n="auto_awesome" size={15} />Let's Start</button>}
              {step > 0 && step < 8 && (
                <>
                  {step === 4 && <button style={{ ...S.btn("outline"), fontSize: "12px" }} onClick={goNext}>Skip</button>}
                  <button style={{ ...S.btn("primary"), opacity: generating ? 0.6 : 1 }} onClick={goNext} disabled={generating}>
                    {step === 7 ? (
                      generating ? <><div className="dot-wave" style={{ display: "inline-flex", gap: "3px" }}><span /><span /><span /></div>&nbsp;Generating…</> : <><Icon n="auto_awesome" size={15} />Generate Brief</>
                    ) : <>Next<Icon n="arrow_forward" size={15} /></>}
                  </button>
                </>
              )}
              {step === 8 && <button style={S.btn("primary")} onClick={handleConfirm}><Icon n="check" size={15} />Confirm & Continue</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
