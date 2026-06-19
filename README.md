# 💬 Real Online Chat

A modern, production-ready anonymous chat platform. Connect instantly with strangers worldwide — no signup required.

**Domain:** [realonlinechat.com](https://realonlinechat.com)  
**Tagline:** Connect. Chat. Discover.

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB Atlas (optional) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
real-online-chat/
├── client/                         # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx              # Root layout + SEO metadata
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Design system
│   │   ├── chat/page.tsx           # 1-on-1 stranger chat
│   │   ├── rooms/page.tsx          # Chat rooms browser
│   │   ├── rooms/[roomId]/page.tsx # Group chat room
│   │   ├── privacy/page.tsx        # Privacy policy
│   │   ├── terms/page.tsx          # Terms of service
│   │   ├── sitemap.ts              # SEO sitemap
│   │   └── robots.ts               # Robots.txt
│   ├── components/
│   │   ├── landing/LandingPage.tsx
│   │   ├── chat/
│   │   │   ├── ChatApp.tsx         # Main chat UI
│   │   │   ├── ChatHeader.tsx      # Status + actions
│   │   │   ├── MessagesList.tsx    # Chat messages
│   │   │   ├── MessageBubble.tsx   # Message bubble
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── ChatInput.tsx       # Message input
│   │   │   ├── StartScreen.tsx     # Idle state
│   │   │   ├── MatchmakingScreen.tsx
│   │   │   └── StrangerProfile.tsx # Stranger info card
│   │   ├── rooms/
│   │   │   ├── RoomsBrowser.tsx    # Room grid
│   │   │   └── RoomChatPage.tsx    # Group chat
│   │   ├── ui/
│   │   │   ├── Logo.tsx            # Brand logo component
│   │   │   ├── OnboardingModal.tsx # User setup modal
│   │   │   ├── OnlineCounter.tsx
│   │   │   ├── ReportModal.tsx
│   │   │   └── Spinner.tsx
│   │   └── seo/
│   │       ├── JsonLd.tsx          # Structured data
│   │       └── SeoContent.tsx      # SEO article
│   ├── hooks/
│   │   ├── useChat.ts              # 1-on-1 chat state
│   │   └── useRoom.ts              # Group room state
│   ├── lib/
│   │   ├── socket.ts               # Socket.IO singleton
│   │   ├── utils.ts                # Helpers
│   │   ├── profile.ts              # User profile (localStorage)
│   │   └── countries.ts            # Country list + detection
│   ├── types/chat.ts               # TypeScript types
│   └── public/
│       ├── logo.svg                # Full brand logo
│       ├── favicon.svg             # Browser tab icon
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       ├── apple-touch-icon.png
│       ├── icon-192.png
│       ├── icon-512.png
│       └── site.webmanifest
│
└── server/                         # Express backend
    ├── index.js                    # Entry point
    ├── config/database.js          # MongoDB connection
    ├── socket/socketHandler.js     # Matchmaking + group rooms
    ├── middleware/rateLimiter.js   # Rate limiting
    ├── controllers/reportController.js
    ├── routes/api.js
    └── models/
        ├── Report.js
        └── Analytics.js
```

---

## ⚙️ Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/yourname/real-online-chat.git
cd real-online-chat
npm run install:all
```

### 2. Configure Environment

**Server** — `server/.env`:
```env
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/realonlinechat
CLIENT_URL=http://localhost:3000
NODE_ENV=development
SERVER_NAME=Real Online Chat
```

**Client** — `client/.env.local`:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=https://realonlinechat.com
NEXT_PUBLIC_SITE_NAME=Real Online Chat
```

> MongoDB is **optional** for local development. Chat works without it — only report storage requires it.

### 3. Run

```bash
# Terminal 1 — server
npm run dev:server

# Terminal 2 — client
npm run dev:client
```

Open: **http://localhost:3000**

---

## 🌐 Deployment

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_SERVER_URL` = your Render server URL
   - `NEXT_PUBLIC_SITE_URL` = `https://realonlinechat.com`

### Backend → Render

1. Push `server/` to GitHub
2. Create **Web Service** on [render.com](https://render.com)
3. Build: `npm install` | Start: `npm start`
4. Set environment variables:
   - `CLIENT_URL` = your Vercel URL
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `NODE_ENV` = `production`

---

## 🔧 Features

| Feature | Detail |
|---|---|
| 1-on-1 Chat | Instant anonymous matching via Socket.IO |
| Chat Rooms | 12 topic rooms (Gaming, Music, Travel...) |
| User Onboarding | Nickname, gender, country, interests |
| Interest Matching | Profile shared on match for shared interests display |
| Stranger Profile | Premium card with avatar, country, shared interests |
| Report & Block | Instant safety controls |
| Rate Limiting | 30 messages / 10 seconds per socket |
| SEO | Full metadata, OG, Twitter Cards, JSON-LD, sitemap |
| PWA | Installable, offline-capable manifest |
| Mobile-First | Responsive for all screen sizes |

---

## 📄 License

MIT — © 2025 realonlinechat.com
