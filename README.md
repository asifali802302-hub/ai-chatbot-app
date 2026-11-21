# 🤖 NovaAI — Real-Time AI-Powered Conversational Platform

[![Full Stack](https://img.shields.io/badge/Stack-Node.js%20+%20Express%20+%20React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![WebSockets](https://img.shields.io/badge/Real--Time-Socket.io%20WebSockets-black?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20+%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS%20v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Security](https://img.shields.io/badge/Security-JWT%20+%20Rate%20Limiting-red?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io)

An enterprise-grade, real-time AI conversational assistant built with **React 18**, **Tailwind CSS**, **Node.js**, **Express.js**, **Socket.io WebSockets**, **Mongoose / MongoDB Atlas**, and **JWT Authentication**. It features real-time streaming updates, multi-persona AI switching, conversation history sessions, thumbs up/down rating feedback, and an administrative telemetry dashboard.

---

## 🌟 Core Features (From Project Curriculum)

1. **🔐 User Authentication & Session Security:**
   * JWT-based authentication with secure token handling and persistent sessions.
   * Role-Based Access Control (`user` vs `admin`).
2. **⚡ Real-Time Chat via WebSockets:**
   * Live bidirectional messaging powered by `Socket.io` without page refresh.
   * Real-time AI typing indicators and status synchronization.
3. **🧠 AI-Powered Multi-Model Intelligence:**
   * Multi-provider architecture supporting **OpenAI GPT**, **Google Gemini**, and a built-in contextual fallback engine.
   * Markdown formatting with syntax-highlighted code blocks and one-click copy.
4. **📜 Persistent Chat History & Sessions:**
   * Conversations and messages stored in MongoDB.
   * Sidebar session history with search, rename, and delete capabilities.
5. **🎨 User Personalization & Personas:**
   * Dynamically switch AI persona modes:
     * 🧭 **General Assistant:** Structured, balanced responses.
     * ☕ **Casual Friend:** Relaxed, friendly, and approachable.
     * 💻 **Code Mentor:** Production-grade software architecture & clean code.
     * 🎨 **Creative Muse:** Storytelling, brainstorming, and poetic prose.
   * Custom chatbot naming (e.g. `NovaAI`, `Jarvis`) and Dark/Light theme switching.
6. **👍 Rating & Feedback System:**
   * Interactive thumbs up / thumbs down with feedback capture.
7. **📊 Admin Intelligence & Telemetry Panel:**
   * Dedicated dashboard for administrators to monitor user counts, total sessions, latency metrics, and user satisfaction percentages.

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | High-performance SPA with fast bundling |
| **Styling** | Tailwind CSS v3 | Modern dark/light UI with custom scrollbars |
| **Real-Time** | Socket.io Client | Instant bidirectional messaging & typing events |
| **Icons** | Lucide React | Clean, responsive iconography |
| **Backend** | Node.js + Express.js | Robust RESTful and WebSocket server |
| **WebSockets** | Socket.io Server | Room-based channel partitioning per conversation |
| **Database** | MongoDB Atlas / Mongoose | Scalable document storage with in-memory fallback |
| **Authentication**| JWT + BcryptJS | Stateless token authorization and password hashing |
| **Rate Limiter** | express-rate-limit | API abuse protection & security compliance |

---

## 📁 System Architecture

```text
ai-chatbot-app/
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, ChatArea, MessageInput, Modals
│   │   ├── context/            # AuthContext, ChatContext
│   │   ├── pages/              # AuthPage, ChatPage
│   │   ├── services/           # Socket.io client & Axios API handlers
│   │   ├── App.jsx             # Main layout & Toast provider
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vercel.json             # Vercel SPA rewrite config
│   └── vite.config.js
│
└── server/                     # Node.js + Express + Socket.io Backend
    ├── config/                 # MongoDB connection & Demo Data Seeder
    ├── controllers/            # Auth, Sessions, Chat, and Admin Analytics
    ├── middleware/             # JWT verification & admin guard
    ├── models/                 # Mongoose schemas (User, Session, Message) & Store
    ├── routes/                 # REST API endpoints (/api/auth, /api/sessions, etc.)
    ├── services/               # AI Engine (OpenAI, Gemini & Contextual Engine)
    ├── socket/                 # Socket.io WebSocket event dispatcher
    ├── .env.example
    └── server.js               # Application entry point
```

---

## 🔑 Pre-Seeded Demo Accounts

The application automatically seeds ready-to-test enterprise accounts on startup:

| Account Role | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@chatbot.com` | `password123` | Full chat access + **Admin Analytics Panel** |
| **Standard User** | `user@chatbot.com` | `password123` | Multi-session chat, personalization & rating |

---

## 🚀 Running Locally

### 1. Prerequisites
* **Node.js 18+** (`node -v`)
* **npm** (`npm -v`)

### 2. Backend Setup (`server/`)
```bash
cd server
npm install
npm start
```
*Server runs on `http://localhost:5000` with WebSocket support at `ws://localhost:5000`.*

### 3. Frontend Setup (`client/`)
```bash
cd client
npm install
npm run dev
```
*Client opens on `http://localhost:3000`.*

---

## 📡 REST & WebSocket API Specification

### 🔐 Auth Endpoints (`/api/auth`)
* `POST /api/auth/register` — Create account with role selection.
* `POST /api/auth/login` — Login and receive Bearer JWT token.
* `GET /api/auth/me` — Retrieve logged-in user profile.
* `PUT /api/auth/preferences` — Update bot name, theme, and default persona.

### 💬 Session Endpoints (`/api/sessions`)
* `GET /api/sessions` — Fetch user's conversation sessions.
* `POST /api/sessions` — Create a new conversation thread.
* `GET /api/sessions/:sessionId` — Fetch messages for a specific session.
* `PUT /api/sessions/:sessionId` — Rename conversation title.
* `DELETE /api/sessions/:sessionId` — Delete conversation thread and messages.

### 🤖 Chat & Rating Endpoints (`/api/chat`)
* `POST /api/chat/message` — Send message via HTTP fallback.
* `POST /api/chat/rate/:messageId` — Rate AI response with score (1 or -1) & feedback.

### 📊 Admin Analytics (`/api/admin`)
* `GET /api/admin/analytics` — Real-time telemetry, user count, AI latency, satisfaction metrics (Admin only).

### ⚡ WebSocket Events (Socket.io)
* `join_session` — Join conversation room.
* `send_message` — Stream message to server.
* `ai_typing` — Broadcast typing indicator.
* `receive_message` — Receive user and AI message payloads.
* `rate_message` — Submit real-time feedback rating.
