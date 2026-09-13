require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; border: 1px solid #DFD2C2; border-radius: 12px; padding: 24px; background-color: #FAF7F2;">
          <h2 style="color: #1A365D; border-bottom: 2px solid #A5B8D1; padding-bottom: 10px; margin-top: 0;">New Website Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 100px; color: #4A5560;">Name:</td>
              <td style="padding: 6px 0; color: #1A212D;">${cleanName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4A5560;">Email:</td>
              <td style="padding: 6px 0; color: #1A212D;"><a href="mailto:${cleanEmail}" style="color: #3B6290; text-decoration: none;">${cleanEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4A5560;">Phone:</td>
              <td style="padding: 6px 0; color: #1A212D;">${cleanPhone}</td>
            </tr>
          </table>
          <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #F0EADF; color: #1A212D;">
            <p style="margin: 0; font-weight: bold; color: #4A5560; margin-bottom: 8px;">Message:</p>
            <p style="margin: 0; white-space: pre-wrap;">${cleanMessage}</p>
          </div>
          <p style="font-size: 11px; color: #8C9BA5; text-align: center; margin-top: 24px; border-top: 1px solid #F0EADF; padding-top: 12px;">
            Sent automatically by Flourish Management Cloud Server &middot; ${new Date().toLocaleString()}
          </p>
        </div>
      `
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
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; border: 1px solid #DFD2C2; border-radius: 12px; padding: 24px; background-color: #FAF7F2;">
          <h2 style="color: #1A365D; border-bottom: 2px solid #A5B8D1; padding-bottom: 10px; margin-top: 0;">New Chat Lead & Transcript</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #4A5560;">Name:</td>
              <td style="padding: 6px 0; color: #1A212D;">${cleanName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4A5560;">Email:</td>
              <td style="padding: 6px 0; color: #1A212D;"><a href="mailto:${cleanEmail}" style="color: #3B6290; text-decoration: none;">${cleanEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4A5560;">Phone:</td>
              <td style="padding: 6px 0; color: #1A212D;">${cleanPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #4A5560;">Pitch summary:</td>
              <td style="padding: 6px 0; color: #1A212D;">${cleanPitch}</td>
            </tr>
          </table>

          <h3 style="color: #1A365D; border-top: 1px solid #DFD2C2; padding-top: 16px; margin-bottom: 12px;">Full Conversation History</h3>
          <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #F0EADF; max-height: 400px; overflow-y: auto;">
            ${transcriptHtml}
          </div>

          <p style="font-size: 11px; color: #8C9BA5; text-align: center; margin-top: 24px; border-top: 1px solid #F0EADF; padding-top: 12px;">
            Sent automatically by Flourish Management Cloud Server &middot; ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`🚀 Chat lead and transcript successfully emailed to: ${process.env.NOTIFICATION_EMAIL}\n`);
    res.json({ success: true, message: 'Your details and conversation transcript have been sent to our partners.' });

  } catch (error) {
    console.error('❌ Nodemailer failed to send chat lead email:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing transaction.' });
  }
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
