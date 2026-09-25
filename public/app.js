document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    const barsIcon = document.getElementById('menu-icon-bars');
    const closeIcon = document.getElementById('menu-icon-close');

    mobileMenuBtn.addEventListener('click', () => {
      const isClosed = mobileMenu.classList.toggle('hidden');
      if (barsIcon && closeIcon) {
        if (isClosed) {
          barsIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
        } else {
          barsIcon.classList.add('hidden');
          closeIcon.classList.remove('hidden');
        }
      }
    });

    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        if (barsIcon && closeIcon) {
          barsIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
        }
      });
    });
  }

  // Smooth Scroll with Offset for Sticky Header
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Scroll to Reveal Animation
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealOnScroll = () => {
    for (let i = 0; i < revealElements.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = revealElements[i].getBoundingClientRect().top;
      const elementVisible = 100;

      if (elementTop < windowHeight - elementVisible) {
        revealElements[i].classList.add('active');
      }
    }
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Run initially to reveal elements in viewport

  // Contact Form Submission (Connects to backend Express API)
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Get form data
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();

      // Set sending state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> Sending Inquiry...`;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, phone, message })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success
          contactForm.reset();
          
          // Inject custom backend message into alert (e.g. if local saved only)
          const successSpan = formSuccess.querySelector('span');
          if (successSpan) {
            successSpan.innerHTML = `<strong>Inquiry Logged!</strong> ${result.message}`;
          }
          
          formSuccess.classList.remove('hidden');
          formSuccess.classList.remove('bg-rose-50', 'border-rose-300', 'text-rose-800');
          formSuccess.classList.add('bg-sage-light', 'border-sage-accent', 'text-sage-dark');
          
          setTimeout(() => {
            formSuccess.classList.add('hidden');
          }, 8000);
        } else {
          throw new Error(result.message || 'Server encountered an error processing your inquiry.');
        }

      } catch (err) {
        console.error('Contact Form Error:', err);
        // Show error alert
        const successSpan = formSuccess.querySelector('span');
        if (successSpan) {
          successSpan.innerHTML = `<strong>Failed to Send:</strong> ${err.message}`;
        }
        formSuccess.classList.remove('hidden');
        formSuccess.classList.remove('bg-sage-light', 'border-sage-accent', 'text-sage-dark');
        formSuccess.classList.add('bg-rose-50', 'border-rose-300', 'text-rose-800');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // ==========================================
  // SMART SIMULATED CHAT ASSISTANT (REFACTORED)
  // ==========================================
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');
  const closeChat = document.getElementById('close-chat');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');
  const chatNotification = document.getElementById('chat-notification');

  // Open Chat Window
  const openChatWindow = () => {
    chatContainer.classList.remove('hidden');
    chatContainer.classList.add('flex');
    chatNotification.classList.add('hidden'); // Clear new message badge
    chatInput.focus();
    scrollToBottom();
  };

  // Close Chat Window
  const closeChatWindow = () => {
    chatContainer.classList.add('hidden');
    chatContainer.classList.remove('flex');
  };

  if (chatToggle && chatContainer && closeChat) {
    chatToggle.addEventListener('click', openChatWindow);
    closeChat.addEventListener('click', closeChatWindow);
  }

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // Format timestamp
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Stateful conversation state for interactive lead collection (Dual-Track: Founders & Allocators)
  let conversationHistory = [];
  let leadState = 'DEFAULT'; // DEFAULT, FOUNDER_NAME, FOUNDER_EMAIL, FOUNDER_PHONE, FOUNDER_PITCH, ALLOCATOR_NAME, ALLOCATOR_EMAIL, ALLOCATOR_ORG, ALLOCATOR_INTEREST
  let leadType = 'founder'; // 'founder' | 'allocator'
  let leadData = { name: '', email: '', phone: '', pitch: '', organization: '', interest: '' };

  // Add a message bubble to the chat (always insert BEFORE the typing indicator)
  const appendMessage = (sender, text) => {
    // Save to local session log history for transcript processing
    conversationHistory.push({ sender, text });

    const isUser = sender === 'user';
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
      isUser 
        ? 'bg-[#1A365D] text-white rounded-br-none' 
        : 'bg-[#F8F5F0] text-slate-800 rounded-bl-none border border-[#E5DEC9]'
    }`;
    
    bubble.innerHTML = `
      <div class="leading-relaxed text-xs sm:text-sm">${text}</div>
      <span class="block text-[9px] ${isUser ? 'text-slate-300' : 'text-slate-400'} mt-1 text-right font-mono">${getFormattedTime()}</span>
    `;

    messageWrapper.appendChild(bubble);
    
    // Insert before typing indicator so typing indicator stays at the bottom
    chatMessages.insertBefore(messageWrapper, typingIndicator);
    scrollToBottom();
  };

  // Handle typing animation
  const showTyping = () => {
    typingIndicator.classList.remove('hidden');
    // Ensure the indicator is at the very bottom
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();
  };

  const hideTyping = () => {
    typingIndicator.classList.add('hidden');
  };

  // 20-Year Partner Wisdom Engine: Institutional Heuristic Responses
  const getAssistantResponse = (userMsg) => {
    const query = userMsg.toLowerCase().trim();

    // 1. Greetings & Desk Introduction
    if (reMatch(query, ['hello', 'hi', 'hey', 'greetings', 'start', 'test', 'good morning', 'good afternoon', 'good evening', 'who is this'])) {
      return "Greetings. I represent the digital desk for the <strong>Flourish Investment Committee</strong>.<br><br>We allocate proprietary capital across three core disciplines:<br>• <strong>Workforce Real Estate:</strong> 50% OpEx & debt yield hurdles.<br>• <strong>Options Hedging:</strong> 0.18 delta systematic overlay & crash put reserves.<br>• <strong>Seed Venture:</strong> SAFE dilution caps & founder velocity.<br><br>Select a topic above or state your inquiry to begin.";
    }

    // 2. Real Estate Underwriting & Criteria
    if (reMatch(query, ['real estate', 'property', 'properties', 'multifamily', 'apartment', 'housing', 'acquisition', 'cap rate', 'debt yield', 'replacement cost', 'opex', 'underwriting rule', 'fm-re-01', 'real estate underwriting'])) {
      return "<strong>Real Estate Underwriting Mandate:</strong><br>Our committee acquires cash-flowing residential and workforce housing under four non-negotiable rules:<br><br>" +
        "1. <strong>The 50% OpEx Mandate:</strong> We never underwrite to seller or broker pro formas. Operating expenses (taxes, insurance, turns, management) invariably absorb 48–52% of gross revenues.<br>" +
        "2. <strong>Sub-Replacement Cost Hurdle:</strong> Acquisition basis must be ≤75% of new construction cost per door to ensure an unassailable margin of safety.<br>" +
        "3. <strong>Fixed-Rate Debt Only:</strong> Zero floating-rate bridge debt. All properties carry 7-to-10 year fixed agency financing backed by a 12-month operational liquidity reserve.<br>" +
        "4. <strong>Unlevered Debt Yield:</strong> Minimum 9.5% unlevered debt yield hurdle upon stabilized occupancy.<br><br>" +
        "📥 Review our complete 1-page framework: <a href='/sheets/multifamily-matrix.html' target='_blank' class='underline font-bold text-brand-gold'>Multifamily Screening Matrix (Doc ID: FM-RE-01)</a>.";
    }

    // 3. Options Hedging & Volatility Strategy
    if (reMatch(query, ['option', 'options', 'hedging', 'hedge', 'delta', 'vix', 'volatility', 'capital market', 'public market', 'crash put', 'covered call', 'derivative', 'fm-mm-03', 'options hedging'])) {
      return "<strong>Systematic Options & Volatility Hedging:</strong><br>We execute a disciplined, non-correlated derivatives overlay designed to protect capital and harvest structural cash yields:<br><br>" +
        "1. <strong>0.18 Delta Systematic Write:</strong> 30–45 DTE covered calls rolled on monthly expirations to generate recurring income without capping long-term core equity upside.<br>" +
        "2. <strong>3-Tier VIX Regime Calibration:</strong> Low IV (VIX <15) triggers tight systematic writes; moderate (15–28) triggers defensive call spreads; high volatility (VIX >28) triggers rolling strikes down and monetizing long tail puts.<br>" +
        "3. <strong>Asymmetric Crash-Put Budget:</strong> 1.5%–2.0% annual premium allocated to deep out-of-the-money crash puts, generating +500% to +1,000% payouts during systemic shocks (e.g. 2020 liquidity freeze).<br>" +
        "4. <strong>100% Cash-Secured Collateral:</strong> Collateral is swept continuously into 4-week US Treasury bills; unhedged margin debt is strictly prohibited.<br><br>" +
        "📥 Review our parameters: <a href='/sheets/delta-hedging-matrix.html' target='_blank' class='underline font-bold text-brand-gold'>Delta-Hedging Parameter Sheet (Doc ID: FM-MM-03)</a>.";
    }

    // 4. Venture Capital & Seed Diligence
    if (reMatch(query, ['venture', 'vc', 'startup', 'start-up', 'founder', 'seed', 'series a', 'safe', 'cap table', 'dilution', 'angel', 'pre-seed', 'fm-vc-02', 'venture capital', 'dual-track', 'dual track', 'co-development', 'codevelopment', 'velocity capital'])) {
      return "<strong>Flourish Management — Early-Stage Venture Arm:</strong><br>" +
        "<em>&ldquo;Capital that moves at your speed. Partnership that builds at your depth.&rdquo;</em><br><br>" +
        "We solve the modern founder’s greatest trade-off between fast hands-off capital and slow intrusive mentorship through our <strong>Dual-Track Engine</strong>:<br><br>" +
        "1. <strong>Track 1: High-Velocity Capital:</strong> Frictionless deployment funded in days, unrestricted founder autonomy without board baggage, and instant access to our technical ecosystem.<br>" +
        "2. <strong>Track 2: Active Operational Co-Development:</strong> Direct collaboration with experienced domain partners across product architecture, AI systems, and go-to-market scaling.<br><br>" +
        "<strong>Why Founders Choose Flourish:</strong> No forced playbooks, deep technical force-multipliers, and founder-first speed under strict cap table defense (under 20% aggregate seed dilution).<br><br>" +
        "<strong>Value for Limited Partners:</strong> Broad market velocity, concentrated alpha via operational de-risking, and disciplined risk architecture.<br><br>" +
        "🚀 <strong>Founders:</strong> Submit your pitch via our <a href='/contact?type=founder' class='font-bold text-brand-gold underline'>Founder Pitch Portal</a>.<br>" +
        "💼 <strong>LPs & Allocators:</strong> Access strategy details via our <a href='/contact?type=allocator' class='font-bold text-brand-gold underline'>LP Portal & Inquiries</a>.<br>" +
        "📥 Review our framework: <a href='/sheets/seed-safe-audit.html' target='_blank' class='underline font-bold text-brand-gold'>Seed SAFE Cap Table Audit (Doc ID: FM-VC-02)</a>.";
    }

    // 5. Four Market Regimes Track Record
    if (reMatch(query, ['track record', 'experience', '20 years', '20-year', '22 years', '22-year', 'history', 'cycle', 'cycles', 'market cycles', 'how long', 'regime', 'performance', 'gfc', '2008', '2020', '2022', 'track record'])) {
      return "<strong>Steering Capital Across Four Economic Regimes:</strong><br>Our Investment Committee has steered capital through every major financial stress-test of the modern era with <strong>zero debt defaults</strong>:<br><br>" +
        "• <strong>2008 Financial Crisis:</strong> Fixed-rate debt and strict 12-month operating reserves protected our physical assets while floating-rate competitors faced liquidation.<br>" +
        "• <strong>2014–2020 Low-Rate Tech Boom:</strong> Maintained disciplined entry valuations; refused speculative 50x ARR seed rounds and focused on tangible cash flows.<br>" +
        "• <strong>2020 Liquidity Shock:</strong> Monetized deep out-of-the-money options crash hedges to acquire distressed high-quality assets at deep discounts.<br>" +
        "• <strong>2022 Rapid Rate Shock:</strong> Systematic 0.18 delta covered call overlays buffered against a 500 bps Fed tightening cycle while debt-heavy borrowers stalled.<br><br>" +
        "See our detailed cycle analysis on the <a href='/track-record' class='underline font-bold text-brand-gold'>Track Record page</a>.";
    }

    // 6. Institutional Diligence Tear-Sheets
    if (reMatch(query, ['tear-sheet', 'tear sheet', 'tear-sheets', 'tear sheets', 'checklist', 'pdf', 'matrix', 'worksheet', 'download', 'print', 'diligence sheets'])) {
      return "<strong>Institutional Diligence Tear-Sheets:</strong><br>We provide standardized 1-page institutional diligence matrices for allocators and operators:<br><br>" +
        "1. <a href='/sheets/multifamily-matrix.html' target='_blank' class='font-bold text-brand-gold underline'>FM-RE-01: Multifamily Screening Matrix</a> &middot; 50% OpEx stress test, debt yield hurdles, replacement cost.<br>" +
        "2. <a href='/sheets/seed-safe-audit.html' target='_blank' class='font-bold text-brand-gold underline'>FM-VC-02: Seed SAFE Cap Table Audit</a> &middot; 20% aggregate dilution ceiling, 72-hr founder velocity, ESOP traps.<br>" +
        "3. <a href='/sheets/delta-hedging-matrix.html' target='_blank' class='font-bold text-brand-gold underline'>FM-MM-03: Delta-Hedging Parameter Sheet</a> &middot; 0.18 delta covered calls, VIX regimes, crash put insurance.<br><br>" +
        "Review and print all sheets on the <a href='/diligence' class='underline font-bold text-brand-gold'>Diligence Portal</a>.";
    }

    // 7. Allocator / LP Inquiries
    if (reMatch(query, ['allocator', 'co-invest', 'coinvest', 'lp', 'limited partner', 'family office', 'institutional investor', 'accredited', 'private wealth', 'endowment', 'fund of funds'])) {
      return "<strong>Accredited Allocator Inquiries:</strong><br>We selectively evaluate co-investments, institutional research partnerships, and programmatic real estate / options allocations with accredited family offices and qualified institutional buyers.<br><br>To initiate a confidential mandate review with our Investment Committee, type <strong>'start allocator intake'</strong> or visit the <a href='/contact' class='underline font-bold text-brand-gold'>Executive Portal</a>.";
    }

    // 8. Strategic Ecosystem & Venture Partners
    if (reMatch(query, ['tca', 'tca venture', 'expert dojo', 'dojo', 'ecosystem', 'partner link', 'partner links', 'ecosystem partners', 'accelerator', 'venture network'])) {
      return "<strong>Strategic Ecosystem & Venture Partners:</strong><br>We actively collaborate with premier early-stage investment networks and global accelerators:<br><br>" +
        "• <a href='https://tcaventuregroup.com/' target='_blank' rel='noopener noreferrer' class='font-bold text-brand-gold underline'>TCA Venture Group</a>: One of the largest and most active early-stage investment networks in the US, providing seed capital, mentorship, and extensive industry connections.<br>" +
        "• <a href='https://expertdojo.com/' target='_blank' rel='noopener noreferrer' class='font-bold text-brand-gold underline'>Expert Dojo</a>: A premier international early-stage accelerator program backing high-growth founders and leading rapid seed financing rounds.<br><br>" +
        "Explore these alliances on our <a href='/' class='underline font-bold text-brand-gold'>Home page</a> and <a href='/strategies' class='underline font-bold text-brand-gold'>Investment Disciplines page</a>.";
    }

    // 9. Identity, Governance & Oversight
    if (reMatch(query, ['who are you', 'team', 'who runs', 'committee', 'names', 'founder name', 'management', 'governance', 'partners', 'leadership'])) {
      return "<strong>Investment Governance & Oversight:</strong><br>Flourish Management LLC is governed directly by our <strong>Investment Committee</strong>. We allocate capital across physical real estate, quantitative options hedging, and early-stage venture. We let our track record, underwriting rules, and risk management discipline speak for themselves.";
    }

    // 10. Contact & Inquiries
    if (reMatch(query, ['contact', 'email', 'phone', 'call', 'reach out', 'office', 'inquiry', 'info', 'message', 'mail', 'address'])) {
      return "<strong>Executive Contact Channels:</strong><br>• <strong>Executive Desk:</strong> <a href='mailto:info@flourish-mgmt.com' class='underline font-bold text-brand-gold'>info@flourish-mgmt.com</a><br>• <strong>Direct Telephone:</strong> <a href='tel:+14247033332' class='underline font-bold text-brand-gold'>+1 (424) 703-3332</a><br>• <strong>Formal Inquiry:</strong> Submit details via the <a href='/contact' class='underline font-bold text-brand-gold'>Partner Inquiry Form</a>.<br>• <strong>Live Concierge:</strong> You can also state your inquiry right here, and I will route it directly to our general partners.";
    }

    // 11. Compliance & Disclaimers
    if (reMatch(query, ['disclaimer', 'sec', 'compliance', 'legal', 'regulation', '506', 'accreditation'])) {
      return "<strong>Legal Disclaimer:</strong><br>Flourish Management is an independent private investment management firm. All market perspectives, underwriting frameworks, and quantitative options models are strictly for informational and analytical purposes and do not constitute an offer to sell, a solicitation to buy, or an investment recommendation. Past performance across historical economic cycles is no guarantee of future results.";
    }

    // 12. Polite Closing / Acknowledgment
    if (reMatch(query, ['thank', 'thanks', 'great', 'awesome', 'good', 'perfect', 'understood', 'got it', 'bye', 'goodbye'])) {
      return "You are very welcome. The Flourish Investment Committee Desk is always at your service. Please reach out if you require further diligence or co-investment details.";
    }

    // 13. Fallback Menu
    return "I want to ensure you receive the precise institutional perspective you require. Please select one of the quick options above, or ask about:<br><br>" +
      "• <strong>'real estate'</strong> for our 50% OpEx & debt yield criteria.<br>" +
      "• <strong>'options'</strong> for our 0.18 delta systematic hedging engine.<br>" +
      "• <strong>'venture'</strong> or <strong>'pitch'</strong> to submit a seed startup.<br>" +
      "• <strong>'allocator'</strong> for accredited LP & co-investment pathways.<br>" +
      "• <strong>'tear sheets'</strong> to review our printable institutional matrices.";
  };

  // Heuristic matching helper with whole word boundary scanning
  const reMatch = (text, keywords) => {
    return keywords.some(keyword => {
      const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = escaped.includes(' ') 
        ? new RegExp(escaped, 'i') 
        : new RegExp('\\b' + escaped + '\\b', 'i');
      return regex.test(text);
    });
  };

  // Reusable core message processing function (Dual-Track State Machine)
  const handleUserMessageSubmit = (messageText) => {
    if (!messageText) return;

    // Append User Message bubble
    appendMessage('user', messageText);

    // Show simulated assistant typing indicator
    showTyping();

    const query = messageText.toLowerCase().trim();

    // Check if the user is attempting to escape/cancel the lead process
    if (query === 'reset' || query === 'cancel' || query === 'exit' || query === 'restart' || query === 'stop' || query === 'back') {
      leadState = 'DEFAULT';
      leadType = 'founder';
      leadData = { name: '', email: '', phone: '', pitch: '', organization: '', interest: '' };
      setTimeout(() => {
        hideTyping();
        appendMessage('assistant', "Onboarding flow reset. I am at your disposal. You can inquire about our 20-year cross-cycle track record, real estate underwriting, options hedging parameters, or executive tear-sheets.");
      }, 500);
      return;
    }

    let responseText = '';
    let triggerLeadSubmit = false;

    // Smart Interruption: Check if user is asking an informational question, command, or topic query
    const isGeneralQuestion = 
      query.includes('?') ||
      query.startsWith('what') || 
      query.startsWith('how') || 
      query.startsWith('why') || 
      query.startsWith('tell me') || 
      query.startsWith('explain') || 
      query.startsWith('show me') || 
      query.startsWith('can you') ||
      reMatch(query, [
        'real estate', 'property', 'properties', 'option', 'options', 'hedging', 'hedge', 
        'track record', 'tear-sheet', 'tear sheet', 'tear sheets', 'diligence sheets', 
        'cycle', 'cycles', '2008', '2020', '2022', 'who are you', 'team', 'partner', 
        'contact', 'email', 'phone', 'help', 'philosophy', 'strategy', 'about'
      ]);

    // Explicit intake activation triggers
    const isPitchRequest = reMatch(query, [
      'i want to pitch', 'pitch a startup', 'pitch my startup', 'submit pitch', 
      'submit my pitch', 'submit deal', 'submit a deal', 'apply for funding', 
      'seeking capital for startup', 'pitch to partners', 'pitch deck', 'raise seed capital'
    ]);

    const isAllocatorRequest = reMatch(query, [
      'start allocator intake', 'apply to allocate', 'onboard as allocator', 
      'submit allocator inquiry', 'register allocator', 'allocator onboarding'
    ]);

    // If currently in an intake flow but the user asks an informational question, break out cleanly
    if (leadState !== 'DEFAULT' && isGeneralQuestion && !isPitchRequest && !isAllocatorRequest) {
      leadState = 'DEFAULT';
      leadType = 'founder';
      leadData = { name: '', email: '', phone: '', pitch: '', organization: '', interest: '' };
      responseText = getAssistantResponse(messageText);
    }
    // Process chat inputs statefully
    else if (leadState === 'DEFAULT') {
      if (isPitchRequest) {
        leadType = 'founder';
        leadState = 'FOUNDER_NAME';
        responseText = "<strong>Venture Partnership Intake:</strong> We actively evaluate early-stage software, fintech, and hard-tech startups with high-velocity founding teams. I will capture your parameters and transmit your transcript directly to our Investment Committee.<br><br>Let's begin: <strong>What is your full name?</strong><br><span class='text-[10px] text-slate-500 font-mono'>(Type 'cancel' anytime to return to general questions)</span>";
      } else if (isAllocatorRequest) {
        leadType = 'allocator';
        leadState = 'ALLOCATOR_NAME';
        responseText = "<strong>Institutional Allocator Intake:</strong> We welcome confidential dialogue with accredited family offices, institutional allocators, and co-investment partners. I will log your mandate and brief our General Partners directly.<br><br>To begin: <strong>What is your full name and title?</strong><br><span class='text-[10px] text-slate-500 font-mono'>(Type 'cancel' anytime to return to general questions)</span>";
      } else {
        responseText = getAssistantResponse(messageText);
      }
    } 
    // Track A: Founder Pitch Flow
    else if (leadState === 'FOUNDER_NAME') {
      leadData.name = messageText;
      leadState = 'FOUNDER_EMAIL';
      responseText = `Great to connect, <strong>${leadData.name}</strong>. What is your <strong>best executive email address</strong> so our Investment Committee can follow up?`;
    } else if (leadState === 'FOUNDER_EMAIL') {
      if (!messageText.includes('@') || !messageText.includes('.')) {
        responseText = "Please provide a valid email address so our committee can contact you directly (or type 'cancel' to exit):";
      } else {
        leadData.email = messageText;
        leadState = 'FOUNDER_PHONE';
        responseText = `Understood. What is a <strong>good direct phone number</strong> (including country code) to connect with you?`;
      }
    } else if (leadState === 'FOUNDER_PHONE') {
      leadData.phone = messageText;
      leadState = 'FOUNDER_PITCH';
      responseText = "Perfect. Please share a <strong>brief summary of your startup, current ARR/traction, and your current raise terms</strong> (e.g., '$750k Seed on SAFE at $8M valuation cap'):";
    } else if (leadState === 'FOUNDER_PITCH') {
      leadData.pitch = messageText;
      leadState = 'DEFAULT';
      responseText = `Thank you, <strong>${leadData.name}</strong>. I am compiling your pitch memo and transmitting your conversation transcript directly to our General Partners right now. One moment...`;
      triggerLeadSubmit = true;
    }
    // Track B: Accredited Allocator / LP Flow
    else if (leadState === 'ALLOCATOR_NAME') {
      leadData.name = messageText;
      leadState = 'ALLOCATOR_EMAIL';
      responseText = `Thank you, <strong>${leadData.name}</strong>. What is your <strong>primary institutional or executive email address</strong>?`;
    } else if (leadState === 'ALLOCATOR_EMAIL') {
      if (!messageText.includes('@') || !messageText.includes('.')) {
        responseText = "Please provide a valid corporate or executive email address (or type 'cancel' to exit):";
      } else {
        leadData.email = messageText;
        leadState = 'ALLOCATOR_ORG';
        responseText = `What is the name of your <strong>organization, family office, or fund entity</strong> (e.g., 'Single Family Office', 'Endowment', 'Individual Qualified Purchaser')?`;
      }
    } else if (leadState === 'ALLOCATOR_ORG') {
      leadData.organization = messageText;
      leadState = 'ALLOCATOR_INTEREST';
      responseText = "Understood. What is your <strong>primary allocation interest or target strategy</strong> (e.g., 'Workforce Housing Equity', 'Systematic Volatility Yield', 'Seed Co-Investment Rights')?";
    } else if (leadState === 'ALLOCATOR_INTEREST') {
      leadData.interest = messageText;
      leadState = 'DEFAULT';
      responseText = `Thank you, <strong>${leadData.name}</strong>. I am packaging your institutional inquiry and transmitting your brief directly to our Investment Committee. One moment...`;
      triggerLeadSubmit = true;
    }

    // Calculate typing speed delay based on word length
    const delay = Math.max(600, Math.min(1800, responseText.length * 5));

    setTimeout(() => {
      hideTyping();
      appendMessage('assistant', responseText);

      // Submit captured lead and transcript details to server
      if (triggerLeadSubmit) {
        showTyping();

        fetch('/api/chat-lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            leadType: leadType,
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            pitch: leadData.pitch,
            organization: leadData.organization,
            interest: leadData.interest,
            transcript: conversationHistory
          })
        })
        .then(res => res.json())
        .then(data => {
          hideTyping();
          if (data.success) {
            if (leadType === 'allocator') {
              appendMessage('assistant', `🏛️ <strong>Institutional Inquiry Transmitted:</strong><br>Your mandate details and conversation transcript have been delivered directly to the Flourish Investment Committee. A General Partner will review your inquiry and follow up at <strong>${leadData.email}</strong> within 24 hours.<br><br>Thank you for connecting with Flourish Management.`);
            } else {
              appendMessage('assistant', `🚀 <strong>Venture Pitch Transmitted:</strong><br>Your details have been logged and the conversation transcript emailed directly to our General Partners. A partner will review your pitch against our Seed diligence criteria and respond to <strong>${leadData.email}</strong> within 24 hours.<br><br>Thank you for submitting to Flourish Management.`);
            }
          } else {
            appendMessage('assistant', `ℹ️ <strong>Details Saved!</strong> Your inquiry has been logged locally on our server. A partner will review your submission shortly. Thank you, <strong>${leadData.name}</strong>!`);
          }
          // Reset captured state variables
          leadData = { name: '', email: '', phone: '', pitch: '', organization: '', interest: '' };
        })
        .catch(err => {
          hideTyping();
          appendMessage('assistant', `ℹ️ <strong>Details Logged!</strong> We successfully captured your information on our server. Our team will review your inquiry shortly. Thank you, <strong>${leadData.name}</strong>!`);
          leadData = { name: '', email: '', phone: '', pitch: '', organization: '', interest: '' };
        });
      }
    }, delay);
  };

  // Submit chat message form handler
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageText = chatInput.value.trim();
      if (!messageText) return;
      
      handleUserMessageSubmit(messageText);
      chatInput.value = '';
    });
  }

  // Bind Standard Click event listeners to shortcut buttons (Strictly complies with CSP)
  document.querySelectorAll('.chat-shortcut-btn').forEach(button => {
    button.addEventListener('click', () => {
      // ALWAYS reset lead state on shortcut click so buttons are never trapped in a form
      leadState = 'DEFAULT';
      leadType = 'founder';
      leadData = { name: '', email: '', phone: '', pitch: '', organization: '', interest: '' };
      const questionText = button.getAttribute('data-question');
      if (questionText) {
        handleUserMessageSubmit(questionText);
      }
    });
  });

  // Auto-trigger welcome message after a brief delay
  setTimeout(() => {
    // Only if there are no user/assistant messages yet (besides the typing indicator)
    const messages = chatMessages.querySelectorAll('div:not(#typing-indicator)');
    if (messages.length === 0) {
      appendMessage('assistant', "Welcome to Flourish Management. I am the digital desk officer for the <strong>Flourish Investment Committee</strong>.<br><br>Whether you are an accredited allocator evaluating our cross-cycle strategies, a founder submitting a seed round, or reviewing our diligence frameworks, how may I assist you today?");
      // Show notification badge if chat window is closed
      if (chatContainer.classList.contains('hidden')) {
        chatNotification.classList.remove('hidden');
      }
    }
  }, 1000);

  // ==========================================
  // FLOURISH INSIGHTS DYNAMIC ENGINE & SOCIAL API
  // ==========================================
  const insightsGrid = document.getElementById('insights-grid');
  const archiveModal = document.getElementById('archive-modal');
  const openArchiveBtn = document.getElementById('open-archive-btn');
  const closeArchiveBtn = document.getElementById('close-archive-modal');
  const archiveCountBadge = document.getElementById('archive-count-badge');
  const archiveListContainer = document.getElementById('archive-list-container');
  const archiveFilterBtns = document.querySelectorAll('.archive-filter-btn');
  const insightCategoryBtns = document.querySelectorAll('.insight-tab-btn');

  // Reader Modal Elements
  const articleModal = document.getElementById('article-modal');
  const closeArticleBtn = document.getElementById('close-modal');
  const modalFooterCloseBtn = document.getElementById('modal-footer-close');
  const modalCategory = document.getElementById('modal-category');
  const modalDate = document.getElementById('modal-date');
  const modalReadTime = document.getElementById('modal-read-time');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalLikeBtn = document.getElementById('modal-like-btn');
  const modalLikeIcon = document.getElementById('modal-like-icon');
  const modalLikeCount = document.getElementById('modal-like-count');
  const modalJumpComments = document.getElementById('modal-jump-comments');
  const modalCommentCount = document.getElementById('modal-comment-count');
  const commentsBadgeTotal = document.getElementById('comments-badge-total');
  const modalCommentsList = document.getElementById('modal-comments-list');
  const modalShareBtn = document.getElementById('modal-share-btn');
  const commentForm = document.getElementById('comment-form');
  const commentAuthorInput = document.getElementById('comment-author');
  const commentAffiliationInput = document.getElementById('comment-affiliation');
  const commentTextInput = document.getElementById('comment-text');
  const commentSubmitBtn = document.getElementById('comment-submit-btn');
  const commentMessage = document.getElementById('comment-message');
  const modalScrollPane = document.getElementById('modal-scroll-pane');

  // State Management
  let recentArticles = [];
  let archivedArticles = [];
  let currentRecentCategory = 'all';
  let currentArchiveCategory = 'all';
  let currentActiveArticle = null;
  const likedArticlesSet = new Set(JSON.parse(localStorage.getItem('flourish_liked_articles') || '[]'));

  // SVG Icons
  const heartOutlineSvg = `<svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`;
  const heartFilledSvg = `<svg class="w-4 h-4 fill-rose-500 stroke-rose-500" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`;

  /**
   * Fetch articles from backend API
   */
  async function loadArticles() {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (data.success) {
        recentArticles = data.recent || [];
        archivedArticles = data.archived || [];

        if (archiveCountBadge) {
          archiveCountBadge.textContent = data.counts.archived || archivedArticles.length;
        }

        renderRecentArticles();
      }
    } catch (err) {
      console.warn('Using client fallback articles data:', err.message);
      // Fallback pre-rendered cards will remain clickable
      bindStaticCards();
    }
  }

  /**
   * Render Recent Articles Grid (Past 3 Months sliding window: 9 letters)
   */
  function renderRecentArticles() {
    if (!insightsGrid) return;

    const filtered = recentArticles.filter(item => {
      if (currentRecentCategory === 'all') return true;
      return item.category.toLowerCase() === currentRecentCategory.toLowerCase();
    });

    if (filtered.length === 0) {
      insightsGrid.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate text-sm">
          No articles found for category "${currentRecentCategory}" in the last 3 months.
        </div>
      `;
      return;
    }

    insightsGrid.innerHTML = filtered.map(article => {
      const isLiked = likedArticlesSet.has(article.id);
      const commentsCount = (article.comments && article.comments.length) || 0;

      return `
        <div class="insight-article-card bg-cream-light border border-cream-accent/50 rounded-4xl p-7 hover:shadow-xl transition-all duration-300 hover:border-[#3B6290]/40 flex flex-col justify-between cursor-pointer group"
             data-article-id="${article.id}">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-[#3B6290]/10 text-[#1A365D] rounded-full border border-[#3B6290]/20 font-mono">${escapeHtml(article.category)}</span>
              <span class="text-xs text-slate font-mono">${escapeHtml(article.date || article.displayDate)} &bull; ${escapeHtml(article.readTime || '4 Min')}</span>
            </div>
            <h3 class="text-xl font-serif text-slate-dark mb-3 group-hover:text-sage transition-colors leading-snug">${escapeHtml(article.title)}</h3>
            <p class="text-xs text-slate leading-relaxed line-clamp-3 mb-4">
              ${escapeHtml(article.summary)}
            </p>
          </div>
          <div class="pt-4 border-t border-cream-accent/40 flex items-center justify-between">
            <div class="flex items-center space-x-3 text-xs text-slate font-mono">
              <button type="button" 
                      class="card-like-btn flex items-center space-x-1.5 transition-colors ${isLiked ? 'text-rose-600 font-semibold' : 'text-slate hover:text-rose-600'}" 
                      data-article-id="${article.id}" 
                      title="Like this letter">
                ${isLiked ? heartFilledSvg : heartOutlineSvg}
                <span class="like-counter">${article.likes || 0}</span>
              </button>
              <button type="button" 
                      class="card-comment-btn flex items-center space-x-1 text-slate hover:text-[#1A365D] transition-colors" 
                      data-article-id="${article.id}"
                      title="View reader discussion">
                <svg class="w-4 h-4 fill-none stroke-currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span>${commentsCount}</span>
              </button>
            </div>
            <span class="text-xs font-bold text-[#3B6290] flex items-center group-hover:translate-x-1 transition-transform">
              Read <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </span>
          </div>
        </div>
      `;
    }).join('');

    bindArticleEvents();
  }

  /**
   * Render Archives List inside the Archive Modal
   */
  function renderArchivedArticles() {
    if (!archiveListContainer) return;

    const filtered = archivedArticles.filter(item => {
      if (currentArchiveCategory === 'all') return true;
      return item.category.toLowerCase() === currentArchiveCategory.toLowerCase();
    });

    if (filtered.length === 0) {
      archiveListContainer.innerHTML = `
        <div class="text-center py-12 text-slate text-sm">
          No archived letters found for category "${currentArchiveCategory}".
        </div>
      `;
      return;
    }

    archiveListContainer.innerHTML = filtered.map(article => {
      const isLiked = likedArticlesSet.has(article.id);
      const commentsCount = (article.comments && article.comments.length) || 0;

      return `
        <div class="archive-item bg-cream-light border border-cream-accent/50 rounded-2xl p-5 hover:border-[#3B6290]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
             data-article-id="${article.id}">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center space-x-2 text-[10px] font-mono">
              <span class="px-2.5 py-0.5 bg-[#3B6290]/10 text-[#1A365D] font-bold rounded-full">${escapeHtml(article.category)}</span>
              <span class="text-slate font-medium">${escapeHtml(article.date || article.displayDate)} &bull; ${escapeHtml(article.readTime || '4 Min')}</span>
            </div>
            <h4 class="text-base font-serif text-slate-dark font-semibold">${escapeHtml(article.title)}</h4>
            <p class="text-xs text-slate line-clamp-2 leading-relaxed">${escapeHtml(article.summary)}</p>
          </div>
          <div class="flex items-center justify-between md:justify-end space-x-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-cream-accent/30 text-xs">
            <div class="flex items-center space-x-3 text-slate font-mono text-[11px]">
              <span class="flex items-center space-x-1 ${isLiked ? 'text-rose-600 font-semibold' : ''}">
                ${isLiked ? heartFilledSvg : heartOutlineSvg}
                <span>${article.likes || 0}</span>
              </span>
              <span class="flex items-center space-x-1">
                <svg class="w-3.5 h-3.5 fill-none stroke-currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span>${commentsCount}</span>
              </span>
            </div>
            <span class="px-4 py-1.5 rounded-full bg-cream border border-cream-accent text-[#3B6290] font-bold text-xs hover:bg-[#3B6290] hover:text-white transition-all">
              Read
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Bind click events on archive items
    archiveListContainer.querySelectorAll('.archive-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-article-id');
        if (id) {
          closeArchiveModal();
          openArticle(id);
        }
      });
    });
  }

  /**
   * Bind events to cards rendered in the grid
   */
  function bindArticleEvents() {
    // Card clicks
    document.querySelectorAll('#insights-grid .insight-article-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-article-id');
        if (id) openArticle(id);
      });
    });

    // Like buttons on cards
    document.querySelectorAll('.card-like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-article-id');
        if (id) handleLike(id);
      });
    });

    // Comment buttons on cards
    document.querySelectorAll('.card-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-article-id');
        if (id) openArticle(id, true);
      });
    });
  }

  function bindStaticCards() {
    document.querySelectorAll('.insight-article-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-article-id');
        if (id) openArticle(id);
      });
    });
  }

  /**
   * Open Article Reader Modal
   */
  async function openArticle(id, scrollToComments = false) {
    if (!articleModal) return;

    // Show loading state or find article
    let article = [...recentArticles, ...archivedArticles].find(a => a.id === id);

    // Fetch full article from API if body is not loaded or for fresh likes/comments
    try {
      const res = await fetch(`/api/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.article) {
          article = data.article;
        }
      }
    } catch (e) {
      console.warn('API fetch error for article:', e);
    }

    if (!article) return;
    currentActiveArticle = article;

    // Populate Modal Details
    if (modalCategory) modalCategory.textContent = article.category;
    if (modalDate) modalDate.textContent = article.date || article.displayDate;
    if (modalReadTime) modalReadTime.textContent = `• ${article.readTime || '4 Min Read'}`;
    if (modalTitle) modalTitle.textContent = article.title;
    if (modalBody) modalBody.innerHTML = article.body;

    // Likes state in modal
    updateModalLikeState();

    // Comments in modal
    renderModalComments(article.comments || []);

    // Open Modal Animation
    articleModal.classList.remove('hidden');
    articleModal.classList.add('flex');
    setTimeout(() => {
      articleModal.classList.remove('opacity-0');
      articleModal.classList.add('opacity-100');
      const inner = articleModal.querySelector('.translate-y-4');
      if (inner) {
        inner.classList.remove('translate-y-4');
        inner.classList.add('translate-y-0');
      }

      if (scrollToComments && modalScrollPane) {
        const commentsSec = document.getElementById('comments-section');
        if (commentsSec) {
          commentsSec.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (modalScrollPane) {
        modalScrollPane.scrollTop = 0;
      }
    }, 50);
  }

  /**
   * Close Article Reader Modal
   */
  function closeArticle() {
    if (!articleModal) return;

    articleModal.classList.remove('opacity-100');
    articleModal.classList.add('opacity-0');
    const inner = articleModal.querySelector('.translate-y-0');
    if (inner) {
      inner.classList.remove('translate-y-0');
      inner.classList.add('translate-y-4');
    }

    setTimeout(() => {
      articleModal.classList.remove('flex');
      articleModal.classList.add('hidden');
      currentActiveArticle = null;
    }, 300);
  }

  /**
   * Update modal like button state
   */
  function updateModalLikeState() {
    if (!currentActiveArticle || !modalLikeBtn) return;
    const isLiked = likedArticlesSet.has(currentActiveArticle.id);
    if (modalLikeCount) modalLikeCount.textContent = currentActiveArticle.likes || 0;

    if (isLiked) {
      modalLikeBtn.className = 'inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-rose-300 bg-rose-500 text-white transition-all text-xs font-semibold shadow-sm active:scale-95';
      if (modalLikeIcon) modalLikeIcon.className = 'w-4 h-4 fill-white stroke-white';
    } else {
      modalLikeBtn.className = 'inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100/90 transition-all text-xs font-semibold shadow-sm active:scale-95';
      if (modalLikeIcon) modalLikeIcon.className = 'w-4 h-4 fill-none stroke-current';
    }
  }

  /**
   * Render comments list inside modal
   */
  function renderModalComments(comments = []) {
    const count = comments.length;
    if (modalCommentCount) modalCommentCount.textContent = count;
    if (commentsBadgeTotal) commentsBadgeTotal.textContent = `${count} Comment${count === 1 ? '' : 's'}`;

    if (!modalCommentsList) return;

    if (count === 0) {
      modalCommentsList.innerHTML = `
        <div class="p-6 bg-cream/60 rounded-2xl border border-cream-accent/40 text-center text-slate text-xs italic">
          No perspectives shared yet. Be the first to start the discussion below.
        </div>
      `;
      return;
    }

    modalCommentsList.innerHTML = comments.map(c => `
      <div class="bg-cream-light/80 border border-cream-accent/40 rounded-2xl p-4 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-slate-dark">${escapeHtml(c.author)}</span>
            ${c.affiliation ? `<span class="px-2 py-0.5 bg-[#3B6290]/10 text-[#1A365D] rounded-full text-[10px] font-mono">${escapeHtml(c.affiliation)}</span>` : ''}
          </div>
          <span class="text-[10px] text-slate font-mono">${escapeHtml(c.date)}</span>
        </div>
        <p class="text-xs text-slate leading-relaxed">${escapeHtml(c.text)}</p>
      </div>
    `).join('');
  }

  /**
   * Like an article
   */
  async function handleLike(articleId) {
    // If already liked locally, do not spam
    if (likedArticlesSet.has(articleId)) {
      // Allow unlike or keep liked
      likedArticlesSet.delete(articleId);
      localStorage.setItem('flourish_liked_articles', JSON.stringify([...likedArticlesSet]));
      decrementLocalLike(articleId);
      return;
    }

    // Mark as liked
    likedArticlesSet.add(articleId);
    localStorage.setItem('flourish_liked_articles', JSON.stringify([...likedArticlesSet]));
    incrementLocalLike(articleId);

    try {
      const res = await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.likes === 'number') {
          syncArticleLikes(articleId, data.likes);
        }
      }
    } catch (e) {
      console.warn('Like request failed:', e);
    }
  }

  function incrementLocalLike(articleId) {
    const art = [...recentArticles, ...archivedArticles].find(a => a.id === articleId);
    if (art) {
      art.likes = (art.likes || 0) + 1;
      syncArticleLikes(articleId, art.likes);
    }
  }

  function decrementLocalLike(articleId) {
    const art = [...recentArticles, ...archivedArticles].find(a => a.id === articleId);
    if (art && art.likes > 0) {
      art.likes -= 1;
      syncArticleLikes(articleId, art.likes);
    }
  }

  function syncArticleLikes(articleId, count) {
    // Update local objects
    [...recentArticles, ...archivedArticles].forEach(a => {
      if (a.id === articleId) a.likes = count;
    });

    // Update active modal if matching
    if (currentActiveArticle && currentActiveArticle.id === articleId) {
      currentActiveArticle.likes = count;
      updateModalLikeState();
    }

    // Update DOM cards in recent grid
    const card = document.querySelector(`.insight-article-card[data-article-id="${articleId}"]`);
    if (card) {
      const counter = card.querySelector('.like-counter');
      if (counter) counter.textContent = count;
      const likeBtn = card.querySelector('.card-like-btn');
      if (likeBtn) {
        const isLiked = likedArticlesSet.has(articleId);
        likeBtn.className = `card-like-btn flex items-center space-x-1.5 transition-colors ${isLiked ? 'text-rose-600 font-semibold' : 'text-slate hover:text-rose-600'}`;
        likeBtn.innerHTML = `${isLiked ? heartFilledSvg : heartOutlineSvg} <span class="like-counter">${count}</span>`;
      }
    }
  }

  /**
   * Handle Comment Submission
   */
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentActiveArticle) return;

      const author = commentAuthorInput ? commentAuthorInput.value.trim() : '';
      const affiliation = commentAffiliationInput ? commentAffiliationInput.value.trim() : '';
      const text = commentTextInput ? commentTextInput.value.trim() : '';

      if (!text) return;

      commentSubmitBtn.disabled = true;
      commentSubmitBtn.textContent = 'Posting...';
      commentMessage.className = 'text-xs font-semibold hidden';

      try {
        const response = await fetch(`/api/articles/${currentActiveArticle.id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, affiliation, text })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          // Success
          commentMessage.className = 'text-xs font-semibold text-emerald-700 block';
          commentMessage.textContent = 'Perspective posted successfully. Thank you for contributing!';
          commentForm.reset();

          // Update active article comments
          if (data.comments) {
            currentActiveArticle.comments = data.comments;
          } else if (data.comment) {
            currentActiveArticle.comments = currentActiveArticle.comments || [];
            currentActiveArticle.comments.unshift(data.comment);
          }

          renderModalComments(currentActiveArticle.comments);

          // Update comment count on matching card
          const card = document.querySelector(`.insight-article-card[data-article-id="${currentActiveArticle.id}"]`);
          if (card) {
            const commentCountSpan = card.querySelector('.card-comment-btn span');
            if (commentCountSpan) {
              commentCountSpan.textContent = currentActiveArticle.comments.length;
            }
          }
        } else {
          commentMessage.className = 'text-xs font-semibold text-rose-600 block';
          commentMessage.textContent = data.message || 'Unable to post comment. Please try again.';
        }
      } catch (err) {
        console.error('Comment error:', err);
        commentMessage.className = 'text-xs font-semibold text-rose-600 block';
        commentMessage.textContent = 'Network error submitting comment. Please try again.';
      } finally {
        commentSubmitBtn.disabled = false;
        commentSubmitBtn.textContent = 'Post Perspective';
        setTimeout(() => {
          if (commentMessage) commentMessage.classList.add('hidden');
        }, 5000);
      }
    });
  }

  /**
   * Modal Like Button Click
   */
  if (modalLikeBtn) {
    modalLikeBtn.addEventListener('click', () => {
      if (currentActiveArticle) {
        handleLike(currentActiveArticle.id);
      }
    });
  }

  /**
   * Modal Jump to Comments Click
   */
  if (modalJumpComments) {
    modalJumpComments.addEventListener('click', () => {
      const commentsSec = document.getElementById('comments-section');
      if (commentsSec) {
        commentsSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /**
   * Modal Share Button Click
   */
  if (modalShareBtn) {
    modalShareBtn.addEventListener('click', async () => {
      if (!currentActiveArticle) return;
      const shareData = {
        title: currentActiveArticle.title,
        text: currentActiveArticle.summary,
        url: window.location.href.split('#')[0] + '#insights'
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (e) {
          // User cancelled or unsupported
        }
      } else {
        navigator.clipboard.writeText(shareData.url);
        const originalText = modalShareBtn.innerHTML;
        modalShareBtn.innerHTML = `<span class="text-emerald-700 font-bold">&check; Link Copied</span>`;
        setTimeout(() => {
          modalShareBtn.innerHTML = originalText;
        }, 2000);
      }
    });
  }

  /**
   * Close Modal Listeners
   */
  if (closeArticleBtn) closeArticleBtn.addEventListener('click', closeArticle);
  if (modalFooterCloseBtn) modalFooterCloseBtn.addEventListener('click', closeArticle);
  if (articleModal) {
    articleModal.addEventListener('click', (e) => {
      if (e.target === articleModal) closeArticle();
    });
  }

  /**
   * Category Filter Buttons (Recent Grid)
   */
  insightCategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      insightCategoryBtns.forEach(b => {
        b.className = 'insight-tab-btn px-4 py-2 rounded-full transition-all text-slate hover:text-slate-dark hover:bg-cream-light';
      });
      btn.className = 'insight-tab-btn px-4 py-2 rounded-full transition-all bg-[#1A365D] text-white font-semibold shadow-sm';
      currentRecentCategory = btn.getAttribute('data-category') || 'all';
      renderRecentArticles();
    });
  });

  /**
   * Archives Modal Logic
   */
  function openArchiveModal() {
    if (!archiveModal) return;
    renderArchivedArticles();
    archiveModal.classList.remove('hidden');
    archiveModal.classList.add('flex');
    setTimeout(() => {
      archiveModal.classList.remove('opacity-0');
      archiveModal.classList.add('opacity-100');
      const inner = archiveModal.querySelector('.translate-y-4');
      if (inner) {
        inner.classList.remove('translate-y-4');
        inner.classList.add('translate-y-0');
      }
    }, 50);
  }

  function closeArchiveModal() {
    if (!archiveModal) return;
    archiveModal.classList.remove('opacity-100');
    archiveModal.classList.add('opacity-0');
    const inner = archiveModal.querySelector('.translate-y-0');
    if (inner) {
      inner.classList.remove('translate-y-0');
      inner.classList.add('translate-y-4');
    }
    setTimeout(() => {
      archiveModal.classList.remove('flex');
      archiveModal.classList.add('hidden');
    }, 300);
  }

  if (openArchiveBtn) openArchiveBtn.addEventListener('click', openArchiveModal);
  if (closeArchiveBtn) closeArchiveBtn.addEventListener('click', closeArchiveModal);
  if (archiveModal) {
    archiveModal.addEventListener('click', (e) => {
      if (e.target === archiveModal) closeArchiveModal();
    });
  }

  /**
   * Archive Category Filter Buttons
   */
  archiveFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      archiveFilterBtns.forEach(b => {
        b.className = 'archive-filter-btn px-3.5 py-1.5 rounded-full text-xs text-slate hover:text-slate-dark';
      });
      btn.className = 'archive-filter-btn active px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1A365D] text-white';
      currentArchiveCategory = btn.getAttribute('data-archive-filter') || 'all';
      renderArchivedArticles();
    });
  });

  /**
   * Escape HTML utility to prevent XSS in rendered comments
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Load articles on page initialization
  loadArticles();

  // ==========================================
  // NEWSLETTER SUBSCRIPTION AJAX HANDLER
  // ==========================================
  const newsletterForms = document.querySelectorAll('#newsletter-form, .newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = form.querySelector('input[type="email"]') || document.getElementById('newsletter-email');
      const submitBtn = form.querySelector('button[type="submit"]') || document.getElementById('newsletter-submit');
      const parentContainer = form.closest('.max-w-xl') || form.parentElement;
      const messageEl = parentContainer ? (parentContainer.querySelector('#newsletter-message, .newsletter-message') || document.getElementById('newsletter-message')) : document.getElementById('newsletter-message');

      const emailValue = emailInput ? emailInput.value.trim() : '';
      if (!emailValue) return;

      // Reset states
      if (messageEl) {
        messageEl.className = 'text-xs font-semibold mt-3 text-brand-inkMuted';
        messageEl.textContent = 'Registering your subscription...';
        messageEl.classList.remove('hidden');
      }
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: emailValue }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (messageEl) {
            messageEl.className = 'text-xs font-semibold mt-3 text-emerald-600';
            messageEl.textContent = data.message || 'Subscribed successfully! Thank you for joining Flourish Insights.';
          }
          form.reset();
        } else {
          if (messageEl) {
            messageEl.className = 'text-xs font-semibold mt-3 text-rose-600';
            messageEl.textContent = data.message || 'Subscription failed. Please try again.';
          }
        }
      } catch (error) {
        console.error('Newsletter error:', error);
        if (messageEl) {
          messageEl.className = 'text-xs font-semibold mt-3 text-rose-600';
          messageEl.textContent = 'Network error. Please try again later.';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (messageEl) {
          setTimeout(() => {
            messageEl.classList.add('hidden');
          }, 6000);
        }
      }
    });
  });

  /**
   * 20-Year Cross-Cycle Timeline Regime Tab Switcher
   */
  function initRegimeTimeline() {
    const regimeButtons = document.querySelectorAll('.regime-tab-btn');
    const regimePanels = document.querySelectorAll('.regime-panel');

    if (!regimeButtons.length || !regimePanels.length) return;

    regimeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetRegimeId = btn.getAttribute('data-regime');
        if (!targetRegimeId) return;

        // Reset all buttons to inactive styling
        regimeButtons.forEach(b => {
          b.classList.remove('active', 'bg-[#3B6290]', 'border-[#A5B8D1]', 'text-white', 'shadow-lg', 'shadow-[#3B6290]/20');
          b.classList.add('bg-white/5', 'border-white/10', 'text-slate-300');
          const subText = b.querySelector('span');
          if (subText) {
            subText.classList.remove('text-emerald-300');
            subText.classList.add('text-sage-accent');
          }
        });

        // Activate clicked button
        btn.classList.add('active', 'bg-[#3B6290]', 'border-[#A5B8D1]', 'text-white', 'shadow-lg', 'shadow-[#3B6290]/20');
        btn.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');
        const activeSubText = btn.querySelector('span');
        if (activeSubText) {
          activeSubText.classList.remove('text-sage-accent');
          activeSubText.classList.add('text-emerald-300');
        }

        // Hide all panels and show targeted panel
        regimePanels.forEach(panel => {
          panel.classList.add('hidden');
          panel.classList.remove('animate-fade-in');
        });

        const targetPanel = document.getElementById(targetRegimeId);
        if (targetPanel) {
          targetPanel.classList.remove('hidden');
          // Re-trigger CSS fade-in
          void targetPanel.offsetWidth;
          targetPanel.classList.add('animate-fade-in');
        }
      });
    });
  }

  initRegimeTimeline();

  // ------------------------------------------------------------------------
  // EXECUTIVE DILIGENCE TEAR-SHEETS PREVIEW MODAL
  // ------------------------------------------------------------------------
  const SHEET_DATA = {
    'multifamily-matrix': {
      docId: 'FM-RE-01',
      title: 'The 15-Minute Multifamily Acquisition Screening Matrix',
      url: '/sheets/multifamily-matrix.html'
    },
    'seed-safe-audit': {
      docId: 'FM-VC-02',
      title: 'The Seed Angel SAFE & Cap Table Dilution Audit',
      url: '/sheets/seed-safe-audit.html'
    },
    'delta-hedging-matrix': {
      docId: 'FM-MM-03',
      title: 'The Quantitative Delta-Hedging & Volatility Matrix',
      url: '/sheets/delta-hedging-matrix.html'
    }
  };

  window.openSheetPreview = function(sheetId) {
    const data = SHEET_DATA[sheetId];
    if (!data) {
      console.warn('Unknown sheetId:', sheetId);
      return;
    }

    const modal = document.getElementById('sheet-preview-modal');
    const docIdEl = document.getElementById('modal-sheet-docid');
    const titleEl = document.getElementById('modal-sheet-title');
    const printBtnEl = document.getElementById('modal-sheet-print-btn');
    const iframeEl = document.getElementById('modal-sheet-iframe');

    if (!modal) {
      console.warn('sheet-preview-modal element not found in DOM');
      return;
    }

    if (docIdEl) docIdEl.textContent = data.docId;
    if (titleEl) titleEl.textContent = data.title;
    if (printBtnEl) printBtnEl.href = data.url;
    if (iframeEl) iframeEl.src = data.url;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      const innerCard = modal.querySelector('div');
      if (innerCard) innerCard.classList.remove('translate-y-4');
    }, 20);
    document.body.style.overflow = 'hidden';
  };

  window.closeSheetPreview = function() {
    const modal = document.getElementById('sheet-preview-modal');
    const iframeEl = document.getElementById('modal-sheet-iframe');
    if (!modal) return;

    modal.classList.add('opacity-0');
    const innerCard = modal.querySelector('div');
    if (innerCard) innerCard.classList.add('translate-y-4');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (iframeEl) iframeEl.src = '';
      document.body.style.overflow = '';
    }, 250);
  };

  // Event delegation for preview buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.sheet-preview-btn');
    if (btn) {
      e.preventDefault();
      const sheetId = btn.getAttribute('data-sheet-id');
      if (sheetId) {
        window.openSheetPreview(sheetId);
      }
    }

    // Close button
    if (e.target.closest('#close-sheet-modal-btn')) {
      e.preventDefault();
      window.closeSheetPreview();
    }

    // Backdrop click
    const modal = document.getElementById('sheet-preview-modal');
    if (modal && e.target === modal) {
      window.closeSheetPreview();
    }
  });

  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('sheet-preview-modal');
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      window.closeSheetPreview();
    }
  });
});
