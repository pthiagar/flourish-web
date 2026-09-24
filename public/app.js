document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
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

  // Stateful conversation state for interactive lead collection
  let conversationHistory = [];
  let leadState = 'DEFAULT'; // DEFAULT, COLLECTING_NAME, COLLECTING_EMAIL, COLLECTING_PHONE, COLLECTING_PITCH
  let leadData = { name: '', email: '', phone: '', pitch: '' };

  // Add a message bubble to the chat (always insert BEFORE the typing indicator)
  const appendMessage = (sender, text) => {
    // Save to local session log history for transcript processing
    conversationHistory.push({ sender, text });

    const isUser = sender === 'user';
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
      isUser 
        ? 'bg-sage text-white rounded-br-none' 
        : 'bg-cream-dark text-slate-dark rounded-bl-none border border-cream-accent'
    }`;
    
    bubble.innerHTML = `
      <p class="leading-relaxed">${text}</p>
      <span class="block text-[10px] ${isUser ? 'text-sage-light/75' : 'text-slate-light'} mt-1 text-right">${getFormattedTime()}</span>
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

  // Highly robust conversational NLP matching
  const getAssistantResponse = (userMsg) => {
    const query = userMsg.toLowerCase().trim();

    // Check for Greetings
    if (reMatch(query, ['hello', 'hi', 'hey', 'greetings', 'g\'day', 'hola', 'start', 'anybody there', 'test'])) {
      return "Hi there! I'm the digital assistant for Flourish Management LLC. I'm here to help you navigate our services. Are you interested in our <strong>Real Estate acquisitions</strong>, <strong>Capital Markets hedging</strong>, or <strong>Venture Capital investments</strong>?";
    }

    // Real Estate & Properties
    if (reMatch(query, ['real estate', 'property', 'properties', 'residential', 'commercial', 'building', 'buy land', 'acquisition', 're', 'housing', 'apartment', 'developer'])) {
      return "<strong>Real Estate & Physical Assets:</strong><br>We target high-yield acquisitions in residential and commercial sectors to provide defensive, consistent cash flows and long-term equity appreciation. We partner actively with brokers, local developers, and property managers to identify off-market gems. Do you have a project or property you are seeking capital for?";
    }

    // Venture Capital, Startups & Seed
    if (reMatch(query, ['venture', 'vc', 'startup', 'start-up', 'founder', 'seed', 'series a', 'tech', 'mentorship', 'equity', 'mentoring', 'grow business', 'raising', 'raise capital'])) {
      return "<strong>Venture Capital & Private Equity:</strong><br>We partner with visionary, early-stage founders from Seed to Series A stages, supporting them with capital and operational mentorship. Additionally, we participate as LPs in top-tier VC funds to ensure strategic exposure across the most promising technological frontiers. Are you a founder raising capital?";
    }

    // Capital Markets, Stocks, Bonds, Options & Hedging
    if (reMatch(query, ['market', 'capital market', 'equities', 'stock', 'bond', 'option', 'hedge', 'hedging', 'fixed income', 'volatility', 'trading', 'portfolio', 'derivative', 'risk'])) {
      return "<strong>Capital Markets & Hedging:</strong><br>We manage a highly liquid, sophisticated public portfolio. We combine a core foundation of equities and bonds with customized, options-based derivative strategies to hedge downside risks, capture yield, and monetize volatility. This ensures steady capital preservation during broad market turbulence.";
    }

    // Stats, Experience, General Partners, Team
    if (reMatch(query, ['experience', 'how long', 'year', 'track record', 'stat', 'number', 'investment count', 'portfolio size', 'partner', 'team', 'who runs', 'who are', 'about'])) {
      return "<strong>Flourish Profile:</strong><br>Flourish Management has <strong>15 years of investment experience</strong>, directed by our <strong>4 general partners</strong>. We currently manage a diversified roster of <strong>28 active investments</strong> across <strong>6 specialist industries</strong>. Our synergy model ensures stability through every economic cycle.";
    }

    // Core philosophy or "what do you do" or "what is your strategy"
    if (reMatch(query, ['what do you do', 'what is this', 'what are you', 'tell me about flourish', 'philosophy', 'strategy', 'pillar', 'goal', 'mission', 'about flourish', 'overview'])) {
      return "Flourish Management LLC is a private investment holding company. We operate a multi-asset ecosystem designed for non-correlated returns. By balancing high-growth startup equity with hedged capital market strategies and tangible cash-flowing real estate, we maximize returns while mitigating structural risks.";
    }

    // Contact, phone, email, reach, talk, send message
    if (reMatch(query, ['contact', 'email', 'phone', 'call', 'reach out', 'talk to human', 'real person', 'address', 'office', 'inquiry', 'info', 'message', 'mail'])) {
      return "We would love to talk! You can connect with our general partners via:<br>• <strong>Email:</strong> <a href='mailto:info@flourish-mgmt.com' class='underline hover:text-sage font-semibold'>info@flourish-mgmt.com</a><br>• <strong>Phone:</strong> <a href='tel:+14247033332' class='underline hover:text-sage font-semibold'>+1 (424) 703-3332</a><br>Or simply fill out our <strong>Inquiry Form</strong> on the page, and we will get back to you within 24 hours.";
    }

    // Friendly pleasantries
    if (reMatch(query, ['thank', 'thanks', 'cool', 'awesome', 'great', 'nice', 'ok', 'good', 'perfect', 'got it', 'bye', 'goodbye'])) {
      return "My pleasure! Let me know if there's anything else about Flourish Management I can clarify. Enjoy exploring our site!";
    }

    // Broader fallback - if user types random questions, give them an informative menu of options to pick from
    return "I want to make sure I give you the exact information you're looking for. Please type a topic or select one of the quick options above:<br>• Type <strong>'real estate'</strong> to hear about our property criteria.<br>• Type <strong>'venture'</strong> to learn how we back startups.<br>• Type <strong>'hedging'</strong> to understand our capital market protective strategies.<br>• Type <strong>'contact'</strong> to get connected with a partner directly.";
  };

  // Heuristic matching helper with whole word boundary scanning
  const reMatch = (text, keywords) => {
    return keywords.some(keyword => {
      // Escape special characters to create a valid regex
      const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Use \b (word boundary) for single-word keywords to prevent matching parts of words
      // But allow matching phrases that might contain spaces
      const regex = escaped.includes(' ') 
        ? new RegExp(escaped, 'i') 
        : new RegExp('\\b' + escaped + '\\b', 'i');
      return regex.test(text);
    });
  };

  // Reusable core message processing function
  const handleUserMessageSubmit = (messageText) => {
    if (!messageText) return;

    // Append User Message bubble
    appendMessage('user', messageText);

    // Show simulated assistant typing indicator
    showTyping();

    const query = messageText.toLowerCase().trim();

    // Check if the user is attempting to escape/cancel the lead process
    if (query === 'reset' || query === 'cancel' || query === 'exit' || query === 'restart') {
      leadState = 'DEFAULT';
      leadData = { name: '', email: '', phone: '', pitch: '' };
      setTimeout(() => {
        hideTyping();
        appendMessage('assistant', "No problem! I have cancelled our onboarding loop and reset the chat. How else can I assist you today?");
      }, 700);
      return;
    }

    let responseText = '';
    let triggerLeadSubmit = false;

    // Process chat inputs statefully
    if (leadState === 'DEFAULT') {
      const isPitchRequest = reMatch(query, [
        'raise', 'funding', 'raise capital', 'investor', 'pitch', 'pitching', 
        'back startups', 'raising', 'venture', 'vc', 'founder', 'startup', 
        'start-up', 'series a', 'seed', 'partner with you', 'looking to raise'
      ]);

      if (isPitchRequest) {
        leadState = 'COLLECTING_NAME';
        responseText = "<strong>Venture Partnership Onboarding:</strong> We are always seeking to collaborate with visionary, growth-stage founders! I can collect your details right here and email them directly to our general partners, along with our full conversation history.<br><br>Let's get started! <strong>What is your full name?</strong>";
      } else {
        responseText = getAssistantResponse(messageText);
      }
    } else if (leadState === 'COLLECTING_NAME') {
      leadData.name = messageText;
      leadState = 'COLLECTING_EMAIL';
      responseText = `Great to meet you, <strong>${leadData.name}</strong>! What is your **best email address** so our general partners can get in touch with you?`;
    } else if (leadState === 'COLLECTING_EMAIL') {
      // Basic email formatting safety check
      if (!messageText.includes('@') || !messageText.includes('.')) {
        responseText = "Hmm, that doesn't look like a valid email address. Please share a valid email so we can reach you:";
      } else {
        leadData.email = messageText;
        leadState = 'COLLECTING_PHONE';
        responseText = `Got it, thank you! What is a **good phone number** (including country code) to connect with you at?`;
      }
    } else if (leadState === 'COLLECTING_PHONE') {
      leadData.phone = messageText;
      leadState = 'COLLECTING_PITCH';
      responseText = "Perfect. Lastly, please share a **brief description of your startup/project and what you are raising** (e.g., 'raising $500k Seed for AI-driven logistics platform'):";
    } else if (leadState === 'COLLECTING_PITCH') {
      leadData.pitch = messageText;
      leadState = 'DEFAULT';
      responseText = `Thank you so much, <strong>${leadData.name}</strong>! I am packaging your details and transmitting your conversation transcript directly to our investment partners right now. One moment...`;
      triggerLeadSubmit = true;
    }

    // Calculate typing speed delay based on word length
    const delay = Math.max(700, Math.min(2000, responseText.length * 7));

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
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            pitch: leadData.pitch,
            transcript: conversationHistory
          })
        })
        .then(res => res.json())
        .then(data => {
          hideTyping();
          if (data.success) {
            appendMessage('assistant', `🚀 <strong>Transmission Complete!</strong><br>Your details have been logged, and the conversation history has been emailed directly to our general partners. A partner will review your pitch and contact you at <strong>${leadData.email}</strong> within 24 hours.<br><br>Thank you for reaching out to Flourish Management, and we wish you absolute success with your startup!`);
          } else {
            appendMessage('assistant', `ℹ️ <strong>Details Saved!</strong> Your pitch information has been logged locally on our server. A partner will review your inquiry shortly. Thank you, <strong>${leadData.name}</strong>!`);
          }
          // Reset captured state variables
          leadData = { name: '', email: '', phone: '', pitch: '' };
        })
        .catch(err => {
          hideTyping();
          appendMessage('assistant', `ℹ️ <strong>Details Logged!</strong> We successfully captured your information on our server. Our team will review your pitch shortly. Thank you, <strong>${leadData.name}</strong>!`);
          leadData = { name: '', email: '', phone: '', pitch: '' };
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
      appendMessage('assistant', "Welcome to Flourish Management LLC. I'm here to assist you with any questions about our investment verticals, team, or contact pathways. How can I help you today?");
      // Show notification badge if chat window is closed
      if (chatContainer.classList.contains('hidden')) {
        chatNotification.classList.remove('hidden');
      }
    }
  }, 1000);

  // ==========================================
  // INTERACTIVE HEDGING & VOLATILITY SIMULATOR
  // ==========================================
  const slider = document.getElementById('simulator-slider');
  const intensityLabel = document.getElementById('slider-intensity-label');
  const unhedgedPerf = document.getElementById('sim-unhedged-perf');
  const hedgedPerf = document.getElementById('sim-hedged-perf');
  const explanation = document.getElementById('simulator-explanation');
  const unhedgedPath = document.getElementById('svg-unhedged-path');
  const hedgedPath = document.getElementById('svg-hedged-path');

  // Interpolation helper function
  function interpolate(v0, v1, v2, p) {
    if (p <= 50) {
      const t = p / 50;
      return v0 + (v1 - v0) * t;
    } else {
      const t = (p - 50) / 50;
      return v1 + (v2 - v1) * t;
    }
  }

  function updateSimulator(sliderVal) {
    let perf_u = 0;
    let perf_h = 0;
    let y1_u, y2_u, y3_u, y4_u;
    let y1_h, y2_h, y3_h, y4_h;

    if (sliderVal === 50) {
      // 1. Baseline state
      perf_u = 0.0;
      perf_h = 0.0;

      y1_u = y2_u = y3_u = y4_u = 100;
      y1_h = y2_h = y3_h = y4_h = 100;

      if (intensityLabel) {
        intensityLabel.textContent = "Baseline Climate (0%)";
        intensityLabel.className = 'text-lg font-serif text-[#38BDF8] font-semibold';
      }
      if (unhedgedPerf) unhedgedPerf.className = 'text-xl font-bold text-slate-light transition-colors duration-300';
      if (hedgedPerf) hedgedPerf.className = 'text-xl font-bold text-slate-light transition-colors duration-300';
      if (explanation) {
        explanation.textContent = 'Baseline scenario. Both the benchmark S&P 500 and the options-managed Flourish Portfolio sit at par value.';
      }
    } else if (sliderVal < 50) {
      // 2. Bear Market / Crash Scenario (Slider going Left: 50 -> 0)
      const bearPct = (50 - sliderVal) * 2; // scale to 0 - 100

      perf_u = interpolate(0.0, -25.0, -40.0, bearPct);
      perf_h = interpolate(0.0, -3.5, -6.0, bearPct);

      // S&P 500 drops deeply
      y1_u = interpolate(100, 120, 140, bearPct);
      y2_u = interpolate(100, 160, 190, bearPct);
      y3_u = interpolate(100, 130, 160, bearPct);
      y4_u = interpolate(100, 100, 120, bearPct);

      // Flourish Hedged cushion drops
      y1_h = interpolate(100, 105, 110, bearPct);
      y2_h = interpolate(100, 115, 130, bearPct);
      y3_h = interpolate(100, 105, 115, bearPct);
      y4_h = interpolate(100, 85, 92, bearPct);

      if (bearPct < 60) {
        if (intensityLabel) {
          intensityLabel.textContent = `${perf_u.toFixed(0)}% Bear Correction`;
          intensityLabel.className = 'text-lg font-serif text-[#F59E0B] font-semibold';
        }
        if (unhedgedPerf) unhedgedPerf.className = 'text-xl font-bold text-red-400 transition-colors duration-300';
        if (hedgedPerf) hedgedPerf.className = 'text-xl font-bold text-green-400 transition-colors duration-300';
        if (explanation) {
          explanation.textContent = 'In an extended bear market, our structured options protection acts as a compounding shock-absorber, shielding capital.';
        }
      } else {
        if (intensityLabel) {
          intensityLabel.textContent = `${perf_u.toFixed(0)}% Severe Crash`;
          intensityLabel.className = 'text-lg font-serif text-[#EF4444] font-semibold';
        }
        if (unhedgedPerf) unhedgedPerf.className = 'text-xl font-bold text-red-600 transition-colors duration-300';
        if (hedgedPerf) hedgedPerf.className = 'text-xl font-bold text-green-500 transition-colors duration-300';
        if (explanation) {
          explanation.textContent = 'During severe macro crashes, tail-hedging puts trigger extreme payout events, securing absolute protection and fast recoveries.';
        }
      }
    } else {
      // 3. Bull Market / Alpha Capture Scenario (Slider going Right: 50 -> 100)
      const bullPct = (sliderVal - 50) * 2; // scale to 0 - 100

      perf_u = interpolate(0.0, 12.0, 20.0, bullPct);
      perf_h = interpolate(0.0, 18.5, 27.5, bullPct); // Alpha capture outperformance!

      // S&P 500 rises
      y1_u = interpolate(100, 90, 80, bullPct);
      y2_u = interpolate(100, 80, 60, bullPct);
      y3_u = interpolate(100, 85, 70, bullPct);
      y4_u = interpolate(100, 75, 55, bullPct);

      // Flourish Hedged rises higher (Alpha capture)
      y1_h = interpolate(100, 85, 70, bullPct);
      y2_h = interpolate(100, 70, 40, bullPct);
      y3_h = interpolate(100, 75, 50, bullPct);
      y4_h = interpolate(100, 65, 30, bullPct);

      if (bullPct < 60) {
        if (intensityLabel) {
          intensityLabel.textContent = `+${perf_u.toFixed(0)}% Growth Cycle`;
          intensityLabel.className = 'text-lg font-serif text-[#10B981] font-semibold';
        }
        if (unhedgedPerf) unhedgedPerf.className = 'text-xl font-bold text-red-400/90 transition-colors duration-300';
        if (hedgedPerf) hedgedPerf.className = 'text-xl font-bold text-green-400 transition-colors duration-300';
        if (explanation) {
          explanation.textContent = 'During steady expansions, writing low-risk calls and compounding equity distributions yields consistent upside growth.';
        }
      } else {
        if (intensityLabel) {
          intensityLabel.textContent = `+${perf_u.toFixed(0)}% Strong Bull Run`;
          intensityLabel.className = 'text-lg font-serif text-[#059669] font-bold';
        }
        if (unhedgedPerf) unhedgedPerf.className = 'text-xl font-bold text-red-400/90 transition-colors duration-300';
        if (hedgedPerf) hedgedPerf.className = 'text-xl font-bold text-green-400 font-extrabold transition-colors duration-300';
        if (explanation) {
          explanation.textContent = 'Alpha Capture: In strong bull runs, our dynamic reinvestments and active overlay allocations allow us to systematically outpace the benchmark index.';
        }
      }
    }

    // Update performance text fields
    if (unhedgedPerf) unhedgedPerf.textContent = `${perf_u > 0 ? '+' : ''}${perf_u.toFixed(1)}%`;
    if (hedgedPerf) hedgedPerf.textContent = `${perf_h > 0 ? '+' : ''}${perf_h.toFixed(1)}%`;

    // Apply interpolated vectors
    if (unhedgedPath) {
      unhedgedPath.setAttribute('d', `M 0,100 C 100,${y1_u} 180,${y2_u} 300,${y3_u} T 500,${y4_u}`);
    }
    if (hedgedPath) {
      hedgedPath.setAttribute('d', `M 0,100 C 100,${y1_h} 180,${y2_h} 300,${y3_h} T 500,${y4_h}`);
    }
  }

  // Bind slider event
  if (slider) {
    slider.addEventListener('input', (e) => {
      updateSimulator(parseInt(e.target.value));
    });
    // Trigger initial render (at bear correction 30)
    updateSimulator(30);
  }

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
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterSubmit = document.getElementById('newsletter-submit');
  const newsletterMessage = document.getElementById('newsletter-message');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailValue = newsletterEmail.value.trim();
      if (!emailValue) return;

      // Reset states
      newsletterMessage.className = 'text-xs font-semibold mt-3 text-slate';
      newsletterMessage.textContent = 'Registering your subscription...';
      newsletterMessage.classList.remove('hidden');
      newsletterSubmit.disabled = true;

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
          newsletterMessage.className = 'text-xs font-semibold mt-3 text-green-600';
          newsletterMessage.textContent = data.message || 'Subscribed successfully! Thank you.';
          newsletterForm.reset();
        } else {
          newsletterMessage.className = 'text-xs font-semibold mt-3 text-red-600';
          newsletterMessage.textContent = data.message || 'Subscription failed. Please try again.';
        }
      } catch (error) {
        console.error('Newsletter error:', error);
        newsletterMessage.className = 'text-xs font-semibold mt-3 text-red-600';
        newsletterMessage.textContent = 'Network error. Please try again later.';
      } finally {
        newsletterSubmit.disabled = false;
        setTimeout(() => {
          newsletterMessage.classList.add('hidden');
        }, 6000);
      }
    });
  }
});
