import React from 'react';
import { Link } from 'react-router-dom';

interface NuminLogoProps {
    scale?: number;
    className?: string;
    style?: React.CSSProperties;
    href?: string;
}

export default function NuminLogo({ scale = 1, className = '', style = {}, href = '/' }: NuminLogoProps) {
    const baseSize = 24; // Base height of the logo unit
    const scaledSize = baseSize * scale;

    const logoContent = (
        <div
            className={`numin-logo ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10 * scale,
                textDecoration: 'none',
                ...style
            }}
        >
            {/* Geometric Core Mark */}
            <div style={{
                width: scaledSize * 1.25,
                height: scaledSize * 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ overflow: 'visible' }}
                >
                    {/* Outer perfect circle */}
                    <circle cx="50" cy="50" r="46" stroke="#f7f9fc" strokeWidth="2.5" />

                    {/* Inner elliptical ring */}
                    <ellipse cx="50" cy="50" rx="40" ry="18" stroke="#f7f9fc" strokeWidth="2.5" transform="rotate(-35 50 50)" />

                    {/* Solid Gold Core */}
                    <circle cx="50" cy="50" r="22" fill="#C9A84C" />
                </svg>
            </div>

            {/* Typographic Mark */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                lineHeight: 1
            }}>
                <span style={{
                    fontSize: `${1.4 * scale}rem`,
                    fontWeight: 800,
                    color: '#f7f9fc',
                    letterSpacing: '-0.03em',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    numin
                </span>
                <span style={{
                    fontSize: `${1.4 * scale}rem`,
                    fontWeight: 800,
                    color: '#C9A84C',
                    fontFamily: "'Inter', sans-serif",
                    marginLeft: `${1 * scale}px`
                }}>
                    .
                </span>
            </div>
        </div>
    );

    // If href starts with /, make it a router Link. Otherwise an <a> tag.
    if (href.startsWith('/')) {
        return (
            <Link to={href} style={{ textDecoration: 'none' }}>
                {logoContent}
            </Link>
        );
    }

    return (
        <a href={href} style={{ textDecoration: 'none' }}>
            {logoContent}
        </a>
    );
}
