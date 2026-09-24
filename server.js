require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const subscriberManager = require('./subscriber-manager');
const emailDispatcher = require('./email-dispatcher');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. App Security: Harden HTTP Headers with customized Content Security Policy (CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "https://www.googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com", "fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://static.wixstatic.com", "https://static.parastorage.com", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
        connectSrc: ["'self'", "https://www.google-analytics.com"]
      }
    },
    // Prevent clickjacking by restricting frame embedding
    frameguard: { action: 'deny' },
    // Prevent MIME type sniffing
    noSniff: true,
    // Enable XSS filter in older browsers
    xssFilter: true,
    // Hide server technology headers
    hidePoweredBy: true
  })
);

// 2. Body parsing middleware (restricted sizes to prevent payload-inflation DDoS attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. API Security: Rate-limit contact form submissions to prevent mail-bombing and brute force
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // Limit each IP to 8 contact form submissions per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in standard RFC headers
  legacyHeaders: false // Disable deprecated headers
});

app.use('/api/contact', contactLimiter);

// Universal Logo Attachment & Header Helper for all outbound emails
const logoAttachment = {
  filename: 'logo.png',
  path: path.join(__dirname, 'public', 'logo.png'),
  cid: 'flourish-logo'
};

function getBrandedEmailHeader(subtitle = 'Executive Notification') {
  return `
    <div style="background-color: #1A365D; padding: 28px 24px; text-align: center; border-bottom: 2px solid #DFD2C2;">
      <a href="https://flourish-web-151213060012.us-central1.run.app" style="text-decoration: none; display: inline-block;">
        <img src="cid:flourish-logo" alt="Flourish Management" width="160" style="display: block; margin: 0 auto 10px auto; max-width: 160px; height: auto; border: 0;" />
      </a>
      <h1 style="color: #FAF7F2; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 400; letter-spacing: 2.5px; text-transform: uppercase;">FLOURISH MANAGEMENT</h1>
      <p style="color: #A5B8D1; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px;">${subtitle}</p>
    </div>
  `;
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to handle contact form inquiries
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, message).' });
  }

  // Sanitize simple tags from fields to avoid stored script injection
  const sanitize = (text) => text.replace(/<[^>]*>/g, '');
  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email);
  const cleanPhone = phone ? sanitize(phone) : 'Not Provided';
  const cleanMessage = sanitize(message);

  const newInquiry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    message: cleanMessage
  };

  // Back up inquiry to a local JSON file (only if running locally)
  const filePath = path.join(__dirname, 'inquiries.json');
  let inquiries = [];
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      inquiries = JSON.parse(fileData);
    }
    inquiries.push(newInquiry);
    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2));
  } catch (error) {
    // Graceful log in container (read-only directories like Cloud Run can fail here without crashing the server)
    console.log('ℹ️  Skipped local DB write (normal behavior on read-only cloud environments)');
  }

  // Print high-visibility log to the terminal console
  console.log(`\n==================================================`);
  console.log(`✉️  [NEW CONTACT FORM INQUIRY RECEIVED]`);
  console.log(`👤 Name:      ${cleanName}`);
  console.log(`📧 Email:     ${cleanEmail}`);
  console.log(`📞 Phone:     ${cleanPhone}`);
  console.log(`📝 Message:   ${cleanMessage}`);
  console.log(`==================================================\n`);

  // Check SMTP setup
  const hasSMTPConfig = 
    process.env.SMTP_USER && 
    process.env.SMTP_USER !== 'your-email@gmail.com' &&
    process.env.SMTP_PASS && 
    process.env.SMTP_PASS !== 'your-gmail-app-password';

  if (!hasSMTPConfig) {
    console.log(`ℹ️  SMTP credentials not fully configured in .env.`);
    return res.json({ 
      success: true, 
      message: 'Inquiry received and logged on server. (Configure SMTP credentials to receive real-time email alerts!)'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // For SendGrid, SMTP_USER is 'apikey'. We must use a verified sender email (e.g. SENDER_EMAIL or NOTIFICATION_EMAIL) in the 'from' header.
    const senderEmail = process.env.SENDER_EMAIL || process.env.NOTIFICATION_EMAIL || 'info@flourish-mgmt.com';

    const mailOptions = {
      from: `"${cleanName}" <${senderEmail}>`,
      replyTo: cleanEmail,
      to: process.env.NOTIFICATION_EMAIL || 'info@flourish-mgmt.com',
      subject: `New Flourish Inquiry from ${cleanName}`,
      text: `You have received a new inquiry from the Flourish website form:\n\n` +
            `Name: ${cleanName}\n` +
            `Email: ${cleanEmail}\n` +
            `Phone: ${cleanPhone}\n\n` +
            `Message:\n${cleanMessage}\n`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #DFD2C2; border-radius: 16px; overflow: hidden; background-color: #FAF7F2; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          ${getBrandedEmailHeader('Direct Website Inquiry')}
          <div style="padding: 28px 24px; color: #1A212D;">
            <h2 style="color: #1A365D; margin-top: 0; font-size: 18px; font-weight: 600;">New Direct Investor Inquiry</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 100px; color: #4A5560; font-size: 13px;">Name:</td>
                <td style="padding: 8px 0; color: #1A212D; font-size: 14px; font-weight: 500;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4A5560; font-size: 13px;">Email:</td>
                <td style="padding: 8px 0; color: #1A212D; font-size: 14px;"><a href="mailto:${cleanEmail}" style="color: #3B6290; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4A5560; font-size: 13px;">Phone:</td>
                <td style="padding: 8px 0; color: #1A212D; font-size: 14px;">${cleanPhone}</td>
              </tr>
            </table>
            <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #DFD2C2; color: #1A212D;">
              <p style="margin: 0; font-weight: bold; color: #4A5560; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message:</p>
              <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${cleanMessage}</p>
            </div>
          </div>
          <div style="background-color: #EFE7DE; padding: 14px 20px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #DFD2C2;">
            Sent automatically by Flourish Management Cloud Server &middot; ${new Date().toLocaleString()}
          </div>
        </div>
      `,
      attachments: [logoAttachment]
    };

    await transporter.sendMail(mailOptions);
    console.log(`🚀 Real email notification dispatched successfully to: ${process.env.NOTIFICATION_EMAIL}\n`);
    res.json({ success: true, message: 'Your inquiry has been received and emailed successfully.' });

  } catch (error) {
    console.error('❌ Nodemailer failed to send email:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server encountered a routing issue. Please try again later or contact us directly.'
    });
  }
});

// Rate limiter for newsletter subscriptions
const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many subscription attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// API endpoint to handle newsletter subscriptions
app.post('/api/subscribe', subscribeLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const cleanEmail = email.replace(/<[^>]*>/g, '').trim();

  console.log(`\n==================================================`);
  console.log(`📧  [NEW NEWSLETTER SUBSCRIBER LOGGED]`);
  console.log(`Email:     ${cleanEmail}`);
  console.log(`==================================================\n`);

  // Register with SubscriberManager
  let subResult;
  try {
    subResult = subscriberManager.addSubscriber(cleanEmail);
    console.log(`📋 Subscriber status: ${subResult.isNew ? 'New' : subResult.reactivated ? 'Reactivated' : 'Existing'}`);
    
    // Dispatch this month's digest if not already received this calendar month
    const currentMonthKey = emailDispatcher.getCurrentMonthKey();
    if (subResult.subscriber && subResult.subscriber.lastSentMonth !== currentMonthKey) {
      emailDispatcher.dispatchMonthlyDigest({ testEmail: cleanEmail, forceMonthKey: currentMonthKey })
        .then(() => {
          subscriberManager.recordMonthSent(cleanEmail, currentMonthKey);
          console.log(`✉️  Immediate welcome monthly brief sent to: ${cleanEmail}`);
        })
        .catch(err => {
          console.warn('⚠️ [Welcome Digest] Deferred or skipped:', err.message);
        });
    }
  } catch (err) {
    console.warn('⚠️ [SubscriberManager] Warning during registration:', err.message);
  }

  // Check SMTP setup and alert partners
  const hasSMTPConfig = 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS && 
    process.env.SMTP_USER !== 'your-email@gmail.com' && 
    process.env.SMTP_PASS !== 'your-gmail-app-password';

  if (!hasSMTPConfig) {
    return res.json({ 
      success: true, 
      message: 'Subscribed successfully! (Nodemailer alert logged locally on server)' 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const senderEmail = process.env.SENDER_EMAIL || process.env.NOTIFICATION_EMAIL || 'info@flourish-mgmt.com';
    const mailOptions = {
      from: `"Flourish Website Alerts" <${senderEmail}>`,
      to: process.env.NOTIFICATION_EMAIL || 'info@flourish-mgmt.com',
      subject: `📈 New Subscriber Alert: ${cleanEmail}`,
      text: `You have a new subscriber for your "Flourish Insights" monthly letters!\n\nSubscriber Email: ${cleanEmail}\n\nThis subscriber has been logged to your contact database.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; border: 1px solid #DFD2C2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          ${getBrandedEmailHeader('Subscriber Registration')}
          <div style="padding: 32px 24px; color: #1A212D;">
            <h2 style="margin-top: 0; font-size: 18px; color: #1A365D; font-weight: 600;">New Subscriber Registered</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4A5560;">You have captured a new subscription for your monthly insights newsletter channel!</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #DFD2C2;">
              <tr style="border-bottom: 1px solid #F0EADF;">
                <td style="padding: 16px; font-weight: bold; color: #1A365D; font-size: 13px; width: 140px; background-color: #FBFBF9;">Subscriber Email:</td>
                <td style="padding: 16px; color: #1A212D; font-size: 14px;"><a href="mailto:${cleanEmail}" style="color: #3B6290; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
              </tr>
            </table>
          </div>
          <div style="background-color: #EFE7DE; padding: 16px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #DFD2C2;">
            &copy; 2026 Flourish Management LLC. All rights reserved.
          </div>
        </div>
      `,
      attachments: [logoAttachment]
    };

    await transporter.sendMail(mailOptions);
    console.log(`🚀 New subscriber email notification dispatched successfully to: ${process.env.NOTIFICATION_EMAIL}\n`);
    res.json({ success: true, message: 'Subscribed successfully! Thank you for joining Flourish Insights.' });

  } catch (error) {
    console.error('❌ Nodemailer failed to send subscription alert:', error.message);
    res.json({ success: true, message: 'Subscribed successfully! Thank you for joining Flourish Insights.' });
  }
});

// Rate limiter for chat leads to avoid spam
const chatLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many chat submissions. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// API endpoint to handle stateful chat-lead capture and transcripts
app.post('/api/chat-lead', chatLeadLimiter, async (req, res) => {
  const { name, email, phone, pitch, transcript } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required to log a chat lead.' });
  }

  const sanitize = (text) => (text ? text.replace(/<[^>]*>/g, '') : '');
  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email);
  const cleanPhone = phone ? sanitize(phone) : 'Not Provided';
  const cleanPitch = pitch ? sanitize(pitch) : 'Not Provided';

  console.log(`\n==================================================`);
  console.log(`💬  [NEW INTERACTIVE CHAT LEAD LOGGED]`);
  console.log(`👤 Name:      ${cleanName}`);
  console.log(`📧 Email:     ${cleanEmail}`);
  console.log(`📞 Phone:     ${cleanPhone}`);
  console.log(`🚀 Pitch:     ${cleanPitch}`);
  console.log(`==================================================\n`);

  // Check SMTP setup
  const hasSMTPConfig = 
    process.env.SMTP_USER && 
    process.env.SMTP_USER !== 'your-email@gmail.com' &&
    process.env.SMTP_PASS && 
    process.env.SMTP_PASS !== 'your-gmail-app-password';

  if (!hasSMTPConfig) {
    console.log(`ℹ️  SMTP credentials not configured in .env. Logging lead locally.`);
    return res.json({ 
      success: true, 
      message: 'Inquiry received and logged on server. (Configure SMTP credentials to receive real-time email alerts!)'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const senderEmail = process.env.SENDER_EMAIL || process.env.NOTIFICATION_EMAIL || 'info@flourish-mgmt.com';

    // Format transcript as HTML rows
    let transcriptHtml = '';
    if (Array.isArray(transcript)) {
      transcriptHtml = transcript.map(msg => {
        const isUser = msg.sender === 'user';
        const color = isUser ? '#1A365D' : '#3B6290';
        const align = isUser ? 'right' : 'left';
        const displayName = isUser ? 'User' : 'Assistant';
        return `
          <div style="margin-bottom: 12px; text-align: ${align};">
            <span style="font-size: 10px; font-weight: bold; color: ${color}; text-transform: uppercase;">${displayName}</span>
            <div style="display: inline-block; max-width: 85%; background-color: ${isUser ? '#FAF7F2' : '#F0F4F8'}; border: 1px solid #DFD2C2; border-radius: 8px; padding: 10px; margin-top: 2px; text-align: left; color: #1A212D; font-size: 13px;">
              ${msg.text}
            </div>
          </div>
        `;
      }).join('');
    } else {
      transcriptHtml = `<p style="font-style: italic; color: #8C9BA5;">Transcript not available.</p>`;
    }

    const mailOptions = {
      from: `"${cleanName} (Chat Lead)" <${senderEmail}>`,
      replyTo: cleanEmail,
      to: process.env.NOTIFICATION_EMAIL || 'info@flourish-mgmt.com',
      subject: `New Interactive Chat Lead: ${cleanName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #DFD2C2; border-radius: 16px; overflow: hidden; background-color: #FAF7F2; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          ${getBrandedEmailHeader('Interactive Concierge Lead')}
          <div style="padding: 28px 24px; color: #1A212D;">
            <h2 style="color: #1A365D; margin-top: 0; font-size: 18px; font-weight: 600;">New Qualified Chat Lead & Transcript</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px; color: #4A5560; font-size: 13px;">Name:</td>
                <td style="padding: 8px 0; color: #1A212D; font-size: 14px; font-weight: 500;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4A5560; font-size: 13px;">Email:</td>
                <td style="padding: 8px 0; color: #1A212D; font-size: 14px;"><a href="mailto:${cleanEmail}" style="color: #3B6290; text-decoration: none; font-weight: 600;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4A5560; font-size: 13px;">Phone:</td>
                <td style="padding: 8px 0; color: #1A212D; font-size: 14px;">${cleanPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #4A5560; font-size: 13px;">Pitch summary:</td>
                <td style="padding: 8px 0; color: #1A212D; font-size: 14px;">${cleanPitch}</td>
              </tr>
            </table>

            <h3 style="color: #1A365D; border-top: 1px solid #DFD2C2; padding-top: 16px; margin-bottom: 12px; font-size: 15px;">Full Conversation History</h3>
            <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #DFD2C2; max-height: 400px; overflow-y: auto;">
              ${transcriptHtml}
            </div>
          </div>

          <div style="background-color: #EFE7DE; padding: 14px 20px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #DFD2C2;">
            Sent automatically by Flourish Management Cloud Server &middot; ${new Date().toLocaleString()}
          </div>
        </div>
      `,
      attachments: [logoAttachment]
    };

    await transporter.sendMail(mailOptions);
    console.log(`🚀 Chat lead and transcript successfully emailed to: ${process.env.NOTIFICATION_EMAIL}\n`);
    res.json({ success: true, message: 'Your details and conversation transcript have been sent to our partners.' });

  } catch (error) {
    console.error('❌ Nodemailer failed to send chat lead email:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing transaction.' });
  }
});

// ----------------------------------------------------
// FLOURISH INSIGHTS & THOUGHT LEADERSHIP API
// ----------------------------------------------------
const insightsEngine = require('./insights-engine');

// Rate limiters for engagement actions
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many comments submitted. Please wait a few moments.' },
  standardHeaders: true,
  legacyHeaders: false
});

const likeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Rate limit exceeded for likes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ----------------------------------------------------
// EXECUTIVE DILIGENCE TEAR-SHEETS API
// ----------------------------------------------------
const DILIGENCE_SHEETS = [
  {
    id: 'multifamily-matrix',
    docId: 'FM-RE-TEARSHEET-01',
    category: 'real-estate',
    categoryLabel: 'Physical Real Estate',
    title: 'The 15-Minute Multifamily Acquisition Screening Matrix',
    subtitle: 'Rapid Institutional Hurdle Filter for Class B/C Workforce Housing Underwriting',
    format: 'Printable 1-Page PDF / 8.5" x 11"',
    url: '/sheets/multifamily-matrix.html',
    highlights: [
      '50% Operating Expense Ratio Mandate (eliminates broker pro-forma bias)',
      'Sub-replacement cost hurdle (≤ 75% of reproduction basis)',
      'Minimum 9.5% unlevered debt yield & 1.35x fixed DSCR',
      '4-point physical on-site utility & deferred maintenance audit'
    ],
    redFlagTrigger: 'Expense ratio < 48% or floating-rate debt proposed'
  },
  {
    id: 'seed-safe-audit',
    docId: 'FM-VC-TEARSHEET-02',
    category: 'venture-capital',
    categoryLabel: 'Early-Stage Venture',
    title: 'The Seed Angel SAFE & Cap Table Dilution Audit',
    subtitle: 'Angel Syndicate Defense Architecture: Dilution Math, Protective Covenants & Velocity Scoring',
    format: 'Printable 1-Page PDF / 8.5" x 11"',
    url: '/sheets/seed-safe-audit.html',
    highlights: [
      'Post-money SAFE stack ceiling (< 25% aggregate seed dilution)',
      '72-hour founder execution & diligence velocity filter',
      'Mandatory information rights & pro-rata side letter defense',
      'Burn multiple hurdle (< 1.5x) and ARR / headcount ratio (> $180k)'
    ],
    redFlagTrigger: 'Total unpriced SAFEs > $2.5M or unallocated option pool trap'
  },
  {
    id: 'delta-hedging-matrix',
    docId: 'FM-MM-TEARSHEET-03',
    category: 'capital-markets',
    categoryLabel: 'Capital Markets & Hedging',
    title: 'The Quantitative Delta-Hedging & Volatility Parameter Matrix',
    subtitle: 'Systematic 0.18 Delta Overlay Calibration, Asymmetric Put Budgets & VIX Regimes',
    format: 'Printable 1-Page PDF / 8.5" x 11"',
    url: '/sheets/delta-hedging-matrix.html',
    highlights: [
      '0.18 Delta systematic covered call & cash-secured strangle rules (30–45 DTE)',
      'Three-tier VIX regime playbook (VIX <15, 15–28, >28)',
      'Pre-programmed tail-risk put harvest (+500% to +1,000% tiers)',
      '100% cash-secured mandate & 4-week Treasury Bill sweep collateral'
    ],
    redFlagTrigger: 'Naked put writing or holding unhedged delta into IV spikes'
  }
];

// GET /api/diligence-sheets - Return list of available executive tear-sheets
app.get('/api/diligence-sheets', (req, res) => {
  res.json({
    success: true,
    total: DILIGENCE_SHEETS.length,
    sheets: DILIGENCE_SHEETS
  });
});

// GET /api/articles - List published articles with recent vs archived breakdown
app.get('/api/articles', (req, res) => {
  try {
    const category = req.query.category || null;
    const recent = insightsEngine.getRecentArticles(category);
    const archived = insightsEngine.getArchivedArticles(category);
    const all = insightsEngine.getPublishedArticles();
    res.json({
      success: true,
      counts: {
        recent: recent.length,
        archived: archived.length,
        total: all.length
      },
      recent,
      archived
    });
  } catch (err) {
    console.error('Error fetching articles:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load insights articles.' });
  }
});

// GET /api/articles/recent - Fetch articles from the past 3 months (9 letters)
app.get('/api/articles/recent', (req, res) => {
  try {
    const category = req.query.category || null;
    const articles = insightsEngine.getRecentArticles(category);
    res.json({ success: true, count: articles.length, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/articles/archive - Fetch older articles (>3 months)
app.get('/api/articles/archive', (req, res) => {
  try {
    const category = req.query.category || null;
    const articles = insightsEngine.getArchivedArticles(category);
    res.json({ success: true, count: articles.length, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/articles/:id - Fetch full article with body & comments
app.get('/api/articles/:id', (req, res) => {
  try {
    const article = insightsEngine.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/articles/:id/like - Like an article
app.post('/api/articles/:id/like', likeLimiter, (req, res) => {
  try {
    const result = insightsEngine.likeArticle(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({ success: true, likes: result.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/articles/:id/comment - Add comment to an article
app.post('/api/articles/:id/comment', commentLimiter, (req, res) => {
  try {
    const { author, affiliation, text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }
    const result = insightsEngine.addComment(req.params.id, { author, affiliation, text });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Article not found or comment invalid.' });
    }
    res.json({
      success: true,
      comment: result.newComment,
      commentsCount: result.commentsCount,
      comments: result.comments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/articles/trigger-schedule - Trigger scheduler check
app.post('/api/articles/trigger-schedule', (req, res) => {
  try {
    insightsEngine.checkSchedule();
    res.json({ success: true, message: 'Schedule updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// MONTHLY NEWSLETTER DISPATCH & UNSUBSCRIBE
// ==========================================

// GET /api/unsubscribe - CAN-SPAM compliant 1-click unsubscribe page
app.get('/api/unsubscribe', (req, res) => {
  const { token, email } = req.query;
  const result = subscriberManager.unsubscribe(token || email);

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe Confirmation | Flourish Management</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF7F2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #1A212D;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #DFD2C2;
      border-radius: 16px;
      padding: 48px 36px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      margin: 20px;
    }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      color: #1A365D;
      margin-top: 16px;
      margin-bottom: 12px;
    }
    p {
      color: #4A5560;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      background-color: #1A365D;
      color: #FAF7F2;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.2s ease;
    }
    .btn:hover {
      background-color: #2A4870;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 36px;">✉️</div>
    <h1>Flourish Letters Unsubscribe</h1>
    <p>
      ${result.success 
        ? `You (${result.email || 'your email'}) have been successfully removed from our monthly executive brief distribution list. You will not receive further emails from us.`
        : 'Your email has already been unsubscribed or this link is expired.'}
    </p>
    <a href="/" class="btn">Return to Flourish Management</a>
  </div>
</body>
</html>
  `);
});

// POST /api/unsubscribe - Programmatic unsubscription
app.post('/api/unsubscribe', (req, res) => {
  const { token, email } = req.body || {};
  const result = subscriberManager.unsubscribe(token || email);
  res.json(result);
});

// POST /api/admin/dispatch-monthly-digest - Trigger monthly email brief
app.post('/api/admin/dispatch-monthly-digest', async (req, res) => {
  try {
    const apiKey = req.headers['x-admin-key'] || req.query.key;
    const expectedKey = process.env.ADMIN_KEY || 'flourish-admin-dispatch';

    // Allow if matching admin key or in local dev
    if (process.env.NODE_ENV === 'production' && apiKey !== expectedKey) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Valid admin key required.' });
    }

    const { testEmail, forceMonthKey } = req.body || {};
    const result = await emailDispatcher.dispatchMonthlyDigest({ testEmail, forceMonthKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/subscribers - View subscriber statistics
app.get('/api/admin/subscribers', (req, res) => {
  const apiKey = req.headers['x-admin-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_KEY || 'flourish-admin-dispatch';

  if (process.env.NODE_ENV === 'production' && apiKey !== expectedKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  const all = subscriberManager.getAllSubscribers();
  const currentMonthKey = emailDispatcher.getCurrentMonthKey();
  const eligibleThisMonth = subscriberManager.getEligibleSubscribersForMonth(currentMonthKey);

  res.json({
    total: all.length,
    active: subscriberManager.getActiveCount(),
    eligibleThisMonth: eligibleThisMonth.length,
    currentMonthKey,
    subscribers: all.map(s => ({
      email: s.email,
      status: s.status,
      subscribedAt: s.subscribedAt,
      lastSentMonth: s.lastSentMonth,
      lastSentAt: s.lastSentAt
    }))
  });
});

// Catch-all route to serve index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Secure Flourish Management server is running!`);
  console.log(`🌐 Address: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
