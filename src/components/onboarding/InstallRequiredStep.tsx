/**
 * InstallRequiredStep — shown when Hermes gateway is not reachable
 * Part of the OnboardingWizard flow.
 */
import { useState, useEffect } from 'react';

interface Props {
  onInstalled: () => void;
}

const INSTALL_COMMAND = 'curl -sSL https://numin.ai/install.sh | sh';

export default function InstallRequiredStep({ onInstalled }: Props) {
  const [checking, setChecking] = useState(false);
  const [detected, setDetected] = useState<boolean | null>(null);

  const checkHermes = async () => {
    setChecking(true);
    setDetected(null);
    try {
      const res = await fetch('http://localhost:18789/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      setDetected(res.ok);
    } catch {
      setDetected(false);
    } finally {
      setChecking(false);
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkHermes();
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText(INSTALL_COMMAND).catch(() => {});
  };

  const openTerminal = () => {
    // Attempt to open terminal with the command copied
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const isLinux = navigator.platform.toLowerCase().includes('linux');
    if (isMac) {
      window.open('macosx://');
    }
    copyCommand();
  };

  if (detected === true) {
    // Hermes is up — allow progression
    onInstalled();
    return null;
  }

  return (
    <div style={{ textAlign: 'center', maxWidth: 600 }} className="animate-fadeInUp">
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '2rem',
        }}
      >
        ⚙️
      </div>

      <h2
        style={{
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          marginBottom: 12,
          letterSpacing: '-0.04em',
        }}
      >
        Install Numin first.
      </h2>

      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: 1.8,
          marginBottom: 40,
          maxWidth: 480,
          margin: '0 auto 40px',
        }}
      >
        Numin runs on your Mac Mini. Open a terminal, paste the command below, and run it — then come back here.
      </p>

      {/* Command block */}
      <div
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 24px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <code
          style={{
            flex: 1,
            fontSize: '0.88rem',
            color: 'var(--gold)',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            userSelect: 'all',
          }}
        >
          {INSTALL_COMMAND}
        </code>
        <button
          onClick={copyCommand}
          style={{
            background: 'var(--surface-overlay)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            (e.target as HTMLElement).style.color = 'var(--text-primary)';
            (e.target as HTMLElement).style.borderColor = 'var(--border-focus)';
          }}
          onMouseOut={e => {
            (e.target as HTMLElement).style.color = 'var(--text-muted)';
            (e.target as HTMLElement).style.borderColor = 'var(--border)';
          }}
        >
          Copy
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={checkHermes}
          disabled={checking}
          style={{
            background: checking ? 'var(--surface-raised)' : 'var(--surface-overlay)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '14px 28px',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: checking ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: checking ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {checking ? '◌ Checking…' : '↻ I ran it — check again'}
        </button>

        {detected === false && (
          <button
            onClick={() => {
              const terminalUrl =
                navigator.platform.toLowerCase().includes('win')
                  ? 'cmd.exe'
                  : 'macosx://';
              window.open(terminalUrl, '_blank');
            }}
            style={{
              background: 'var(--gold-subtle)',
              border: '1px solid var(--border-gold)',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--gold-light)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ⎋ Open Terminal
          </button>
        )}
      </div>

      {detected === false && (
        <p
          style={{
            marginTop: 24,
            fontSize: '0.72rem',
            color: 'var(--text-faint)',
            lineHeight: 1.6,
          }}
        >
          Installation takes ~2 minutes. Requires macOS or Linux. After install, the Hermes
          gateway runs at{' '}
          <code style={{ color: 'var(--text-muted)' }}>localhost:18789</code>.
        </p>
      )}

      {detected === null && (
        <p
          style={{
            marginTop: 24,
            fontSize: '0.72rem',
            color: 'var(--text-faint)',
          }}
        >
          Checking if Numin is running…
        </p>
      )}
    </div>
  );
}
