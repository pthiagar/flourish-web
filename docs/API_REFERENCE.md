# Flourish Management REST API Reference

All API endpoints return JSON and accept standard HTTP requests.

---

## 1. Articles Endpoints (`/api/articles`)

### `GET /api/articles`
Retrieves all currently published articles formatted with recency flags.

- **Query Parameters**:
  - `category` (optional): Filter by pillar name (`Macro Strategy`, `Real Estate`, `Venture Capital`).
- **Response**:
```json
{
  "success": true,
  "counts": {
    "recent": 18,
    "archived": 9,
    "total": 27
  },
  "recent": [
    {
      "id": "seed-angel-underwriting",
      "title": "Underwriting Seed Stage Startups: The Angel Investor's Filter",
      "category": "Venture Capital",
      "topic": "venture",
      "publishDate": "2026-09-20T08:00:00Z",
      "displayDate": "Sep 2026",
      "readTime": "5 Min Read",
      "summary": "How angel investors avoid the pitch deck trap...",
      "likes": 42,
      "commentsCount": 2,
      "isRecent": true,
      "isArchived": false
    }
  ],
  "archived": [ ... ]
}
```

---

### `GET /api/articles/recent`
Returns only articles within the active 3-month sliding window (9 letters).

- **Query Parameters**: `category` (optional)
- **Response**:
```json
{
  "success": true,
  "count": 9,
  "articles": [ ... ]
}
```

---

### `GET /api/articles/archive`
Returns historical articles older than 3 months (18 letters).

- **Query Parameters**: `category` (optional)
- **Response**:
```json
{
  "success": true,
  "count": 18,
  "articles": [ ... ]
}
```

---

### `GET /api/articles/:id`
Returns complete details, full HTML body, and reader discussion thread for a single article.

- **Path Parameters**:
  - `id` (required): Article slug ID.
- **Response (200 OK)**:
```json
{
  "success": true,
  "article": {
    "id": "seed-angel-underwriting",
    "title": "Underwriting Seed Stage Startups: The Angel Investor's Filter",
    "category": "Venture Capital",
    "publishDate": "2026-09-20T08:00:00Z",
    "displayDate": "Sep 2026",
    "readTime": "5 Min Read",
    "summary": "...",
    "likes": 42,
    "commentsCount": 2,
    "comments": [
      {
        "id": "c-sep-vc-1",
        "author": "Julian Thorne",
        "affiliation": "Seed Syndicate Lead",
        "text": "The 72-hour founder velocity test is brilliant.",
        "date": "Sep 21, 2026"
      }
    ],
    "body": "<p>...</p>"
  }
}
```
- **Error (404 Not Found)**:
```json
{ "success": false, "message": "Article not found" }
```

---

### `POST /api/articles/:id/like`
Increments the like counter for an article.
- **Rate Limit**: 60 requests per 5 minutes per IP.
- **Response (200 OK)**:
```json
{
  "success": true,
  "likes": 43
}
```

---

### `POST /api/articles/:id/comment`
Adds a new reader perspective comment to an article.
- **Rate Limit**: 20 requests per 15 minutes per IP.
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "author": "Marcus Vance",
  "affiliation": "Angel Allocator",
  "text": "Defending pro-rata rights is where venture returns are compounded."
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "comment": {
    "id": "c-1790221709280-urxr",
    "author": "Marcus Vance",
    "affiliation": "Angel Allocator",
    "text": "Defending pro-rata rights is where venture returns are compounded.",
    "date": "Sep 24, 2026"
  },
  "commentsCount": 3,
  "comments": [ ... ]
}
```

---

### `POST /api/articles/trigger-schedule`
Triggers an immediate evaluation of the publishing and archiving schedule.
- **Response**:
```json
{ "success": true, "message": "Schedule updated." }
```

---

## 2. Lead Capture & Communication Endpoints

### `POST /api/contact`
Submits an executive general inquiry. Triggers an SMTP notification email.
- **Rate Limit**: 5 requests per 15 minutes per IP.
- **Request Body**:
```json
{
  "name": "David Sterling",
  "email": "david@familyoffice.com",
  "phone": "+1 (555) 019-2831",
  "inquiryType": "investor",
  "message": "Interested in reviewing current multifamily acquisition pipeline."
}
```
- **Response (200 OK)**:
```json
{ "success": true, "message": "Inquiry sent successfully" }
```

---

### `POST /api/subscribe`
Adds an email address to the executive newsletter distribution list.
- **Rate Limit**: 10 requests per 15 minutes per IP.
- **Request Body**:
```json
{ "email": "allocator@sovereignfund.com" }
```
- **Response (200 OK)**:
```json
{ "success": true, "message": "Subscribed successfully" }
```

---

### `POST /api/chat-lead`
Captures investor qualification information from the interactive concierge chatbot modal.
- **Rate Limit**: 10 requests per 15 minutes per IP.
- **Request Body**:
```json
{
  "name": "Sarah Chen",
  "email": "schen@venturecapital.com",
  "investorType": "Institutional / Family Office",
  "capitalRange": "$1M - $5M",
  "interest": "Options Hedging & Venture Dilution Defense"
}
```
- **Response (200 OK)**:
```json
{ "success": true, "message": "Concierge lead captured successfully" }
```

---

### `GET /api/unsubscribe`
Renders an executive-styled unsubscription confirmation webpage and opts out the subscriber.
- **Parameters**: `?token=...` or `?email=...`
- **Response**: HTML Confirmation Page

---

### `POST /api/unsubscribe`
Programmatic REST endpoint to opt out a subscriber.
- **Request Body**:
```json
{ "token": "45d5a20758240de09f1f38531ab76c00" }
```
- **Response (200 OK)**:
```json
{ "success": true, "email": "allocator@sovereignfund.com" }
```

---

### `POST /api/admin/dispatch-monthly-digest`
Triggers the automated monthly executive brief email run. Strictly enforces **single-send protection** (subscribers with `lastSentMonth === currentMonthKey` are skipped).
- **Security**: Requires Header `x-admin-key: <ADMIN_KEY>` or query parameter `?key=<ADMIN_KEY>`.
- **Request Body (Optional)**:
```json
{
  "testEmail": "prabhu@flourish-mgmt.com",
  "forceMonthKey": "2026-10"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "monthKey": "2026-10",
  "sentCount": 142,
  "skippedCount": 18,
  "errorCount": 0
}
```

---

### `GET /api/admin/subscribers`
Returns subscriber statistics and eligibility for the current calendar month.
- **Security**: Requires Header `x-admin-key: <ADMIN_KEY>` or query parameter `?key=<ADMIN_KEY>`.
- **Response (200 OK)**:
```json
{
  "total": 160,
  "active": 155,
  "eligibleThisMonth": 155,
  "currentMonthKey": "2026-10",
  "subscribers": [
    {
      "email": "allocator@sovereignfund.com",
      "status": "active",
      "subscribedAt": "2026-09-24T04:47:03.251Z",
      "lastSentMonth": "2026-09",
      "lastSentAt": "2026-09-24T05:00:00.000Z"
    }
  ]
}
```

