import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";

export default function NuminAuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06060A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#f7f9fc',
          letterSpacing: '-0.02em',
          marginBottom: '4px',
        }}>
          numin<span style={{ color: '#C9A84C' }}>.</span>
        </h1>
        <p style={{ color: '#55657a', fontSize: '0.85rem' }}>AI Business Operating System</p>
      </div>

      {/* Clerk component */}
      {mode === 'signin' ? (
        <SignIn
          routing="hash"
          afterSignInUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#C9A84C',
              colorBackground: '#0c0f14',
              colorInputBackground: '#111520',
              colorInputText: '#f7f9fc',
              colorText: '#acb5c4',
              colorTextSecondary: '#55657a',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            },
            elements: {
              card: { boxShadow: 'none', border: '1px solid rgba(255,255,255,0.06)' },
              formButtonPrimary: { backgroundColor: '#C9A84C', color: '#06060A', fontWeight: 700 },
              footerActionLink: { color: '#C9A84C' },
            }
          }}
        />
      ) : (
        <SignUp
          routing="hash"
          afterSignUpUrl="/onboard"
          appearance={{
            variables: {
              colorPrimary: '#C9A84C',
              colorBackground: '#0c0f14',
              colorInputBackground: '#111520',
              colorInputText: '#f7f9fc',
              colorText: '#acb5c4',
              colorTextSecondary: '#55657a',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            },
            elements: {
              card: { boxShadow: 'none', border: '1px solid rgba(255,255,255,0.06)' },
              formButtonPrimary: { backgroundColor: '#C9A84C', color: '#06060A', fontWeight: 700 },
              footerActionLink: { color: '#C9A84C' },
            }
          }}
        />
      )}

      {/* Toggle */}
      <p style={{ marginTop: '20px', color: '#55657a', fontSize: '0.82rem' }}>
        {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
