# System Architecture & Design

This document describes the architectural principles, component interactions, security layers, and data flows of the **Flourish Management** web platform.

---

## 1. High-Level System Architecture

Flourish Management is designed as an ultra-fast, lightweight, highly secure web application. It combines an Express.js backend with a vanilla JavaScript frontend, achieving sub-second response times, zero runtime framework dependencies, and minimal memory footprints (<60MB RSS in production).

```
[ Client Browser ]
       |
       | HTTPS / TLS 1.3
       v
[ Google Cloud Run (Load Balancer & SSL Termination) ]
       |
       v
[ Express Server (Node.js 20 on Linux Alpine) ]
  ├── 1. Security Middleware (Helmet CSP, HSTS, Rate Limiters)
  ├── 2. Body Parser (Strict 10KB payload limits)
  ├── 3. Static File Server (Cached CSS/JS/Images)
  ├── 4. REST API Routing Layer
  │     ├── /api/articles/* (Insights Engine)
  │     ├── /api/contact (Nodemailer Emailer)
  │     ├── /api/subscribe (Newsletter)
  │     └── /api/chat-lead (Concierge Funnel)
  └── 5. Hybrid Data Store (In-Memory + Disk JSON Persistence)
```

---

## 2. Security Architecture

### A. Content Security Policy (CSP) via Helmet
The application uses `helmet` with an explicitly crafted Content Security Policy that enforces:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src 'self' https://fonts.gstatic.com`
- `img-src 'self' data: https:`
- `object-src 'none'`
- `upgradeInsecureRequests: []`

### B. Tiered Rate Limiting
To defend against automated denial-of-service, brute-force form submission, and spam, each API group has an independent rate limiter configured via `express-rate-limit`:

| Rate Limiter | Window | Max Requests | Targeted Endpoints |
| :--- | :--- | :--- | :--- |
| `contactLimiter` | 15 Minutes | 5 | `/api/contact` |
| `subscribeLimiter` | 15 Minutes | 10 | `/api/subscribe` |
| `chatLeadLimiter` | 15 Minutes | 10 | `/api/chat-lead` |
| `likeLimiter` | 5 Minutes | 60 | `/api/articles/:id/like` |
| `commentLimiter` | 15 Minutes | 20 | `/api/articles/:id/comment` |

### C. Input Sanitization & Anti-XSS
- Body payloads are strictly restricted to **10KB** (`express.json({ limit: '10kb' })`).
- All user-submitted comment texts, names, and affiliations are stripped of HTML tags via regex sanitization before storing.
- On the client side, all dynamic text interpolation is escaped using `escapeHtml()` before insertion into the DOM.

---

## 3. Data Layer & State Persistence

```
       +---------------------------------------------+
       |             Insights Engine                 |
       |  - in-memory articles collection            |
       +----------------------+----------------------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
    [ Reading State ]                [ Writing State ]
    Reads articles array             Updates likes & comments
    directly from memory             Saves to memory immediately
    (<0.1ms latency)                 Asynchronously persists to
                                     data/articles-data.json
                                     (with graceful read-only fallback)
```

### Serverless Compatibility
In Google Cloud Run, container file systems can be ephemeral or read-only across scaling instances.
The engine implements **hybrid persistence**:
1. When a container starts, it attempts to load from `data/articles-data.json`.
2. Any catalog changes (new articles, likes, comments) update in-memory state instantly.
3. If disk writing succeeds, state is persisted. If disk writing is denied due to container read-only locks, it logs an informational note and continues serving cleanly from memory without throwing a 500 error.

---

## 4. Frontend Event Architecture

The frontend is implemented in vanilla JavaScript without bulky frameworks:
- **DOM Hydration**: On `DOMContentLoaded`, the app initiates parallel asynchronous fetches to `/api/articles`.
- **Sliding Window Rendering**: Renders the 3-month recent cards grid (9 letters) while calculating historical archive counts.
- **Optimistic UI Updates**: Clicking a "Like" button immediately increments the counter on screen and updates local storage before waiting for server acknowledgment.
- **Deep Linking**: Reading an article updates URL hashes or modal states, allowing direct sharing of specific letters.
