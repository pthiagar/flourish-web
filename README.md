# Flourish Management Web Platform

[![Live Application](https://img.shields.io/badge/Live-flourish--web-blue?style=for-the-badge&logo=googlecloud)](https://flourish-web-151213060012.us-central1.run.app)
[![Node.js](https://img.shields.io/badge/Node.js-20.x%20%7C%2023.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Alpine%203.19-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)](https://opensource.org/licenses/ISC)

> Modern single-page investment holding company platform for **Flourish Management LLC**, featuring autonomous multi-pillar thought leadership publishing, quantitative portfolio risk simulation, and interactive investor engagement.

---

## 🌐 Live Production Deployment

- **Production URL**: [https://flourish-web-151213060012.us-central1.run.app](https://flourish-web-151213060012.us-central1.run.app)
- **Cloud Infrastructure**: Google Cloud Run (Containerized via Cloud Build, non-root Alpine runtime, autoscaling with zero cold-start penalty)
- **Repository**: [https://github.com/pthiagar/flourish-web](https://github.com/pthiagar/flourish-web)

---

## 🚀 Key Platform Capabilities

### 1. Autonomous 3-Pillar Thought Leadership Engine (`Flourish Insights`)
- **Automated Publication Cadence**: Publishes 3 prescriptive letters every month without requiring manual deployments or code edits:
  - **1st of Month**: **Macro Strategy** (Quantitative options overlays, volatility harvesting, rate-cycle hedging, tail risk protection)
  - **10th of Month**: **Real Estate** (Multifamily acquisitions, 50% operating expense rule, off-market sourcing, workforce housing)
  - **20th of Month**: **Venture Capital & Angel Investing** (Seed startup underwriting, SAFE cap table dilution defense, founder velocity tests, power-law economics)
- **Sliding 6-Month Recency Window**: Dynamically displays articles published within the last 183 days on the primary grid. Older articles automatically transition into the **Archives Modal**.
- **Self-Replenishing Queue**: Automatically looks 3–4 months into the future and generates scheduled letters so the publication queue never runs dry.
- **Strict Human-Pruned Voice Rules**: Every letter is written with ruthless pruning (<15-word sentence rhythm average, plain English, concrete real-world math, zero corporate fluff) and features a numbered **4-Step Actionable Checklist / Diligence Playbook**.

### 2. Interactive Investor Engagement & Community Discussion
- **Optimistic Likes**: Instant like toggling with localStorage persistence and server-side rate-limited synchronization.
- **Reader Perspectives & Discussion Stream**: Community comment threads with verified author and affiliation badges.
- **Deep-Linking & Share Bar**: Native Web Share API integration with clipboard fallback and direct jump-to-comments navigation.

### 3. Quantitative Risk Modeling & Portfolio Climate Simulator
- **Interactive Correction Slider**: Real-time stress testing from -5% to -50% market drops (default -20% bear correction).
- **Asymmetric Alpha Capture**: Visualizes how systematic 30–45 day option overlays harvest theta decay to outperform unhedged equities in both bull runs and market crashes.
- **Dynamic Yield Buffers**: Real-time delta rebalancing calculations comparing unhedged S&P exposure against Flourish's risk-managed hedged portfolio.

### 4. Executive Communication & Lead Capture
- **Secure Contact Form**: Protected by strict rate-limiting (5 requests/15 min) and automated email notifications via Nodemailer.
- **Newsletter Subscription**: Direct subscription capture for accredited investor briefs.
- **AI Concierge / Chat Lead Funnel**: Interactive modal for qualifying private allocators and LP prospects.

---

## 🏗️ Architecture Overview

```
                                  +------------------------------------------+
                                  |            Google Cloud Run              |
                                  |    (Node.js 20 Alpine / Port 8080)       |
                                  +--------------------+---------------------+
                                                       |
                             +-------------------------+-------------------------+
                             |                                                   |
                             v                                                   v
                  [ Express Application ]                             [ Security Middleware ]
               +---------------------------+                      +---------------------------+
               | * Static Asset Serving    |                      | * Helmet (Custom CSP)     |
               | * REST API Routes         |                      | * express-rate-limit      |
               | * Error Handling          |                      | * 10KB Body Size Limits   |
               +-------------+-------------+                      +---------------------------+
                             |
             +---------------+---------------+
             |                               |
             v                               v
[ Insights Publishing Engine ]     [ Lead & Email Services ]
+----------------------------+     +------------------------+
| * 3-Pillar Monthly Cadence |     | * Nodemailer SMTP      |
| * Sliding 6-Month Window   |     | * Contact Form Handler |
| * Auto-Archival System     |     | * Newsletter Subsystem |
| * On-Demand Lazy Check     |     | * Chat Lead Capture    |
| * Hybrid JSON Storage      |     +------------------------+
+----------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Runtime** | Node.js (v20+), Express 4.19 |
| **Security & Headers** | Helmet 8.3 (CSP, HSTS, X-Frame-Options), Express-Rate-Limit 8.7 |
| **Email Delivery** | Nodemailer 10.0 (SMTP / TLS) |
| **Frontend Styling** | Tailwind CSS (Tailwind Play CDN), Custom Vanilla JS (Zero external client-side frameworks) |
| **Typography** | Cormorant Garamond & Playfair Display (Serif), Inter (Sans-Serif), JetBrains Mono (Monospace) |
| **Containerization** | Docker (Alpine 3.19, non-root user `node`, multi-layer caching) |
| **Cloud Platform** | Google Cloud Run, Cloud Build, Google Artifact Registry |

---

## 📂 Project Directory Structure

```
flourish-web/
├── .dockerignore                 # Excludes node_modules, logs, and secrets from Docker builds
├── .env.example                  # Environment variable template
├── .gitignore                    # Git exclusions
├── Dockerfile                    # Production container build definition (Node 20 Alpine)
├── package.json                  # Dependencies and execution scripts
├── package-lock.json             # Locked dependency versions
├── server.js                     # Express server, security middleware, and REST routes
├── insights-engine.js            # Automated 3-pillar publishing & archiving engine
├── data/
│   └── articles-data.json        # Seeded library of 36 prescriptive investment letters
├── docs/                         # Detailed architecture and API documentation
│   ├── ARCHITECTURE.md           # Deep dive into system design and security
│   ├── INSIGHTS_ENGINE.md        # Publishing engine, cadence, and voice standards
│   ├── API_REFERENCE.md          # OpenAPI / REST documentation for all endpoints
│   └── DEPLOYMENT.md             # Google Cloud Run deployment guide
└── public/                       # Static frontend assets
    ├── index.html                # Main single-page application markup
    ├── app.js                    # Client-side state, API client, DOM hydration, and charts
    ├── flourish_logo_highres.png # Executive brand identity
    ├── flourish_logo_square.png  # Square app icon
    └── favicon.ico               # Browser favicon
```

---

## 🚦 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v20.x or higher
- [npm](https://www.npmjs.com/) v10.x or higher
- Optional: [Docker](https://www.docker.com/) for container testing

### 1. Clone the Repository
```bash
git clone https://github.com/pthiagar/flourish-web.git
cd flourish-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and customize as needed:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP Port to bind to | `3000` |
| `SMTP_HOST` | SMTP mail server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP mail server port | `587` |
| `SMTP_USER` | SMTP authentication username | `inquiries@flourish-mgmt.com` |
| `SMTP_PASS` | SMTP authentication password | `your-app-password` |
| `NOTIFICATION_EMAIL` | Recipient for contact inquiries | `inquiries@flourish-mgmt.com` |

### 4. Run the Development Server
```bash
npm start
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run automated syntax and module health checks:
```bash
# Validate syntax of core modules
node -c server.js
node -c insights-engine.js

# Test article catalog counts and 3-pillar distribution
node -e "
const engine = require('./insights-engine');
console.log('Total Articles:', engine.articles.length);
console.log('Recent 6-Month Window:', engine.getRecentArticles().length);
console.log('Historical Archives:', engine.getArchivedArticles().length);
"
```

---

## 📡 REST API Summary

Full documentation is available in [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

| Endpoint | Method | Rate Limit | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/articles` | `GET` | None | Retrieve active recent articles and archive breakdown. |
| `/api/articles/recent` | `GET` | None | Retrieve articles within the 6-month sliding window. |
| `/api/articles/archive` | `GET` | None | Retrieve historical archived letters (>6 months old). |
| `/api/articles/:id` | `GET` | None | Retrieve single article details with discussion comments. |
| `/api/articles/:id/like` | `POST` | 60 / 5 min | Increment like counter for an article. |
| `/api/articles/:id/comment` | `POST` | 20 / 15 min | Post a reader perspective comment. |
| `/api/articles/trigger-schedule` | `POST` | None | Trigger on-demand evaluation of publishing queue. |
| `/api/contact` | `POST` | 5 / 15 min | Submit general executive inquiry form. |
| `/api/subscribe` | `POST` | 10 / 15 min | Subscribe to executive newsletter. |
| `/api/chat-lead` | `POST` | 10 / 15 min | Capture contact details from AI concierge modal. |

---

## 🚀 Deployment to Google Cloud Run

Deploy directly using the Google Cloud SDK:
```bash
gcloud run deploy flourish-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```
For complete deployment workflows, custom domains, and IAM security, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📄 Documentation Index

- [Architecture & Design Details](docs/ARCHITECTURE.md)
- [Publishing Engine Specification](docs/INSIGHTS_ENGINE.md)
- [REST API Reference](docs/API_REFERENCE.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)

---

## ⚖️ License

ISC License &copy; 2026 Flourish Management LLC. All rights reserved.
