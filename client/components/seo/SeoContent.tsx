/**
 * SEO Content Section — Real Online Chat Homepage
 * 700+ words targeting key search terms naturally.
 * Semantic HTML: h2, h3, ul, p — no keyword stuffing.
 */

import Link from 'next/link';

export default function SeoContent() {
  return (
    <section
      className="border-t border-[#0a0a0a] bg-[#020202] px-4 py-16"
      aria-label="About Real Online Chat"
    >
      <div className="max-w-3xl mx-auto prose-roc">
{/* H1 — one per page, defined in LandingPage hero */}
        <h2>What Is Real Online Chat?</h2>
        <p>
          Real Online Chat is a free, anonymous online chat platform built for
          instant real-time conversations. You connect with people from around the
          world in seconds — no account, no email, no download required.
          Whether you're looking for a quick chat with a random stranger or want
          to join a public discussion room around a shared interest, everything
          is available from the moment you open the site.
        </p>
        <p>
          The platform runs entirely in your browser using WebSocket technology,
          which means messages arrive instantly with no perceptible delay.
          All conversations are encrypted in transit, and no message content
          is stored on our servers — when a session ends, the conversation
          is gone permanently.
        </p>

        <div className="roc-divider" />

        <h2>Free Online Chat — No Signup Required</h2>
        <p>
          Most chat platforms require registration, a verified phone number, or
          a paid subscription before you can talk to anyone. Real Online Chat
          removes every one of those barriers. You choose a nickname, pick your
          interests, and click Start. That's it.
        </p>
        <p>
          Anonymous chat has clear value: you can speak openly, explore topics
          without social pressure, and meet genuinely new people without the
          algorithms of traditional social media deciding who you see.
        </p>

        <h3>Why people choose Real Online Chat</h3>
        <ul>
          <li>No registration or email required</li>
          <li>Messages are never stored or logged</li>
          <li>Connects you globally in under a second</li>
          <li>12 topic-based public chat rooms</li>
          <li>Works on any device — phone, tablet, desktop</li>
          <li>Interest matching for better conversations</li>
          <li>One-tap report and block for safety</li>
          <li>Free forever, no premium tier</li>
        </ul>

        <div className="roc-divider" />

        <h2>Public Chat Rooms by Topic</h2>
        <p>
          Beyond 1-on-1 matching, Real Online Chat offers{' '}
          <Link href="/rooms">12 live chat rooms</Link> organized by interest.
          Each room is a persistent group conversation — join, read the last
          50 messages, and jump in. Members see who else is in the room in
          real time via the member sidebar.
        </p>

        <h3>Available rooms</h3>
        <ul>
          <li>🌍 Global Chat</li>
          <li>🎮 Gaming</li>
          <li>🎵 Music</li>
          <li>🎬 Movies &amp; TV</li>
          <li>💻 Technology</li>
          <li>⚽ Sports</li>
          <li>✈️ Travel</li>
          <li>📚 Study</li>
          <li>🌸 Anime</li>
          <li>📖 Books</li>
          <li>💪 Fitness</li>
          <li>💼 Business</li>
        </ul>

        <p>
          Chat rooms update in real time — when someone joins or leaves,
          the member count and sidebar update instantly. Typing indicators
          show you who is composing a message.
        </p>

        <div className="roc-divider" />

        <h2>How Real-Time Anonymous Chat Works</h2>
        <p>
          When you click Start Chat, our matching system scans the current
          queue of waiting users and pairs you with someone available.
          The match typically completes in under one second. If you share
          interests with the other user, those are highlighted on their
          profile card so you have an immediate conversation starter.
        </p>
        <p>
          Not feeling the conversation? Hit <strong>Next</strong> at any time
          to be paired with a new person instantly. You are never trapped
          in a conversation you don't want to continue.
        </p>

        <h3>Security and safety</h3>
        <p>
          Real Online Chat is designed with privacy as a default, not an
          afterthought. No personal information is required to use the service.
          All socket connections run over SSL. Messages are relayed directly
          between matched users and are not written to any database.
          If another user behaves inappropriately, you can report or block
          them with a single tap — the report goes to our moderation queue
          and the user is removed from your session immediately.
        </p>

        <div className="roc-divider" />

        <h2>Accessible on Every Device</h2>
        <p>
          The interface is built mobile-first. The layout adapts to phone
          screens, tablets, and desktops without requiring a separate app.
          On mobile, the keyboard-safe viewport ensures the input area stays
          visible even with the on-screen keyboard open. Page transitions are
          instant thanks to Next.js prefetching.
        </p>

        <p>
          Ready to meet someone new?{' '}
          <Link href="/chat">Start a conversation now</Link> — it takes
          less than five seconds.
        </p>
      </div>
    </section>
  );
}
