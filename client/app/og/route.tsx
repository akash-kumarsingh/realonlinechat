import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
          fontFamily: '-apple-system, sans-serif',
        }}
      >
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
          }}
        >
          <div style={{ fontSize: '40px' }}>💬</div>
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-2px',
            marginBottom: '16px',
          }}
        >
          Real Online Chat
        </div>

        <div
          style={{
            fontSize: '22px',
            color: '#555555',
            marginBottom: '40px',
          }}
        >
          Connect. Chat. Discover.
        </div>

        <div
          style={{
            fontSize: '14px',
            color: '#2a2a2a',
            position: 'absolute',
            bottom: '32px',
          }}
        >
          realonlinechat.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}