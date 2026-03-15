import { useState, useCallback, useRef } from "react";

const SYSTEM_PROMPT = `You are an expert SEO content writer specializing in Amazon affiliate marketing blog articles. You write compelling, informative, and SEO-optimized product review articles that drive conversions.

CRITICAL: You must respond ONLY with valid JSON. No markdown, no backticks, no preamble. Just pure JSON.

The JSON must have this exact structure:
{
  "title": "SEO-optimized blog post title (60-70 chars)",
  "slug": "url-friendly-slug-with-hyphens",
  "metaDescription": "Compelling meta description with keywords (150-160 chars)",
  "keywords": "comma, separated, seo, keywords, for, meta, tag",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "Full HTML article content with proper h2, h3, p, ul, li tags. Include: intro, product overview, key features, pros/cons, who should buy, FAQ section, and conclusion with CTA. Make it 1500-2000 words. Use engaging tone. Include affiliate disclaimer."
}`;

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

    const userPrompt = `Generate a complete blog article with these details:
Product: ${productName}
Amazon URL: ${amazonUrl || "N/A"}
Key Features: ${keyFeatures || "Research and include relevant features"}
Target Audience: ${targetAudience || "General consumers"}
Article Type: ${articleType}

Instructions:
- ${typeInstruction}
- ${langInstruction}
- Include the Amazon affiliate link naturally in the content where appropriate
- Make the content engaging and conversion-focused
- Include proper HTML formatting with h2, h3, p, ul, li, strong tags
- Add an affiliate disclosure at the beginning`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setResult(parsed);
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
  }, [productName, amazonUrl, keyFeatures, targetAudience, language, articleType]);

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
            AI-powered blog article generator for Amazon affiliate marketing
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
          <div style={styles.progressBox}>
            <p>{progress}</p>
            <p style={{ fontSize: 12, marginTop: 6, color: t.textMuted }}>
              This may take 30-60 seconds for a complete article
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={styles.sectionTitle}>
                <span style={{ color: t.success }}>✓</span> Generated Article
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
