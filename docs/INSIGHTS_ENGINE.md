# Flourish Insights Publishing Engine Specification

The **Flourish Insights Engine** (`insights-engine.js`) is an autonomous content distribution, lifecycle, and scheduling system.

---

## 1. The Three Asset Pillars

Flourish Management organizes its investment thought leadership into three core pillars:

### Pillar 1: Macro Strategy & Quantitative Options Hedging
- **Publish Date**: **1st of every month**
- **Core Topics**: Delta calibration, systematic 30–45 day theta decay harvesting, rate-cycle hedging, volatility spikes, and downside asymmetric protection.

### Pillar 2: Real Estate & Physical Asset Acquisitions
- **Publish Date**: **10th of every month**
- **Core Topics**: Commercial multifamily underwriting, the 50% operating expense rule, off-market deal sourcing, debt maturity cliffs, and tenant retention.

### Pillar 3: Venture Capital & Angel Investing
- **Publish Date**: **20th of every month**
- **Core Topics**: Seed startup underwriting, SAFE cap table dilution defense, founder velocity tests, power-law economics, and B2B SaaS ARR diligence.

---

## 2. Voice & Editorial Standards

Every letter published by the engine must adhere strictly to these four rules:

1. **Ruthless Pruning**:
   - Zero tolerance for filler words, throat-clearing openers, or generic AI buzzwords ("In today's fast-paced environment...", "Navigating the complexities...").
   - Cut every word that does not earn its place.
2. **Rhythm & Brevity**:
   - Average sentence length must be under **15 words**.
   - Vary rhythm deliberately: pair short, punchy statements with crisp explanatory sentences.
3. **Concrete & Plain**:
   - Swap abstract concepts for vivid real-world math and examples (e.g. 0.18 delta covered calls, unallocated option pool dilution, 50% operating expense deductions).
4. **Actionable 4-Step Checklist**:
   - Every single letter concludes with a numbered, step-by-step checklist or underwriting rulebook that investors can apply immediately.

---

## 3. Sliding 3-Month Recency Window & Archival

The engine maintains a dynamic boundary between **Recent (Last 3 Months, 9 Letters)** and **Archived** letters:

```
                                  3 Months Ago                     Today
---------------------------------------|-----------------------------|--------> Time
           ARCHIVES                    |        RECENT (9 Letters)   |  SCHEDULED
 (Viewable in Archives Modal)          |  (Displayed on Main Grid)   |  (Hidden)
```

### Mathematical Formula
- `threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)` (first day of 2 calendar months prior)
- **Published**: `pubDate <= now`
- **Recent**: `pubDate >= threeMonthsAgo && pubDate <= now` (exactly 9 letters across the 3 calendar months)
- **Archived**: `pubDate < threeMonthsAgo` (historical letters >3 months old)
- **Scheduled (Future)**: `pubDate > now`

As time advances, letters automatically transition across these boundaries without manual database migrations.

---

## 4. Self-Replenishing Queue Algorithm

The scheduler function `checkSchedule()` executes:
1. On container boot (`initDatabase()`).
2. Hourly via background timer (`setInterval`).
3. Lazily on-demand whenever `getPublishedArticles()` is called.

```javascript
// Look ahead 0 to 3 months into the future
for (let offset = 0; offset <= 3; offset++) {
  const targetDate = new Date(currentYear, currentMonth + offset, 1);
  const year = targetDate.getFullYear();
  const monthName = targetDate.toLocaleString('default', { month: 'short' });

  // 1. Ensure Macro Strategy letter exists for 1st
  // 2. Ensure Real Estate letter exists for 10th
  // 3. Ensure Venture Capital letter exists for 20th
}
```

If any pillar is missing for an upcoming month, the engine programmatically generates it with its appropriate checklist, summary, and metadata.

---

## 5. Article Data Schema

```typescript
interface Article {
  id: string;               // Unique slug (e.g., 'seed-angel-underwriting')
  title: string;            // Direct, high-impact headline
  category: string;         // 'Macro Strategy' | 'Real Estate' | 'Venture Capital'
  topic: string;            // 'options' | 'real-estate' | 'venture'
  publishDate: string;      // ISO 8601 UTC timestamp ('2026-09-20T08:00:00Z')
  displayDate: string;      // Human label ('Sep 2026')
  date?: string;            // Fallback display date
  readTime: string;         // Estimated read time ('4 Min Read' | '5 Min Read')
  summary: string;          // 2-sentence executive summary
  likes: number;            // Total reader likes
  comments: Comment[];      // Array of verified comments
  body: string;             // Sanitized HTML body with 4-step checklist
}

interface Comment {
  id: string;               // Unique comment identifier
  author: string;           // Reader name
  affiliation: string;      // Role / Firm ('Angel Investor', 'Family Office')
  text: string;             // Comment content
  date: string;             // Formatted date string
}
```

---

## 6. Automated Monthly Email Brief Dispatch

To deliver continuous value directly to accredited investors and family offices, the platform includes an automated outbound monthly email dispatch subsystem ([`email-dispatcher.js`](file:///Users/pthiagar/antigravity/flourish-web/email-dispatcher.js) and [`subscriber-manager.js`](file:///Users/pthiagar/antigravity/flourish-web/subscriber-manager.js)).

### Rules of Engagement
1. **Single-Send Guarantee**:
   - Each subscriber record tracks `lastSentMonth: "YYYY-MM"`.
   - The engine guarantees each subscriber receives **exactly one executive email brief per calendar month**.
   - Repeated triggers within the same calendar month automatically skip already-serviced subscribers.
2. **Three-Pillar Monthly Roundup**:
   - The brief synthesizes the month's 3 letters across Macro Strategy, Real Estate, and Venture Capital & Angel Investing.
   - Includes 2-sentence summaries, read time, and direct links to the full letters and checklists.
3. **CAN-SPAM & Privacy Compliance**:
   - Every email features a cryptographic 1-click unsubscribe token:
     `https://flourish-web-151213060012.us-central1.run.app/api/unsubscribe?token=<TOKEN>`
   - Unsubscribing permanently sets status to `unsubscribed`, excluding the recipient from all future automated runs.

