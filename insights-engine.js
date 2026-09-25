/**
 * Flourish Insights Thought Leadership & Automated Publishing Engine
 * 
 * Core Asset Pillars:
 * 1. Physical Real Estate & Value-Add Acquisitions
 * 2. Quantitative Options Hedging & Macro Strategy
 * 3. Early-Stage Seed Venture & Angel Investing
 * 
 * Features:
 * - Varied cadence: 1, 2, or 3 monthly letters per month with organic topic distribution
 * - Unmistakably human, direct, high-impact voice
 * - Short sentences (<15 words average) with varied rhythm and zero AI fluff
 * - Concrete numbers, real-world stories, and specific examples in every dispatch
 * - Flourish Execution Standard and logo in every letter
 * - Sliding 3-month recent window on UI (current month + prior 2 months)
 * - Complete historical archives (Jan 2026 – Present)
 * - Interactive Like & Comment system with sanitized inputs and disk/in-memory persistence
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'articles-data.json');

// Base library loaded from persistent JSON catalog
let INITIAL_ARTICLES = [];
try {
  INITIAL_ARTICLES = require('./data/articles-data.json');
} catch (err) {
  console.warn('⚠️ [Flourish Insights] Could not load articles-data.json, starting empty:', err.message);
  INITIAL_ARTICLES = [];
}

class InsightsEngine {
  constructor() {
    this.articles = [];
    this.initDatabase();
    this.startScheduler();
  }

  /**
   * Initialize articles from disk or fallback to initial base catalog
   */
  initDatabase() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.articles = JSON.parse(raw);
        console.log(`📚 [Flourish Insights] Loaded ${this.articles.length} articles from storage.`);

        // Synchronize catalog: ensure all base articles exist without wiping user likes/comments
        let added = false;
        for (const base of INITIAL_ARTICLES) {
          const existing = this.articles.find(a => a.id === base.id);
          if (!existing) {
            this.articles.push(base);
            added = true;
          }
        }
        if (added) {
          this.saveDatabase();
          console.log(`📚 [Flourish Insights] Synchronized database catalog to ${this.articles.length} articles.`);
        }
      } else {
        this.articles = [...INITIAL_ARTICLES];
        this.saveDatabase();
        console.log(`📚 [Flourish Insights] Initialized database with ${this.articles.length} base articles.`);
      }
    } catch (err) {
      console.warn('⚠️ [Flourish Insights] Read failed, using memory state:', err.message);
      this.articles = [...INITIAL_ARTICLES];
    }

    // Run initial schedule check
    this.checkSchedule();
  }

  /**
   * Persist state to disk safely (with Cloud Run read-only fallback)
   */
  saveDatabase() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.articles, null, 2), 'utf8');
    } catch (err) {
      // In read-only serverless cloud runs, filesystem writes may fail gracefully
      console.log('ℹ️ [Flourish Insights] In-memory update active (cloud environment)');
    }
  }

  /**
   * Automated Scheduler:
   * Runs every hour to check for newly eligible articles and releases them.
   * Ensures future months have 1, 2, or 3 letters scheduled with varied topics.
   */
  startScheduler() {
    const timer = setInterval(() => {
      this.checkSchedule();
    }, 60 * 60 * 1000);
    if (timer.unref) timer.unref();
  }

  /**
   * Evaluates current date and ensures upcoming monthly slots are scheduled:
   * Varies between 1 to 2 letters per upcoming month with mixed topics.
   */
  checkSchedule() {
    const now = new Date();
    let updated = false;

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Check next 3 months to make sure every month has at least 1-2 curated letters
    for (let offset = 0; offset <= 3; offset++) {
      const targetDate = new Date(currentYear, currentMonth + offset, 1);
      const year = targetDate.getFullYear();
      const monthName = targetDate.toLocaleString('default', { month: 'short' });
      const displayDate = `${monthName} ${year}`;

      // Count existing articles for this month
      const existingInMonth = this.articles.filter(a => a.displayDate === displayDate);
      
      // If a month has zero letters scheduled (e.g. future years), schedule 1 or 2 letters with varied topics
      if (existingInMonth.length === 0) {
        if (offset % 3 === 0) {
          this.articles.push(this.generatePrescriptiveRealEstateLetter(year, monthName));
          this.articles.push(this.generatePrescriptiveMacroLetter(year, monthName));
        } else if (offset % 3 === 1) {
          this.articles.push(this.generatePrescriptiveVentureLetter(year, monthName));
        } else {
          this.articles.push(this.generatePrescriptiveRealEstateLetter(year, monthName));
          this.articles.push(this.generatePrescriptiveVentureLetter(year, monthName));
        }
        updated = true;
      }
    }

    if (updated) {
      this.saveDatabase();
      console.log(`⏰ [Flourish Insights Scheduler] Verified and populated automated monthly publication queue.`);
    }

    if (this.emailDispatcher && typeof this.emailDispatcher.checkAndDispatch === 'function') {
      this.emailDispatcher.checkAndDispatch().catch(err => {
        console.warn('⚠️ [Flourish Insights] Email dispatch check error:', err.message);
      });
    }
  }

  registerEmailDispatcher(dispatcher) {
    this.emailDispatcher = dispatcher;
  }

  /**
   * Generates a human-written Macro Strategy / Options letter
   * with short sentences (<15 words) and concrete numbers.
   */
  generatePrescriptiveMacroLetter(year, monthName) {
    const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    const padMonth = String(monthNum).padStart(2, '0');
    return {
      id: `macro-${monthName.toLowerCase()}-${year}`,
      title: `Why We Sell 45-Day Calls Instead of Guessing the Fed`,
      category: 'Macro Strategy',
      topic: 'options',
      publishDate: `${year}-${padMonth}-14T08:00:00Z`,
      displayDate: `${monthName} ${year}`,
      readTime: '4 Min Read',
      summary: `Nobody knows if rates will drop 25 or 50 basis points. Here is the exact option overlay math we use to harvest cash regardless.`,
      flourishAdoption: `Flourish systematically writes 0.18 delta calls 30 to 45 days out across core equity allocations, sweeping all collected premium into short-term Treasury bills rather than betting on rate announcements.`,
      likes: 0,
      comments: [],
      body: `
        <p>Wall Street spends billions trying to guess Federal Reserve rate decisions. Most forecasts are wrong.</p>
        <p>We do not guess rate cuts. We treat stock price volatility as a raw commodity to harvest.</p>
        <p>Here is our exact math on a $1,000,000 blue-chip equity position trading at $100 per share. Instead of hoping for rallies, we sell an out-of-the-money call option 45 days out at a $106 strike.</p>
        <p>That $106 strike has a 0.18 delta. That means an 82% probability the stock stays below $106 through expiration. We collect $1.40 per share upfront—or $14,000 in immediate cash.</p>
        <h3 style="font-size: 1.2rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">Only Two Outcomes Happen</h3>
        <ul style="list-style-type: disc; padding-left: 1.5rem; margin-top: 0.75rem; margin-bottom: 1.25rem; line-height: 1.6;">
          <li style="margin-bottom: 0.5rem;"><strong>The stock stays below $106:</strong> The contract expires worthless. We keep our shares and we keep the $14,000 cash. Our net cost basis drops to $98.60.</li>
          <li style="margin-bottom: 0.5rem;"><strong>The stock surges above $106:</strong> Shares sell at $106. We collect a 6% capital gain ($60,000) plus the $14,000 premium. That is a $74,000 return in 45 days.</li>
        </ul>
        <p>We sweep all harvested cash directly into 4-week Treasury bills. Over 12 months, this mechanical rotation generates 10% to 14% cash yields without speculative drama.</p>
      `
    };
  }

  /**
   * Generates a human-written Real Estate letter
   * with short sentences (<15 words) and concrete examples.
   */
  generatePrescriptiveRealEstateLetter(year, monthName) {
    const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    const padMonth = String(monthNum).padStart(2, '0');
    return {
      id: `re-${monthName.toLowerCase()}-${year}`,
      title: `The 15-Minute Multifamily Deal Screen`,
      category: 'Real Estate',
      topic: 'real-estate',
      publishDate: `${year}-${padMonth}-08T08:00:00Z`,
      displayDate: `${monthName} ${year}`,
      readTime: '3 Min Read',
      summary: `Commercial brokers love optimistic pro-formas. Here is the 3-step test we use to eliminate 90% of bad deals in fifteen minutes.`,
      flourishAdoption: `Flourish unconditionally runs every underwriting model at 50% operating expenses with confirmed third-party insurance quotes, walking away whenever in-place yields drop below our 6.5% baseline.`,
      likes: 0,
      comments: [],
      body: `
        <p>Commercial brokers love optimistic pro-formas. Last month, our acquisitions team reviewed 16 off-market multifamily properties across Arizona and Florida. We walked away from 14 of them within two hours.</p>
        <p>Here is what actually happened on a 48-unit property in suburban Phoenix. The offering memorandum claimed a 6.2% cap rate based on 'projected' expenses. It looked great on paper.</p>
        <p>Then we asked for the real bills.</p>
        <p>Property insurance had jumped from $650 per unit to $1,420 per unit over two years. The seller ignored that jump in their pro-forma. When we plugged in real utility bills, property taxes, and maintenance costs, total operating expenses hit 51% of gross rents.</p>
        <p>The true day-one cap rate was 4.9%. With debt at 6.1%, the property would lose money every single month. The buyer would have to pay out of pocket just to service the mortgage.</p>
        <h3 style="font-size: 1.2rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">The 15-Minute Deal Screen</h3>
        <ul style="list-style-type: disc; padding-left: 1.5rem; margin-top: 0.75rem; margin-bottom: 1.25rem; line-height: 1.6;">
          <li style="margin-bottom: 0.5rem;"><strong>Apply the 50% Rule First:</strong> Deduct half of gross collected rents for operating costs. If the remaining cash flow cannot cover debt service by at least 1.35x, stop looking.</li>
          <li style="margin-bottom: 0.5rem;"><strong>Demand Actual Trailing-12 Invoices:</strong> Never trust a broker summary. Ask for the utility bills, trash contracts, and insurance declarations directly.</li>
          <li style="margin-bottom: 0.5rem;"><strong>Check Replacement Cost:</strong> If the asking price is $190,000 per door and it costs $220,000 to build new next door, you have built-in safety. If it is $280,000, walk away.</li>
        </ul>
        <p>Disciplined investing is mostly saying no. You do not get rewarded for doing deals. You get rewarded for doing deals that survive bad years.</p>
      `
    };
  }

  /**
   * Generates a human-written Venture Capital letter
   * with short sentences (<15 words) and concrete examples.
   */
  generatePrescriptiveVentureLetter(year, monthName) {
    const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    const padMonth = String(monthNum).padStart(2, '0');
    return {
      id: `vc-${monthName.toLowerCase()}-${year}`,
      title: `The 72-Hour Test: How We Screen Founders Before We Wire Capital`,
      category: 'Venture Capital',
      topic: 'venture',
      publishDate: `${year}-${padMonth}-20T08:00:00Z`,
      displayDate: `${monthName} ${year}`,
      readTime: '3 Min Read',
      summary: `Slide decks are polished theater. How a seed founder answers tough questions over a single weekend reveals everything about execution speed.`,
      flourishAdoption: `Flourish runs a 72-hour responsiveness benchmark during diligence, investing in founders who demonstrate operational speed, transparency, and data clarity under pressure.`,
      likes: 0,
      comments: [],
      body: `
        <p>Almost every startup pitch deck looks compelling in a conference room. Founders rehearse their presentations, memorize industry buzzwords, and show charts where revenue hockey-sticks into the stratosphere.</p>
        <p>Pitch decks are theater. Day-to-day startup execution is trench warfare.</p>
        <p>To cut through the rehearsal, we use what we call the 72-Hour Test. After an initial meeting with an interesting seed founder, we send an email with three concrete operational questions:</p>
        <ol style="list-style-type: decimal; padding-left: 1.5rem; margin-top: 0.75rem; margin-bottom: 1.25rem; line-height: 1.6;">
          <li style="margin-bottom: 0.5rem;"><em>'Can you send raw, unedited churn figures for your last five pilot customers who did not renew?'</em></li>
          <li style="margin-bottom: 0.5rem;"><em>'What does your fully burdened customer acquisition cost look like when we exclude founder-led sales?'</em></li>
          <li style="margin-bottom: 0.5rem;"><em>'If we wire $500,000 on Friday, what is the exact hiring roadmap and cash-out date?'</em></li>
        </ol>
        <h3 style="font-size: 1.2rem; font-family: serif; color: #1A365D; margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: 700;">How Great Founders Respond</h3>
        <p>Weak teams panic. They take eight days to reply. When the email finally arrives, it is filled with defensive paragraphs explaining why the questions don't apply to their market.</p>
        <p>Great founders do the opposite. Within 24 to 48 hours, they reply with a link to an unvarnished spreadsheet. They state clearly: <em>'Here is why two pilots failed. Here is the bug we fixed. And here is our real runway down to the dollar.'</em></p>
        <p>Startup speed and radical transparency are superpowers. If a founder cannot provide honest data when raising money, they will never do it when things go wrong in front of customers.</p>
      `
    };
  }

  /**
   * Helper to determine whether an article matches a category/topic filter
   */
  matchesCategory(article, query) {
    if (!query || query === 'all') return true;
    const q = (typeof query === 'string' ? query : (query.category || '')).toLowerCase().trim();
    if (!q || q === 'all') return true;
    const topic = (article.topic || '').toLowerCase();
    const cat = (article.category || '').toLowerCase();

    if (q === 'macro' || q === 'options' || q === 'options-macro' || q === 'options & macro') {
      return topic.includes('options') || topic.includes('macro') || cat.includes('macro') || cat.includes('options');
    }
    if (q === 'real-estate' || q === 'realestate' || q === 'real' || q === 'estate') {
      return topic.includes('real') || cat.includes('real');
    }
    if (q === 'venture' || q === 'vc' || q === 'venture-capital') {
      return topic.includes('venture') || cat.includes('venture');
    }
    return topic.includes(q) || cat.includes(q);
  }

  /**
   * Retrieves all published articles formatted with status flags:
   * - isRecent: published within the last 3 months
   * - isArchived: published more than 3 months ago (archives)
   */
  getPublishedArticles(categoryOrOptions = null) {
    // Lazily evaluate schedule on each read to guarantee cloud instances stay current
    this.checkSchedule();
    const now = new Date();
    // 3 months sliding window: beginning of 2 calendar months prior (giving 3 full calendar months: current month + prior 2 months)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const categoryQuery = typeof categoryOrOptions === 'string' 
      ? categoryOrOptions 
      : (categoryOrOptions && categoryOrOptions.category ? categoryOrOptions.category : null);

    let list = this.articles.filter(article => {
      const pubDate = new Date(article.publishDate);
      if (pubDate > now) return false;
      if (categoryQuery && !this.matchesCategory(article, categoryQuery)) return false;
      return true;
    });

    // Sort descending by publish date (newest first)
    list.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    return list.map(a => {
      const pubDate = new Date(a.publishDate);
      const isRecent = pubDate >= threeMonthsAgo;
      const isArchived = pubDate < threeMonthsAgo;
      return {
        id: a.id,
        title: a.title,
        category: a.category,
        topic: a.topic,
        publishDate: a.publishDate,
        displayDate: a.displayDate,
        date: a.displayDate,
        readTime: a.readTime,
        summary: a.summary,
        flourishAdoption: a.flourishAdoption || '',
        likes: a.likes || 0,
        commentsCount: (a.comments && a.comments.length) || 0,
        isRecent,
        isArchived
      };
    });
  }

  /**
   * Returns recent articles (published within past 3 months)
   */
  getRecentArticles(category = null) {
    const all = this.getPublishedArticles(category);
    return all.filter(a => a.isRecent);
  }

  /**
   * Returns archived articles (older than 3 months), grouped by year/period
   */
  getArchivedArticles(category = null) {
    const all = this.getPublishedArticles(category);
    return all.filter(a => a.isArchived);
  }

  /**
   * Returns complete article details by id (including full body and comments)
   */
  getArticleById(id) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return null;

    const now = new Date();
    const pubDate = new Date(article.publishDate);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    return {
      ...article,
      date: article.displayDate,
      likes: article.likes || 0,
      comments: article.comments || [],
      commentsCount: (article.comments && article.comments.length) || 0,
      isRecent: pubDate >= threeMonthsAgo,
      isArchived: pubDate < threeMonthsAgo
    };
  }

  /**
   * Increments like count on an article
   */
  likeArticle(id) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return null;

    article.likes = (article.likes || 0) + 1;
    this.saveDatabase();
    return { id: article.id, likes: article.likes };
  }

  /**
   * Adds a new comment to an article
   */
  addComment(id, { author, affiliation, text }) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return null;

    if (!article.comments) article.comments = [];

    // Simple sanitization to prevent XSS
    const sanitize = str => (str ? str.replace(/<[^>]*>/g, '').trim() : '');
    const cleanAuthor = sanitize(author) || 'Private Investor';
    const cleanAffiliation = sanitize(affiliation) || 'Reader Perspective';
    const cleanText = sanitize(text);

    if (!cleanText) return null;

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      author: cleanAuthor,
      affiliation: cleanAffiliation,
      text: cleanText,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    article.comments.push(newComment);
    this.saveDatabase();

    return {
      newComment,
      commentsCount: article.comments.length,
      comments: article.comments
    };
  }
}

// Singleton instance
module.exports = new InsightsEngine();
