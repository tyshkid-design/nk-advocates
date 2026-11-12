/* ==========================================================
   N. Kuria & Company Advocates - dashboard script

   Shows the signed-in visitor's name and one general legal tip
   per day. Load main.js first: it provides siteRoot, getSession()
   and clearSession().
   ========================================================== */

// The tip changes every day and cycles through this list in order.
// To add tips, add new entries to the end of the list.
// General information only; have the firm review all tips before launch.
const dailyTips = [
  {
    category: "Contracts",
    title: "Put it in writing",
    text: "Agreements are easier to rely on when the parties, amounts, dates and obligations are written down and signed by everyone involved."
  },
  {
    category: "Property",
    title: "Search before you buy land",
    text: "Before paying for land or a building, carry out an official search at the relevant land registry to confirm who owns it and whether any charges or restrictions are registered against it."
  },
  {
    category: "Succession",
    title: "Keep your will up to date",
    text: "A will lets you decide who receives your assets and who cares for any minor children. Review it after major life events such as marriage, the birth of a child or buying property."
  },
  {
    category: "Business",
    title: "Agree the rules between partners",
    text: "Business partners should agree in writing how decisions are made, how profits are shared and what happens if one partner wants to leave."
  },
  {
    category: "Contracts",
    title: "Read before you sign",
    text: "Pay close attention to payment terms, how a contract can be ended and how disputes are handled. If anything is unclear, ask before you sign."
  },
  {
    category: "Disputes",
    title: "Keep a record",
    text: "Save emails, messages, receipts and notes of conversations. Clear records made at the time often make a dispute much easier to resolve."
  },
  {
    category: "Compliance",
    title: "Handle personal data with care",
    text: "If your business collects personal information, collect only what you need, be clear about why you need it and keep it secure."
  },
  {
    category: "Disputes",
    title: "Act quickly on legal notices",
    text: "If you receive a legal notice or court document, note every date and deadline in it and seek advice promptly. Missed deadlines can limit your options."
  },
  {
    category: "Succession",
    title: "Keep a list of your assets",
    text: "A simple, up-to-date list of your assets and where the important documents are kept makes things much easier for your family or executors."
  },
  {
    category: "Business",
    title: "Think before you guarantee",
    text: "Before guaranteeing someone else's loan or debt, make sure you understand exactly what you would be responsible for if they cannot pay."
  }
];

// Daily wisdom quotes — one per day, cycled by date.
const dailyQuotes = [
  "Justice delayed is justice denied.",
  "The law is reason, free from passion.",
  "A good lawyer knows the law; a great lawyer knows the client.",
  "Integrity is doing the right thing even when no one is watching.",
  "In law, as in life, preparation is everything.",
  "A contract is only as strong as the trust behind it.",
  "Fairness is not an option; it is a requirement.",
  "The best agreement is one where both sides feel they won.",
  "Knowledge of the law is power; wisdom is knowing how to use it.",
  "Every case has two sides — listen to both before you judge.",
  "Honesty is the first chapter in the book of wisdom.",
  "A client's trust is earned one honest answer at a time.",
  "Law is not about winning; it is about what is right.",
  "Patience is a virtue, especially in litigation.",
  "The pen is mightier than the sword — especially a well-drafted contract.",
  "Clarity prevents conflict.",
  "Justice should not be a luxury; it should be accessible to all.",
  "A stitch in time saves nine — seek legal advice early.",
  "Respect the process, respect the court, respect the client.",
  "The truth is the best defence.",
  "Confidentiality is the foundation of the advocate-client relationship.",
  "Laws change; principles endure.",
  "Diligence beats talent when talent does not do the work.",
  "Every signature matters — read before you sign.",
  "Compliance is not a burden; it is a shield.",
  "Disputes are inevitable; litigation is optional.",
  "A will speaks for you when you no longer can.",
  "Property rights are the cornerstone of prosperity.",
  "Good governance begins with clear rules.",
  "Risk identified is risk halved.",
  "Partnerships thrive on written agreements, not handshakes.",
  "Data is an asset — protect it like one.",
  "Mediation often achieves what litigation cannot.",
  "The rule of law protects the weak as well as the strong.",
  "Success in law is measured by client peace of mind.",
  "Attention to detail separates good advocacy from great advocacy.",
  "Legal precision prevents costly ambiguity.",
  "Trust is built in consistency, not in grand gestures.",
  "The court rewards those who come with clean hands.",
  "Every transaction leaves a paper trail — make it a good one.",
  "Change is constant; legal readiness is not optional.",
  "A well-advised client makes better decisions.",
  "Justice is not about technicalities; it is about substance.",
  "Professional courtesy costs nothing and earns everything.",
  "The best legal advice is practical, not theoretical.",
  "Precedent guides us, but justice defines us.",
  "Confidentiality is sacred — guard it fiercely.",
  "Laws exist to serve society, not the other way around.",
  "Preparation is the difference between panic and performance.",
  "Advocacy is the art of persuasion with principle.",
  "Every client deserves to be heard."
];

// Number of whole days since 1970, using the visitor's local date.
function getDayNumber() {
  const now = new Date();
  const localMilliseconds = now.getTime() - now.getTimezoneOffset() * 60000;
  return Math.floor(localMilliseconds / 86400000);
}

// Picks a tip by day number, going back "daysAgo" days.
function getTip(dayNumber, daysAgo) {
  const count = dailyTips.length;
  const index = (((dayNumber - daysAgo) % count) + count) % count;
  return dailyTips[index];
}

// Picks a quote by day number.
function getQuote(dayNumber) {
  const count = dailyQuotes.length;
  const index = (((dayNumber % count) + count) % count);
  return dailyQuotes[index];
}

function initDashboard() {
  const session = getSession();

  // Not signed in: go back to the home page and open the sign-in pop-up
  if (!session) {
    window.location.replace(siteRoot + "index.html?signin=1");
    return;
  }

  const dayNumber = getDayNumber();
  const today = getTip(dayNumber, 0);

  document.getElementById("user-name").textContent = session.name.split(" ")[0];
  document.getElementById("user-email").textContent = session.email;

  // Member since date
  if (session.created) {
    document.getElementById("member-since").textContent = new Date(session.created).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // Stat values
  document.getElementById("stat-tips").textContent = dailyTips.length;

  document.getElementById("tip-date").textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  document.getElementById("tip-category").textContent = today.category;
  document.getElementById("tip-title").textContent = today.title;
  document.getElementById("tip-text").textContent = today.text;

  // Daily quote
  const quote = getQuote(dayNumber);
  document.getElementById("daily-quote").textContent = quote;

  // The three tips before today's
  const recentList = document.getElementById("recent-tips");
  for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
    const tip = getTip(dayNumber, daysAgo);

    const card = document.createElement("div");
    card.className = "card";

    const category = document.createElement("p");
    category.className = "tip-category";
    category.textContent = tip.category;

    const title = document.createElement("h3");
    title.textContent = tip.title;

    const text = document.createElement("p");
    text.textContent = tip.text;

    card.append(category, title, text);
    recentList.appendChild(card);
  }

  document.getElementById("sign-out").addEventListener("click", function () {
    clearSession();
    window.location.href = siteRoot + "index.html";
  });

  document.getElementById("dashboard").hidden = false;
}

initDashboard();
