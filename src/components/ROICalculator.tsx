/**
 * Numin ROI Calculator
 * Real-time savings calculator — shows business owners exactly how much
 * money Numin saves them by automating their workforce tasks.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const ROLES = [
    {
        id: "customer_service",
        label: "Customer Service",
        icon: "⬡",
        agent: "NEXUS",
        color: "#3b82f6",
        automationRate: 0.80,
        description: "Support tickets, live chat, dispute resolution",
        defaultRate: 18,
        defaultCount: 2,
    },
    {
        id: "email_scheduling",
        label: "Email & Scheduling",
        icon: "✦",
        agent: "ARIA",
        color: "#C9A84C",
        automationRate: 0.85,
        description: "Inbox management, calendar, meeting coordination",
        defaultRate: 22,
        defaultCount: 1,
    },
    {
        id: "sales_crm",
        label: "Sales & CRM",
        icon: "◈",
        agent: "VANCE",
        color: "#10b981",
        automationRate: 0.75,
        description: "Lead follow-up, pipeline updates, outreach",
        defaultRate: 28,
        defaultCount: 2,
    },
    {
        id: "marketing",
        label: "Marketing & Content",
        icon: "◆",
        agent: "PRISM",
        color: "#f59e0b",
        automationRate: 0.65,
        description: "Social media, content creation, campaign management",
        defaultRate: 25,
        defaultCount: 1,
    },
    {
        id: "operations",
        label: "Operations & Admin",
        icon: "▲",
        agent: "APEX",
        color: "#ef4444",
        automationRate: 0.80,
        description: "Reporting, KPI tracking, process documentation",
        defaultRate: 24,
        defaultCount: 1,
    },
    {
        id: "bookkeeping",
        label: "Bookkeeping & Finance",
        icon: "◉",
        agent: "APEX",
        color: "#8b5cf6",
        automationRate: 0.60,
        description: "Expense tracking, invoicing, financial reports",
        defaultRate: 32,
        defaultCount: 1,
    },
    {
        id: "hr_admin",
        label: "HR & Onboarding",
        icon: "▦",
        agent: "ARIA",
        color: "#06b6d4",
        automationRate: 0.65,
        description: "Onboarding docs, scheduling interviews, HR tasks",
        defaultRate: 26,
        defaultCount: 1,
    },
    {
        id: "disputes",
        label: "Disputes & Compliance",
        icon: "⬟",
        agent: "NEXUS",
        color: "#f97316",
        automationRate: 0.70,
        description: "Chargebacks, refund workflows, compliance checks",
        defaultRate: 30,
        defaultCount: 1,
    },
];

const PLANS = [
    { name: "Starter", setup: 499, monthly: 49, agents: 2, color: "#3a3f52" },
    { name: "Growth", setup: 2499, monthly: 149, agents: 4, color: "#55657a" },
    { name: "Professional", setup: 4999, monthly: 299, agents: 6, color: "#C9A84C" },
    { name: "Scale", setup: 9999, monthly: 399, agents: 6, color: "#818cf8" },
    { name: "Enterprise", setup: 24999, monthly: 3997, agents: 6, color: "#E8D5A3" },
];

type RoleState = {
    active: boolean;
    count: number;
    hourlyRate: number;
    hoursPerWeek: number;
};

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: {
    value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
    const formatted = value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return <span>{prefix}{formatted}{suffix}</span>;
}

function RoleCard({
    role,
    state,
    onChange,
    isMobile = false,
}: {
    role: typeof ROLES[0];
    state: RoleState;
    onChange: (patch: Partial<RoleState>) => void;
    isMobile?: boolean;
}) {
    const annualCost = state.count * state.hourlyRate * state.hoursPerWeek * 52;
    const savings = annualCost * role.automationRate;

    return (
        <div style={{
            background: state.active ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
            border: `1px solid ${state.active ? `${role.color}35` : "rgba(255,255,255,0.06)"}`,
            borderRadius: 16,
            padding: "20px 22px",
            transition: "all 0.3s",
            cursor: "pointer",
        }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: state.active ? 16 : 0 }}
                onClick={() => onChange({ active: !state.active })}>
                {/* Toggle */}
                <div style={{
                    width: 44, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 2,
                    background: state.active ? `${role.color}` : "rgba(255,255,255,0.08)",
                    position: "relative", transition: "background 0.3s", cursor: "pointer",
                }}>
                    <div style={{
                        position: "absolute", width: 18, height: 18, borderRadius: "50%",
                        background: "#f7f9fc", top: 3,
                        left: state.active ? 23 : 3,
                        transition: "left 0.3s",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                    }} />
                </div>
                {/* Icon + label */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: "0.8rem", color: role.color }}>{role.icon}</span>
                        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: state.active ? "#f7f9fc" : "#55657a" }}>
                            {role.label}
                        </span>
                        <span style={{
                            fontSize: "0.58rem", color: role.color,
                            border: `1px solid ${role.color}40`,
                            background: `${role.color}10`,
                            padding: "2px 8px", borderRadius: 6,
                            textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600,
                        }}>{role.agent}</span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "#3a3f52", lineHeight: 1.4 }}>{role.description}</p>
                </div>
                {/* Savings preview */}
                {state.active && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#34d399", letterSpacing: "-0.02em" }}>
                            <AnimatedNumber value={savings} prefix="$" />
                        </div>
                        <div style={{ fontSize: "0.6rem", color: "#3a3f52", marginTop: 1 }}>saved/yr</div>
                    </div>
                )}
            </div>

            {/* Expanded controls */}
            {state.active && (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 12, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                        <label style={{ fontSize: "0.62rem", color: "#55657a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, display: "block", marginBottom: 6 }}>
                            Employees
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onChange({ count: Math.max(1, state.count - 1) }); }}
                                style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#acb5c4", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                                −
                            </button>
                            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f7f9fc", minWidth: 24, textAlign: "center" }}>{state.count}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onChange({ count: state.count + 1 }); }}
                                style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#acb5c4", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                                +
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: "0.62rem", color: "#55657a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, display: "block", marginBottom: 6 }}>
                            Hourly Rate ($)
                        </label>
                        <input
                            type="number"
                            value={state.hourlyRate}
                            min={10}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onChange({ hourlyRate: Math.max(10, Number(e.target.value)) })}
                            style={{
                                width: "100%", background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                                color: "#f7f9fc", fontSize: "0.9rem", fontWeight: 600,
                                padding: "6px 10px", outline: "none",
                                fontFamily: "Inter, sans-serif",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.62rem", color: "#55657a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, display: "block", marginBottom: 6 }}>
                            Hrs / Week
                        </label>
                        <input
                            type="number"
                            value={state.hoursPerWeek}
                            min={1} max={60}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onChange({ hoursPerWeek: Math.min(60, Math.max(1, Number(e.target.value))) })}
                            style={{
                                width: "100%", background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                                color: "#f7f9fc", fontSize: "0.9rem", fontWeight: 600,
                                padding: "6px 10px", outline: "none",
                                fontFamily: "Inter, sans-serif",
                            }}
                        />
                    </div>
                    {/* Automation rate bar */}
                    <div style={{ gridColumn: "1/-1" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: "0.62rem", color: "#55657a" }}>Numin automation coverage</span>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: role.color }}>{Math.round(role.automationRate * 100)}%</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                            <div style={{
                                height: "100%", borderRadius: 2,
                                width: `${role.automationRate * 100}%`,
                                background: `linear-gradient(90deg, ${role.color}80, ${role.color})`,
                                transition: "width 0.5s ease",
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ROICalculator() {
    const isMobile = useIsMobile();
    const initialState: Record<string, RoleState> = Object.fromEntries(
        ROLES.map(r => [r.id, { active: false, count: r.defaultCount, hourlyRate: r.defaultRate, hoursPerWeek: 40 }])
    );
    const [roleStates, setRoleStates] = useState<Record<string, RoleState>>(initialState);

    const updateRole = (id: string, patch: Partial<RoleState>) => {
        setRoleStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    };

    const results = useMemo(() => {
        const activeRoles = ROLES.filter(r => roleStates[r.id].active);
        if (activeRoles.length === 0) return null;

        let totalEmployeeCost = 0;
        let totalSavings = 0;
        let totalEmployees = 0;
        let totalHoursAutomated = 0;

        for (const role of activeRoles) {
            const s = roleStates[role.id];
            const annualCost = s.count * s.hourlyRate * s.hoursPerWeek * 52;
            const savings = annualCost * role.automationRate;
            const hoursAutomated = s.count * s.hoursPerWeek * 52 * role.automationRate;
            totalEmployeeCost += annualCost;
            totalSavings += savings;
            totalEmployees += s.count;
            totalHoursAutomated += hoursAutomated;
        }

        // Recommend plan
        let planIndex = 0;
        if (activeRoles.length >= 5 || totalEmployees >= 10) planIndex = 2;
        else if (activeRoles.length >= 3 || totalEmployees >= 4) planIndex = 1;
        else planIndex = 0;
        if (totalEmployees >= 20) planIndex = 3;

        const plan = PLANS[planIndex];
        const numinAnnualCost = plan.setup + plan.monthly * 12;
        const netSavings = totalSavings - numinAnnualCost;
        const roi = numinAnnualCost > 0 ? ((netSavings / numinAnnualCost) * 100) : 0;
        const paybackMonths = numinAnnualCost > 0 ? Math.ceil(numinAnnualCost / (totalSavings / 12)) : 0;
        const employeesReplaced = Math.floor(totalSavings / (totalEmployeeCost / totalEmployees));
        const weeksHoursAutomated = Math.round(totalHoursAutomated / 52);

        return {
            totalEmployeeCost,
            totalSavings,
            netSavings,
            roi,
            paybackMonths,
            employeesReplaced,
            weeksHoursAutomated,
            numinAnnualCost,
            plan,
            planIndex,
            activeCount: activeRoles.length,
            totalEmployees,
        };
    }, [roleStates]);

    const activeCount = ROLES.filter(r => roleStates[r.id].active).length;

    return (
        <section id="calculator" style={{
            background: "linear-gradient(180deg, #080b10 0%, #050707 100%)",
            padding: isMobile ? "72px 20px" : "100px 24px",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Background glow */}
            <div style={{
                position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
                width: 800, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,168,76,0.04), transparent 70%)",
                pointerEvents: "none",
            }} />

            <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 64 }}>
                    <p style={{
                        fontSize: "0.68rem", fontWeight: 600, color: "#C9A84C",
                        textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
                        ROI Calculator
                    </p>
                    <h2 style={{
                        fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, color: "#f7f9fc",
                        lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16,
                    }}>
                        See exactly how much{" "}
                        <span style={{ color: "rgba(247,249,252,0.3)", fontWeight: 300, fontStyle: "italic" }}>you're overpaying</span>
                        <br />for work Numin can do.
                    </h2>
                    <p style={{ fontSize: "0.95rem", color: "#55657a", maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
                        Select the roles in your business below. Enter your real numbers. Watch Numin show you what you could reclaim.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? 24 : 28, alignItems: "start" }}>

                    {/* LEFT — Role selector */}
                    <div>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginBottom: 16,
                        }}>
                            <p style={{ fontSize: "0.72rem", color: "#55657a", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
                                Select roles you currently pay humans to do
                            </p>
                            {activeCount > 0 && (
                                <span style={{
                                    fontSize: "0.68rem", color: "#C9A84C",
                                    background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
                                    padding: "3px 10px", borderRadius: 100,
                                }}>
                                    {activeCount} selected
                                </span>
                            )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {ROLES.map(role => (
                                <RoleCard
                                    key={role.id}
                                    role={role}
                                    state={roleStates[role.id]}
                                    onChange={(patch) => updateRole(role.id, patch)}
                            isMobile={isMobile}
                                />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Results panel (sticky) */}
                    <div style={{ position: isMobile ? "static" : "sticky", top: 88 }}>
                        {!results ? (
                            /* Empty state */
                            <div style={{
                                background: "#0c0f14", border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 20, padding: "48px 32px", textAlign: "center",
                            }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 16, opacity: 0.3 }}>◉</div>
                                <p style={{ fontSize: "0.88rem", color: "#3a3f52", lineHeight: 1.7 }}>
                                    Select the roles on the left to see your real-time savings calculation.
                                </p>
                                <div style={{ marginTop: 24, fontSize: "0.72rem", color: "#2a2f3a" }}>
                                    ← Start by toggling a role
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: "linear-gradient(160deg, rgba(201,168,76,0.08) 0%, #0c0f14 50%)",
                                border: "1px solid rgba(201,168,76,0.3)",
                                borderRadius: 20, overflow: "hidden",
                            }}>
                                {/* Top gradient bar */}
                                <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #C9A84C, #E8D5A3, #C9A84C, transparent)" }} />

                                <div style={{ padding: "28px 28px 24px" }}>

                                    {/* Main savings number */}
                                    <div style={{ textAlign: "center", marginBottom: 28 }}>
                                        <p style={{ fontSize: "0.62rem", color: "#55657a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8, fontWeight: 600 }}>
                                            Your Annual Savings with Numin
                                        </p>
                                        <div style={{
                                            fontSize: "clamp(2.4rem, 5vw, 3.2rem)", fontWeight: 900,
                                            color: results.netSavings > 0 ? "#34d399" : "#ef4444",
                                            letterSpacing: "-0.03em", lineHeight: 1,
                                            animation: "counter-pulse 2s ease-in-out infinite",
                                        }}>
                                            <AnimatedNumber
                                                value={Math.abs(results.netSavings)}
                                                prefix={results.netSavings >= 0 ? "+$" : "-$"}
                                            />
                                        </div>
                                        <p style={{ fontSize: "0.72rem", color: "#3a3f52", marginTop: 6 }}>
                                            per year · net after Numin cost
                                        </p>
                                    </div>

                                    {/* Stats grid */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                                        {[
                                            { label: "Current payroll cost", val: `$${results.totalEmployeeCost.toLocaleString()}`, sub: "annual for selected roles", color: "#ef4444" },
                                            { label: "Numin automates", val: `$${results.totalSavings.toLocaleString()}`, sub: "of that cost per year", color: "#C9A84C" },
                                            { label: "Hours automated", val: `${results.weeksHoursAutomated}h`, sub: "per week freed up", color: "#60a5fa" },
                                            { label: "Payback period", val: `${results.paybackMonths}mo`, sub: "until Numin pays for itself", color: "#34d399" },
                                        ].map(s => (
                                            <div key={s.label} style={{
                                                background: "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.05)",
                                                borderRadius: 12, padding: "14px 14px",
                                            }}>
                                                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.val}</div>
                                                <div style={{ fontSize: "0.6rem", color: "#3a3f52", marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Employees replaced */}
                                    {results.employeesReplaced > 0 && (
                                        <div style={{
                                            background: "rgba(201,168,76,0.06)",
                                            border: "1px solid rgba(201,168,76,0.15)",
                                            borderRadius: 12, padding: "14px 18px",
                                            display: "flex", alignItems: "center", gap: 14,
                                            marginBottom: 20,
                                        }}>
                                            <div style={{
                                                fontSize: "2rem", fontWeight: 900, color: "#C9A84C",
                                                letterSpacing: "-0.03em", lineHeight: 1, flexShrink: 0,
                                            }}>
                                                {results.employeesReplaced}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f7f9fc" }}>
                                                    Roles Numin can fully replace
                                                </div>
                                                <div style={{ fontSize: "0.7rem", color: "#55657a", marginTop: 2 }}>
                                                    of your {results.totalEmployees} selected employees' work
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ROI bar */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: "0.65rem", color: "#55657a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Return on Investment</span>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: results.roi > 0 ? "#34d399" : "#ef4444" }}>
                                                {results.roi > 0 ? "+" : ""}{Math.round(results.roi)}%
                                            </span>
                                        </div>
                                        <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%", borderRadius: 3,
                                                width: `${Math.min(100, Math.max(0, results.roi / 10))}%`,
                                                background: results.roi > 0
                                                    ? "linear-gradient(90deg, #C9A84C, #34d399)"
                                                    : "#ef4444",
                                                transition: "width 0.6s ease",
                                            }} />
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 20 }} />

                                    {/* Recommended plan */}
                                    <div>
                                        <p style={{ fontSize: "0.6rem", color: "#55657a", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 10 }}>
                                            Recommended plan for you
                                        </p>
                                        <div style={{
                                            background: "rgba(201,168,76,0.05)",
                                            border: "1px solid rgba(201,168,76,0.2)",
                                            borderRadius: 12, padding: "16px 18px",
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            marginBottom: 14,
                                        }}>
                                            <div>
                                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f7f9fc", letterSpacing: "-0.02em" }}>
                                                    {results.plan.name}
                                                </div>
                                                <div style={{ fontSize: "0.72rem", color: "#55657a", marginTop: 2 }}>
                                                    ${results.plan.setup.toLocaleString()} setup · ${results.plan.monthly.toLocaleString()}/mo
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 600 }}>
                                                    ${results.numinAnnualCost.toLocaleString()}/yr
                                                </div>
                                                <div style={{ fontSize: "0.6rem", color: "#3a3f52", marginTop: 1 }}>total annual cost</div>
                                            </div>
                                        </div>

                                        {/* Plan switcher pills */}
                                        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
                                            {PLANS.map((p, i) => (
                                                <div key={p.name} style={{
                                                    fontSize: "0.62rem", padding: "4px 12px", borderRadius: 100,
                                                    fontWeight: 600, letterSpacing: "0.06em",
                                                    background: i === results.planIndex ? "rgba(201,168,76,0.12)" : "transparent",
                                                    border: `1px solid ${i === results.planIndex ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.06)"}`,
                                                    color: i === results.planIndex ? "#C9A84C" : "#3a3f52",
                                                }}>
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>

                                        <Link to="/auth" style={{
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                            padding: "14px", borderRadius: 12, width: "100%",
                                            background: "linear-gradient(135deg, #C9A84C, #f0d078)",
                                            color: "#050707", fontSize: "0.85rem", fontWeight: 700,
                                            textDecoration: "none", letterSpacing: "0.04em",
                                            boxShadow: "0 4px 20px rgba(201,168,76,0.25)",
                                            transition: "all 0.2s",
                                        }}>
                                            Get {results.plan.name} — Save ${Math.abs(results.netSavings).toLocaleString()}/yr →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
