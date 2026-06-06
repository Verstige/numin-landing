/**
 * Onboarding Wizard — OrbitAIX flagship
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AGENTS_LIST } from "@/lib/agents/index";
import { seedOnboardingMemory } from "@/lib/onboarding/memory-seeder";
import InstallRequiredStep from "./InstallRequiredStep";

// ─── Stripe redirect param interface ───────────────────────────────────────────
// When Stripe redirects back after payment, the URL carries:
//   ?step=launch&tier=professional&session_id=cs_xxx&company=Acme
// OnboardingWizard reads these to pre-populate state and jump to launch.

// ─── Tool Catalog ───────────────────────────────────────────────────────────────
type ToolCategory = 'communication' | 'crm' | 'productivity' | 'finance' | 'social' | 'operations';

interface Tool {
  id: string;
  name: string;
  icon: string;
  category: ToolCategory;
  description: string;
}

const TOOLS_LIST: Tool[] = [
  // Communication
  { id: 'gmail', name: 'Gmail', icon: '📧', category: 'communication', description: 'Email' },
  { id: 'outlook', name: 'Outlook', icon: '📪', category: 'communication', description: 'Email & Calendar' },
  { id: 'slack', name: 'Slack', icon: '💬', category: 'communication', description: 'Team Messaging' },
  { id: 'discord', name: 'Discord', icon: '🎙️', category: 'communication', description: 'Community Chat' },
  { id: 'zoom', name: 'Zoom', icon: '📹', category: 'communication', description: 'Video Meetings' },
  { id: 'teams', name: 'Microsoft Teams', icon: '👥', category: 'communication', description: 'Collaboration' },
  // CRM & Sales
  { id: 'hubspot', name: 'HubSpot', icon: '🎯', category: 'crm', description: 'CRM & Marketing' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'crm', description: 'Enterprise CRM' },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🔁', category: 'crm', description: 'Sales CRM' },
  { id: 'zoho', name: 'Zoho CRM', icon: '📊', category: 'crm', description: 'Business CRM' },
  // Productivity & Docs
  { id: 'google-calendar', name: 'Google Calendar', icon: '📅', category: 'productivity', description: 'Scheduling' },
  { id: 'notion', name: 'Notion', icon: '📋', category: 'productivity', description: 'Notes & Wikis' },
  { id: 'confluence', name: 'Confluence', icon: '📖', category: 'productivity', description: 'Team Docs' },
  { id: 'asana', name: 'Asana', icon: '✅', category: 'productivity', description: 'Project Management' },
  { id: 'trello', name: 'Trello', icon: '📌', category: 'productivity', description: 'Kanban Boards' },
  { id: 'linear', name: 'Linear', icon: '⚡', category: 'productivity', description: 'Dev Projects' },
  { id: 'evernote', name: 'Evernote', icon: '🗂️', category: 'productivity', description: 'Notes' },
  // Finance & Payments
  { id: 'stripe', name: 'Stripe', icon: '💳', category: 'finance', description: 'Payments' },
  { id: 'quickbooks', name: 'QuickBooks', icon: '📊', category: 'finance', description: 'Accounting' },
  { id: 'xero', name: 'Xero', icon: '📒', category: 'finance', description: 'Invoicing' },
  { id: 'expensify', name: 'Expensify', icon: '💰', category: 'finance', description: 'Expense Tracking' },
  // Social & Marketing
  { id: 'instagram', name: 'Instagram', icon: '📸', category: 'social', description: 'Social Media' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', category: 'social', description: 'Professional Network' },
  { id: 'twitter', name: 'X / Twitter', icon: '🐦', category: 'social', description: 'Social Media' },
  { id: 'shopify', name: 'Shopify', icon: '🛍️', category: 'social', description: 'E-commerce' },
  // Operations
  { id: 'zapier', name: 'Zapier', icon: '⚡', category: 'operations', description: 'Automation' },
  { id: 'aws', name: 'AWS', icon: '☁️', category: 'operations', description: 'Cloud Infrastructure' },
  { id: 'github', name: 'GitHub', icon: '🐙', category: 'operations', description: 'Code Repos' },
  { id: 'figma', name: 'Figma', icon: '🎨', category: 'operations', description: 'Design' },
];

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  communication: '💬 Communication',
  crm: '🎯 CRM & Sales',
  productivity: '📋 Productivity',
  finance: '💳 Finance',
  social: '📱 Social & Marketing',
  operations: '⚙️ Operations',
};

const CATEGORY_ORDER: ToolCategory[] = ['communication', 'crm', 'productivity', 'finance', 'social', 'operations'];

// ─── Tools Step Component ───────────────────────────────────────────────────────
interface ToolsStepProps {
  tools: string[];
  toggle: (id: string) => void;
}

function ToolsStep({ tools, toggle }: ToolsStepProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return TOOLS_LIST.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<ToolCategory, Tool[]>> = {};
    for (const t of filtered) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, [filtered]);

  return (
    <div style={{ maxWidth: 720 }} className="animate-fadeInUp">
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.03em' }}>
        Which tools do you use?
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.6 }}>
        Tell us before your onboarding call so we can have everything ready. Select all that apply.
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search tools…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 44px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: `1px solid ${activeCategory === 'all' ? 'var(--gold)' : 'var(--border)'}`,
            background: activeCategory === 'all' ? 'var(--gold-subtle)' : 'var(--surface)',
            color: activeCategory === 'all' ? 'var(--gold-light)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          All
        </button>
        {CATEGORY_ORDER.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${activeCategory === cat ? 'var(--gold)' : 'var(--border)'}`,
              background: activeCategory === cat ? 'var(--gold-subtle)' : 'var(--surface)',
              color: activeCategory === cat ? 'var(--gold-light)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Selected count */}
      {tools.length > 0 && (
        <div style={{ marginBottom: 16, fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>
          {tools.length} tool{tools.length !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Tool grid by group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {(activeCategory === 'all' ? CATEGORY_ORDER : [activeCategory]).map(cat => {
          const items = grouped[cat];
          if (!items?.length) return null;
          return (
            <div key={cat}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                {CATEGORY_LABELS[cat]}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {items.map(t => {
                  const on = tools.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggle(t.id)}
                      style={{
                        padding: '12px 14px',
                        background: on ? 'var(--gold-subtle)' : 'var(--surface)',
                        border: `1px solid ${on ? 'var(--border-gold)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{t.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{t.description}</div>
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: `2px solid ${on ? 'var(--gold)' : 'var(--text-faint)'}`,
                        background: on ? 'var(--gradient-gold)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', color: 'var(--bg)', fontWeight: 800, flexShrink: 0, transition: 'all 0.2s',
                      }}>
                        {on ? '✓' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No tools match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

const BASE_STEPS = [
    { id: 'welcome', label: 'Welcome', icon: '◉' },
    { id: 'company', label: 'Company', icon: '◈' },
    { id: 'tools', label: 'Tools', icon: '✦' },
    { id: 'agents', label: 'Agents', icon: '⬡' },
    { id: 'launch', label: 'Launch', icon: '▲' },
] as const;

const HERMES_GATEWAY = 'http://localhost:18789';

async function checkHermesRunning(): Promise<boolean> {
    try {
        const res = await fetch(`${HERMES_GATEWAY}/status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(3000),
        });
        return res.ok;
    } catch {
        return false;
    }
}

const OnboardingWizard = () => {
    const [hermesReady, setHermesReady] = useState<boolean | null>(null);
    const [step, setStep] = useState(0);
    const [company, setCompany] = useState({ name: '', industry: '', size: '', timezone: 'America/New_York' });
    const [tools, setTools] = useState<string[]>([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Pre-flight: check if Hermes gateway is reachable
    useEffect(() => {
        checkHermesRunning().then(setHermesReady);
    }, []);

    // Stripe post-checkout: pre-populate from redirect params and jump to launch
    useEffect(() => {
        const tier = searchParams.get('tier');
        const passedCompany = searchParams.get('company');
        const sessionId = searchParams.get('session_id');
        if (tier && sessionId) {
            // Pre-populate company name from Stripe redirect
            if (passedCompany) setCompany(c => ({ ...c, name: decodeURIComponent(passedCompany) }));
            // Skip to launch step (index 5 in BASE_STEPS, or 6 if install step is injected)
            const targetStep = hermesReady === false ? 6 : 5;
            setStep(targetStep);
        }
    }, [searchParams, hermesReady]);

    // When Hermes becomes ready, step stays but the install screen won't render
    const handleHermesReady = useCallback(() => {
        setHermesReady(true);
    }, []);

    // Build steps: if Hermes is not ready, inject install step at front
    const STEPS = hermesReady === false ? [{ id: 'install', label: 'Install', icon: '⚙️' }, ...BASE_STEPS] : [...BASE_STEPS];

    // If Hermes check is still pending, show minimal loading
    if (hermesReady === null) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>◉</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Checking system…</p>
                </div>
            </div>
        );
    }

    const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const back = () => setStep(s => Math.max(s - 1, 0));
    const toggle = (id: string) => setTools(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]);

    const render = () => {
        switch (STEPS[step].id) {
            case 'install':
                return <InstallRequiredStep onInstalled={handleHermesReady} />;
            case 'welcome':
                return (
                    <div style={{ textAlign: 'center', maxWidth: 640 }} className="animate-fadeInUp">
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: '2.2rem' }} className="animate-float">◉</div>
                        <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.04em' }}>
                            Welcome to <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Numin.</span>
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 500, margin: '0 auto 44px' }}>
                            Your AI Business Operating System is installed and ready. Let's spend 5 minutes configuring your six agents.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 480, margin: '0 auto' }}>
                            {[['5 min', 'Setup'], ['6', 'AI Agents'], ['100%', 'On-Device']].map(([v, l]) => (
                                <div key={l} className="orbit-card-flat" style={{ padding: 20, textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'company':
                return (
                    <div style={{ maxWidth: 540 }} className="animate-fadeInUp">
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.03em' }}>Tell us about your company</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 36, lineHeight: 1.7 }}>Your agents will use this to personalise every interaction.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {[{ label: 'Company Name', key: 'name', ph: 'Acme Corp' }, { label: 'Industry', key: 'industry', ph: 'Technology, Retail, Healthcare…' }, { label: 'Team Size', key: 'size', ph: '1-10, 11-50, 51-200, 200+' }, { label: 'Timezone', key: 'timezone', ph: 'America/New_York' }].map(f => (
                                <div key={f.key}>
                                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{f.label}</label>
                                    <input value={company[f.key as keyof typeof company]} onChange={e => setCompany(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} className="orbit-input" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'tools':
                return <ToolsStep tools={tools} toggle={toggle} />;
            case 'agents':
                return (
                    <div style={{ maxWidth: 720 }} className="animate-fadeInUp">
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.03em' }}>Meet your team</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 36 }}>Six specialized agents, working 24/7.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                            {AGENTS_LIST.map(a => (
                                <div key={a.id} className="orbit-card-flat" style={{ padding: 22, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${a.color}10`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{a.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, letterSpacing: '-0.01em' }}>{a.name}</div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 600, color: a.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{a.role}</div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{a.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'launch':
                const selectedToolNames = TOOLS_LIST.filter(t => tools.includes(t.id)).map(t => t.name);
                return (
                    <div style={{ textAlign: 'center', maxWidth: 580 }} className="animate-fadeInUp">
                        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 32px' }} className="animate-glow-pulse">▲</div>
                        <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.04em' }}>
                            You're <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ready.</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 36 }}>
                            {company.name || 'Your company'}'s AI team is standing by. All data stays on-device.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto 32px' }}>
                            {[`${tools.length} tool${tools.length !== 1 ? 's' : ''} selected`, '6 agents active', 'Memory initialized', 'All data stored locally'].map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 800 }}>✓</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                        {selectedToolNames.length > 0 && (
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', maxWidth: 480, margin: '0 auto' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                                    Your tools — we'll connect these on the call
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {selectedToolNames.map(name => (
                                        <span key={name} style={{ background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', borderRadius: 20, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--gold-light)' }}>
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '44px 28px', fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', position: 'relative', overflow: 'hidden' }}>
            <div className="glow-blob glow-blob-gold animate-drift" style={{ width: 700, height: 700, top: '-20%', right: '-15%' }} />
            <div className="orbit-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

            {/* Stepper */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 64, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                {STEPS.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: i <= step ? 'var(--gold-subtle)' : 'var(--surface)', border: `1px solid ${i <= step ? 'var(--border-gold)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: i < step ? 'var(--gold)' : i === step ? 'var(--gold-light)' : 'var(--text-faint)', transition: 'all 0.3s' }}>
                            {i < step ? '✓' : s.icon}
                        </div>
                        {i === step && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold-light)' }}>{s.label}</span>}
                        {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: i < step ? 'var(--border-gold)' : 'var(--border)' }} />}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 740, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {render()}
            </div>

            {/* Nav — hidden during install step since InstallRequiredStep has its own controls */}
            {STEPS[step].id !== 'install' && (
                <div style={{ display: 'flex', gap: 16, marginTop: 52, position: 'relative', zIndex: 1, alignItems: 'center' }}>
                    {step > 0 && <button onClick={back} className="orbit-btn orbit-btn-secondary orbit-btn-sm">← Back</button>}
                    {step < STEPS.length - 1 ? (
                        <button onClick={next} className="orbit-btn orbit-btn-primary" style={{ padding: '16px 48px' }}>
                            {step === 0 ? "Let's Start →" : 'Continue →'}
                        </button>
                    ) : (
                        <button onClick={async () => {
                            await seedOnboardingMemory({ company, tools });
                            navigate('/dashboard');
                        }} className="orbit-btn orbit-btn-primary" style={{ padding: '16px 56px' }}>
                            Enter Dashboard →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OnboardingWizard;
