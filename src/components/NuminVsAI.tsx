/**
 * NuminVsAI — "This isn't ChatGPT" education section
 * Addresses the #1 objection: "isn't this just another AI chatbot?"
 */
import { useIsMobile } from "@/hooks/use-mobile";

const COMPARISON_ROWS = [
    {
        category: "Memory",
        icon: "◈",
        chatgpt: "Forgets everything when you close the tab. No memory of your business, your clients, or your history.",
        numin: "Permanent, growing memory of your entire business. Remembers every client, decision, conversation — forever.",
        winner: "numin",
    },
    {
        category: "Action",
        icon: "▲",
        chatgpt: "Gives you text. You still have to do everything yourself — copy, paste, send, update, schedule.",
        numin: "Takes real action. Sends emails, updates your CRM, schedules meetings, routes tickets — automatically.",
        winner: "numin",
    },
    {
        category: "Business Context",
        icon: "⬡",
        chatgpt: "Knows nothing about your business. Every conversation starts from zero. Generic answers for everyone.",
        numin: "Trained specifically on YOUR business — your products, clients, team, workflows, and rules.",
        winner: "numin",
    },
    {
        category: "Agents",
        icon: "✦",
        chatgpt: "One generalist. Good at many things, expert at nothing. No specialization for your specific needs.",
        numin: "6 specialized AI executives — each one owns a domain: sales, support, marketing, ops, exec, and command.",
        winner: "numin",
    },
    {
        category: "Privacy & Data",
        icon: "◉",
        chatgpt: "Your conversations train their models. Your business data goes to their servers — permanently.",
        numin: "100% local. Everything runs on your Mac mini. Your data never leaves your building. Ever.",
        winner: "numin",
    },
    {
        category: "Always On",
        icon: "◆",
        chatgpt: "Waits to be asked. Completely passive. Nothing happens unless a human manually types a message.",
        numin: "Runs 24/7 autonomously. Monitors your business, sends briefings, flags issues — while you sleep.",
        winner: "numin",
    },
    {
        category: "Integrations",
        icon: "▦",
        chatgpt: "Isolated. Cannot access your Gmail, calendar, CRM, Slack, or any of your actual business tools.",
        numin: "Fully connected. Lives inside your real tools — reads your inbox, updates deals, books meetings.",
        winner: "numin",
    },
    {
        category: "Setup",
        icon: "◎",
        chatgpt: "You type a prompt. That's it. No configuration for your business, no roles, no workflows.",
        numin: "Pre-configured before it ships. Agents are trained on your business before the box arrives at your door.",
        winner: "numin",
    },
    {
        category: "Hardware",
        icon: "⬟",
        chatgpt: "Lives in the cloud. Dependent on their servers, their uptime, their pricing changes.",
        numin: "Runs on a Mac mini in your office. You own the hardware. No cloud dependency. No outages.",
        winner: "numin",
    },
    {
        category: "Purpose",
        icon: "◈",
        chatgpt: "A conversation tool. Built to answer questions and generate text for anyone, anywhere.",
        numin: "A business operating system. Built to run your company — not to chat, but to execute.",
        winner: "numin",
    },
];

const FUNDAMENTALS = [
    {
        number: "01",
        title: "ChatGPT answers. Numin acts.",
        body: "The difference between a search engine and an employee. When you ask ChatGPT to follow up with a lead, it writes you a message and stops. When you tell VANCE to follow up, the email goes out, the CRM gets updated, and you get a confirmation. Numin doesn't give you work to do — it does the work.",
        icon: "▲",
        color: "#C9A84C",
    },
    {
        number: "02",
        title: "ChatGPT forgets. Numin remembers everything.",
        body: "Every conversation you've ever had with your AI agents is stored permanently on your hardware. NUMIN knows your client Sarah prefers morning calls. It knows you closed the Alvarez deal in November. It knows your pricing changed in Q1. That institutional knowledge compounds every single day — and it's yours forever.",
        icon: "◈",
        color: "#60a5fa",
    },
    {
        number: "03",
        title: "ChatGPT is a tool. Numin is infrastructure.",
        body: "ChatGPT is software you open when you need it. Numin is the operating layer your business runs on — always active, always monitoring, always working. The same way your business has a phone system, an internet connection, and a POS terminal, it now has an AI layer that handles the cognitive work 24 hours a day.",
        icon: "◉",
        color: "#34d399",
    },
];

export default function NuminVsAI() {
    const isMobile = useIsMobile();
    return (
        <section id="vs-ai" style={{
            background: "linear-gradient(180deg, #050707 0%, #080b10 40%, #050707 100%)",
            padding: isMobile ? "72px 20px" : "100px 24px",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Background pattern */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "radial-gradient(rgba(201,168,76,0.03) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 70%)",
            }} />

            <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* ── HEADER ── */}
                <div style={{ textAlign: "center", marginBottom: 80 }}>
                    <p style={{
                        fontSize: "0.68rem", fontWeight: 600, color: "#C9A84C",
                        textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
                        Not a chatbot. Not even close.
                    </p>

                    <h2 style={{
                        fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800,
                        color: "#f7f9fc", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24,
                    }}>
                        "Wait — isn't this just{" "}
                        <span style={{
                            color: "rgba(247,249,252,0.25)",
                            fontWeight: 300,
                            fontStyle: "italic",
                            textDecoration: "line-through",
                            textDecorationColor: "rgba(239,68,68,0.4)",
                        }}>ChatGPT?</span>"
                        <br />
                        <span style={{ color: "#C9A84C" }}>No. It's a different category entirely.</span>
                    </h2>

                    <p style={{
                        fontSize: "1rem", color: "#55657a", maxWidth: 620,
                        margin: "0 auto", lineHeight: 1.85,
                    }}>
                        ChatGPT, Gemini, and Claude are <strong style={{ color: "#acb5c4" }}>conversation tools</strong> — you ask, they answer, you do the work. Numin is a <strong style={{ color: "#E8D5A3" }}>business operating system</strong> — it lives on your hardware, knows your entire business history, connects to your real tools, and executes tasks automatically while you focus on what matters.
                    </p>
                </div>

                {/* ── CONCEPT SPLIT ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? 12 : 3,
                    borderRadius: 20, overflow: "hidden", marginBottom: 60,
                    border: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}>
                    {/* LEFT — What AI chatbots are */}
                    <div style={{
                        background: "rgba(239,68,68,0.04)",
                        padding: isMobile ? "28px 24px" : "36px 40px",
                        borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.04)",
                        border: isMobile ? "1px solid rgba(239,68,68,0.1)" : undefined,
                        borderRadius: isMobile ? 16 : 0,
                    }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: 100, padding: "4px 14px", marginBottom: 20,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.12em" }}>ChatGPT / Gemini / Claude</span>
                        </div>
                        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f7f9fc", marginBottom: 8, letterSpacing: "-0.02em" }}>
                            A tool you open when you need it.
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "#55657a", lineHeight: 1.75, marginBottom: 24 }}>
                            Powerful for writing, research, and brainstorming — but fundamentally passive. It waits. It forgets. It can't take action in your business.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                "Answers questions, gives you work to do",
                                "Forgets everything when you close the tab",
                                "No access to your email, CRM, or calendar",
                                "Generic — knows nothing about your business",
                                "Your data goes to their servers",
                                "Only works when you're actively using it",
                                "One generalist with no specialization",
                                "You're still the operator",
                            ].map(item => (
                                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.82rem", color: "#55657a" }}>
                                    <span style={{ color: "#ef4444", flexShrink: 0, marginTop: 1, fontSize: "0.7rem" }}>✕</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — What Numin is */}
                    <div style={{
                        background: "rgba(201,168,76,0.05)",
                        padding: isMobile ? "28px 24px" : "36px 40px",
                        border: isMobile ? "1px solid rgba(201,168,76,0.15)" : undefined,
                        borderRadius: isMobile ? 16 : 0,
                    }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)",
                            borderRadius: 100, padding: "4px 14px", marginBottom: 20,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", animation: "pulse-dot 2s ease-in-out infinite" }} />
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.12em" }}>Numin</span>
                        </div>
                        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f7f9fc", marginBottom: 8, letterSpacing: "-0.02em" }}>
                            The operating system your business runs on.
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "#acb5c4", lineHeight: 1.75, marginBottom: 24 }}>
                            Six specialized AI executives running 24/7 on hardware in your office — connected to your real tools, trained on your business, taking real action every day.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                "Takes action — sends, schedules, updates, executes",
                                "Permanent memory of your entire business history",
                                "Lives inside Gmail, CRM, calendar, Slack, and more",
                                "Trained specifically on your business before delivery",
                                "Everything runs locally — your data never leaves your building",
                                "Operates 24/7, proactively monitors and alerts",
                                "6 specialized agents, each owning a business domain",
                                "Numin is the operator — you just lead",
                            ].map(item => (
                                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.82rem", color: "#E8D5A3" }}>
                                    <span style={{ color: "#C9A84C", flexShrink: 0, marginTop: 1, fontSize: "0.7rem" }}>✓</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── DETAILED COMPARISON TABLE ── */}
                <div style={{ marginBottom: 80 }}>
                    <h3 style={{
                        fontSize: "1.5rem", fontWeight: 700, color: "#f7f9fc",
                        letterSpacing: "-0.02em", textAlign: "center", marginBottom: 32,
                    }}>
                        Feature by feature — the full picture
                    </h3>

                    {/* Table header */}
                    <div style={{
                        display: isMobile ? "none" : "grid",
                        gridTemplateColumns: "180px 1fr 1fr",
                        gap: 0, marginBottom: 2,
                    }}>
                        <div style={{ padding: "12px 16px" }} />
                        <div style={{
                            padding: "12px 20px", textAlign: "center",
                            background: "rgba(239,68,68,0.06)", borderRadius: "12px 0 0 0",
                            border: "1px solid rgba(239,68,68,0.12)", borderRight: "none",
                        }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                ChatGPT / Gemini
                            </span>
                        </div>
                        <div style={{
                            padding: "12px 20px", textAlign: "center",
                            background: "rgba(201,168,76,0.08)", borderRadius: "0 12px 0 0",
                            border: "1px solid rgba(201,168,76,0.2)", borderLeft: "none",
                        }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                Numin
                            </span>
                        </div>
                    </div>

                    {/* Table rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {COMPARISON_ROWS.map((row, i) => (
                            isMobile ? (
                                /* Mobile: stacked card per row */
                                <div key={row.category} style={{
                                    background: "#0c0f14",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 14, overflow: "hidden", marginBottom: 8,
                                }}>
                                    <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <span style={{ fontSize: "0.72rem", color: "#C9A84C" }}>{row.icon}</span>
                                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#acb5c4" }}>{row.category}</span>
                                    </div>
                                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(239,68,68,0.06)", background: "rgba(239,68,68,0.02)", display: "flex", gap: 8 }}>
                                        <span style={{ color: "#ef4444", flexShrink: 0, fontSize: "0.65rem", marginTop: 2 }}>✕</span>
                                        <span style={{ fontSize: "0.78rem", color: "#55657a", lineHeight: 1.6 }}>{row.chatgpt}</span>
                                    </div>
                                    <div style={{ padding: "12px 16px", background: "rgba(201,168,76,0.03)", display: "flex", gap: 8 }}>
                                        <span style={{ color: "#C9A84C", flexShrink: 0, fontSize: "0.65rem", marginTop: 2 }}>✓</span>
                                        <span style={{ fontSize: "0.78rem", color: "#E8D5A3", lineHeight: 1.6 }}>{row.numin}</span>
                                    </div>
                                </div>
                            ) : (
                                <div key={row.category} style={{
                                    display: "grid", gridTemplateColumns: "180px 1fr 1fr",
                                    gap: 0,
                                    borderRadius: i === COMPARISON_ROWS.length - 1 ? "0 0 16px 16px" : 0,
                                    overflow: "hidden",
                                }}>
                                    <div style={{
                                        padding: "18px 16px", background: "#0c0f14",
                                        borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                        display: "flex", alignItems: "center", gap: 10,
                                    }}>
                                        <span style={{ fontSize: "0.75rem", color: "#C9A84C", flexShrink: 0 }}>{row.icon}</span>
                                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#acb5c4", letterSpacing: "0.02em" }}>{row.category}</span>
                                    </div>
                                    <div style={{
                                        padding: "18px 20px", background: "rgba(239,68,68,0.025)",
                                        borderLeft: "1px solid rgba(239,68,68,0.08)",
                                        borderRight: "1px solid rgba(255,255,255,0.03)",
                                        borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid rgba(239,68,68,0.05)" : "none",
                                        display: "flex", alignItems: "flex-start", gap: 10,
                                    }}>
                                        <span style={{ color: "#ef4444", flexShrink: 0, fontSize: "0.65rem", marginTop: 3 }}>✕</span>
                                        <span style={{ fontSize: "0.8rem", color: "#55657a", lineHeight: 1.6 }}>{row.chatgpt}</span>
                                    </div>
                                    <div style={{
                                        padding: "18px 20px", background: "rgba(201,168,76,0.03)",
                                        borderLeft: "1px solid rgba(201,168,76,0.08)",
                                        borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid rgba(201,168,76,0.05)" : "none",
                                        display: "flex", alignItems: "flex-start", gap: 10,
                                    }}>
                                        <span style={{ color: "#C9A84C", flexShrink: 0, fontSize: "0.65rem", marginTop: 3 }}>✓</span>
                                        <span style={{ fontSize: "0.8rem", color: "#E8D5A3", lineHeight: 1.6 }}>{row.numin}</span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* ── THE THREE FUNDAMENTALS ── */}
                <div>
                    <h3 style={{
                        fontSize: "1.5rem", fontWeight: 700, color: "#f7f9fc",
                        letterSpacing: "-0.02em", textAlign: "center", marginBottom: 8,
                    }}>
                        The three things that make Numin a different category
                    </h3>
                    <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#3a3f52", marginBottom: 40 }}>
                        Not incremental improvements. Fundamental differences in how the technology works.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 14 : 20 }}>
                        {FUNDAMENTALS.map(f => (
                            <div key={f.number} style={{
                                background: "#0c0f14",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 20, padding: "36px 32px",
                                position: "relative", overflow: "hidden",
                                transition: "border-color 0.3s, transform 0.3s",
                            }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}30`;
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                }}
                            >
                                {/* Background glow */}
                                <div style={{
                                    position: "absolute", inset: 0, pointerEvents: "none",
                                    background: `radial-gradient(circle at 80% 10%, ${f.color}06, transparent 60%)`,
                                    borderRadius: 20,
                                }} />

                                {/* Number */}
                                <div style={{
                                    fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.04em",
                                    color: `${f.color}15`, lineHeight: 1, marginBottom: 16,
                                    fontVariantNumeric: "tabular-nums",
                                }}>
                                    {f.number}
                                </div>

                                {/* Icon */}
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: `${f.color}10`, border: `1px solid ${f.color}20`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.1rem", color: f.color, marginBottom: 20,
                                }}>
                                    {f.icon}
                                </div>

                                <h4 style={{
                                    fontSize: "1.1rem", fontWeight: 700, color: "#f7f9fc",
                                    letterSpacing: "-0.02em", marginBottom: 14, lineHeight: 1.3,
                                }}>
                                    {f.title}
                                </h4>
                                <p style={{
                                    fontSize: "0.82rem", color: "#55657a",
                                    lineHeight: 1.8,
                                }}>
                                    {f.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── BOTTOM CALLOUT ── */}
                <div style={{
                    marginTop: 64, textAlign: "center",
                    padding: "48px 40px",
                    background: "rgba(201,168,76,0.04)",
                    border: "1px solid rgba(201,168,76,0.12)",
                    borderRadius: 20,
                }}>
                    <p style={{
                        fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                        fontWeight: 700, color: "#f7f9fc",
                        lineHeight: 1.5, letterSpacing: "-0.02em", marginBottom: 12,
                    }}>
                        ChatGPT is a calculator.<br />
                        <span style={{ color: "#C9A84C" }}>Numin is the accountant.</span>
                    </p>
                    <p style={{ fontSize: "0.88rem", color: "#55657a", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.8 }}>
                        One gives you a tool to do work with. The other does the work. That's not a feature difference — that's a category difference. Numin is the first AI system built specifically to run a business, not just assist one.
                    </p>
                    <a href="#pricing" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "13px 32px", borderRadius: 100,
                        background: "linear-gradient(135deg, #C9A84C, #f0d078)",
                        color: "#050707", fontSize: "0.85rem", fontWeight: 700,
                        textDecoration: "none", letterSpacing: "0.04em",
                        boxShadow: "0 4px 20px rgba(201,168,76,0.25)",
                        transition: "all 0.2s",
                    }}>
                        See Pricing →
                    </a>
                </div>
            </div>
        </section>
    );
}
