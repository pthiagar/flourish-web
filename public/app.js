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
});
