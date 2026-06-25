import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default async function GET() {
return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          fontFamily: '-apple-system, "Inter", "Segoe UI", sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial glow — top center */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 40%, transparent 70%)',
          }}
        />

        {/* Grid lines overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Chat bubble decorations — top left */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: 0.12,
          }}
        >
          {['Hi there! 👋', 'Hello!', 'How are you?'].map((msg, i) => (
            <div
              key={i}
              style={{
                padding: '10px 16px',
                borderRadius: i % 2 === 0 ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                background: i % 2 === 0 ? '#111' : '#fff',
                color: i % 2 === 0 ? '#888' : '#000',
                fontSize: '14px',
                fontWeight: 500,
                border: '1px solid #222',
                alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
              }}
            >
              {msg}
            </div>
          ))}
        </div>

        {/* Chat bubble decorations — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            opacity: 0.12,
          }}
        >
          {["What's up?", 'Nice to meet you!', '😊'].map((msg, i) => (
            <div
              key={i}
              style={{
                padding: '10px 16px',
                borderRadius: i % 2 === 0 ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: i % 2 === 0 ? '#fff' : '#111',
                color: i % 2 === 0 ? '#000' : '#888',
                fontSize: '14px',
                fontWeight: 500,
                border: '1px solid #222',
                alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start',
              }}
            >
              {msg}
            </div>
          ))}
        </div>

        {/* Center content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Icon mark */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              boxShadow: '0 0 60px rgba(255,255,255,0.1)',
            }}
          >
            {/* Chat bubble SVG icon */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="3" width="28" height="20" rx="6" fill="#000000" />
              <circle cx="9"  cy="13" r="2.5" fill="#ffffff" />
              <circle cx="16" cy="13" r="2.5" fill="#ffffff" />
              <circle cx="23" cy="13" r="2.5" fill="#ffffff" />
              <polygon points="6,22 14,22 6,30" fill="#000000" />
            </svg>
          </div>

          {/* Brand name */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            Real Online Chat
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '22px',
              fontWeight: 400,
              color: '#555555',
              letterSpacing: '0.5px',
              marginBottom: '40px',
            }}
          >
            Connect. Chat. Discover.
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {['Anonymous', 'Free', 'Worldwide', 'No Signup'].map((text) => (
              <div
                key={text}
                style={{
                  padding: '8px 16px',
                  borderRadius: '99px',
                  background: '#0d0d0d',
                  border: '1px solid #1e1e1e',
                  color: '#555',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            color: '#2a2a2a',
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}
        >
          realonlinechat.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
