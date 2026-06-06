/**
 * Numin — Pre-Purchase Intake Form
 * Public route: /get-started
 * Flow: Tier selection → Business info → Tools → Goals → Review → Stripe Checkout
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// ─── Stripe Payment Links ─────────────────────────────────────────────────────
// Each tier has a Payment Link configured in the Stripe dashboard.
// Success URL per link: https://numin.ai/onboard?tier=X
// For local dev, use localhost. Update these for production.
const STRIPE_LINKS: Record<string, string> = {
  starter:      import.meta.env.VITE_STRIPE_STARTER      || 'https://buy.stripe.com/starter',
  growth:       import.meta.env.VITE_STRIPE_GROWTH       || 'https://buy.stripe.com/growth',
  professional: import.meta.env.VITE_STRIPE_PROFESSIONAL || 'https://buy.stripe.com/professional',
  scale:        import.meta.env.VITE_STRIPE_SCALE        || 'https://buy.stripe.com/scale',
  enterprise:   import.meta.env.VITE_STRIPE_ENTERPRISE   || 'https://buy.stripe.com/enterprise',
};

// ─── Tiers ────────────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "starter",
    name: "Starter",
    badge: "🥉",
    setup: "$499",
    monthly: "$49/mo",
    agents: ["NUMIN", "ARIA"],
    agentCount: 2,
    color: "#55657a",
    description: "Perfect for solo founders and small teams ready to automate the basics.",
    features: ["Email & Calendar automation", "2 AI agents", "6-month memory", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    badge: "🥈",
    setup: "$2,499",
    monthly: "$149/mo",
    agents: ["NUMIN", "ARIA", "NEXUS", "PRISM"],
    agentCount: 4,
    color: "#60a5fa",
    description: "For growing businesses that need sales, support, and marketing handled.",
    features: ["CRM + Slack integrations", "4 AI agents", "1-year memory", "Priority support"],
  },
  {
    id: "professional",
    name: "Professional",
    badge: "🥇",
    setup: "$4,999",
    monthly: "$299/mo",
    agents: ["NUMIN", "ARIA", "VANCE", "NEXUS", "PRISM", "APEX"],
    agentCount: 6,
    color: "#C9A84C",
    best: true,
    description: "Full 6-agent team. Every part of your business, automated.",
    features: ["All 6 agents unlocked", "Unlimited memory", "Custom agent training", "Dedicated success manager"],
  },
  {
    id: "scale",
    name: "Scale",
    badge: "💎",
    setup: "$9,999",
    monthly: "$399/mo",
    agents: ["NUMIN", "ARIA", "VANCE", "NEXUS", "PRISM", "APEX", "+ Custom"],
    agentCount: 7,
    color: "#818cf8",
    description: "Everything in Professional, plus custom workflows and advanced integrations.",
    features: ["Custom workflows", "Advanced integrations", "Priority agent training", "Dedicated success manager"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "👑",
    setup: "$24,999",
    monthly: "$3,997/mo",
    agents: ["NUMIN", "ARIA", "VANCE", "NEXUS", "PRISM", "APEX", "+ Custom"],
    agentCount: "Unlimited",
    color: "#E8D5A3",
    description: "Multi-location, white-glove setup, on-site training, custom agents.",
    features: ["Custom agent branding", "Up to 3 locations", "On-site installation", "24/7 support"],
  },
];

const TOOLS_LIST = [
  { id: "gmail", label: "Gmail", icon: "✉️" },
  { id: "outlook", label: "Outlook", icon: "📧" },
  { id: "google_cal", label: "Google Calendar", icon: "📅" },
  { id: "hubspot", label: "HubSpot", icon: "🔶" },
  { id: "salesforce", label: "Salesforce", icon: "☁️" },
  { id: "airtable", label: "Airtable", icon: "🟢" },
  { id: "slack", label: "Slack", icon: "💬" },
  { id: "stripe", label: "Stripe", icon: "💳" },
  { id: "shopify", label: "Shopify", icon: "🛍️" },
  { id: "notion", label: "Notion", icon: "◻️" },
  { id: "quickbooks", label: "QuickBooks", icon: "📊" },
  { id: "zapier", label: "Zapier", icon: "⚡" },
];

const STEPS = [
  { id: "tier", label: "Choose Plan" },
  { id: "business", label: "Your Business" },
  { id: "tools", label: "Your Tools" },
  { id: "goals", label: "Your Goals" },
  { id: "review", label: "Review" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  tier: string;
  company_name: string;
  industry: string;
  team_size: string;
  website: string;
  timezone: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  tools: string[];
  top_clients: string;
  products_services: string;
  tone: string;
  priority_1: string;
  priority_2: string;
  priority_3: string;
  never_without_approval: string;
  escalation_contact: string;
}

const EMPTY: FormData = {
  tier: "",
  company_name: "",
  industry: "",
  team_size: "",
  website: "",
  timezone: "America/New_York",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  tools: [],
  top_clients: "",
  products_services: "",
  tone: "professional",
  priority_1: "",
  priority_2: "",
  priority_3: "",
  never_without_approval: "",
  escalation_contact: "",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#06060A",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "40px 20px 120px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: 900,
    color: "#f7f9fc",
    letterSpacing: "-0.03em",
    marginBottom: 48,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  logoSpan: { color: "#C9A84C" },
  stepper: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    marginBottom: 52,
    maxWidth: 540,
    width: "100%",
  },
  stepItem: (active: boolean, done: boolean) => ({
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
    flex: 1,
    position: "relative" as const,
  }),
  stepDot: (active: boolean, done: boolean) => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: done ? "#C9A84C" : active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
    border: `1.5px solid ${done ? "#C9A84C" : active ? "#C9A84C" : "rgba(255,255,255,0.1)"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.65rem",
    fontWeight: 700,
    color: done ? "#06060A" : active ? "#C9A84C" : "#55657a",
    transition: "all 0.3s",
    zIndex: 2,
  }),
  stepLabel: (active: boolean) => ({
    fontSize: "0.6rem",
    fontWeight: 600,
    color: active ? "#C9A84C" : "#3a3f52",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    whiteSpace: "nowrap" as const,
  }),
  stepLine: (done: boolean) => ({
    position: "absolute" as const,
    top: 14,
    left: "50%",
    width: "100%",
    height: 1,
    background: done ? "#C9A84C" : "rgba(255,255,255,0.06)",
    zIndex: 1,
    transition: "background 0.3s",
  }),
  card: {
    background: "#0c0f14",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: "40px 40px",
    width: "100%",
    maxWidth: 760,
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#f7f9fc",
    letterSpacing: "-0.03em",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "#55657a",
    marginBottom: 32,
    lineHeight: 1.7,
  },
  tierGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  tierCard: (selected: boolean, color: string) => ({
    background: selected ? `rgba(${hexToRgb(color)}, 0.06)` : "rgba(255,255,255,0.02)",
    border: `1.5px solid ${selected ? color : "rgba(255,255,255,0.06)"}`,
    borderRadius: 14,
    padding: "20px 22px",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative" as const,
  }),
  tierName: { fontSize: "0.95rem", fontWeight: 700, color: "#f7f9fc", marginBottom: 2 },
  tierPrice: (color: string) => ({ fontSize: "1.3rem", fontWeight: 900, color, letterSpacing: "-0.02em" }),
  tierMonthly: { fontSize: "0.7rem", color: "#55657a", marginBottom: 10 },
  tierDesc: { fontSize: "0.75rem", color: "#55657a", lineHeight: 1.6, marginBottom: 10 },
  tierFeature: { fontSize: "0.72rem", color: "#acb5c4", display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 },
  bestBadge: {
    position: "absolute" as const,
    top: -1,
    right: 14,
    background: "#C9A84C",
    color: "#06060A",
    fontSize: "0.55rem",
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: "0 0 8px 8px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
  label: {
    display: "block",
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#55657a",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: "0.88rem",
    color: "#f7f9fc",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: "0.88rem",
    color: "#f7f9fc",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    resize: "vertical" as const,
    minHeight: 90,
  },
  select: {
    width: "100%",
    background: "#0c0f14",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: "0.88rem",
    color: "#f7f9fc",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 },
  formGridFull: { gridColumn: "1 / -1" as const },
  toolsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 4,
  },
  toolChip: (selected: boolean) => ({
    background: selected ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
    border: `1.5px solid ${selected ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.06)"}`,
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.8rem",
    color: selected ? "#E8D5A3" : "#55657a",
    fontWeight: selected ? 600 : 400,
    transition: "all 0.2s",
  }),
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 36,
    paddingTop: 24,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  btnBack: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: "0.85rem",
    color: "#55657a",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  btnNext: {
    background: "linear-gradient(135deg, #C9A84C, #9A7A2A)",
    border: "none",
    borderRadius: 10,
    padding: "13px 32px",
    fontSize: "0.88rem",
    color: "#06060A",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    letterSpacing: "0.02em",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  btnStripe: {
    background: "linear-gradient(135deg, #C9A84C, #9A7A2A)",
    border: "none",
    borderRadius: 12,
    padding: "16px 40px",
    fontSize: "0.95rem",
    color: "#06060A",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 800,
    letterSpacing: "0.02em",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "opacity 0.2s",
  },
  reviewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: "0.82rem",
  },
  reviewLabel: { color: "#55657a", fontWeight: 500, minWidth: 160 },
  reviewVal: { color: "#f7f9fc", textAlign: "right" as const, flex: 1, marginLeft: 16 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "#C9A84C",
    textTransform: "uppercase" as const,
    letterSpacing: "0.14em",
    marginBottom: 14,
  },
  summaryTier: (color: string) => ({
    background: `rgba(${hexToRgb(color)}, 0.05)`,
    border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  }),
  errorText: { fontSize: "0.75rem", color: "#ef4444", marginTop: 6 },
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-select tier from URL ?tier=professional
  useEffect(() => {
    const tierParam = searchParams.get("tier");
    if (tierParam && TIERS.find((t) => t.id === tierParam)) {
      setForm((f) => ({ ...f, tier: tierParam }));
      // Skip straight to business info if tier is pre-selected
      setStep(1);
    }
  }, []);

  const set = (key: keyof FormData, val: string | string[]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleTool = (id: string) =>
    set("tools", form.tools.includes(id) ? form.tools.filter((t) => t !== id) : [...form.tools, id]);

  const selectedTier = TIERS.find((t) => t.id === form.tier);

  // ── Validation ──────────────────────────────────────────────────────────────
  const canNext = () => {
    switch (STEPS[step].id) {
      case "tier": return !!form.tier;
      case "business": return !!form.company_name && !!form.contact_email;
      case "tools": return true;
      case "goals": return !!form.priority_1;
      case "review": return true;
      default: return true;
    }
  };

  // ── Submit + Stripe redirect ─────────────────────────────────────────────────
  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      // Save intake to Supabase
      const { error: dbErr } = await supabase.from("intake_submissions").insert([
        {
          tier: form.tier,
          company_name: form.company_name,
          industry: form.industry,
          team_size: form.team_size,
          website: form.website,
          timezone: form.timezone,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          tools: form.tools,
          top_clients: form.top_clients,
          products_services: form.products_services,
          tone: form.tone,
          priorities: [form.priority_1, form.priority_2, form.priority_3].filter(Boolean),
          never_without_approval: form.never_without_approval,
          escalation_contact: form.escalation_contact,
          submitted_at: new Date().toISOString(),
          status: "pending_payment",
        },
      ]);

      if (dbErr) {
        console.warn("Supabase save failed (non-blocking):", dbErr.message);
        localStorage.setItem("numin_intake", JSON.stringify(form));
      }

      // Redirect to Stripe Payment Link — success_url carries tier to /onboard
      const baseUrl = STRIPE_LINKS[form.tier] || STRIPE_LINKS.starter;
      const stripeUrl = `${baseUrl}?prefilled_email=${encodeURIComponent(form.contact_email)}&client_reference_id=${encodeURIComponent(form.company_name)}`;
      window.location.href = stripeUrl;
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // ── Steps ───────────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (STEPS[step].id) {
      // ── STEP 1: TIER ──────────────────────────────────────────────────────
      case "tier":
        return (
          <div>
            <h2 style={s.title}>Choose your plan</h2>
            <p style={s.subtitle}>Pick the plan that fits your business.</p>
            <div style={s.tierGrid}>
              {TIERS.map((t) => (
                <div
                  key={t.id}
                  style={s.tierCard(form.tier === t.id, t.color)}
                  onClick={() => set("tier", t.id)}
                >
                  {t.best && <div style={s.bestBadge}>Best Value</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={s.tierName}>{t.badge} {t.name}</div>
                    {form.tier === t.id && (
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#06060A", fontWeight: 700 }}>✓</div>
                    )}
                  </div>
                  <div style={s.tierPrice(t.color)}>{t.setup}</div>
                  <div style={s.tierMonthly}>{t.monthly}</div>
                  <div style={s.tierDesc}>{t.description}</div>
                  <div>
                    {t.features.map((f) => (
                      <div key={f} style={s.tierFeature}>
                        <span style={{ color: t.color, flexShrink: 0 }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── STEP 2: BUSINESS ──────────────────────────────────────────────────
      case "business":
        return (
          <div>
            <h2 style={s.title}>Tell us about your business</h2>
            <p style={s.subtitle}>Your agents will be trained on this before your Mac ships. The more detail, the better.</p>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Company Name *</label>
                <input style={s.input} value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <label style={s.label}>Industry *</label>
                <input style={s.input} value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Real Estate, Tech, Consulting…" />
              </div>
              <div>
                <label style={s.label}>Team Size</label>
                <select style={s.select} value={form.team_size} onChange={(e) => set("team_size", e.target.value)}>
                  <option value="">Select size</option>
                  <option value="solo">Solo / Just me</option>
                  <option value="2-5">2–5 people</option>
                  <option value="6-20">6–20 people</option>
                  <option value="21-50">21–50 people</option>
                  <option value="50+">50+ people</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Timezone</label>
                <select style={s.select} value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Chicago">Central (CT)</option>
                  <option value="America/Denver">Mountain (MT)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="America/Phoenix">Arizona (MST)</option>
                  <option value="Pacific/Honolulu">Hawaii (HT)</option>
                  <option value="America/Anchorage">Alaska (AKT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Europe (CET)</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Your Name</label>
                <input style={s.input} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="First Last" />
              </div>
              <div>
                <label style={s.label}>Email Address *</label>
                <input style={s.input} type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="you@company.com" />
              </div>
              <div>
                <label style={s.label}>Phone (optional)</label>
                <input style={s.input} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label style={s.label}>Website</label>
                <input style={s.input} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yourcompany.com" />
              </div>
            </div>
          </div>
        );

      // ── STEP 3: TOOLS ─────────────────────────────────────────────────────
      case "tools":
        return (
          <div>
            <h2 style={s.title}>What tools do you use?</h2>
            <p style={s.subtitle}>Select everything your business runs on. Your agents will connect to these on Day 1.</p>
            <div style={s.toolsGrid}>
              {TOOLS_LIST.map((t) => (
                <div
                  key={t.id}
                  style={s.toolChip(form.tools.includes(t.id))}
                  onClick={() => toggleTool(t.id)}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  {form.tools.includes(t.id) && <span style={{ marginLeft: "auto", color: "#C9A84C", fontSize: "0.7rem" }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <label style={s.label}>Any other tools we should know about?</label>
              <input style={s.input} placeholder="e.g. Monday.com, Intercom, ActiveCampaign…" />
            </div>
          </div>
        );

      // ── STEP 4: GOALS ─────────────────────────────────────────────────────
      case "goals":
        return (
          <div>
            <h2 style={s.title}>What do you want automated?</h2>
            <p style={s.subtitle}>This tells your agents what to prioritise from Day 1. Be specific — your agents are listening.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={s.label}>#1 Thing you want to stop doing yourself *</label>
                <input style={s.input} value={form.priority_1} onChange={(e) => set("priority_1", e.target.value)} placeholder="e.g. Responding to customer support emails" />
              </div>
              <div>
                <label style={s.label}>#2 Priority (optional)</label>
                <input style={s.input} value={form.priority_2} onChange={(e) => set("priority_2", e.target.value)} placeholder="e.g. Following up on sales leads" />
              </div>
              <div>
                <label style={s.label}>#3 Priority (optional)</label>
                <input style={s.input} value={form.priority_3} onChange={(e) => set("priority_3", e.target.value)} placeholder="e.g. Scheduling meetings" />
              </div>
              <div>
                <label style={s.label}>Agent tone / communication style</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["formal", "professional", "casual", "friendly"].map((tone) => (
                    <div
                      key={tone}
                      style={{
                        ...s.toolChip(form.tone === tone),
                        flex: 1,
                        justifyContent: "center",
                        padding: "10px 8px",
                        textTransform: "capitalize" as const,
                      }}
                      onClick={() => set("tone", tone)}
                    >
                      {tone}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={s.label}>What should agents NEVER do without your approval?</label>
                <textarea style={s.textarea} value={form.never_without_approval} onChange={(e) => set("never_without_approval", e.target.value)} placeholder="e.g. Issue refunds over $200, post on social media, send emails to media/press…" />
              </div>
              <div>
                <label style={s.label}>Escalation contact (if agent needs a human decision)</label>
                <input style={s.input} value={form.escalation_contact} onChange={(e) => set("escalation_contact", e.target.value)} placeholder="Name, email or phone" />
              </div>
            </div>
          </div>
        );

      // ── STEP 5: REVIEW ────────────────────────────────────────────────────
      case "review":
        return (
          <div>
            <h2 style={s.title}>Review your order</h2>
            <p style={s.subtitle}>Everything looks good? Hit purchase to complete your order and meet your team.</p>

            {selectedTier && (
              <div style={s.summaryTier(selectedTier.color)}>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f7f9fc" }}>{selectedTier.badge} {selectedTier.name} Plan</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: selectedTier.color }}>{selectedTier.setup}</div>
                  <div style={{ fontSize: "0.7rem", color: "#55657a" }}>then {selectedTier.monthly}</div>
                </div>
              </div>
            )}

            <div style={s.section}>
              <div style={s.sectionLabel}>Business Info</div>
              {[
                ["Company", form.company_name],
                ["Industry", form.industry],
                ["Team Size", form.team_size],
                ["Timezone", form.timezone],
                ["Contact", `${form.contact_name} · ${form.contact_email}`],
                ["Website", form.website],
              ].filter(([_, v]) => v).map(([label, val]) => (
                <div key={label} style={s.reviewRow}>
                  <div style={s.reviewLabel}>{label}</div>
                  <div style={s.reviewVal}>{val}</div>
                </div>
              ))}
            </div>

            {form.tools.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionLabel}>Tools to Connect</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 4 }}>
                  {form.tools.map((t) => {
                    const tool = TOOLS_LIST.find((tl) => tl.id === t);
                    return tool ? (
                      <div key={t} style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8, padding: "4px 12px", fontSize: "0.75rem", color: "#E8D5A3" }}>
                        {tool.icon} {tool.label}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div style={s.section}>
              <div style={s.sectionLabel}>Day 1 Priorities</div>
              {[form.priority_1, form.priority_2, form.priority_3].filter(Boolean).map((p, i) => (
                <div key={i} style={s.reviewRow}>
                  <div style={s.reviewLabel}>Priority {i + 1}</div>
                  <div style={s.reviewVal}>{p}</div>
                </div>
              ))}
              {form.tone && (
                <div style={s.reviewRow}>
                  <div style={s.reviewLabel}>Agent Tone</div>
                  <div style={{ ...s.reviewVal, textTransform: "capitalize" as const }}>{form.tone}</div>
                </div>
              )}
            </div>

            <div style={{
              background: "rgba(52,211,153,0.04)",
              border: "1px solid rgba(52,211,153,0.15)",
              borderRadius: 12,
              padding: "16px 20px",
              fontSize: "0.82rem",
              color: "#acb5c4",
              lineHeight: 1.7,
              display: "flex",
              gap: 12,
              marginTop: 8,
            }}>
              <span>✅</span>
              <div>Your intake form will be saved and your agents will be pre-trained on your business before your Mac ships. You'll receive an email from us within 24 hours of payment to schedule your discovery call.</div>
            </div>

            {error && <div style={s.errorText}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <button style={s.btnStripe} onClick={handleCheckout} disabled={loading}>
                {loading ? (
                  <>⟳ Saving your info…</>
                ) : (
                  <>🔒 Complete Purchase · {selectedTier?.setup}</>
                )}
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: "0.7rem", color: "#3a3f52", marginTop: 12 }}>
              Secured by Stripe · SSL encrypted · Cancel anytime
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={s.page}>
      {/* Logo */}
      <div style={s.logo} onClick={() => navigate("/")} role="button">
        numin<span style={s.logoSpan}>.</span>
      </div>

      {/* Stepper */}
      <div style={s.stepper}>
        {STEPS.map((st, i) => (
          <div key={st.id} style={s.stepItem(i === step, i < step)}>
            {i < STEPS.length - 1 && <div style={s.stepLine(i < step)} />}
            <div style={s.stepDot(i === step, i < step)}>
              {i < step ? "✓" : i + 1}
            </div>
            <div style={s.stepLabel(i === step)}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div style={s.card}>{renderStep()}</div>

      {/* Navigation */}
      {STEPS[step].id !== "review" && (
        <div style={{ ...s.actions, maxWidth: 760, width: "100%", padding: "24px 0 0" }}>
          <button
            style={s.btnBack}
            onClick={() => step === 0 ? navigate("/") : setStep((s) => s - 1)}
          >
            {step === 0 ? "← Back to home" : "← Back"}
          </button>
          <button
            style={{ ...s.btnNext, opacity: canNext() ? 1 : 0.4, cursor: canNext() ? "pointer" : "not-allowed" }}
            onClick={() => canNext() && setStep((s) => s + 1)}
            disabled={!canNext()}
          >
            {step === STEPS.length - 2 ? "Review Order →" : "Continue →"}
          </button>
        </div>
      )}
      {STEPS[step].id === "review" && (
        <div style={{ ...s.actions, maxWidth: 760, width: "100%", padding: "24px 0 0", justifyContent: "flex-start" }}>
          <button style={s.btnBack} onClick={() => setStep((s) => s - 1)}>← Back</button>
        </div>
      )}
    </div>
  );
}
