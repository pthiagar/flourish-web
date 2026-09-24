const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const subscriberManager = require('./subscriber-manager');
const insightsEngine = require('./insights-engine');

class EmailDispatcher {
  constructor() {
    this.transporter = null;
    this.isDispatching = false;
    this.initTransporter();
    insightsEngine.registerEmailDispatcher(this);
  }

  initTransporter() {
    const hasConfig = 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS && 
      process.env.SMTP_USER !== 'your-email@gmail.com' && 
      process.env.SMTP_PASS !== 'your-gmail-app-password';

    if (hasConfig) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('✉️  [EmailDispatcher] Transporter configured via SMTP host:', process.env.SMTP_HOST || 'smtp.gmail.com');
    } else {
      console.log('✉️  [EmailDispatcher] No live SMTP credentials found. Running in safe simulation/mock mode.');
    }
  }

  getLogoAttachment() {
    const logoPath = path.join(__dirname, 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      return [{
        filename: 'logo.png',
        path: logoPath,
        cid: 'flourish-logo'
      }];
    }
    return [];
  }

  getCurrentMonthKey() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }

  getMonthArticles(targetDate = new Date()) {
    const allPublished = insightsEngine.getPublishedArticles();
    const pillars = ['Macro Strategy', 'Real Estate', 'Venture Capital'];
    const chosen = [];

    pillars.forEach(p => {
      const match = allPublished.find(a => a.category.toLowerCase() === p.toLowerCase());
      if (match) {
        // Retrieve full article object from catalog to access body and checklists
        const fullArticle = (insightsEngine.articles && insightsEngine.articles.find(a => a.id === match.id)) || match;
        chosen.push(fullArticle);
      }
    });

    return chosen.length > 0 ? chosen : (insightsEngine.articles ? insightsEngine.articles.slice(0, 3) : allPublished.slice(0, 3));
  }

  extractChecklistHtml(bodyHtml) {
    if (!bodyHtml) return '';
    const olMatch = bodyHtml.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (!olMatch) return '';

    return `
      <div style="background-color: #F8F5F0; border-left: 3px solid #829A7E; border-radius: 8px; padding: 16px 20px; margin: 16px 0 20px 0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #556B2F; margin-bottom: 10px;">
          Actionable Implementation Checklist:
        </div>
        <div style="font-size: 13px; line-height: 1.6; color: #2D3748;">
          ${olMatch[0]}
        </div>
      </div>
    `;
  }

  generateMonthlyDigestHtml(monthLabel, articles, subscriber) {
    const siteUrl = 'https://flourish-web-151213060012.us-central1.run.app';
    const unsubToken = subscriber.unsubscribeToken || 'unsub';
    const unsubUrl = `${siteUrl}/api/unsubscribe?token=${unsubToken}`;

    const pillarBadges = {
      'Macro Strategy': '#1A365D',
      'Real Estate': '#556B2F',
      'Venture Capital': '#3B6290'
    };

    const articleCardsHtml = articles.map(article => {
      const badgeBg = pillarBadges[article.category] || '#1A365D';
      const readUrl = `${siteUrl}/#insights`;
      const checklistHtml = this.extractChecklistHtml(article.body);

      return `
        <div style="background-color: #FFFFFF; border: 1px solid #DFD2C2; border-radius: 12px; padding: 26px 24px; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; background-color: ${badgeBg}; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px;">
              ${article.category}
            </span>
            <span style="font-size: 12px; color: #8C9BAE; margin-left: 10px;">
              ${article.readTime || '4 Min Read'} • ${article.displayDate || article.date}
            </span>
          </div>
          <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; line-height: 1.35; color: #1A212D; margin: 0 0 10px 0;">
            ${article.title}
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A5560; margin: 0 0 14px 0;">
            ${article.summary}
          </p>

          ${checklistHtml}

          <div>
            <a href="${readUrl}" style="display: inline-block; background-color: #1A365D; color: #FAF7F2; text-decoration: none; font-size: 13px; font-weight: 600; padding: 9px 20px; border-radius: 20px;">
              Read Full Essay & Discuss on Portal &rarr;
            </a>
          </div>
        </div>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Flourish Insights Executive Brief</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EFEB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A212D;">
  <div style="max-width: 640px; margin: 30px auto; background-color: #FAF7F2; border: 1px solid #DFD2C2; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.04);">
    
    <!-- Header with Official Flourish Management Logo -->
    <div style="background-color: #1A365D; padding: 36px 30px; text-align: center; border-bottom: 2px solid #DFD2C2;">
      <a href="${siteUrl}" style="text-decoration: none; display: inline-block;">
        <img src="cid:flourish-logo" alt="Flourish Management" width="180" style="display: block; margin: 0 auto 12px auto; max-width: 180px; height: auto; border: 0;" />
      </a>
      <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #FAF7F2; letter-spacing: 1.5px; font-weight: 400;">
        FLOURISH MANAGEMENT
      </h1>
      <p style="margin: 6px 0 0 0; color: #A5B8D1; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
        Executive Monthly Brief &bull; ${monthLabel}
      </p>
    </div>

    <!-- Letter Body -->
    <div style="padding: 36px 30px;">
      <p style="font-size: 16px; line-height: 1.6; color: #1A212D; margin-top: 0; font-weight: 600;">
        Dear Investor,
      </p>
      <p style="font-size: 14px; line-height: 1.65; color: #4A5560; margin-bottom: 14px;">
        As we navigate the current economic landscape, capital allocators face an uncommon convergence of macroeconomic crosscurrents: fluctuating interest rate expectations, evolving commercial real estate valuations, and a venture capital environment returning to strict fundamental underwriting. Rather than speculating on short-term market timing, our philosophy centers on quantitative downside hedging, physical asset durability, and structured deal discipline.
      </p>
      <p style="font-size: 14px; line-height: 1.65; color: #4A5560; margin-bottom: 26px;">
        Each month, our General Partners synthesize these principles into three prescriptive, battle-tested frameworks designed to protect and compound generational capital. Below is your <strong>${monthLabel}</strong> executive brief across our core pillars.
      </p>

      <hr style="border: none; border-top: 1px solid #DFD2C2; margin: 26px 0;">

      <!-- Article Cards with Direct Checklists -->
      ${articleCardsHtml}

      <!-- Dual Allocator Hub -->
      <div style="margin-top: 32px; border-top: 2px solid #DFD2C2; padding-top: 28px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 8px;">
              <div style="background-color: #EFE7DE; border-radius: 12px; padding: 22px 18px; text-align: center; border: 1px solid #DFD2C2;">
                <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #1A365D; margin: 0 0 6px 0;">
                  Portfolio Stress-Testing
                </h3>
                <p style="font-size: 12px; color: #4A5560; line-height: 1.5; margin: 0 0 16px 0;">
                  Simulate downside delta hedges and asymmetrical alpha capture under market stress.
                </p>
                <a href="${siteUrl}/#climate" style="display: inline-block; background-color: #829A7E; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 18px; border-radius: 20px;">
                  Launch Simulator &rarr;
                </a>
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 8px;">
              <div style="background-color: #EFE7DE; border-radius: 12px; padding: 22px 18px; text-align: center; border: 1px solid #DFD2C2;">
                <div style="font-size: 24px; margin-bottom: 8px;">🤝</div>
                <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #1A365D; margin: 0 0 6px 0;">
                  General Partner Inquiry
                </h3>
                <p style="font-size: 12px; color: #4A5560; line-height: 1.5; margin: 0 0 16px 0;">
                  Connect directly for private co-investment, family office allocations, or deal review.
                </p>
                <a href="${siteUrl}/#contact" style="display: inline-block; background-color: #1A365D; color: #FAF7F2; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 18px; border-radius: 20px;">
                  Contact Partners &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #EFE7DE; padding: 24px 30px; text-align: center; font-size: 12px; line-height: 1.6; color: #718096; border-top: 1px solid #DFD2C2;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #1A365D;">
        Flourish Management LLC
      </p>
      <p style="margin: 0 0 10px 0;">
        Strategic Real Estate • Options-Hedged Capital Markets • Growth-Stage Venture Capital
      </p>
      <p style="margin: 0; font-size: 11px;">
        You are receiving this monthly brief because you subscribed to Flourish Letters at flourishmgmt.com.<br>
        <a href="${unsubUrl}" style="color: #3B6290; text-decoration: underline;">Click here to unsubscribe</a> from this monthly distribution list.
      </p>
    </div>

  </div>
</body>
</html>
    `;
  }

  async dispatchMonthlyDigest(options = {}) {
    if (this.isDispatching) {
      console.log('⏳ [EmailDispatcher] Dispatch already in progress. Skipping concurrent run.');
      return { success: false, message: 'Dispatch already in progress' };
    }

    this.isDispatching = true;
    const now = new Date();
    const monthKey = options.forceMonthKey || this.getCurrentMonthKey();
    const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    console.log(`\n==================================================`);
    console.log(`🚀 [MONTHLY EMAIL DISPATCH INITIATED: ${monthKey}]`);
    console.log(`==================================================`);

    try {
      const articles = this.getMonthArticles(now);
      const senderEmail = process.env.SENDER_EMAIL || process.env.NOTIFICATION_EMAIL || 'info@flourish-mgmt.com';
      const attachments = this.getLogoAttachment();

      // 1. Single test email mode
      if (options.testEmail) {
        console.log(`🎯 Dispatching test monthly digest to: ${options.testEmail}`);
        const mockSub = {
          email: options.testEmail,
          unsubscribeToken: 'test-token-preview',
          status: 'active'
        };
        const html = this.generateMonthlyDigestHtml(monthLabel, articles, mockSub);

        if (this.transporter) {
          await this.transporter.sendMail({
            from: `"Flourish Insights" <${senderEmail}>`,
            to: options.testEmail,
            subject: `Flourish Insights — ${monthLabel} Executive Brief: Macro, Real Estate & Venture`,
            html,
            attachments
          });
          console.log(`✓ Test email successfully sent to ${options.testEmail}`);
        } else {
          console.log(`ℹ️  [Mock Delivery] Transporter inactive. Test email simulated for ${options.testEmail}`);
        }

        this.isDispatching = false;
        return {
          success: true,
          mode: 'test',
          recipient: options.testEmail,
          monthKey,
          articlesIncluded: articles.map(a => a.title)
        };
      }

      // 2. Full production subscriber batch (Sends ONLY ONCE per month to each subscriber)
      const eligible = subscriberManager.getEligibleSubscribersForMonth(monthKey);
      const totalActive = subscriberManager.getActiveCount();

      console.log(`📊 Active Subscribers: ${totalActive} | Eligible For ${monthKey}: ${eligible.length}`);

      if (eligible.length === 0) {
        console.log(`ℹ️  All subscribers have already received the ${monthKey} brief. Zero duplicate emails sent.`);
        this.isDispatching = false;
        return {
          success: true,
          monthKey,
          sentCount: 0,
          skippedCount: totalActive,
          message: 'All subscribers already received this month\'s brief'
        };
      }

      let sentCount = 0;
      let errorCount = 0;

      for (const subscriber of eligible) {
        try {
          const html = this.generateMonthlyDigestHtml(monthLabel, articles, subscriber);

          if (this.transporter) {
            await this.transporter.sendMail({
              from: `"Flourish Insights" <${senderEmail}>`,
              to: subscriber.email,
              subject: `Flourish Insights — ${monthLabel} Executive Brief: Macro, Real Estate & Venture`,
              html,
              attachments
            });
          } else {
            console.log(`ℹ️  [Mock Send] Dispatched ${monthKey} brief to: ${subscriber.email}`);
          }

          // Mark subscriber as sent for this monthKey so they are never emailed twice this month
          subscriberManager.recordMonthSent(subscriber.email, monthKey);
          sentCount++;

          // Respectful 250ms spacing between sends
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (subErr) {
          console.error(`❌ Failed sending to ${subscriber.email}:`, subErr.message);
          errorCount++;
        }
      }

      console.log(`✓ Monthly dispatch completed. Sent: ${sentCount}, Errors: ${errorCount}`);
      console.log(`==================================================\n`);

      this.isDispatching = false;
      return {
        success: true,
        monthKey,
        sentCount,
        errorCount,
        skippedCount: totalActive - eligible.length
      };
    } catch (err) {
      this.isDispatching = false;
      console.error('❌ Error during monthly email dispatch:', err);
      return { success: false, error: err.message };
    }
  }

  async checkAndDispatch() {
    const monthKey = this.getCurrentMonthKey();
    const eligible = subscriberManager.getEligibleSubscribersForMonth(monthKey);
    if (eligible.length > 0) {
      console.log(`⏰ [Scheduler] Detected ${eligible.length} subscribers eligible for ${monthKey} monthly brief.`);
      return await this.dispatchMonthlyDigest();
    }
    return { success: true, message: 'No eligible subscribers pending for this month' };
  }
}

module.exports = new EmailDispatcher();
