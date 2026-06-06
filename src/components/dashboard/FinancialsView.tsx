/**
 * Financials — Full business financial breakdown
 * Data populates from conversations with NUMIN via the Command page.
 * All numbers are documented by the customer through natural language.
 */

const CATEGORIES = [
    { label: 'Revenue', icon: '↑', color: '#34d399', items: ['Client Payments', 'Recurring Subscriptions', 'One-time Sales', 'Other Income'] },
    { label: 'Expenses', icon: '↓', color: '#f87171', items: ['Payroll & Contractors', 'Software & Tools', 'Marketing & Ads', 'Office & Operations'] },
];

const EMPTY_METRICS = [
    { label: 'Monthly Revenue', value: '—', sub: 'Not yet logged' },
    { label: 'Monthly Expenses', value: '—', sub: 'Not yet logged' },
    { label: 'Net Profit', value: '—', sub: 'Not yet logged' },
    { label: 'Profit Margin', value: '—', sub: 'Not yet logged' },
    { label: 'Cash on Hand', value: '—', sub: 'Not yet logged' },
    { label: 'Outstanding Invoices', value: '—', sub: 'Not yet logged' },
];

export default function FinancialsView() {
    return (
        <div style={{ padding: '36px 40px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
                <div>
                    <div className="orbit-eyebrow" style={{ marginBottom: 10 }}>Business Intelligence</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
                        Financial <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Overview</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
                        Log your financials by telling NUMIN on the Command page. All data stays on your machine.
                    </p>
                </div>
                <button className="orbit-btn orbit-btn-secondary orbit-btn-sm" onClick={() => window.location.hash = '#command'}>
                    + Add via NUMIN →
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {EMPTY_METRICS.map(m => (
                    <div key={m.label} className="orbit-card" style={{ padding: 28 }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 14 }}>{m.label}</div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '-0.03em', opacity: 0.35 }}>—</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 10 }}>{m.sub}</div>
                    </div>
                ))}
            </div>

            {/* Income / Expense breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {CATEGORIES.map(cat => (
                    <div key={cat.label} className="orbit-card-flat" style={{ padding: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <span style={{ color: cat.color, fontSize: '1rem', fontWeight: 800 }}>{cat.icon}</span>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: cat.color }}>{cat.label}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {cat.items.map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item}</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-faint)', fontWeight: 600 }}>—</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* How to use */}
            <div className="orbit-card-flat" style={{ padding: 32, borderColor: 'var(--border-gold)', background: 'rgba(201,168,76,0.02)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 16 }}>
                    How to Log Financials
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { step: '1', title: 'Tell NUMIN', desc: 'Go to Command and say "Log $12,500 revenue from client ABC for March"' },
                        { step: '2', title: 'NUMIN Confirms', desc: 'Your agent confirms and records it to your business memory' },
                        { step: '3', title: 'See it Here', desc: 'Numbers update automatically on this page as data comes in' },
                    ].map(s => (
                        <div key={s.step} style={{ padding: '20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', marginBottom: 12 }}>{s.step}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{s.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
