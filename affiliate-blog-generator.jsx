import { useState, useCallback, useRef } from "react";

const SYSTEM_PROMPT = `You are "Jake" — a 34-year-old product reviewer who runs a mid-sized blog. You've been doing this since 2017. You buy products with your own money, test them for weeks, and write about them honestly. You have a cat named Pixel who occasionally knocks products off your desk during testing.

CRITICAL: You must respond ONLY with valid JSON. No markdown, no backticks, no preamble. Just pure JSON.

## YOUR WRITING DNA (internalize these — don't just follow them as rules):

### How You Actually Think and Write
You don't plan perfect paragraphs. You start talking about a feature, get sidetracked by a memory, come back to the point, and sometimes lose your train of thought a little. This is INTENTIONAL. Real writing meanders.

Example of YOUR voice:
"So I've had this thing on my desk for about three weeks now. Maybe closer to four? Anyway. The first thing you notice is how heavy it is — and I mean that in a good way. Cheap stuff feels like it'll blow away if you sneeze near it. This? This feels like somebody actually cared when they were putting it together."

### Sentence Architecture (THIS IS THE MOST IMPORTANT SECTION)
Your writing must have EXTREME variation in sentence length. Follow this pattern loosely:
- Short (2-6 words): "Dead serious." / "Nope." / "That surprised me." / "Not great, honestly."
- Medium (8-15 words): Most of your sentences live here. Normal conversational length.
- Long (20-35 words): Occasionally you go on a longer run when you're really explaining something or telling a mini-story about your experience.
- One-word paragraphs are fine occasionally: "Finally."

NEVER write 3+ consecutive sentences of similar length. This is the #1 thing AI detectors catch.

### Words You Actually Use vs Words You NEVER Use
YOUR vocabulary: "solid", "decent", "pretty good", "not bad", "kinda annoying", "honestly impressed", "fell flat", "nailed it", "dropped the ball", "no complaints", "meh", "legit", "lowkey", "the real deal", "overhyped", "slept on"

BANNED vocabulary (these scream AI): "delve", "tapestry", "landscape", "paradigm", "robust", "seamless", "leverage", "elevate", "streamline", "optimize", "boasts", "sport", "flaunt", "plethora", "myriad", "comprehensive", "Moreover", "Furthermore", "Additionally", "Notably", "Importantly", "Interestingly", "It's worth noting", "needless to say", "testament to", "game-changer", "cutting-edge", "state-of-the-art", "top-notch", "second to none", "unparalleled"

### Paragraph Rhythm
- Para 1: 3 sentences
- Para 2: 1 sentence (just a reaction or aside)
- Para 3: 5-6 sentences (deep into a feature)
- Para 4: 2 sentences
- Para 5: 4 sentences with a parenthetical
NEVER make all paragraphs the same length. NEVER follow a predictable pattern.

### Section Transitions
Don't use transitions. Just... start the next thought. Real bloggers don't write "Moving on to the battery life..." They just start: "Battery. This is where things get interesting."

Or use casual bridges: "Ok so the other thing I wanted to talk about..." / "Right, almost forgot—" / "Now here's where it gets tricky."

### Imperfections That Signal Humanity
- Start 2-3 sentences with "And" or "But"
- Use one run-on sentence somewhere (connected with "and" instead of a period)
- Include one self-correction: "it lasted about 8 hours — actually closer to 7.5 if I'm being precise"
- Add one tangent that's slightly off-topic then pull back: "...which reminds me of the old [competitor] I used to have, but that's a whole other rant."
- Use "like" as filler once or twice: "it's like, you know when something just works?"

### The Anti-Detection Core Rules
1. NEVER start consecutive paragraphs with the same part of speech
2. NEVER use a colon followed by a list more than once in the article
3. NEVER write a paragraph where every sentence starts with a different subject (AI does this to seem "varied" — it's actually a pattern)
4. NEVER end 2 sections the same way
5. Include at least 3 incomplete thoughts or mid-sentence pivots using em dashes
6. Use at least 2 questions that you answer yourself: "Is it perfect? Nah. But it's close."
7. Reference a specific (made up but realistic) timeframe: "After using this daily for about 19 days..."
8. Include one mild complaint that most reviewers wouldn't mention
9. Break the 4th wall once: "If you're still reading this far, you're probably serious about buying one"

The JSON must have this exact structure:
{
  "title": "Write like a real blog title — conversational, specific, sometimes with a dash or parenthetical. Examples: 'I Used the [Product] for a Month — Here's My Honest Take', '[Product] Review: The Good, Bad, and Meh', 'Is the [Product] Actually Worth It? (Spoiler: Mostly)'",
  "slug": "url-friendly-slug-matching-the-title",
  "metaDescription": "150-160 chars. Write like a text to a friend: 'Spent a month with the [product]. Some things blew me away, others... not so much. Here's what you need to know.'",
  "keywords": "natural keyword phrases a human would search, comma separated",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "Full HTML article. 1500-2000 words. h2/h3/p/ul/li/strong/em/a tags. MUST follow every rule above. The content must read like it was written by a real person at 11pm with a cup of coffee, not by a machine optimizing for engagement metrics."
}`;

const HUMANIZER_PROMPT = `You are a human editor. Your job is to take an AI-written article and rewrite it so that NO AI detector can flag it.

CRITICAL: Respond ONLY with the rewritten HTML content. No JSON wrapping, no backticks, no explanation. Just the raw HTML article content.

## Your Rewriting Process:
1. Read the entire article first
2. Rewrite EVERY sentence in your own words — do not keep any original sentence structure intact
3. Inject natural imperfections throughout

## Specific Rewrites You MUST Make:
- Replace any sentence starting with "This [product]" with something more natural
- Break up any paragraph longer than 5 sentences into smaller chunks
- Add 2-3 personal asides in parentheses
- Insert at least one "actually" mid-sentence where it sounds natural
- Replace all instances of "provides/offers/delivers/features" with more human verbs: "gives you", "comes with", "has", "packs"
- Change any "the [product] is equipped with" → simpler phrasing
- If you see a list where each item starts the same way, rewrite each item differently
- Add contractions wherever they're missing
- Make at least 5 sentences significantly shorter (under 6 words)
- Make at least 3 sentences longer and more rambling (25+ words)
- Move one paragraph to a slightly unexpected position in the article
- Replace at least 3 "formal" transitions with casual ones or no transition at all
- Add one sentence that starts with "Oh" or "Right" or "Look"
- Include one self-interruption with an em dash that changes direction

## Sentence-Level Mutations (apply to random sentences):
- Swap clause order: "While the battery is good, the screen is great" → "Screen's fantastic. Battery's not bad either."
- Merge two short sentences into one rambling one with "and"
- Split one long sentence into two punchy ones
- Add a qualifier: "probably", "I think", "from what I can tell", "as far as I know"
- Insert filler: "basically", "honestly", "I mean"

## Words to Hunt and Replace:
- "utilizes" → "uses"
- "purchase" → "buy" or "grab" or "pick up"
- "consumers" → "people" or "folks" or "buyers"
- "functionality" → "features" or "what it does"
- "aesthetic" → "look" or "vibe" or "style"
- "exceptional" → "really good" or "impressive" or "killer"
- "significant" → "big" or "major" or "noticeable"
- "facilitate" → "help" or "make it easier"
- "subsequently" → "then" or "after that" or just remove it
- "demonstrate" → "show" or "prove"
- "implement" → "add" or "put in" or "build"
- "virtually" → "pretty much" or "basically"`;

const themes = {
  dark: {
    bg: "#0a0a0f",
    surface: "#12121a",
    surfaceAlt: "#1a1a25",
    border: "#2a2a3a",
    borderFocus: "#6c5ce7",
    text: "#e8e6f0",
    textMuted: "#8888a0",
    accent: "#6c5ce7",
    accentHover: "#7c6cf7",
    accentBg: "rgba(108,92,231,0.1)",
    success: "#00b894",
    successBg: "rgba(0,184,148,0.1)",
    error: "#ff6b6b",
    errorBg: "rgba(255,107,107,0.1)",
    warning: "#ffc048",
    gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
  },
};

const t = themes.dark;

export default function AffiliateBlogGenerator() {
  const [productName, setProductName] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("english");
  const [articleType, setArticleType] = useState("review");
  const [writingTone, setWritingTone] = useState("casual");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState({});
  const [progress, setProgress] = useState("");
  const contentRef = useRef(null);

  const articleTypes = [
    { value: "review", label: "Product Review", icon: "★" },
    { value: "comparison", label: "Comparison", icon: "⚖" },
    { value: "buying-guide", label: "Buying Guide", icon: "📋" },
    { value: "top-10", label: "Top 10 List", icon: "🏆" },
  ];

  const toneOptions = [
    { value: "casual", label: "Casual & Friendly", icon: "😊" },
    { value: "expert", label: "Expert Authority", icon: "🎓" },
    { value: "storyteller", label: "Storyteller", icon: "📖" },
    { value: "brutally-honest", label: "Brutally Honest", icon: "🔥" },
  ];

  const generateArticle = useCallback(async () => {
    if (!productName.trim()) {
      setError("Please enter a product name");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setProgress("Crafting your article...");

    const langInstruction = language === "sinhala"
      ? "Write the entire article content in Sinhala (සිංහල) language. Keep the title, slug, metaDescription, and keywords in English for SEO purposes, but write the main content field in Sinhala."
      : "Write everything in English.";

    const typeInstruction = {
      review: "Write a detailed single product review article.",
      comparison: "Write a comparison article. If only one product is given, compare it with its top competitors.",
      "buying-guide": "Write a comprehensive buying guide article for this product category.",
      "top-10": "Write a top 10 list article featuring this product and similar alternatives.",
    }[articleType];

    const toneInstruction = {
      casual: "Write like you're telling a friend about this product over coffee. Relaxed, warm, peppered with humor and personal asides.",
      expert: "Write like a seasoned tech reviewer with 10+ years of experience. Confident, data-driven, but still personable. Use specific technical details but explain them simply.",
      storyteller: "Write as a narrative journey — your experience discovering, buying, unboxing, and using this product. Make the reader feel like they're experiencing it with you.",
      "brutally-honest": "Write with zero filter. Be blunt about flaws, enthusiastic about strengths. Use strong opinions and don't hedge. Readers come to you because you don't sugarcoat.",
    }[writingTone];

    const userPrompt = `Generate a complete blog article with these details:
Product: ${productName}
Amazon URL: ${amazonUrl || "N/A"}
Key Features: ${keyFeatures || "Research and include relevant features"}
Target Audience: ${targetAudience || "General consumers"}
Article Type: ${articleType}
Writing Tone: ${writingTone}

Instructions:
- ${typeInstruction}
- ${langInstruction}
- TONE: ${toneInstruction}
- Include the Amazon affiliate link naturally where it makes sense
- Remember: you are Jake, a real human blogger. Write like yourself.
- Do NOT start with any generic opening. Start mid-thought, like a real person.
- Include proper HTML formatting with h2, h3, p, ul, li, strong, em tags`;

    try {
      // === STEP 1: Generate the initial article ===
      setProgress("Step 1/2 — Writing the draft...");
      const response1 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response1.ok) throw new Error(`API error: ${response1.status}`);

      const data1 = await response1.json();
      const text1 = data1.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      const cleaned1 = text1.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned1);

      // === STEP 2: Humanize the content through a second pass ===
      setProgress("Step 2/2 — Humanizing content...");
      const response2 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: HUMANIZER_PROMPT,
          messages: [{ role: "user", content: `Rewrite this article to be completely undetectable by AI detectors. ${language === "sinhala" ? "Keep the content in Sinhala language." : ""} Here is the HTML article content to humanize:\n\n${parsed.content}` }],
        }),
      });

      if (!response2.ok) throw new Error(`Humanizer API error: ${response2.status}`);

      const data2 = await response2.json();
      const humanizedContent = data2.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .replace(/```html|```/g, "")
        .trim();

      setResult({ ...parsed, content: humanizedContent });
      setProgress("");
    } catch (err) {
      console.error(err);
      setError(
        err.message.includes("JSON")
          ? "Failed to parse the generated content. Please try again."
          : `Generation failed: ${err.message}`
      );
      setProgress("");
    } finally {
      setLoading(false);
    }
  }, [productName, amazonUrl, keyFeatures, targetAudience, language, articleType, writingTone]);

  const copyField = useCallback((field, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied((prev) => ({ ...prev, [field]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [field]: false })), 2000);
    });
  }, []);

  const copyAllAsJSON = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2)).then(() => {
      setCopied((prev) => ({ ...prev, all: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, all: false })), 2000);
    });
  }, [result]);

  const styles = {
    app: {
      minHeight: "100vh",
      background: t.bg,
      color: t.text,
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
    },
    header: {
      padding: "28px 32px 20px",
      borderBottom: `1px solid ${t.border}`,
      background: t.surface,
    },
    headerInner: {
      maxWidth: 1100,
      margin: "0 auto",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 4,
    },
    logoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: t.gradient,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      fontWeight: 700,
      color: "#fff",
    },
    logoText: {
      fontSize: 20,
      fontWeight: 700,
      background: t.gradient,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.3px",
    },
    subtitle: {
      fontSize: 13,
      color: t.textMuted,
      marginTop: 2,
      marginLeft: 48,
    },
    main: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "24px 32px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      color: t.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    input: {
      padding: "10px 14px",
      background: t.surfaceAlt,
      border: `1px solid ${t.border}`,
      borderRadius: 8,
      color: t.text,
      fontSize: 14,
      outline: "none",
      transition: "border-color 0.2s",
    },
    textarea: {
      padding: "10px 14px",
      background: t.surfaceAlt,
      border: `1px solid ${t.border}`,
      borderRadius: 8,
      color: t.text,
      fontSize: 14,
      outline: "none",
      resize: "vertical",
      minHeight: 70,
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    typeSelector: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8,
    },
    typeBtn: (active) => ({
      padding: "10px 8px",
      background: active ? t.accentBg : t.surfaceAlt,
      border: `1px solid ${active ? t.accent : t.border}`,
      borderRadius: 8,
      color: active ? t.accent : t.textMuted,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.2s",
    }),
    typeIcon: {
      fontSize: 18,
      display: "block",
      marginBottom: 4,
    },
    row: {
      display: "flex",
      gap: 12,
      alignItems: "end",
    },
    langToggle: {
      display: "flex",
      borderRadius: 8,
      overflow: "hidden",
      border: `1px solid ${t.border}`,
    },
    langBtn: (active) => ({
      padding: "10px 16px",
      background: active ? t.accent : t.surfaceAlt,
      color: active ? "#fff" : t.textMuted,
      border: "none",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    generateBtn: {
      padding: "12px 32px",
      background: loading ? t.surfaceAlt : t.gradient,
      border: "none",
      borderRadius: 8,
      color: loading ? t.textMuted : "#fff",
      fontSize: 14,
      fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.3s",
      marginTop: 8,
      width: "100%",
      letterSpacing: "0.3px",
    },
    section: {
      marginTop: 28,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: t.text,
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    resultCard: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
    },
    resultHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 16px",
      background: t.surfaceAlt,
      borderBottom: `1px solid ${t.border}`,
    },
    resultLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: t.accent,
      textTransform: "uppercase",
      letterSpacing: "0.8px",
    },
    copyBtn: (isCopied) => ({
      padding: "4px 12px",
      background: isCopied ? t.successBg : "transparent",
      border: `1px solid ${isCopied ? t.success : t.border}`,
      borderRadius: 6,
      color: isCopied ? t.success : t.textMuted,
      fontSize: 11,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    resultBody: {
      padding: 16,
      fontSize: 14,
      lineHeight: 1.6,
      color: t.text,
      maxHeight: 400,
      overflowY: "auto",
    },
    resultText: {
      padding: 16,
      fontSize: 14,
      lineHeight: 1.5,
      color: t.text,
      wordBreak: "break-word",
    },
    tagList: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      padding: 16,
    },
    tag: {
      padding: "4px 12px",
      background: t.accentBg,
      border: `1px solid ${t.border}`,
      borderRadius: 20,
      fontSize: 12,
      color: t.accent,
      fontWeight: 500,
    },
    errorBox: {
      padding: "12px 16px",
      background: t.errorBg,
      border: `1px solid ${t.error}`,
      borderRadius: 8,
      color: t.error,
      fontSize: 13,
      marginTop: 12,
    },
    progressBox: {
      padding: "16px",
      textAlign: "center",
      color: t.textMuted,
      fontSize: 14,
    },
    spinner: {
      display: "inline-block",
      width: 20,
      height: 20,
      border: `2px solid ${t.border}`,
      borderTopColor: t.accent,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      marginRight: 10,
      verticalAlign: "middle",
    },
    copyAllBtn: (isCopied) => ({
      padding: "8px 20px",
      background: isCopied ? t.successBg : t.accentBg,
      border: `1px solid ${isCopied ? t.success : t.accent}`,
      borderRadius: 8,
      color: isCopied ? t.success : t.accent,
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    contentHtml: {
      padding: 16,
      fontSize: 14,
      lineHeight: 1.7,
      color: t.text,
      maxHeight: 500,
      overflowY: "auto",
    },
  };

  const ResultField = ({ label, value, field, isHtml, isTags }) => (
    <div style={styles.resultCard}>
      <div style={styles.resultHeader}>
        <span style={styles.resultLabel}>{label}</span>
        <button
          style={styles.copyBtn(copied[field])}
          onClick={() => copyField(field, isTags ? value.join(", ") : value)}
        >
          {copied[field] ? "✓ Copied" : "Copy"}
        </button>
      </div>
      {isTags ? (
        <div style={styles.tagList}>
          {value.map((tag, i) => (
            <span key={i} style={styles.tag}>{tag}</span>
          ))}
        </div>
      ) : isHtml ? (
        <div
          ref={contentRef}
          style={styles.contentHtml}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div style={styles.resultText}>{value}</div>
      )}
    </div>
  );

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: ${t.borderFocus} !important; }
        button:hover { opacity: 0.9; }
        .content-html h2 { font-size: 18px; font-weight: 700; margin: 20px 0 10px; color: ${t.text}; }
        .content-html h3 { font-size: 16px; font-weight: 600; margin: 16px 0 8px; color: ${t.text}; }
        .content-html p { margin: 8px 0; }
        .content-html ul { padding-left: 20px; margin: 8px 0; }
        .content-html li { margin: 4px 0; }
        .content-html strong { color: ${t.accent}; }
        .content-html a { color: ${t.accent}; text-decoration: underline; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${t.bg}; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      `}</style>

      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>A</div>
            <div style={styles.logoText}>Affiliate Blog Generator</div>
          </div>
          <div style={styles.subtitle}>
            Two-pass AI humanization — Draft → Rewrite → Undetectable content for Amazon affiliates
          </div>
        </div>
      </div>

      <div style={styles.main}>
        {/* Article Type */}
        <div style={{ ...styles.fieldGroup, marginBottom: 20 }}>
          <label style={styles.label}>Article Type</label>
          <div style={styles.typeSelector}>
            {articleTypes.map((at) => (
              <button
                key={at.value}
                style={styles.typeBtn(articleType === at.value)}
                onClick={() => setArticleType(at.value)}
              >
                <span style={styles.typeIcon}>{at.icon}</span>
                {at.label}
              </button>
            ))}
          </div>
        </div>

        {/* Writing Tone */}
        <div style={{ ...styles.fieldGroup, marginBottom: 20 }}>
          <label style={styles.label}>Writing Tone</label>
          <div style={styles.typeSelector}>
            {toneOptions.map((to) => (
              <button
                key={to.value}
                style={styles.typeBtn(writingTone === to.value)}
                onClick={() => setWritingTone(to.value)}
              >
                <span style={styles.typeIcon}>{to.icon}</span>
                {to.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={styles.grid}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Product Name *</label>
            <input
              style={styles.input}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Amazon URL</label>
            <input
              style={styles.input}
              placeholder="https://amazon.com/dp/..."
              value={amazonUrl}
              onChange={(e) => setAmazonUrl(e.target.value)}
            />
          </div>
          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <label style={styles.label}>Key Features / Selling Points</label>
            <textarea
              style={styles.textarea}
              placeholder="e.g. Active noise cancellation, 30hr battery, multipoint connection..."
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Target Audience</label>
            <input
              style={styles.input}
              placeholder="e.g. Audiophiles, remote workers, travelers"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Content Language</label>
            <div style={styles.langToggle}>
              <button
                style={styles.langBtn(language === "english")}
                onClick={() => setLanguage("english")}
              >
                English
              </button>
              <button
                style={styles.langBtn(language === "sinhala")}
                onClick={() => setLanguage("sinhala")}
              >
                සිංහල
              </button>
            </div>
          </div>
        </div>

        <button
          style={styles.generateBtn}
          onClick={generateArticle}
          disabled={loading}
        >
          {loading ? (
            <>
              <span style={styles.spinner} />
              Generating Article...
            </>
          ) : (
            "⚡ Generate Blog Article"
          )}
        </button>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading && (
          <div style={{ ...styles.progressBox, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: progress.includes("1/2") ? t.gradient : progress.includes("2/2") ? t.successBg : t.surfaceAlt, border: `2px solid ${progress.includes("1/2") ? t.accent : progress.includes("2/2") ? t.success : t.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 14, fontWeight: 700, color: progress.includes("1/2") ? "#fff" : progress.includes("2/2") ? t.success : t.textMuted }}>
                  {progress.includes("2/2") ? "✓" : "1"}
                </div>
                <div style={{ fontSize: 11, color: progress.includes("1/2") ? t.accent : progress.includes("2/2") ? t.success : t.textMuted, fontWeight: 600 }}>Draft</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingBottom: 20 }}>
                <div style={{ width: 40, height: 2, background: progress.includes("2/2") ? t.success : t.border }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: progress.includes("2/2") ? t.gradient : t.surfaceAlt, border: `2px solid ${progress.includes("2/2") ? t.accent : t.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 14, fontWeight: 700, color: progress.includes("2/2") ? "#fff" : t.textMuted }}>
                  2
                </div>
                <div style={{ fontSize: 11, color: progress.includes("2/2") ? t.accent : t.textMuted, fontWeight: 600 }}>Humanize</div>
              </div>
            </div>
            <p style={{ color: t.text, fontSize: 14, fontWeight: 500 }}>{progress}</p>
            <p style={{ fontSize: 12, marginTop: 6, color: t.textMuted }}>
              Two-pass generation: Draft → Humanize (may take 60-90 seconds)
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={styles.sectionTitle}>
                <span style={{ color: t.success }}>✓</span> Humanized Article
                <span style={{ fontSize: 11, padding: "3px 10px", background: t.successBg, border: `1px solid ${t.success}`, borderRadius: 20, color: t.success, fontWeight: 600, marginLeft: 8 }}>2-Pass Processed</span>
              </div>
              <button
                style={styles.copyAllBtn(copied.all)}
                onClick={copyAllAsJSON}
              >
                {copied.all ? "✓ Copied All" : "Copy All as JSON"}
              </button>
            </div>

            <ResultField label="Title" value={result.title} field="title" />
            <ResultField label="Slug" value={result.slug} field="slug" />
            <ResultField label="Meta Description" value={result.metaDescription} field="meta" />
            <ResultField label="Keywords (Meta Tag)" value={result.keywords} field="keywords" />
            <ResultField label="Tags" value={result.tags || []} field="tags" isTags />
            <ResultField label="Article Content (HTML)" value={result.content} field="content" isHtml />

            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.resultLabel}>Raw HTML Content</span>
                <button
                  style={styles.copyBtn(copied.rawHtml)}
                  onClick={() => copyField("rawHtml", result.content)}
                >
                  {copied.rawHtml ? "✓ Copied" : "Copy HTML"}
                </button>
              </div>
              <div style={{ ...styles.resultText, fontSize: 12, fontFamily: "monospace", color: t.textMuted, maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {result.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
