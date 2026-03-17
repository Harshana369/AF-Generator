"use client";

import { useState, useCallback, useRef } from "react";

const BASE_PERSONA = `You are "Jake" — 34, runs a product review blog since 2017. Buys everything with own money. Has a cat named Pixel. Lives in Denver. Former IT support guy who fell into blogging by accident.

CRITICAL: Respond ONLY with valid JSON. No markdown, no backticks, no preamble.

## YOUR WRITING IDENTITY (not rules — this is WHO you are):

You write like you talk. You don't outline, you don't plan paragraphs, you just... go. Sometimes you circle back to a point you made 3 paragraphs ago. You get distracted by details that fascinate you. You explain things like your buddy just asked "hey is this thing worth it?"

## SENTENCE PATTERNS (follow these EXACTLY):

Pattern A — Staccato Burst: 3-4 very short sentences (2-7 words each), then one long one (25+ words). Use 3-4 times per article.
Example: "Battery life. That's the big one. Fourteen hours. And honestly, I pushed this thing through a full workday with Spotify streaming the entire time and still had juice left at dinner."

Pattern B — The Ramble: One 30-40 word sentence with commas and dashes, immediately followed by 2-3 word sentence. Use 2-3 times.
Example: "The noise cancellation is the kind where you put them on in a busy coffee shop and suddenly it's just you and your music and maybe a faint hum from the espresso machine. Dead quiet."

Pattern C — Self-Interrupt: Start a sentence, interrupt with em dash, finish different thought. Use 4-5 times.
Example: "The bass response is — ok wait, I need to back up. Before I talk about sound, let me tell you about the fit."

Pattern D — Question-Answer: Ask yourself a question, answer immediately. Use 2-3 times.
Example: "Is it perfect? Nah. But it's the closest I've found in this price range."

## VOCABULARY RULES:

Words you USE: solid, decent, pretty good, not bad, kinda, honestly, legit, lowkey, no joke, real talk, the thing is, here's the deal, I gotta say, fair enough, straight up, for real, that said, on the flip side, look, not gonna lie

FORBIDDEN words (flag AI instantly): delve, tapestry, landscape, paradigm, robust, seamless, leverage, elevate, streamline, optimize, boasts, sports, flaunts, plethora, myriad, comprehensive, Moreover, Furthermore, Additionally, Notably, Importantly, Interestingly, It's worth noting, needless to say, testament, game-changer, cutting-edge, state-of-the-art, top-notch, second to none, unparalleled, facilitates, demonstrates, implements, encompasses, constitutes, commences, culminates, paramount, pivotal, crucial, indispensable, meticulously, remarkably, undoubtedly, intricately, excels, thrives, revolutionize, innovative, versatile, compelling, impressive array, wide range of, variety of, whether you're a, designed to, aimed at, geared toward, caters to, in terms of, when it comes to, in the realm of, it should be noted

## PARAGRAPH ARCHITECTURE:
- Para 1: 2-3 sentences (hook)
- Para 2: 1 sentence only
- Para 3: 4-6 sentences (meaty)
- Para 4: 2 sentences
- Para 5: 5-7 sentences (meaty)
- Para 6: 1 sentence
NEVER 3 consecutive paragraphs of similar length.

## OPENING LINES (never generic):
- Specific moment: "I was two weeks into testing this when my neighbor asked what headphones I was wearing."
- Number: "Fourteen hours. That's how long this lasted on a single charge."
- Confession: "I almost didn't review this one. The price scared me off."
- Mid-conversation: "So my buddy texts me last month asking if I've tried the new [product] yet."
NEVER start with: "In today's...", "When it comes to...", "If you're looking for...", "The [product] is a..."

## ANTI-DETECTION FINGERPRINTS (must include ALL):
1. One parenthetical aside per 200 words
2. One self-correction: "about 8 hours — actually more like 7.5"
3. One tangent you pull back from
4. One 4th-wall break: "If you're still reading, you probably care about [detail]"
5. Two sentences starting with "And" or "But"
6. One run-on connected with "and" instead of punctuation
7. One "like" as filler
8. Specific details: exact days ("about 22 days"), scenarios ("Tuesday morning commute")
9. One mild grammar imperfection
10. Varied section headings — mix formats`;

const PROMPTS = {
  product_review: `${BASE_PERSONA}\n\nPRODUCT REVIEW: Use ALL data to write personal first-person review. Weave SEO keywords naturally.\nJSON: { "title": "Personal title (60-70 chars)", "slug": "url-slug", "metaDescription": "Conversational meta (150-160 chars)", "keywords": "primary, secondary", "tags": ["5 tags"], "content": "HTML 1500-2000 words. hook->disclosure->impressions->features->pros->cons->who buy->who avoid->FAQ(3)->verdict. h2/h3/p/ul/li/strong/em/a. Affiliate link 2-3x." }`,
  comparison: `${BASE_PERSONA}\n\nCOMPARISON: Write as someone who tested BOTH side by side. Opinionated.\nJSON: { "title": "A vs B (60-70)", "slug": "slug", "metaDescription": "meta (150-160)", "keywords": "kw", "tags": ["5"], "content": "HTML 1500-2000w. hook->disclosure->verdict table->dimension by dimension->price->who A->who B->FAQ->verdict. Both affiliate links." }`,
  buying_guide: `${BASE_PERSONA}\n\nBUYING GUIDE: Authority who tested all products.\nJSON: { "title": "Guide (60-70)", "slug": "slug", "metaDescription": "meta (150-160)", "keywords": "kw", "tags": ["5"], "content": "HTML 2000-2500w. hook->disclosure->how tested->picks->Top->Value->Upgrade->Budget->what to look for->table->FAQ->rec." }`,
  tech_news: `${BASE_PERSONA}\n\nTECH NEWS: React to news. Opinionated, factual.\nJSON: { "title": "Headline (60-70)", "slug": "slug", "metaDescription": "meta (150-160)", "keywords": "kw", "tags": ["5"], "content": "HTML 1000-1500w. hook->story->why matters->numbers->impacts->next->affiliate angle->sources." }`
};

const HUMANIZER_PROMPT = `You are a veteran freelance editor who rewrites AI content to be indistinguishable from human writing. You understand what AI detectors measure: statistical uniformity, predictable vocabulary, consistent structures, low perplexity, absence of disfluencies.

CRITICAL: Respond ONLY with rewritten HTML. No JSON, no backticks, no explanation. Just raw HTML.

## REWRITING METHODOLOGY (apply ALL):

### STEP 1 — Sentence Surgery
Every sentence gets one transformation:
- SHORTEN: 15-25 words → split into two, second under 6 words
- LENGTHEN: Under 10 words + next also short → merge with "and"/"but"/dash
- REORDER: Swap clause order. "While battery is impressive, design falls flat" → "Design-wise, kinda meh. But the battery? Legit impressive."
- FRAGMENT: Occasionally turn sentence into fragment. "Sound quality though."
- QUESTION: Turn statement into rhetorical question + answer

### STEP 2 — Vocabulary Detox
Replace EVERY instance:
"utilize"→"use", "purchase"→"buy/grab", "consumers"→"people/folks", "functionality"→"what it does", "exceptional"→"really good/killer", "significant"→"big/major", "facilitate"→"help", "demonstrate"→"show", "implement"→"add/build in", "virtually"→"pretty much", "optimal"→"best", "comprehensive"→"full/thorough", "innovative"→"new/clever", "versatile"→"flexible", "aesthetic"→"look/vibe", "seamless"→"smooth/easy", "enhance"→"improve/boost", "Additionally"→"Also/Oh and", "Furthermore"→"Plus", "Moreover"→"And", "However"→"But/That said", "Nevertheless"→"Still", "Consequently"→"So", "In conclusion"→just conclude, "It's worth noting"→"One thing I noticed"

### STEP 3 — Rhythm Breaking
- Find 3+ sentences with similar word count → change at least one drastically
- Find parallel list items → rewrite each differently
- Consecutive paragraphs starting same part of speech → change one

### STEP 4 — Human Disfluency Injection
- 2-3 parenthetical asides
- 1 self-correction with em dash
- 1 filler moment: "it's like, how do I put this..."
- 1 sentence starting "Oh"/"Right"/"Look"
- 1 casual aside to reader
- 1 sentence-initial "And" or "But"

### STEP 5 — Structural Mutations
- Move one paragraph to different position
- Break one long paragraph into two uneven ones
- Merge two short paragraphs
- Make one heading more casual

RULES: Keep ALL HTML tags/links/images/iframes/tables intact. Same language. Same approximate length (±10%). Every sentence must differ from input.`;

const PERPLEXITY_PROMPT = `You are a linguistic engineer making text statistically indistinguishable from human writing. AI detectors measure: token predictability (perplexity), sentence length variance (burstiness), vocabulary richness, structural repetition.

CRITICAL: Respond ONLY with modified HTML. No JSON, no backticks, no explanation.

## STATISTICAL HUMANIZATION:

### 1. PERPLEXITY BOOSTING
In 15-20 places, replace expected words with less predictable alternatives:
- "good sound" → "sound that actually slaps"
- "long battery" → "battery that just won't quit"  
- "comfortable" → "forgot I was wearing them"
- "expensive" → "gonna cost you"
- "the build quality is solid" → "this thing's built like it means business"
- "easy to use" → "figured it out in ten seconds"
- Replace predictable adjective+noun with unexpected descriptions
- Use sensory language: what it feels/sounds/looks like in a specific moment

### 2. BURSTINESS ENFORCEMENT
Ensure these exist:
- At least 5 sentences under 5 words
- At least 3 sentences over 28 words
- No 3 consecutive sentences within 4 words of each other
- At least 2 one-sentence paragraphs
- At least 1 paragraph with 5+ sentences
Restructure until they pass.

### 3. ENTROPY INJECTION
- Any word used 3+ times in 500 words → replace instances
- Consecutive paragraphs same opening part of speech → change one
- Any [statement→evidence→conclusion] → rearrange to [evidence→reaction→statement]
- Remove phrases appearing more than once

### 4. NATURAL NOISE
Add 2-3:
- Unexpected comparison: "heavier than my phone, lighter than a paperback"
- Time reference: "on a random Wednesday afternoon"
- Sensory detail: "that satisfying click when you fold them"
- Micro-opinion: "love that" or "not a fan"

RULES: Keep ALL HTML intact. Same language. Same length (±5%). This is the FINAL pass.`;

const MEDIA_PROMPT = `Media researcher. Find real product images + YouTube review.
CRITICAL: ONLY valid JSON. No markdown.
{ "images": [{"url":"image URL","alt":"alt text"}], "youtube": {"videoId":"ID only","title":"title"} }
images: 2-4 items. youtube: videoId only. null if none found.`;

/* CSV UTILS */
function parseCSV(text) {
  const lines = []; let cur = ""; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { if (inQ && text[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (ch === "\n" && !inQ) { lines.push(cur); cur = ""; }
    else if (ch !== "\r" || inQ) cur += ch;
  }
  if (cur.trim()) lines.push(cur);
  const split = (l) => {
    const cols = []; let col = ""; let q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') { if (q && l[i+1] === '"') { col += '"'; i++; } else q = !q; }
      else if (ch === ',' && !q) { cols.push(col.trim()); col = ""; }
      else col += ch;
    }
    cols.push(col.trim()); return cols;
  };
  if (lines.length < 2) return null;
  const h = split(lines[0]); const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const v = split(lines[i]); const r = {};
    h.forEach((k, idx) => { r[k] = v[idx] || ""; }); rows.push(r);
  }
  return { headers: h, rows };
}

function buildCSVPrompt(type, row, m) {
  if (type === "product_review") return `SEMRUSH DATA:\nPRIMARY KEYWORD: ${row.primary_keyword||m.productName} | SECONDARY: ${row.secondary_keywords||""}\nVOLUME: ${row.search_volume||""} | CPC: $${row.cpc_usd||""} | DIFFICULTY: ${row.keyword_difficulty||""} | INTENT: ${row.search_intent||"Commercial"}\nPRODUCT: ${row.product_title||m.productName} | BRAND: ${row.brand||""} | CATEGORY: ${row.category||""}\nPRICE: ${row.price_currency||"USD"} ${row.price_amount||""} | RATING: ${row.rating_average||""}/5 (${row.rating_count||""} reviews)\nASIN: ${row.asin||""}\nFEATURES: 1.${row.bullet_point_1||""} 2.${row.bullet_point_2||""} 3.${row.bullet_point_3||""} 4.${row.bullet_point_4||""} 5.${row.bullet_point_5||""}\nSPECS: ${row.key_specs||m.keyFeatures} | PROS: ${row.pros_list||""} | CONS: ${row.cons_list||""}\nFOR: ${row.who_its_for||m.targetAudience} | AVOID: ${row.who_should_avoid||""}\nAFFILIATE URL: ${row.affiliate_url||m.amazonUrl||""} | CTA: ${row.call_to_action_text||"Check price on Amazon"}\nDISCLOSURE: ${row.disclosure_text||"This post contains affiliate links."} | NOTES: ${row.notes||""}`;
  if (type === "comparison") return `SEMRUSH: ${row.primary_keyword||""} | SECONDARY: ${row.secondary_keywords||""} | VOL: ${row.search_volume||""} | CPC: $${row.cpc_usd||""} | KD: ${row.keyword_difficulty||""}\nPRODUCT A: ${row.product_a_title||""} | ${row.product_a_price_currency||"USD"} ${row.product_a_price_amount||""} | ${row.product_a_rating_average||""}/5 (${row.product_a_rating_count||""}) | Specs: ${row.product_a_key_specs||""} | URL: ${row.product_a_affiliate_url||""}\nPRODUCT B: ${row.product_b_title||""} | ${row.product_b_price_currency||"USD"} ${row.product_b_price_amount||""} | ${row.product_b_rating_average||""}/5 (${row.product_b_rating_count||""}) | Specs: ${row.product_b_key_specs||""} | URL: ${row.product_b_affiliate_url||""}\nDIMENSIONS: ${row.comparison_dimensions||""} | WINNER: ${row.winner_overall||""} | VALUE: ${row.winner_value||""} | FEATURES: ${row.winner_features||""}\nBUY A: ${row.who_should_buy_a||""} | BUY B: ${row.who_should_buy_b||""} | VERDICT: ${row.final_verdict_summary||""} | NOTES: ${row.notes||""}`;
  if (type === "buying_guide") return `SEMRUSH: ${row.primary_keyword||""} | SECONDARY: ${row.secondary_keywords||""} | VOL: ${row.search_volume||""} | CPC: $${row.cpc_usd||""} | KD: ${row.keyword_difficulty||""}\nTITLE: ${row.guide_title||""} | PERSONA: ${row.buyer_persona||m.targetAudience} | BUDGET: ${row.budget_range||""} | USES: ${row.use_cases||""}\nMUST-HAVE: ${row.must_have_features||""} | NICE: ${row.nice_to_have_features||""} | AVOID: ${row.avoid_if||""} | CRITERIA: ${row.evaluation_criteria||""}\nTOP: ${row.top_pick_asin||""} (${row.affiliate_url_top_pick||""}) | VALUE: ${row.best_value_asin||""} (${row.affiliate_url_best_value||""})\nUPGRADE: ${row.upgrade_pick_asin||""} (${row.affiliate_url_upgrade_pick||""}) | BUDGET: ${row.budget_pick_asin||""} (${row.affiliate_url_budget_pick||""})\nTABLE: ${row.comparison_table_fields||""} | NOTES: ${row.notes||""}`;
  if (type === "tech_news") return `SEMRUSH: ${row.primary_keyword||""} | SECONDARY: ${row.secondary_keywords||""} | VOL: ${row.search_volume||""} | CPC: $${row.cpc_usd||""} | KD: ${row.keyword_difficulty||""}\nHEADLINE: ${row.headline||""} | DATE: ${row.publish_date_local||""}\nTAGS: ${row.topic_tags||""} | PEOPLE: ${row.companies_products_people||""}\nWHAT: ${row.what_happened||""} | WHY: ${row.why_it_matters||""} | NUMBERS: ${row.key_numbers||""} | IMPACTS: ${row.pros_cons_or_impacts||""}\nSOURCES: ${row.source_url_1||""} | ${row.source_url_2||""}\nAFFILIATE: ${row.affiliate_angle_optional||""} | URLs: ${row.affiliate_urls_optional||""}\nNOTES: ${row.notes||""}`;
  return JSON.stringify(row);
}

function getCSVImages(type, row) {
  const imgs = [];
  if (type === "product_review") [row.image_url_1, row.image_url_2, row.image_url_3].forEach(u => u && imgs.push(u));
  else if (type === "comparison") [row.product_a_image_url, row.product_b_image_url].forEach(u => u && imgs.push(u));
  else if (type === "buying_guide" && row.image_url_hero) imgs.push(row.image_url_hero);
  else if (type === "tech_news") [row.image_url_1, row.image_url_2].forEach(u => u && imgs.push(u));
  return imgs.filter(u => u && !u.includes("example.com"));
}

/* THEME */
const C = {bg:"#06060b",sf:"#0d0d15",sa:"#14141f",bd:"#222234",bf:"#e8a838",tx:"#ece9f3",t2:"#c8c5d4",dm:"#6e6e88",ac:"#e8a838",as:"rgba(232,168,56,0.10)",gn:"#27ae60",gb:"rgba(39,174,96,0.10)",rd:"#e74c3c",rb:"rgba(231,76,60,0.08)",bl:"#2e86de",pu:"#8e44ad",gr:"linear-gradient(135deg,#e8a838,#f0c040)"};
const TYPE_META = {
  product_review:{label:"Product Review",icon:"\u2605",color:C.ac,csv:"product_reviews_template.csv"},
  comparison:{label:"Comparison",icon:"\u2696",color:C.bl,csv:"comparisons_template.csv"},
  buying_guide:{label:"Buying Guide",icon:"\uD83D\uDCCB",color:C.gn,csv:"buying_guides_template.csv"},
  tech_news:{label:"Tech News",icon:"\u26A1",color:C.pu,csv:"tech_news_template.csv"},
};

/* COMPONENT */
export default function App() {
  const [apiKey,setApiKey]=useState("");const [showKey,setShowKey]=useState(false);
  const [articleType,setArticleType]=useState("product_review");const [writingTone,setWritingTone]=useState("casual");
  const [productName,setProductName]=useState("");const [amazonUrl,setAmazonUrl]=useState("");
  const [keyFeatures,setKeyFeatures]=useState("");const [targetAudience,setTargetAudience]=useState("");
  const [language,setLanguage]=useState("english");
  const [csvData,setCsvData]=useState(null);const [csvFileName,setCsvFileName]=useState("");const [selectedRow,setSelectedRow]=useState(0);
  const [loading,setLoading]=useState(false);const [step,setStep]=useState(0);const [progress,setProgress]=useState("");
  const [result,setResult]=useState(null);const [error,setError]=useState("");const [copied,setCopied]=useState({});
  const fileRef=useRef(null);

  const tones=[{v:"casual",l:"Casual & Friendly",i:"\uD83D\uDE0A"},{v:"expert",l:"Expert Authority",i:"\uD83C\uDF93"},{v:"storyteller",l:"Storyteller",i:"\uD83D\uDCD6"},{v:"brutally-honest",l:"Brutally Honest",i:"\uD83D\uDD25"}];
  const toneText={casual:"Relaxed, warm, humorous.",expert:"Confident, data-driven.",storyteller:"Narrative journey.",["brutally-honest"]:"Zero filter, blunt."};

  const handleCSV=useCallback((e)=>{const file=e.target.files?.[0];if(!file)return;setError("");setCsvData(null);setSelectedRow(0);const reader=new FileReader();reader.onload=(ev)=>{try{const p=parseCSV(ev.target.result);if(!p||!p.rows.length){setError("CSV is empty or invalid.");return;}setCsvData(p);setCsvFileName(file.name);}catch(err){setError("CSV parse error: "+err.message);}};reader.readAsText(file);},[]);
  const clearCSV=useCallback(()=>{setCsvData(null);setCsvFileName("");setSelectedRow(0);if(fileRef.current)fileRef.current.value="";},[]);

  const callAPI=useCallback(async(system,messages,tools,maxTk=4096)=>{
    const body={model:"claude-sonnet-4-20250514",max_tokens:maxTk,system,messages};
    if(tools)body.tools=tools;
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify(body)});
    if(!r.ok){const e=await r.text().catch(()=>"");throw new Error(`API ${r.status}: ${e.slice(0,200)}`);}
    return r.json();
  },[apiKey]);

  const generate=useCallback(async()=>{
    if(!apiKey.trim()){setError("Anthropic API Key enter \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.");return;}
    if(!productName.trim()&&!csvData){setError("Product Name enter \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1 \u0DC4\u0DDD CSV upload \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.");return;}
    setLoading(true);setError("");setResult(null);setStep(1);setProgress("Step 1/4 \u2014 Writing draft...");

    const langNote=language==="sinhala"?"Write article CONTENT in Sinhala. Keep title/slug/meta/keywords in English.":"Write in English.";
    const tone=toneText[writingTone];const manual={productName,amazonUrl,keyFeatures,targetAudience};
    let userMsg="";
    if(csvData){const row=csvData.rows[selectedRow]||csvData.rows[0];userMsg=`${buildCSVPrompt(articleType,row,manual)}\n\n--- MANUAL ---\nProduct: ${productName}\nURL: ${amazonUrl}\nFeatures: ${keyFeatures}\nAudience: ${targetAudience}\nTONE: ${tone}\nLANG: ${langNote}`;}
    else{userMsg=`Write a ${articleType.replace(/_/g," ")} article:\nProduct: ${productName}\nURL: ${amazonUrl||"N/A"}\nFeatures: ${keyFeatures||"Include relevant features"}\nAudience: ${targetAudience||"General consumers"}\nTONE: ${tone}\nLANG: ${langNote}\nInclude affiliate link 2-3 times. Honest pros AND cons.`;}

    try{
      // STEP 1 — Draft
      const d1=await callAPI(PROMPTS[articleType],[{role:"user",content:userMsg}]);
      const t1=d1.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const parsed=JSON.parse(t1.replace(/```json|```/g,"").trim());

      // STEP 2 — Humanize (sentence surgery + vocab detox + disfluency injection)
      setStep(2);setProgress("Step 2/4 \u2014 Humanizing content...");
      const langKeep=language==="sinhala"?" Keep Sinhala language.":"";
      const d2=await callAPI(HUMANIZER_PROMPT,[{role:"user",content:`Rewrite this article to bypass all AI detectors.${langKeep}\n\n${parsed.content}`}]);
      let humanized=d2.content.filter(b=>b.type==="text").map(b=>b.text).join("").replace(/```html|```/g,"").trim();

      // STEP 3 — Perplexity & Burstiness pass (statistical humanization)
      setStep(3);setProgress("Step 3/4 \u2014 Perplexity injection...");
      const d3p=await callAPI(PERPLEXITY_PROMPT,[{role:"user",content:`Apply statistical humanization to this article. Boost perplexity, enforce burstiness, inject entropy.${langKeep}\n\n${humanized}`}]);
      let polished=d3p.content.filter(b=>b.type==="text").map(b=>b.text).join("").replace(/```html|```/g,"").trim();

      // STEP 4 — Media injection
      setStep(4);setProgress("Step 4/4 \u2014 Injecting media...");
      let final=polished;
      try{
        const csvImgs=csvData?getCSVImages(articleType,csvData.rows[selectedRow]||{}):[]; 
        const name=productName||parsed.title||"";
        const d4=await callAPI(MEDIA_PROMPT,[{role:"user",content:`Find images + YouTube for: ${name}`}],[{type:"web_search_20250305",name:"web_search"}],2048);
        const mt=d4.content.filter(b=>b.type==="text").map(b=>b.text).join("");
        let media;try{media=JSON.parse(mt.replace(/```json|```/g,"").trim());}catch(e){media=null;}
        const webImgs=media?.images?.map(i=>i.url).filter(Boolean)||[];
        const allImgs=[...csvImgs,...webImgs.filter(u=>!csvImgs.includes(u))].slice(0,4);
        const imgH=allImgs.map((url,i)=>`<figure style="margin:24px 0;text-align:center"><img src="${url}" alt="${name} - ${i+1}" style="max-width:100%;height:auto;border-radius:8px" loading="lazy"/><figcaption style="font-size:.85em;color:#888;margin-top:6px">${name}</figcaption></figure>`);
        let ytH="";
        if(media?.youtube?.videoId)ytH=`<div style="margin:28px 0"><h3>Video Review</h3><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px"><iframe src="https://www.youtube.com/embed/${media.youtube.videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:10px" allowfullscreen loading="lazy" title="${media.youtube.title||name}"></iframe></div></div>`;
        if(imgH.length>=2){const parts=final.split(/<\/h2>/i);if(parts.length>2){const out=[];for(let i=0;i<parts.length;i++){if(i<parts.length-1){out.push(parts[i]+"</h2>");if(i===0&&imgH[0])out.push(imgH[0]);if(i===1&&imgH[1])out.push(imgH[1]);if(i===2&&ytH)out.push(ytH);if(i===3&&imgH[2])out.push(imgH[2]);if(i===4&&imgH[3])out.push(imgH[3]);}else out.push(parts[i]);}final=out.join("");}else{final=(imgH[0]||"")+final+(imgH[1]||"")+ytH+imgH.slice(2).join("");}}
      }catch(me){console.warn("Media failed:",me);}

      setResult({...parsed,content:final});setStep(0);setProgress("");
    }catch(err){console.error(err);setError(err.message.includes("JSON")?"AI response parse failed. Try again.":err.message);setStep(0);setProgress("");}
    finally{setLoading(false);}
  },[apiKey,articleType,writingTone,productName,amazonUrl,keyFeatures,targetAudience,language,csvData,selectedRow,callAPI]);

  const cp=useCallback((k,v)=>{navigator.clipboard.writeText(v).then(()=>{setCopied(p=>({...p,[k]:true}));setTimeout(()=>setCopied(p=>({...p,[k]:false})),2000);});},[]);
  const cpAll=useCallback(()=>{if(!result)return;navigator.clipboard.writeText(JSON.stringify(result,null,2)).then(()=>{setCopied(p=>({...p,all:true}));setTimeout(()=>setCopied(p=>({...p,all:false})),2000);});},[result]);

  const meta=TYPE_META[articleType];const currentRow=csvData?.rows?.[selectedRow];

  const _={
    inp:{width:"100%",padding:"10px 13px",background:C.sa,border:`1px solid ${C.bd}`,borderRadius:8,color:C.tx,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .2s"},
    ta:{width:"100%",padding:"10px 13px",background:C.sa,border:`1px solid ${C.bd}`,borderRadius:8,color:C.tx,fontSize:13,outline:"none",resize:"vertical",minHeight:64,fontFamily:"inherit",boxSizing:"border-box",transition:"border-color .2s"},
    lbl:{fontSize:11,fontWeight:600,color:C.dm,textTransform:"uppercase",letterSpacing:".5px",marginBottom:6,display:"block"},
    sec:{background:C.sf,border:`1px solid ${C.bd}`,borderRadius:12,marginBottom:14,overflow:"hidden"},
    sh:{padding:"11px 18px",background:C.sa,borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"},
    sl:{fontSize:11,fontWeight:700,color:C.ac,textTransform:"uppercase",letterSpacing:".8px"},
    sb:{padding:18},
    typeBtn:(a,clr)=>({padding:"12px 8px",background:a?(clr||C.ac)+"16":C.sa,border:`2px solid ${a?clr||C.ac:C.bd}`,borderRadius:10,color:a?clr||C.ac:C.dm,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center",transition:"all .15s"}),
    toneBtn:(a)=>({padding:"11px 8px",background:a?C.as:C.sa,border:`1.5px solid ${a?C.ac:C.bd}`,borderRadius:9,color:a?C.ac:C.dm,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"center",transition:"all .15s"}),
    langBtn:(a)=>({padding:"10px 22px",background:a?C.ac:C.sa,color:a?"#fff":C.dm,border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}),
    cb:(ok)=>({padding:"4px 11px",background:ok?C.gb:"transparent",border:`1px solid ${ok?C.gn:C.bd}`,borderRadius:6,color:ok?C.gn:C.dm,fontSize:10,fontWeight:600,cursor:"pointer"}),
    ca:(ok)=>({padding:"7px 18px",background:ok?C.gb:C.as,border:`1px solid ${ok?C.gn:C.ac}`,borderRadius:8,color:ok?C.gn:C.ac,fontSize:11,fontWeight:700,cursor:"pointer"}),
    badge:(clr)=>({fontSize:9,padding:"3px 9px",background:(clr||C.ac)+"18",border:`1px solid ${(clr||C.ac)}50`,borderRadius:16,color:clr||C.ac,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px"}),
    tag:{padding:"3px 10px",background:C.as,border:`1px solid ${C.bd}`,borderRadius:16,fontSize:11,color:C.ac,fontWeight:500},
    sp:{display:"inline-block",width:16,height:16,border:`2px solid ${C.bd}`,borderTopColor:C.ac,borderRadius:"50%",animation:"spin .8s linear infinite",marginRight:8,verticalAlign:"middle"},
  };

  const Field=({label,val,k,html,tags})=>(<div style={_.sec}><div style={_.sh}><span style={_.sl}>{label}</span><button style={_.cb(copied[k])} onClick={()=>cp(k,tags?val.join(", "):val)}>{copied[k]?"\u2713 Copied":"Copy"}</button></div>{tags?<div style={{padding:14,display:"flex",flexWrap:"wrap",gap:5}}>{val.map((t,i)=><span key={i} style={_.tag}>{t}</span>)}</div>:html?<div className="ch" style={{padding:18,fontSize:13,lineHeight:1.7,maxHeight:500,overflowY:"auto"}} dangerouslySetInnerHTML={{__html:val}}/>:<div style={{padding:16,fontSize:13,lineHeight:1.5,wordBreak:"break-word"}}>{val}</div>}</div>);

  return(<div style={{minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans','Segoe UI',sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}input:focus,textarea:focus{border-color:${C.bf}!important}button:hover{filter:brightness(1.08)}.ch h2{font-size:16px;font-weight:700;margin:18px 0 8px;color:${C.tx}}.ch h3{font-size:14px;font-weight:600;margin:14px 0 6px}.ch p{margin:7px 0}.ch ul{padding-left:18px;margin:7px 0}.ch li{margin:3px 0}.ch strong{color:${C.ac}}.ch a{color:${C.ac};text-decoration:underline}.ch figure{margin:18px 0;text-align:center}.ch figure img{max-width:100%;height:auto;border-radius:8px;border:1px solid ${C.bd}}.ch figcaption{font-size:11px;color:${C.dm};margin-top:5px}.ch iframe{border-radius:8px}.ch table{width:100%;border-collapse:collapse;margin:14px 0;font-size:12px}.ch th,.ch td{padding:7px 10px;border:1px solid ${C.bd};text-align:left}.ch th{background:${C.sa};font-weight:600}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.bd};border-radius:2px}`}</style>

    {/* HEADER */}
    <div style={{background:C.sf,borderBottom:`1px solid ${C.bd}`,padding:"16px 24px"}}><div style={{maxWidth:980,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:8,background:C.gr,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff"}}>A</div><div><div style={{fontSize:16,fontWeight:700,letterSpacing:"-0.3px"}}>Affiliate Blog Generator</div><div style={{fontSize:10,color:C.dm}}>4-Pass Humanization: Draft → Rewrite → Perplexity → Media</div></div></div>{meta&&<span style={_.badge(meta.color)}>{meta.icon} {meta.label}</span>}</div></div>

    <div style={{maxWidth:980,margin:"0 auto",padding:"22px 24px"}}>
      {error&&<div style={{padding:"10px 14px",background:C.rb,border:`1px solid ${C.rd}`,borderRadius:8,color:C.rd,fontSize:12,marginBottom:14}}>{error}</div>}

      {/* 1. API KEY */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Anthropic API Key</span></div><div style={_.sb}><div style={{display:"flex",gap:8}}><input style={{..._.inp,flex:1,fontFamily:showKey?"inherit":"monospace",letterSpacing:showKey?0:2}} type={showKey?"text":"password"} placeholder="sk-ant-api03-..." value={apiKey} onChange={e=>setApiKey(e.target.value)}/><button style={{padding:"0 16px",background:C.sa,border:`1px solid ${C.bd}`,borderRadius:8,color:C.dm,fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}} onClick={()=>setShowKey(p=>!p)}>{showKey?"Hide":"Show"}</button></div><div style={{fontSize:10,color:C.dm,marginTop:5}}>Client-side only — sent directly to Anthropic, never stored.</div></div></div>

      {/* 2. ARTICLE TYPE + CSV */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Article Type</span></div><div style={_.sb}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>{Object.entries(TYPE_META).map(([k,m])=>(<button key={k} style={_.typeBtn(articleType===k,m.color)} onClick={()=>{setArticleType(k);clearCSV();}}><span style={{fontSize:20,display:"block",marginBottom:4}}>{m.icon}</span>{m.label}</button>))}</div>
        <div style={{marginTop:16,padding:"14px 16px",background:C.bg,borderRadius:10,border:`1px solid ${C.bd}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:csvData?10:8}}><div><span style={{fontSize:11,fontWeight:700,color:C.ac}}>Semrush CSV</span><span style={{fontSize:10,color:C.dm,marginLeft:8}}>Optional — <strong style={{color:C.t2}}>{meta.csv}</strong></span></div>{csvData&&<button style={{fontSize:10,color:C.rd,background:"none",border:"none",cursor:"pointer",fontWeight:600}} onClick={clearCSV}>✕ Remove</button>}</div>
          {!csvData?(<div style={{border:`2px dashed ${C.bd}`,borderRadius:10,padding:"24px 16px",textAlign:"center",cursor:"pointer",background:C.sf}} onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.ac}} onDragLeave={e=>{e.currentTarget.style.borderColor=C.bd}} onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.bd;const f=e.dataTransfer.files[0];if(f)handleCSV({target:{files:[f]}})}}><input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleCSV}/><div style={{fontSize:22,marginBottom:4}}>📄</div><div style={{fontSize:12,fontWeight:600,color:C.tx}}>Drop <span style={{color:meta.color}}>{meta.csv}</span> here</div><div style={{fontSize:10,color:C.dm,marginTop:3}}>or click to browse</div></div>):(<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:C.sf,borderRadius:8,border:`1px solid ${C.bd}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>📄</span><div><div style={{fontSize:12,fontWeight:600,color:C.tx}}>{csvFileName}</div><div style={{fontSize:10,color:C.gn,fontWeight:500}}>{csvData.rows.length} row(s)</div></div></div><span style={_.badge(C.gn)}>✓ Ready</span></div>
            {csvData.rows.length>1&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:10}}>{csvData.rows.map((r,i)=>(<button key={i} style={{padding:"5px 12px",background:selectedRow===i?C.as:C.sa,border:`1px solid ${selectedRow===i?C.ac:C.bd}`,borderRadius:7,color:selectedRow===i?C.ac:C.dm,fontSize:11,fontWeight:600,cursor:"pointer"}} onClick={()=>setSelectedRow(i)}>{r[csvData.headers[0]]||`Row ${i+1}`}</button>))}</div>}
            <div style={{marginTop:10,maxHeight:150,overflowY:"auto",fontSize:11}}>{currentRow&&Object.entries(currentRow).filter(([,v])=>v).map(([k,v])=>(<div key={k} style={{display:"flex",gap:8,padding:"3px 0",borderBottom:`1px solid ${C.bd}08`}}><span style={{fontWeight:600,color:C.ac,minWidth:160,fontSize:10,flexShrink:0}}>{k}</span><span style={{color:C.tx,fontSize:11,wordBreak:"break-word"}}>{v.length>100?v.slice(0,100)+"…":v}</span></div>))}</div>
          </div>)}
        </div>
      </div></div>

      {/* 3. WRITING TONE */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Writing Tone</span></div><div style={_.sb}><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>{tones.map(t=>(<button key={t.v} style={_.toneBtn(writingTone===t.v)} onClick={()=>setWritingTone(t.v)}><span style={{fontSize:18,display:"block",marginBottom:3}}>{t.i}</span>{t.l}</button>))}</div></div></div>

      {/* 4. PRODUCT NAME */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Product Name {!csvData&&<span style={{color:C.rd}}>*</span>}</span></div><div style={_.sb}><input style={_.inp} placeholder="e.g. Sony WH-1000XM5 Wireless Headphones" value={productName} onChange={e=>setProductName(e.target.value)}/>{csvData&&<div style={{fontSize:10,color:C.dm,marginTop:5}}>CSV data merges with this. Leave blank to use CSV product name.</div>}</div></div>

      {/* 5. AMAZON URL */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Amazon Affiliate URL</span></div><div style={_.sb}><input style={_.inp} placeholder="https://www.amazon.com/dp/B0XXXXXXXX?tag=yourtag-20" value={amazonUrl} onChange={e=>setAmazonUrl(e.target.value)}/></div></div>

      {/* 6. KEY FEATURES */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Key Features / Selling Points</span></div><div style={_.sb}><textarea style={_.ta} placeholder="e.g. Active noise cancellation, 30hr battery, multipoint Bluetooth, lightweight 245g..." value={keyFeatures} onChange={e=>setKeyFeatures(e.target.value)}/></div></div>

      {/* 7. TARGET AUDIENCE */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Target Audience</span></div><div style={_.sb}><input style={_.inp} placeholder="e.g. Frequent travelers, remote workers, audiophiles" value={targetAudience} onChange={e=>setTargetAudience(e.target.value)}/></div></div>

      {/* 8. CONTENT LANGUAGE */}
      <div style={_.sec}><div style={_.sh}><span style={_.sl}>Content Language</span></div><div style={_.sb}><div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.bd}`,width:"fit-content"}}><button style={_.langBtn(language==="english")} onClick={()=>setLanguage("english")}>English</button><button style={_.langBtn(language==="sinhala")} onClick={()=>setLanguage("sinhala")}>සිංහල</button></div><div style={{fontSize:10,color:C.dm,marginTop:5}}>{language==="sinhala"?"Article content සිංහලෙන්. Title/slug/meta/keywords English (SEO).":"Full article in English."}</div></div></div>

      {/* GENERATE */}
      <button style={{width:"100%",padding:"14px",background:loading?C.sa:C.gr,border:"none",borderRadius:10,color:loading?C.dm:"#fff",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",letterSpacing:".3px",marginBottom:16}} onClick={generate} disabled={loading}>{loading?<><span style={_.sp}/>Generating {meta.label}...</>:`⚡ Generate ${meta.label}`}</button>

      {/* PROGRESS — 4 steps */}
      {loading&&(<div style={{..._.sec,marginBottom:16}}><div style={{padding:24,textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:10,marginBottom:16}}>
          {[{n:1,l:"Draft"},{n:2,l:"Humanize"},{n:3,l:"Perplexity"},{n:4,l:"Media"}].map((s,i)=>{const done=s.n<step,act=s.n===step;return(<div key={s.n} style={{display:"flex",alignItems:"center",gap:10}}><div style={{textAlign:"center"}}><div style={{width:32,height:32,borderRadius:"50%",background:act?C.gr:done?C.gb:C.sa,border:`2px solid ${act?C.ac:done?C.gn:C.bd}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",fontSize:11,fontWeight:700,color:act?"#fff":done?C.gn:C.dm}}>{done?"✓":s.n}</div><div style={{fontSize:9,fontWeight:600,color:act?C.ac:done?C.gn:C.dm}}>{s.l}</div></div>{i<3&&<div style={{width:20,height:2,background:done?C.gn:C.bd,marginBottom:16}}/>}</div>);})}
        </div>
        <p style={{fontSize:13,fontWeight:500,color:C.tx}}>{progress}</p>
        <p style={{fontSize:10,color:C.dm,marginTop:4}}>4-pass pipeline — approximately 2-3 minutes</p>
      </div></div>)}

      {/* RESULTS */}
      {result&&(<div style={{marginTop:4,animation:"fadeUp .4s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:700}}><span style={{color:C.gn}}>✓</span> Humanized Article <span style={_.badge(C.gn)}>4-Pass + Media</span></div><button style={_.ca(copied.all)} onClick={cpAll}>{copied.all?"✓ All Copied":"Copy All JSON"}</button></div>
        <Field label="Title" val={result.title} k="title"/>
        <Field label="Slug" val={result.slug} k="slug"/>
        <Field label="Meta Description" val={result.metaDescription} k="meta"/>
        <Field label="Keywords (Meta Tag)" val={result.keywords} k="keywords"/>
        <Field label="Tags" val={result.tags||[]} k="tags" tags/>
        <Field label="Article Content (Preview)" val={result.content} k="content" html/>
        <div style={_.sec}><div style={_.sh}><span style={_.sl}>Raw HTML — Copy to Admin Panel</span><button style={_.cb(copied.raw)} onClick={()=>cp("raw",result.content)}>{copied.raw?"✓ Copied":"Copy HTML"}</button></div><div style={{padding:14,fontSize:10,fontFamily:"monospace",color:C.dm,maxHeight:220,overflowY:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all",lineHeight:1.5}}>{result.content}</div></div>
      </div>)}
    </div>
  </div>);
}