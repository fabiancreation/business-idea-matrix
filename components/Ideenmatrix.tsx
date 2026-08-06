"use client";
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

// ─── Theme ───────────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: "linear-gradient(170deg, #0a0a1a 0%, #111128 40%, #0d0d22 100%)",
    text: "#e8e8f0",
    textMuted: "#999",
    textFaint: "#666",
    textGhost: "#444",
    cardBg: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.06)",
    inputBorder: "#333",
    inputColor: "#fff",
    inputDescColor: "#777",
    scoreDivider: "#222",
    barTrack: "#1a1a2e",
    starOff: "#3a3a4a",
    btnBg: "rgba(255,255,255,0.04)",
    btnBorder: "rgba(255,255,255,0.08)",
    btnColor: "#aaa",
    btnSecBg: "rgba(255,255,255,0.05)",
    btnSecBorder: "rgba(255,255,255,0.08)",
    btnSecColor: "#888",
    addCardBg: "rgba(255,255,255,0.02)",
    addCardBorder: "rgba(255,255,255,0.08)",
    addCardColor: "#555",
    weightBg: "rgba(255,255,255,0.03)",
    weightBorder: "rgba(255,255,255,0.06)",
    weightInputBg: "#1a1a2e",
    weightInputBorder: "#333",
    scoreSecondary: "#555",
    chartLabel: "#ccc",
  },
  light: {
    bg: "linear-gradient(170deg, #f5f5fa 0%, #eeeef6 40%, #f0f0f8 100%)",
    text: "#1a1a2e",
    textMuted: "#666",
    textFaint: "#999",
    textGhost: "#bbb",
    cardBg: "rgba(255,255,255,0.85)",
    cardBorder: "rgba(0,0,0,0.08)",
    inputBorder: "#ddd",
    inputColor: "#1a1a2e",
    inputDescColor: "#888",
    scoreDivider: "#e8e8ee",
    barTrack: "#e8e8f0",
    starOff: "#d0d0d8",
    btnBg: "rgba(0,0,0,0.03)",
    btnBorder: "rgba(0,0,0,0.10)",
    btnColor: "#666",
    btnSecBg: "rgba(0,0,0,0.03)",
    btnSecBorder: "rgba(0,0,0,0.10)",
    btnSecColor: "#777",
    addCardBg: "rgba(0,0,0,0.01)",
    addCardBorder: "rgba(0,0,0,0.10)",
    addCardColor: "#aaa",
    weightBg: "rgba(0,0,0,0.02)",
    weightBorder: "rgba(0,0,0,0.06)",
    weightInputBg: "#fff",
    weightInputBorder: "#ddd",
    scoreSecondary: "#aaa",
    chartLabel: "#555",
  },
};

type ThemeKey = keyof typeof themes;
type Theme = typeof themes.dark;

// ─── i18n ────────────────────────────────────────────────────────────────────
const T = {
  de: {
    title: "Ideenmatrix",
    subtitle: "Entscheidungsfinder",
    tagline: "Bewerte deine Business-Ideen. Finde deinen Favoriten.",
    addIdea: "+ Idee hinzufügen",
    ideaName: "Idee benennen",
    ideaDesc: "Kurzbeschreibung …",
    total: "Gesamt",
    go: "GO",
    goMicro: "GO – wenn Mikrotest positiv",
    park: "PARKEN",
    weights: "Gewichte anpassen",
    hideWeights: "Gewichte ausblenden",
    comparison: "Vergleich",
    shareLink: "Link kopiert!",
    share: "Ergebnisse teilen",
    reset: "Zurücksetzen",
    maxScore: "Max. erreichbar",
    criteria: [
      { name: "Founder Fit", tip: "Wie gut passt die Idee zu deinen Skills, deiner Erfahrung und deiner Leidenschaft?" },
      { name: "Schmerz & Zahlungsbereitschaft", tip: "Wie groß ist das Problem und wie bereitwillig zahlt die Zielgruppe dafür?" },
      { name: "Zielgruppen‑Zugang", tip: "Wie leicht erreichst du deine ersten Kunden?" },
      { name: "Geschwindigkeit (<14 Tage)", tip: "Kannst du in unter 14 Tagen ein MVP liefern?" },
      { name: "Lieferbarkeit & Einfachheit", tip: "Wie einfach ist die Umsetzung?" },
      { name: "Differenzierung", tip: "Was ist dein unfairer Vorteil gegenüber der Konkurrenz?" },
      { name: "Preis‑ & Marge‑Potenzial", tip: "Wie hoch ist die mögliche Gewinnmarge?" },
      { name: "Regulatorik / Risiko", tip: "Wenig regulatorische Hürden? (5 = kaum Risiko)" },
    ],
  },
  en: {
    title: "Idea Matrix",
    subtitle: "Decision Finder",
    tagline: "Rate your business ideas. Find your winner.",
    addIdea: "+ Add idea",
    ideaName: "Name your idea",
    ideaDesc: "Short description …",
    total: "Total",
    go: "GO",
    goMicro: "GO – if micro-test positive",
    park: "PARK",
    weights: "Edit weights",
    hideWeights: "Hide weights",
    comparison: "Comparison",
    shareLink: "Link copied!",
    share: "Share results",
    reset: "Reset",
    maxScore: "Max. achievable",
    criteria: [
      { name: "Founder Fit", tip: "How well does this idea match your skills, experience, and passion?" },
      { name: "Pain & Willingness to Pay", tip: "How big is the problem and how willing is the audience to pay?" },
      { name: "Target Audience Access", tip: "How easily can you reach your first customers?" },
      { name: "Speed (<14 days)", tip: "Can you deliver an MVP in under 14 days?" },
      { name: "Deliverability & Simplicity", tip: "How simple is the implementation?" },
      { name: "Differentiation", tip: "What's your unfair advantage over competitors?" },
      { name: "Price & Margin Potential", tip: "How high is the possible profit margin?" },
      { name: "Regulatory / Risk", tip: "Few regulatory hurdles? (5 = barely any risk)" },
    ],
  },
};

type LangKey = keyof typeof T;

const DEFAULT_WEIGHTS = [2.0, 2.0, 1.5, 1.5, 1.0, 1.0, 1.0, 0.5];

const COLORS = [
  "#E8572A", "#2A7DE8", "#2AE857", "#E8D02A", "#A32AE8", "#E82A8C", "#2AE8D0",
];

const FONT_HEADING = "'Lexend Deca', 'Helvetica Neue', sans-serif";
const FONT_BODY = "'proxima-nova', 'Proxima Nova', 'Helvetica Neue', sans-serif";

interface Idea {
  id: string;
  name: string;
  desc: string;
  ratings: number[];
}

const emptyIdea = (): Idea => ({
  id: Math.random().toString(36).slice(2, 9),
  name: "",
  desc: "",
  ratings: Array(8).fill(0),
});

// ─── Confetti ────────────────────────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particles = useRef<Array<{x:number;y:number;vx:number;vy:number;size:number;color:string;rotation:number;rotSpeed:number;life:number}>>([]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    particles.current = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2, y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.7) * 10,
      size: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10,
      life: 1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.25;
        p.rotation += p.rotSpeed; p.life -= 0.012;
        if (p.life <= 0) return;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }} />;
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange, color, theme }: { value: number; onChange: (v: number) => void; color: string; theme: Theme }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 20, lineHeight: 1, padding: "2px 1px",
            color: star <= (hover || value) ? color : theme.starOff,
            transition: "color 0.15s, transform 0.15s",
            transform: star <= hover ? "scale(1.2)" : "scale(1)",
          }}
          aria-label={`${star} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({ text, theme, children }: { text: string; theme: Theme; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canHoverRef = useRef(false);

  useEffect(() => {
    canHoverRef.current = window.matchMedia("(hover: hover)").matches;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [open]);

  return (
    <span
      ref={wrapRef}
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => { if (!canHoverRef.current) setOpen((o) => !o); }}
      style={{
        fontSize: 12, color: theme.textMuted, cursor: "help", flex: 1,
        fontFamily: FONT_BODY, position: "relative", outline: "none",
      }}
    >
      {children}
      <div role="tooltip" aria-hidden={!open} style={{
        position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 1000,
        maxWidth: 220, width: "max-content", padding: "8px 10px",
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: 8, color: theme.text, fontSize: 11, lineHeight: 1.4,
        fontWeight: 400, fontFamily: FONT_BODY, whiteSpace: "normal",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        opacity: open ? 1 : 0, pointerEvents: "none",
        transform: open ? "translateY(0) scale(1)" : "translateY(4px) scale(0.96)",
        transformOrigin: "bottom left",
        transition: "opacity 0.2s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        {text}
        <span style={{
          position: "absolute", top: "100%", left: 14, width: 8, height: 8,
          background: theme.cardBg,
          borderRight: `1px solid ${theme.cardBorder}`,
          borderBottom: `1px solid ${theme.cardBorder}`,
          transform: "rotate(45deg) translateY(-4px)",
        }} />
      </div>
    </span>
  );
}

// ─── Verdict Badge ───────────────────────────────────────────────────────────
function VerdictBadge({ score, lang, weights }: { score: number; lang: LangKey; weights: number[] }) {
  const maxPossible = weights.reduce((s, w) => s + w * 5, 0);
  const goThresh = maxPossible * (40 / 52.5);
  const microThresh = maxPossible * (32 / 52.5);
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const prevVerdict = useRef<string | null>(null);
  const t = T[lang];

  let verdict: string, bg: string, emoji: string;
  if (score >= goThresh) {
    verdict = t.go; bg = "linear-gradient(135deg, #0d9b4a, #15c361)"; emoji = "🚀";
  } else if (score >= microThresh) {
    verdict = t.goMicro; bg = "linear-gradient(135deg, #d4930a, #f0b429)"; emoji = "🧪";
  } else {
    verdict = t.park; bg = "linear-gradient(135deg, #555, #777)"; emoji = "⏸️";
  }

  useEffect(() => {
    if (score === 0) { setShow(false); prevVerdict.current = null; return; }
    setShow(false);
    const timer = setTimeout(() => {
      setShow(true);
      if (score >= goThresh && prevVerdict.current !== "go") {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      }
      prevVerdict.current = score >= goThresh ? "go" : score >= microThresh ? "micro" : "park";
    }, 100);
    return () => clearTimeout(timer);
  }, [score, goThresh, microThresh]);

  if (score === 0) return <div style={{ height: 44 }} />;

  return (
    <div style={{ position: "relative", overflow: "visible" }}>
      <ConfettiBurst active={confetti} />
      <div style={{
        background: bg, color: "#fff", padding: "8px 16px", borderRadius: 8,
        fontSize: 13, fontWeight: 700, fontFamily: FONT_BODY,
        textAlign: "center", letterSpacing: "0.04em",
        opacity: show ? 1 : 0,
        transform: show ? "scale(1) translateY(0)" : "scale(0.7) translateY(8px)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {emoji} {verdict}
      </div>
    </div>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function ComparisonChart({ ideas, weights, lang, theme }: { ideas: Idea[]; weights: number[]; lang: LangKey; theme: Theme }) {
  const t = T[lang];
  const maxPossible = weights.reduce((s, w) => s + w * 5, 0);
  const scored = ideas
    .map((idea, i) => ({
      name: idea.name || `${lang === "de" ? "Idee" : "Idea"} ${i + 1}`,
      score: idea.ratings.reduce((sum, r, ci) => sum + r * weights[ci], 0),
      color: COLORS[i % COLORS.length],
    }))
    .filter((s) => s.score > 0);

  if (scored.length === 0) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{
        fontFamily: FONT_HEADING, fontSize: 20, fontWeight: 700,
        color: theme.text, marginBottom: 16,
      }}>
        {"📊"} {t.comparison}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {scored.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 100, fontSize: 13, fontWeight: 600, color: theme.chartLabel,
              textAlign: "right", flexShrink: 0, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT_BODY,
            }}>
              {item.name}
            </div>
            <div style={{
              flex: 1, height: 32, background: theme.barTrack,
              borderRadius: 6, overflow: "hidden", position: "relative",
            }}>
              <div style={{
                width: `${(item.score / maxPossible) * 100}%`, height: "100%",
                background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                borderRadius: 6, transition: "width 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: FONT_BODY,
                  color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}>
                  {item.score.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 100, fontSize: 11, color: theme.textGhost,
            textAlign: "right", flexShrink: 0, fontFamily: FONT_BODY,
          }}>
            {t.maxScore}
          </div>
          <div style={{
            flex: 1, height: 1,
            background: `repeating-linear-gradient(90deg, ${theme.textGhost}, ${theme.textGhost} 4px, transparent 4px, transparent 8px)`,
          }} />
          <span style={{ fontSize: 11, color: theme.textGhost, fontFamily: FONT_BODY }}>
            {maxPossible.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Share / URL State ───────────────────────────────────────────────────────
function encodeState(ideas: Idea[], weights: number[], lang: string, mode: string) {
  const data = { l: lang, m: mode, w: weights, i: ideas.map((idea) => ({ n: idea.name, d: idea.desc, r: idea.ratings })) };
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

function decodeState(hash: string) {
  try {
    const json = JSON.parse(decodeURIComponent(atob(hash)));
    return {
      lang: (json.l || "de") as LangKey,
      mode: (json.m || "light") as ThemeKey,
      weights: json.w as number[] || [...DEFAULT_WEIGHTS],
      ideas: json.i.map((item: { n: string; d: string; r: number[] }) => ({ ...emptyIdea(), name: item.n, desc: item.d, ratings: item.r })),
    };
  } catch { return null; }
}

// ─── Theme Toggle ────────────────────────────────────────────────────────────
function ThemeToggle({ mode, setMode }: { mode: ThemeKey; setMode: (m: ThemeKey) => void }) {
  return (
    <button
      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
      style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: 20, padding: "4px 8px", lineHeight: 1,
        transition: "transform 0.3s",
        transform: mode === "light" ? "rotate(0deg)" : "rotate(180deg)",
      }}
      aria-label="Toggle theme"
    >
      {mode === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function Ideenmatrix() {
  const [lang, setLang] = useState<LangKey>("de");
  const [mode, setMode] = useState<ThemeKey>("light");
  const [ideas, setIdeas] = useState<Idea[]>([emptyIdea(), emptyIdea()]);
  const [weights, setWeights] = useState([...DEFAULT_WEIGHTS]);
  const [showWeights, setShowWeights] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const th = themes[mode];

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const state = decodeState(hash);
      if (state) { setLang(state.lang); setMode(state.mode); setWeights(state.weights); setIdeas(state.ideas); }
    }
    setTimeout(() => setLoaded(true), 50);
  }, []);

  const t = T[lang];

  const updateIdea = useCallback((id: string, field: keyof Idea, value: string) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, [field]: value } : idea)));
  }, []);

  const updateRating = useCallback((id: string, ci: number, value: number) => {
    setIdeas((prev) => prev.map((idea) => {
      if (idea.id !== id) return idea;
      const nr = [...idea.ratings]; nr[ci] = value;
      return { ...idea, ratings: nr };
    }));
  }, []);

  const addIdea = () => { if (ideas.length < 7) setIdeas((p) => [...p, emptyIdea()]); };
  const removeIdea = (id: string) => { if (ideas.length > 1) setIdeas((p) => p.filter((i) => i.id !== id)); };

  const resetAll = () => {
    setIdeas([emptyIdea(), emptyIdea()]);
    setWeights([...DEFAULT_WEIGHTS]);
    setShowWeights(false);
    window.location.hash = "";
  };

  const handleShare = () => {
    const hash = encodeState(ideas, weights, lang, mode);
    window.location.hash = hash;
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const calcScore = (idea: Idea) => idea.ratings.reduce((sum, r, i) => sum + r * weights[i], 0);

  return (
    <div style={{
      minHeight: "100vh", background: th.bg, color: th.text,
      fontFamily: FONT_BODY, padding: "24px 16px 80px",
      opacity: loaded ? 1 : 0, transition: "opacity 0.5s, background 0.4s, color 0.4s",
    }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://use.typekit.net/iff8jht.css" rel="stylesheet" />

      {/* ─── Header ─────────────────────────────────────── */}
      <header style={{ maxWidth: 900, margin: "0 auto 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 16, alignItems: "center" }}>
          <ThemeToggle mode={mode} setMode={setMode} />
          <div style={{ width: 1, height: 20, background: th.cardBorder, margin: "0 4px" }} />
          {(["de", "en"] as LangKey[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang === l ? "#E8572A" : th.btnBg,
              color: lang === l ? "#fff" : th.btnColor,
              border: `1px solid ${lang === l ? "#E8572A" : th.btnBorder}`,
              borderRadius: 6, padding: "5px 14px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              fontFamily: FONT_BODY,
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <h1 style={{
          fontFamily: FONT_HEADING,
          fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg, #E8572A, #f0a030)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
        }}>
          {t.title}
        </h1>
        <p style={{
          fontFamily: FONT_HEADING, fontSize: "clamp(14px, 2.5vw, 18px)",
          color: th.textMuted, fontWeight: 600, margin: "4px 0 0",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          {t.subtitle}
        </p>
        <p style={{ fontSize: 14, color: th.textFaint, marginTop: 8, fontFamily: FONT_BODY }}>
          {t.tagline}
        </p>
      </header>

      {/* ─── Weights Editor ─────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto 20px" }}>
        <button onClick={() => setShowWeights(!showWeights)} style={{
          background: th.btnBg, border: `1px solid ${th.btnBorder}`,
          color: th.btnColor, borderRadius: 8, padding: "8px 18px",
          fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
          fontFamily: FONT_BODY,
        }}>
          {"⚙️"} {showWeights ? t.hideWeights : t.weights}
        </button>

        {showWeights && (
          <div style={{
            marginTop: 12, background: th.weightBg, border: `1px solid ${th.weightBorder}`,
            borderRadius: 12, padding: 20,
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12,
          }}>
            {t.criteria.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: th.textMuted, flex: 1, fontFamily: FONT_BODY }}>{c.name}</span>
                <input
                  type="number" min="0" max="3" step="0.5" value={weights[i]}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setWeights((p) => { const nw = [...p]; nw[i] = Math.min(3, Math.max(0, v)); return nw; });
                  }}
                  style={{
                    width: 52, background: th.weightInputBg,
                    border: `1px solid ${th.weightInputBorder}`, borderRadius: 6,
                    color: th.inputColor, padding: "4px 8px", fontSize: 13,
                    textAlign: "center", fontFamily: FONT_BODY,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Idea Cards ─────────────────────────────────── */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20,
      }}>
        {ideas.map((idea, ideaIdx) => {
          const score = calcScore(idea);
          const maxPossible = weights.reduce((s, w) => s + w * 5, 0);
          const pct = maxPossible > 0 ? (score / maxPossible) * 100 : 0;
          const color = COLORS[ideaIdx % COLORS.length];

          return (
            <div key={idea.id} style={{
              background: th.cardBg, border: `1px solid ${score > 0 ? color + "40" : th.cardBorder}`,
              borderRadius: 16, padding: 24, position: "relative",
              transition: "border-color 0.3s, box-shadow 0.3s, background 0.4s",
              boxShadow: score > 0 ? `0 4px 30px ${color}15` : "none",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.7, borderRadius: "16px 16px 0 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{
                  fontFamily: FONT_HEADING, fontSize: 13, fontWeight: 700,
                  color: color, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {lang === "de" ? "Idee" : "Idea"} {ideaIdx + 1}
                </span>
                {ideas.length > 1 && (
                  <button onClick={() => removeIdea(idea.id)} style={{
                    background: "none", border: "none", color: th.textFaint,
                    fontSize: 14, cursor: "pointer", padding: "2px 6px", lineHeight: 1,
                  }}>
                    ×
                  </button>
                )}
              </div>

              <input
                value={idea.name}
                onChange={(e) => updateIdea(idea.id, "name", e.target.value)}
                placeholder={t.ideaName}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  borderBottom: `1px solid ${th.inputBorder}`, color: th.inputColor,
                  fontSize: 17, fontWeight: 700, padding: "4px 0 8px",
                  marginBottom: 6, outline: "none", fontFamily: FONT_BODY,
                  boxSizing: "border-box",
                }}
              />
              <input
                value={idea.desc}
                onChange={(e) => updateIdea(idea.id, "desc", e.target.value)}
                placeholder={t.ideaDesc}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  color: th.inputDescColor, fontSize: 12, padding: "2px 0 12px",
                  outline: "none", fontFamily: FONT_BODY, boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {t.criteria.map((c, ci) => (
                  <div key={ci}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Tooltip text={c.tip} theme={th}>
                        {c.name}
                        {weights[ci] >= 2 && (
                          <span style={{ color: "#E8572A", marginLeft: 4, fontSize: 10 }}>x{weights[ci]}</span>
                        )}
                      </Tooltip>
                      <StarRating
                        value={idea.ratings[ci]}
                        onChange={(val) => updateRating(idea.id, ci, val)}
                        color={color} theme={th}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${th.scoreDivider}` }}>
                <div style={{ height: 6, background: th.barTrack, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{
                    width: `${pct}%`, height: "100%",
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    borderRadius: 3, transition: "width 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                  }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: th.textFaint, fontFamily: FONT_BODY }}>{t.total}</span>
                  <span style={{
                    fontFamily: FONT_HEADING, fontSize: 24, fontWeight: 800,
                    color: score > 0 ? color : th.textGhost, transition: "color 0.3s",
                  }}>
                    {score.toFixed(1)}
                    <span style={{ fontSize: 12, fontWeight: 400, color: th.scoreSecondary, fontFamily: FONT_BODY }}>
                      {" "}/ {maxPossible.toFixed(1)}
                    </span>
                  </span>
                </div>

                <VerdictBadge score={score} lang={lang} weights={weights} />
              </div>
            </div>
          );
        })}

        {ideas.length < 7 && (
          <button onClick={addIdea} style={{
            background: th.addCardBg, border: `2px dashed ${th.addCardBorder}`,
            borderRadius: 16, minHeight: 200, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            color: th.addCardColor, fontSize: 15, fontWeight: 600,
            transition: "all 0.2s", fontFamily: FONT_BODY,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,87,42,0.3)"; e.currentTarget.style.color = "#E8572A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = th.addCardBorder; e.currentTarget.style.color = th.addCardColor; }}
          >
            {t.addIdea}
          </button>
        )}
      </div>

      {/* ─── Comparison Chart ───────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <ComparisonChart ideas={ideas} weights={weights} lang={lang} theme={th} />
      </div>

      {/* ─── Actions ────────────────────────────────────── */}
      <div style={{
        maxWidth: 900, margin: "32px auto 0",
        display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center",
      }}>
        <button onClick={handleShare} style={{
          background: copied ? "#15c361" : "linear-gradient(135deg, #E8572A, #d44a1f)",
          color: "#fff", border: "none", borderRadius: 10,
          padding: "10px 24px", fontSize: 14, fontWeight: 700,
          cursor: "pointer", transition: "all 0.3s", fontFamily: FONT_BODY,
        }}>
          {copied ? "✓ " + t.shareLink : "🔗 " + t.share}
        </button>
        <button onClick={resetAll} style={{
          background: th.btnSecBg, color: th.btnSecColor,
          border: `1px solid ${th.btnSecBorder}`, borderRadius: 10,
          padding: "10px 24px", fontSize: 14, fontWeight: 600,
          cursor: "pointer", transition: "all 0.2s", fontFamily: FONT_BODY,
        }}>
          {"↺"} {t.reset}
        </button>
      </div>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer style={{
        maxWidth: 900, margin: "48px auto 0", textAlign: "center",
        fontSize: 11, color: th.textGhost, fontFamily: FONT_BODY,
      }}>
        {lang === "de"
          ? "Bewertungsskala: 1 = schwach · 5 = hervorragend · Gewichte bestimmen die Bedeutung jedes Kriteriums"
          : "Rating scale: 1 = weak · 5 = excellent · Weights determine each criterion's importance"}
      </footer>
    </div>
  );
}
