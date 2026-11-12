/* ==========================================================
   N. Kuria & Company Advocates - site scripts

   Features (each has its own function, started at the bottom):
     1. Mobile menu         5. Contact form
     2. Logo strip          6. Scroll animations
     3. Chat assistant      7. Header shadow
     4. Account pop-up
   ========================================================== */

// Pages inside folders need a path back to the site root (e.g. "../../").
// Every <body> carries it in a data-root attribute.
const siteRoot = document.body.dataset.root || "";

// Builds a link to a page, used in chat answers.
function pageLink(page, text) {
  return '<a href="' + siteRoot + page + '">' + text + "</a>";
}


/* ---------- 1. Mobile menu ---------- */

function initMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  function setMenu(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    button.setAttribute("aria-expanded", isOpen);
    button.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  button.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });

  // Close the menu after choosing a link, or when Escape is pressed
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });
}


/* ---------- 2. Logo strip ---------- */

// Copies the logos once so the strip loops without a gap.
function initLogoStrip() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;

  const originals = Array.from(track.children);
  originals.forEach(function (slot) {
    const copy = slot.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);
  });
}


/* ---------- 3. Chat assistant ---------- */

// Approved answers. To add one, copy a line and change the pattern and reply.
// The first pattern that matches the visitor's question wins, so keep the
// more specific topics above the general ones.
const chatAnswers = [
  {
    pattern: /^(hi|hello|hey)\b/,
    reply: "Hello! I can answer questions about our services, our office and booking a consultation."
  },
  {
    pattern: /where|address|located|office|muthaiga|find you/,
    reply: "We are at Muthaiga Square, 3rd Floor, Muthaiga-Highway Junction, Nairobi. P.O. Box 105631-00101."
  },
  {
    pattern: /phone|call|number|tel\b/,
    reply: "You can call us on +254 102 400 400."
  },
  {
    pattern: /email|e-mail|mail/,
    reply: "Email us at info@nkadvocates.com."
  },
  {
    pattern: /hour|open|when are/,
    reply: "Our office hours are Monday to Friday, 8:00 AM to 5:00 PM."
  },
  {
    pattern: /consult|book|appoint|speak|meet/,
    reply: "To arrange a consultation, please " + pageLink("contact.html", "contact our team") + ". Booking does not create an advocate-client relationship."
  },
  {
    pattern: /fee|cost|price|charge|quote/,
    reply: "Fees depend on the matter, so I can't quote one here. Please " + pageLink("contact.html", "contact our team") + " for an estimate."
  },
  {
    pattern: /trust|wealth|\bwill\b|wills|planning/,
    reply: "Our " + pageLink("trusts-wills-private-wealth.html", "Trusts, Wills & Private Wealth") + " practice covers estate planning, trusts, family wealth structures and business succession."
  },
  {
    pattern: /probate|succession|administration|estate|inherit|executor/,
    reply: "Our " + pageLink("estate-succession.html", "Estate & Succession") + " practice covers probate, letters of administration, confirmation of grants and post-confirmation transmission of assets."
  },
  {
    pattern: /merger|acquisition|m&a|incorporat|corporate|shareholder|company/,
    reply: "See " + pageLink("corporate-ma.html", "Corporate & M&A") + ": incorporation, restructuring, transactions, shareholder agreements and due diligence."
  },
  {
    pattern: /bank|loan|financ|lend|security/,
    reply: "See " + pageLink("banking-finance.html", "Banking & Finance") + ": facility agreements, security, refinancing and finance disputes."
  },
  {
    pattern: /property|land|real estate|title|lease|develop/,
    reply: "See " + pageLink("real-estate-projects.html", "Real Estate & Projects") + ": acquisitions, title investigations, leases and development agreements."
  },
  {
    pattern: /dispute|litigat|arbitrat|mediat|court|sue/,
    reply: "See " + pageLink("dispute-resolution.html", "Dispute Resolution") + ": negotiation, mediation, arbitration and litigation."
  },
  {
    pattern: /complian|governance|board|regulat/,
    reply: "See " + pageLink("governance-compliance.html", "Governance & Compliance") + ": governance frameworks, policies and regulatory reviews."
  },
  {
    pattern: /foreign|international|invest|abroad|overseas/,
    reply: "See " + pageLink("international-business.html", "International Business") + ": market entry, company establishment and cross-border support."
  },
  {
    pattern: /account|register|sign ?up|log ?in/,
    reply: "You can create an account or sign in using the round account button at the top right of the page. Creating an account does not guarantee direct access to legal services."
  },
  {
    pattern: /service|practice|expertise|what do you|areas/,
    reply: "Our eight practice areas are listed on the " + pageLink("expertise.html", "Expertise") + " page."
  }
];

const chatWelcome = "General information only, not legal advice. No advocate-client relationship is created. Please don't share confidential case details here.";
const chatFallback = "I can't answer that reliably. For anything specific to your situation, please " + pageLink("contact.html", "contact our team") + " or call +254 102 400 400.";

function initChatAssistant() {
  const toggleButton = document.querySelector(".chat-toggle");
  const panel = document.querySelector(".chat-panel");
  const closeButton = document.querySelector(".chat-close");
  const messages = document.querySelector(".chat-messages");
  const form = document.querySelector(".chat-form");
  const input = document.querySelector(".chat-input");
  let welcomeShown = false;

  // Adds one message bubble. Bot replies may contain our own links (html);
  // anything the visitor types is always added as plain text.
  function addMessage(text, sender, isHtml) {
    const bubble = document.createElement("div");
    bubble.className = "chat-message chat-message--" + sender;
    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function findAnswer(question) {
    const text = question.toLowerCase();
    const match = chatAnswers.find(function (item) {
      return item.pattern.test(text);
    });
    return match ? match.reply : chatFallback;
  }

  toggleButton.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    if (panel.hidden) return;

    // Speak a welcome greeting when the chat is opened
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Hello! I'm your assistant here at N Kuria Advocates. I'm happy to help you with any questions about our services."
      );
      utterance.lang = "en-US";
      utterance.rate = 0.95;

      // Prefer a female voice when available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(function (voice) {
        return voice.name.toLowerCase().includes("female")
          || voice.name.toLowerCase().includes("woman")
          || voice.localService && voice.name.toLowerCase().includes("samantha")
          || voice.name.toLowerCase().includes("karen")
          || voice.name.toLowerCase().includes("moira")
          || voice.name.toLowerCase().includes("tessa")
          || voice.name.toLowerCase().includes("veena");
      });
      if (femaleVoice) utterance.voice = femaleVoice;

      window.speechSynthesis.speak(utterance);
    }

    if (!welcomeShown) {
      addMessage(chatWelcome, "bot", false);
      welcomeShown = true;
    }
    input.focus();
  });

  closeButton.addEventListener("click", function () {
    panel.hidden = true;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, "user", false);
    input.value = "";

    setTimeout(function () {
      addMessage(findAnswer(question), "bot", true);
    }, 300);
  });
}


/* ---------- 4. Account pop-up (create account / sign in) ---------- */

// DEMO ONLY. There is no server yet, so the "session" is just a name and email
// kept in this browser's localStorage, and anyone can open the dashboard.
// Before launch, replace saveSession() and the two submit handlers below with
// real requests to a backend (HTTPS, hashed passwords, secure cookies).
// Never store passwords in the browser.
const sessionKey = "nkSession";

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey));
  } catch (error) {
    return null;
  }
}

function saveSession(name, email) {
  try {
    localStorage.setItem(sessionKey, JSON.stringify({
      name: name,
      email: email,
      created: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    return false;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(sessionKey);
  } catch (error) {
    // Nothing to clear if storage is blocked
  }
}

function initAccount() {
  const accountButton = document.querySelector(".account-button");
  const modal = document.getElementById("auth-modal");
  const closeButton = modal.querySelector(".modal-close");
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const signupTab = document.getElementById("tab-signup");
  const signinTab = document.getElementById("tab-signin");
  const dashboardUrl = siteRoot + "dashboard.html";
  let previouslyFocused = null;

  // Signed-in visitors see their initial in the round button
  const session = getSession();
  if (session) {
    accountButton.textContent = (session.name || "?").charAt(0).toUpperCase();
    accountButton.setAttribute("aria-label", "Go to my dashboard");
  }

  function showTab(tab) {
    const isSignup = tab === "signup";
    signupForm.hidden = !isSignup;
    signinForm.hidden = isSignup;
    signupTab.setAttribute("aria-selected", isSignup);
    signinTab.setAttribute("aria-selected", !isSignup);
  }

  function openModal(tab) {
    previouslyFocused = document.activeElement;
    showTab(tab);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector("form:not([hidden]) input").focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (previouslyFocused) previouslyFocused.focus();
  }

  accountButton.addEventListener("click", function () {
    if (getSession()) {
      window.location.href = dashboardUrl;
    } else {
      openModal("signup");
    }
  });

  signupTab.addEventListener("click", function () {
    showTab("signup");
  });
  signinTab.addEventListener("click", function () {
    showTab("signin");
  });

  // Close with the X, a click on the dark background, or the Escape key
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  // Keep Tab inside the pop-up while it is open
  modal.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(modal.querySelectorAll("button, input, a[href]")).filter(function (element) {
      return element.offsetParent !== null;
    });
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const fields = signupForm.elements;
    const message = document.getElementById("signup-message");
    message.className = "form-message--error";

    if (fields.password.value.length < 8) {
      message.textContent = "Password must be at least 8 characters.";
      return;
    }
    if (fields.password.value !== fields.confirm.value) {
      message.textContent = "Passwords do not match.";
      return;
    }
    if (!fields.disclaimer.checked) {
      message.textContent = "Please accept the disclaimer to continue.";
      return;
    }

    // TODO: send name, email and password to your backend over HTTPS here.
    if (!saveSession(fields.name.value.trim(), fields.email.value.trim())) {
      message.textContent = "Your browser blocked site storage. Please allow it and try again.";
      return;
    }
    window.location.href = dashboardUrl;
  });

  signinForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const message = document.getElementById("signin-message");
    const email = signinForm.elements.email.value.trim();

    // TODO: check the email and password with your backend here.
    const namePart = email.split("@")[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    if (!saveSession(name, email)) {
      message.className = "form-message--error";
      message.textContent = "Your browser blocked site storage. Please allow it and try again.";
      return;
    }
    window.location.href = dashboardUrl;
  });

  // The dashboard sends signed-out visitors back here with ?signin=1
  if (!session && window.location.search.indexOf("signin=1") !== -1) {
    openModal("signin");
  }
}


/* ---------- 5. Contact form ---------- */

// Until a server is connected, the form opens the visitor's email app
// with the enquiry filled in.
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const fields = form.elements;

    const subject = "Enquiry: " + fields.category.value;
    const body =
      "Name: " + fields.name.value + "\n" +
      "Phone: " + fields.phone.value + "\n" +
      "Preferred callback: " + fields.callback.value + "\n\n" +
      fields.message.value;

    window.location.href =
      "mailto:info@nkadvocates.com" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  });
}


/* ---------- 6. Scroll animations ---------- */

// Elements marked class="reveal" fade up the first time they scroll into view.
// Uses CSS scroll-driven animations (animation-timeline: view()) where supported
// for buttery-smooth, main-thread-free reveals; falls back to IntersectionObserver.
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  const scrollDriven = CSS.supports("animation-timeline: view()");

  if (scrollDriven) {
    // CSS scroll-driven timeline handles the reveal; no JS observer needed.
    items.forEach(function (item, index) {
      item.classList.remove("reveal");
      item.classList.add("reveal-scroll");
      item.classList.add("stagger-" + ((index % 6) + 1));
    });
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (item) {
      item.classList.remove("reveal");
    });
    return;
  }

  // Cards in the same grid appear one after another
  document.querySelectorAll(".card-grid, .card-grid-3").forEach(function (grid) {
    Array.from(grid.children).forEach(function (card, index) {
      card.style.transitionDelay = index * 80 + "ms";
    });
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      item.classList.add("is-visible");
      observer.unobserve(item);

      // Once the fade has finished, hand the element back to its normal styles
      // so hover effects work without the reveal delay.
      item.addEventListener("transitionend", function onFinished(transition) {
        if (transition.target !== item) return;
        item.classList.remove("reveal", "is-visible");
        item.style.transitionDelay = "";
        item.removeEventListener("transitionend", onFinished);
      });
    });
  }, { threshold: 0.15 });

  items.forEach(function (item) {
    observer.observe(item);
  });
}


/* ---------- 7. Header shadow ---------- */

// The header gets a soft shadow once the page has been scrolled.
function initHeaderShadow() {
  const header = document.querySelector(".site-header");

  function update() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
}


/* ---------- Start everything ---------- */

initMobileMenu();
initLogoStrip();
initChatAssistant();
initAccount();
initScrollReveal();
initHeaderShadow();
initContactForm();


/* ---------- Page entry veil (additive) ---------- */

(function () {
  function initEntryVeil() {
    var veil = document.createElement("div");
    veil.className = "entry-veil";
    veil.innerHTML =
      '<img src="images/Logo.png" alt="N Kuria Advocates" class="entry-logo" onerror="this.remove()">' +
      '<h1 class="entry-title">N Kuria</h1>' +
      '<div class="entry-stroke"></div>' +
      '<p class="entry-sub">Advocates</p>';
    document.body.insertBefore(veil, document.body.firstChild);

    // Dismiss early on click
    veil.addEventListener("click", function () {
      veil.classList.add("done");
      setTimeout(function () { veil.remove(); }, 700);
    });

    setTimeout(function () {
      veil.classList.add("done");
      setTimeout(function () { veil.remove(); }, 700);
    }, 1400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEntryVeil);
  } else {
    initEntryVeil();
  }
})();


/* ---------- Back to top button ---------- */

(function () {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&uarr;";
  document.body.appendChild(btn);

  function toggle() {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  }

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggle);
  toggle();
})();

