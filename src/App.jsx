import { useState, useEffect } from "react";

const SUBJECTS = [
  { id: "maths",    label: "Mathématiques",   icon: "📐", color: "#60A5FA", glow: "rgba(96,165,250,0.4)"  },
  { id: "francais", label: "Français",         icon: "📚", color: "#A78BFA", glow: "rgba(167,139,250,0.4)" },
  { id: "histoire", label: "Histoire-Géo",     icon: "🌍", color: "#34D399", glow: "rgba(52,211,153,0.4)"  },
  { id: "svt",      label: "SVT",              icon: "🔬", color: "#FBBF24", glow: "rgba(251,191,36,0.4)"  },
  { id: "physique", label: "Physique-Chimie",  icon: "⚗️", color: "#F87171", glow: "rgba(248,113,113,0.4)" },
  { id: "anglais",  label: "Anglais",          icon: "🗣️", color: "#F472B6", glow: "rgba(244,114,182,0.4)" },
  { id: "emc",      label: "EMC",              icon: "⚖️", color: "#22D3EE", glow: "rgba(34,211,238,0.4)"  },
  { id: "techno",   label: "Technologie",      icon: "🖥️", color: "#FB923C", glow: "rgba(251,146,60,0.4)"  },
];

const CHAPTERS = {
  maths:    ["Géométrie plane","Calcul littéral","Statistiques & Probabilités","Fonctions","Calcul numérique","Pythagore & Thalès","Trigonométrie","Volumes & Aires"],
  francais: ["Grammaire","Orthographe & Conjugaison","Lecture & Compréhension","Expression écrite","Figures de style","Textes argumentatifs"],
  histoire: ["1ère Guerre Mondiale","2ème Guerre Mondiale","Guerre Froide","Décolonisation","La Ve République","Mondialisation","Géographie urbaine"],
  svt:      ["Génétique & Hérédité","Évolution des espèces","Corps humain & Santé","Écosystèmes","Géologie","Reproduction"],
  physique: ["Mécanique","Électricité","Optique","Chimie organique","Atomes & Molécules","Énergie & Puissance"],
  anglais:  ["Grammaire","Vocabulaire thématique","Compréhension écrite","Expression écrite","Temps & Conjugaison"],
  emc:      ["Démocratie & Citoyenneté","Droits & Libertés","Laïcité","Institutions françaises","Engagement citoyen"],
  techno:   ["Programmation & Algorithmes","Systèmes techniques","Réseaux & Internet","Développement durable","Projet technologique"],
};

const SYSTEM_PROMPT = `Tu es un professeur bienveillant qui aide des élèves de 3ème à réviser le brevet des collèges (DNB) en France.
Réponds UNIQUEMENT en JSON valide, sans balises markdown ni backticks.`;

const buildQuizPrompt = (subject, chapter) =>
  `Génère exactement 5 questions de quiz à choix multiples sur "${subject}"${chapter ? ` — chapitre : "${chapter}"` : " (sujets les plus susceptibles de tomber au brevet, tous chapitres)"} pour le brevet.
Niveau 3ème, programme officiel français.
Réponds UNIQUEMENT en JSON (sans markdown):
{"questions":[{"question":"...","choices":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}]}`;

const buildLongPrompt = (subject, chapter) =>
  `Génère 1 question ouverte de type brevet sur "${subject}"${chapter ? ` — chapitre : "${chapter}"` : " (parmi les sujets les plus probables au brevet)"} pour un élève de 3ème.
Réponds UNIQUEMENT en JSON (sans markdown):
{"question":"...","context":"...","correction":"...","points_cles":["...","...","..."]}`;

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map((b) => b.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─────────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --amber: #FBBF24;
    --amber-glow: rgba(251,191,36,0.35);
    --amber-dark: #92400E;
    --bg: #0E0C1E;
    --bg2: #13102A;
    --surface: rgba(255,255,255,0.06);
    --surface-hover: rgba(255,255,255,0.1);
    --border: rgba(255,255,255,0.12);
    --border-hover: rgba(255,255,255,0.28);
    --text: #F0EEFF;
    --muted: rgba(230,220,255,0.45);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
  }

  /* ── Animated background ── */
  .app {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center;
    padding: 28px 16px 72px;
    position: relative; overflow: hidden;
  }

  .bg-grid {
    position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
  }

  .orb {
    position: fixed; border-radius: 50%;
    filter: blur(70px); pointer-events: none; z-index: 0;
    animation: drift 18s ease-in-out infinite alternate;
  }
  .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #7C3AED 0%, transparent 70%); opacity: 0.22; top: -200px; left: -150px; animation-duration: 20s; }
  .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #F59E0B 0%, transparent 70%); opacity: 0.18; bottom: -150px; right: -100px; animation-duration: 25s; animation-delay: -8s; }
  .orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, #06B6D4 0%, transparent 70%); opacity: 0.14; top: 40%; left: 55%; transform: translate(-50%,-50%); animation-duration: 15s; animation-delay: -4s; }
  .orb-4 { width: 300px; height: 300px; background: radial-gradient(circle, #EC4899 0%, transparent 70%); opacity: 0.12; top: 20%; right: 5%; animation-duration: 22s; animation-delay: -12s; }

  @keyframes drift {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(30px, -40px) scale(1.05); }
    66%  { transform: translate(-20px, 20px) scale(0.97); }
    100% { transform: translate(15px, -15px) scale(1.02); }
  }

  .container { position: relative; z-index: 1; width: 100%; max-width: 680px; }

  /* ── Header ── */
  .header { text-align: center; margin-bottom: 40px; }

  .badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.08));
    border: 1px solid rgba(251,191,36,0.45);
    color: var(--amber); font-size: 11px; font-weight: 700;
    letter-spacing: 2.5px; text-transform: uppercase;
    padding: 6px 16px; border-radius: 999px; margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .badge-dot { width: 6px; height: 6px; background: var(--amber); border-radius: 50%; box-shadow: 0 0 6px var(--amber); animation: pulse-dot 2s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }

  .header h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(34px, 7vw, 56px);
    font-weight: 800; line-height: 1.0; letter-spacing: -2px;
    margin-bottom: 12px;
  }
  .header h1 .plain { color: #E8E0FF; }
  .header h1 .accent {
    background: linear-gradient(135deg, #FBBF24 0%, #F97316 50%, #FB923C 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    filter: drop-shadow(0 0 20px rgba(251,191,36,0.4));
  }
  .header p { color: var(--muted); font-size: 14px; letter-spacing: 0.2px; }

  /* ── Section label ── */
  .section-title {
    font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
    color: rgba(200,190,255,0.4); margin-bottom: 14px; font-weight: 600;
  }

  /* ── Subject Grid ── */
  .subject-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  @media (max-width: 480px) { .subject-grid { grid-template-columns: repeat(2, 1fr); } }

  .subject-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 18px; padding: 20px 12px;
    cursor: pointer; text-align: center;
    transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), background 0.15s, border-color 0.15s, box-shadow 0.18s;
    box-shadow: 0 4px 0 rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3);
    user-select: none; position: relative; overflow: hidden;
  }
  .subject-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 17px;
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%);
    pointer-events: none;
  }
  .subject-card:hover {
    background: var(--surface-hover); transform: translateY(-5px) scale(1.02);
    box-shadow: 0 8px 0 rgba(0,0,0,0.45), 0 16px 40px rgba(0,0,0,0.35);
  }
  .subject-card:active {
    transform: translateY(3px) scale(0.97) !important;
    box-shadow: 0 1px 0 rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3) !important;
    transition-duration: 0.07s !important;
  }
  .subject-icon { font-size: 30px; margin-bottom: 9px; line-height: 1; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)); }
  .subject-label { font-size: 12px; font-weight: 600; color: rgba(230,220,255,0.85); line-height: 1.3; }

  /* ── Setup pill ── */
  .setup-pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 999px; border: 2px solid;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800;
    margin-bottom: 28px; position: relative;
  }

  /* ── Training cards ── */
  .training-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  @media (max-width: 480px) { .training-grid { grid-template-columns: 1fr; } }

  .training-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 20px; padding: 24px 18px; cursor: pointer; text-align: center;
    transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), background 0.15s, border-color 0.15s, box-shadow 0.18s;
    box-shadow: 0 5px 0 rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.3);
    user-select: none; position: relative; overflow: hidden;
  }
  .training-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 19px;
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 55%);
    pointer-events: none;
  }
  .training-card:hover { background: var(--surface-hover); transform: translateY(-4px); box-shadow: 0 9px 0 rgba(0,0,0,0.45), 0 20px 48px rgba(0,0,0,0.35); }
  .training-card:active { transform: translateY(4px) scale(0.98) !important; box-shadow: 0 1px 0 rgba(0,0,0,0.5) !important; transition-duration: 0.07s !important; }
  .training-icon { font-size: 38px; margin-bottom: 10px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4)); }
  .training-label { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; margin-bottom: 6px; line-height: 1.3; color: #EDE9FF; }
  .training-desc { font-size: 12px; color: var(--muted); line-height: 1.55; }

  /* ── Chapter chips ── */
  .chapter-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .chapter-chip {
    padding: 8px 15px; border-radius: 10px;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(220,210,255,0.7);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: transform 0.14s cubic-bezier(.34,1.56,.64,1), background 0.12s, border-color 0.12s, box-shadow 0.14s, color 0.12s;
    box-shadow: 0 3px 0 rgba(0,0,0,0.45); user-select: none;
  }
  .chapter-chip:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); transform: translateY(-2px); box-shadow: 0 5px 0 rgba(0,0,0,0.4); color: #fff; }
  .chapter-chip:active { transform: translateY(2px) scale(0.97) !important; box-shadow: 0 1px 0 rgba(0,0,0,0.45) !important; transition-duration: 0.06s !important; }

  /* ── Mode cards ── */
  .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 22px; }
  @media (max-width: 480px) { .mode-grid { grid-template-columns: 1fr; } }
  .mode-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 18px; padding: 20px 16px; cursor: pointer;
    transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), background 0.15s, border-color 0.15s, box-shadow 0.18s;
    box-shadow: 0 5px 0 rgba(0,0,0,0.5), 0 12px 28px rgba(0,0,0,0.3);
    user-select: none; position: relative; overflow: hidden;
  }
  .mode-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 17px;
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 55%);
    pointer-events: none;
  }
  .mode-card:hover { background: var(--surface-hover); transform: translateY(-4px); box-shadow: 0 9px 0 rgba(0,0,0,0.45), 0 20px 40px rgba(0,0,0,0.35); }
  .mode-card:active { transform: translateY(4px) scale(0.98) !important; box-shadow: 0 1px 0 rgba(0,0,0,0.5) !important; transition-duration: 0.07s !important; }
  .mode-icon { font-size: 28px; margin-bottom: 8px; }
  .mode-label { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; margin-bottom: 4px; color: #EDE9FF; }
  .mode-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* ── CTA Button ── */
  .btn-cta {
    display: block; width: 100%; padding: 18px 24px;
    border-radius: 16px; border: none;
    background: linear-gradient(135deg, #FBBF24 0%, #F97316 100%);
    color: #1a0a00;
    font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
    cursor: pointer; letter-spacing: 0.3px;
    transition: transform 0.16s cubic-bezier(.34,1.56,.64,1), box-shadow 0.16s ease;
    box-shadow: 0 6px 0 #92400E, 0 10px 32px rgba(251,191,36,0.35), 0 0 0 0 rgba(251,191,36,0);
    user-select: none; position: relative; overflow: hidden;
  }
  .btn-cta::before {
    content: ''; position: absolute; inset: 0; border-radius: 15px;
    background: linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%);
    pointer-events: none;
  }
  .btn-cta:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 9px 0 #78350F, 0 16px 48px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2);
  }
  .btn-cta:active {
    transform: translateY(5px) scale(0.99) !important;
    box-shadow: 0 1px 0 #92400E, 0 4px 16px rgba(251,191,36,0.2) !important;
    transition-duration: 0.08s !important;
  }
  .btn-cta:disabled {
    background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3);
    box-shadow: 0 4px 0 rgba(0,0,0,0.4) !important;
    cursor: not-allowed; transform: none !important;
  }
  .btn-cta:disabled::before { display: none; }

  /* ── Ghost button ── */
  .btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.07);
    border: 1.5px solid rgba(255,255,255,0.13);
    color: rgba(200,190,255,0.65);
    padding: 9px 16px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; margin-bottom: 24px;
    transition: transform 0.14s cubic-bezier(.34,1.56,.64,1), background 0.12s, box-shadow 0.14s, color 0.12s;
    box-shadow: 0 3px 0 rgba(0,0,0,0.45); user-select: none;
  }
  .btn-ghost:hover {
    background: rgba(255,255,255,0.12); color: rgba(230,220,255,0.95);
    transform: translateY(-2px); box-shadow: 0 5px 0 rgba(0,0,0,0.4);
  }
  .btn-ghost:active { transform: translateY(2px) !important; box-shadow: 0 1px 0 rgba(0,0,0,0.45) !important; transition-duration: 0.06s !important; }

  /* ── Spinner ── */
  .loading { text-align: center; padding: 72px 0; }
  .spinner-ring {
    width: 52px; height: 52px; margin: 0 auto 20px; position: relative;
  }
  .spinner-ring::before, .spinner-ring::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
  }
  .spinner-ring::before { border: 3px solid rgba(255,255,255,0.06); }
  .spinner-ring::after {
    border: 3px solid transparent;
    border-top-color: #FBBF24; border-right-color: #F97316;
    animation: spin 0.7s linear infinite;
    filter: drop-shadow(0 0 6px rgba(251,191,36,0.6));
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading p { color: var(--muted); font-size: 14px; }

  /* ── Progress ── */
  .progress-wrap { margin-bottom: 22px; }
  .progress-info { display: flex; justify-content: space-between; font-size: 12px; color: rgba(200,190,255,0.5); margin-bottom: 9px; font-weight: 600; }
  .progress-bar {
    height: 7px; background: rgba(255,255,255,0.07);
    border-radius: 999px; overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FBBF24, #F97316, #FB923C);
    border-radius: 999px;
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 0 10px rgba(251,191,36,0.5);
    position: relative;
  }
  .progress-fill::after {
    content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%);
    width: 10px; height: 10px; background: #fff; border-radius: 50%;
    box-shadow: 0 0 8px rgba(251,191,36,0.8), 0 0 16px rgba(251,191,36,0.4);
  }

  /* ── Question card ── */
  .question-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 22px; padding: 28px; margin-bottom: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative; overflow: hidden;
  }
  .question-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }
  .q-label { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(200,190,255,0.45); margin-bottom: 12px; font-weight: 600; }
  .q-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; line-height: 1.45; color: #F0EEFF; }
  .q-context {
    font-size: 13px; color: rgba(200,190,255,0.65); margin-top: 14px; line-height: 1.65;
    padding: 14px 16px;
    background: rgba(251,191,36,0.07); border-radius: 12px;
    border-left: 3px solid #FBBF24;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  }

  /* ── Choices ── */
  .choices { display: grid; gap: 10px; margin-bottom: 16px; }
  .choice-btn {
    width: 100%; padding: 15px 18px; border-radius: 14px;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: #EDE9FF; font-family: 'DM Sans', sans-serif;
    font-size: 15px; text-align: left; cursor: pointer;
    transition: transform 0.14s cubic-bezier(.34,1.56,.64,1), background 0.12s, border-color 0.12s, box-shadow 0.14s;
    box-shadow: 0 4px 0 rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.2);
    user-select: none; position: relative; overflow: hidden;
  }
  .choice-btn::before {
    content: ''; position: absolute; inset: 0; border-radius: 13px;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .choice-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.28);
    transform: translateY(-3px); box-shadow: 0 7px 0 rgba(0,0,0,0.4), 0 12px 28px rgba(0,0,0,0.25);
    color: #fff;
  }
  .choice-btn:active:not(:disabled) { transform: translateY(3px) scale(0.99) !important; box-shadow: 0 1px 0 rgba(0,0,0,0.45) !important; transition-duration: 0.07s !important; }

  .choice-btn.correct {
    background: rgba(52,211,153,0.15); border-color: #34D399; color: #6EE7B7;
    box-shadow: 0 4px 0 rgba(16,185,129,0.4), 0 0 24px rgba(52,211,153,0.25);
    animation: popCorrect 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .choice-btn.wrong {
    background: rgba(248,113,113,0.13); border-color: #F87171; color: #FCA5A5;
    box-shadow: 0 4px 0 rgba(239,68,68,0.25), 0 0 16px rgba(248,113,113,0.15);
    animation: shakeWrong 0.45s ease forwards;
  }
  @keyframes popCorrect { 0%{transform:scale(1)} 45%{transform:scale(1.04) translateY(-3px)} 100%{transform:scale(1)} }
  @keyframes shakeWrong { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(2px)} }

  /* ── Explanation ── */
  .explanation {
    background: linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.05) 100%);
    border: 1px solid rgba(52,211,153,0.28);
    border-radius: 14px; padding: 16px; margin-bottom: 16px;
    font-size: 14px; line-height: 1.65; color: rgba(220,255,240,0.85);
    box-shadow: 0 0 24px rgba(52,211,153,0.08);
  }
  .explanation strong { color: #34D399; display: block; margin-bottom: 7px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }

  /* ── Correction ── */
  .correction-card {
    background: linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(167,139,250,0.04) 100%);
    border: 1px solid rgba(167,139,250,0.28);
    border-radius: 18px; padding: 22px; margin-bottom: 14px;
    box-shadow: 0 0 32px rgba(139,92,246,0.08);
  }
  .correction-card h3 { font-family: 'Syne', sans-serif; font-size: 14px; color: #C4B5FD; margin-bottom: 12px; font-weight: 700; }
  .correction-text { font-size: 14px; line-height: 1.75; color: rgba(220,210,255,0.82); }
  .points-cles { margin-top: 16px; display: flex; flex-direction: column; gap: 9px; }
  .point { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: rgba(200,190,255,0.7); }
  .point::before { content: '✓'; color: #34D399; font-weight: 700; flex-shrink: 0; margin-top: 1px; text-shadow: 0 0 8px rgba(52,211,153,0.6); }

  /* ── Textarea ── */
  .answer-area {
    width: 100%; min-height: 140px;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 16px; padding: 16px;
    color: #EDE9FF; font-family: 'DM Sans', sans-serif;
    font-size: 15px; line-height: 1.6; resize: vertical;
    outline: none; margin-bottom: 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .answer-area:focus {
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px rgba(167,139,250,0.15), 0 0 20px rgba(167,139,250,0.1);
  }
  .answer-area::placeholder { color: rgba(200,190,255,0.3); }

  /* ── Score ── */
  .score-wrap { text-align: center; padding: 10px 0 28px; }
  .score-ring {
    width: 130px; height: 130px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    font-family: 'Syne', sans-serif; font-size: 38px; font-weight: 800;
    border: 4px solid; position: relative;
  }
  .score-message { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 6px; }
  .score-sub { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin: 24px 0; }
  .hint { text-align: center; font-size: 12px; color: rgba(200,190,255,0.28); margin-top: 8px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
function Spinner({ text = "Génération en cours…" }) {
  return (
    <div className="loading">
      <div className="spinner-ring" />
      <p>{text}</p>
    </div>
  );
}

function QuizMode({ subject, chapter, onBack }) {
  const [state, setState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await callClaude(buildQuizPrompt(subject.label, chapter));
        setQuestions(data.questions || []);
        setState("question");
      } catch { setState("error"); }
    })();
  }, []);

  if (state === "loading") return <Spinner text="Génération des questions…" />;
  if (state === "error") return <p style={{ color: "#F87171", textAlign: "center", padding: "40px 0" }}>Erreur — réessaie !</p>;

  const q = questions[idx];
  const isLast = idx === questions.length - 1;
  const scoreColor = score >= 4 ? "#34D399" : score >= 2 ? "#FBBF24" : "#F87171";
  const scoreGlow = score >= 4 ? "rgba(52,211,153,0.4)" : score >= 2 ? "rgba(251,191,36,0.4)" : "rgba(248,113,113,0.4)";
  const scoreMsg = score >= 4 ? "🎉 Excellent !" : score >= 2 ? "👍 Pas mal !" : "💪 Continue à réviser !";

  if (state === "done") return (
    <div className="score-wrap">
      <button className="btn-ghost" onClick={onBack}>← Retour à l'accueil</button>
      <div className="score-ring" style={{ borderColor: scoreColor, color: scoreColor, boxShadow: `0 0 40px ${scoreGlow}, inset 0 0 20px ${scoreGlow.replace('0.4','0.07')}` }}>
        {score}/{questions.length}
      </div>
      <div className="score-message" style={{ color: scoreColor, textShadow: `0 0 24px ${scoreGlow}` }}>{scoreMsg}</div>
      <div className="score-sub">{subject.icon} {subject.label}{chapter ? ` · ${chapter}` : ""}</div>
      <button className="btn-cta" onClick={onBack}>Recommencer ↩</button>
    </div>
  );

  return (
    <div>
      <button className="btn-ghost" onClick={onBack}>← Retour</button>
      <div className="progress-wrap">
        <div className="progress-info">
          <span>Question {idx + 1} / {questions.length}</span>
          <span>{score} ⭐ score</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
      </div>
      <div className="question-card">
        <div className="q-label">{subject.icon} {chapter || subject.label}</div>
        <div className="q-text">{q.question}</div>
      </div>
      <div className="choices">
        {q.choices.map((c) => {
          let cls = "choice-btn";
          if (selected !== null) {
            if (c.startsWith(q.answer)) cls += " correct";
            else if (c === selected) cls += " wrong";
          }
          return (
            <button key={c} className={cls}
              onClick={() => { if (selected !== null) return; setSelected(c); if (c.startsWith(q.answer)) setScore(s => s + 1); }}
              disabled={selected !== null}>
              {c}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <>
          <div className="explanation"><strong>💡 Explication</strong>{q.explanation}</div>
          <button className="btn-cta" onClick={() => { if (isLast) { setState("done"); return; } setIdx(i => i + 1); setSelected(null); }}>
            {isLast ? "Voir mon score →" : "Question suivante →"}
          </button>
        </>
      )}
    </div>
  );
}

function LongMode({ subject, chapter, onBack }) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await callClaude(buildLongPrompt(subject.label, chapter));
        setData(d); setState("question");
      } catch { setState("error"); }
    })();
  }, []);

  if (state === "loading") return <Spinner text="Génération de la question…" />;
  if (state === "error") return <p style={{ color: "#F87171", textAlign: "center", padding: "40px 0" }}>Erreur — réessaie !</p>;

  return (
    <div>
      <button className="btn-ghost" onClick={onBack}>← Retour</button>
      <div className="question-card">
        <div className="q-label">{subject.icon} {chapter || subject.label} — Question ouverte</div>
        <div className="q-text">{data.question}</div>
        {data.context && <div className="q-context">{data.context}</div>}
      </div>
      {!revealed ? (
        <>
          <textarea className="answer-area" placeholder="Écris ta réponse ici… prends le temps de réfléchir !" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <button className="btn-cta" onClick={() => setRevealed(true)} disabled={answer.trim().length < 10}>Voir la correction</button>
          {answer.length > 0 && answer.trim().length < 10 && <p className="hint">Rédige une réponse un peu plus longue !</p>}
        </>
      ) : (
        <>
          <div className="correction-card">
            <h3>📝 Correction type</h3>
            <div className="correction-text">{data.correction}</div>
            {data.points_cles?.length > 0 && (
              <>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#C4B5FD", marginTop: 16, marginBottom: 10, fontWeight: 700 }}>Points clés attendus</div>
                <div className="points-cles">{data.points_cles.map((p, i) => <div key={i} className="point">{p}</div>)}</div>
              </>
            )}
          </div>
          <div style={{ marginBottom: 16, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(200,190,255,0.32)", marginBottom: 10, fontWeight: 700 }}>Ta réponse</div>
            <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(200,190,255,0.65)", whiteSpace: "pre-wrap" }}>{answer}</div>
          </div>
          <button className="btn-cta" onClick={onBack}>Nouvelle question →</button>
        </>
      )}
    </div>
  );
}

function SetupScreen({ subject, onStart, onBack }) {
  const [trainingType, setTrainingType] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [mode, setMode] = useState(null);
  const chapters = CHAPTERS[subject.id] || [];
  const canStart = mode && (trainingType === "mixed" || (trainingType === "chapter" && chapter));

  return (
    <div>
      <button className="btn-ghost" onClick={onBack}>← Changer de matière</button>

      <div className="setup-pill" style={{
        borderColor: subject.color,
        color: subject.color,
        background: `${subject.color}18`,
        boxShadow: `0 0 24px ${subject.glow}, 0 4px 0 rgba(0,0,0,0.4)`,
      }}>
        <span>{subject.icon}</span><span>{subject.label}</span>
      </div>

      <div className="section-title">Comment veux-tu t'entraîner ?</div>
      <div className="training-grid">
        {[
          { id: "mixed",   icon: "🎯", label: "Tout ce qui tombe au brevet", desc: "Les sujets les plus probables, tous chapitres mélangés" },
          { id: "chapter", icon: "📖", label: "Par chapitre",                desc: "Cible un chapitre précis pour des révisions ciblées" },
        ].map(t => (
          <div key={t.id} className="training-card"
            style={trainingType === t.id ? {
              borderColor: subject.color, background: `${subject.color}14`,
              boxShadow: `0 9px 0 rgba(0,0,0,0.4), 0 0 32px ${subject.glow}`,
              transform: "translateY(-4px)"
            } : {}}
            onClick={() => { setTrainingType(t.id); setChapter(null); setMode(null); }}>
            <div className="training-icon">{t.icon}</div>
            <div className="training-label">{t.label}</div>
            <div className="training-desc">{t.desc}</div>
          </div>
        ))}
      </div>

      {trainingType === "chapter" && (
        <>
          <div className="section-title">Choisis un chapitre</div>
          <div className="chapter-chips">
            {chapters.map(c => (
              <div key={c} className="chapter-chip"
                style={chapter === c ? {
                  borderColor: subject.color, background: `${subject.color}1A`,
                  color: "#fff", fontWeight: 700,
                  transform: "translateY(-2px)",
                  boxShadow: `0 5px 0 rgba(0,0,0,0.4), 0 0 16px ${subject.glow}`
                } : {}}
                onClick={() => setChapter(c)}>
                {c}
              </div>
            ))}
          </div>
        </>
      )}

      {trainingType && (trainingType === "mixed" || chapter) && (
        <>
          <div className="divider" />
          <div className="section-title">Quel type de questions ?</div>
          <div className="mode-grid">
            {[
              { id: "quiz", icon: "⚡", label: "Quiz Rapide",     desc: "5 QCM · environ 3 min",           color: "#FBBF24", glow: "rgba(251,191,36,0.35)" },
              { id: "long", icon: "✍️", label: "Question Longue", desc: "1 question ouverte façon brevet", color: "#A78BFA", glow: "rgba(167,139,250,0.35)" },
            ].map(m => (
              <div key={m.id} className="mode-card"
                style={mode === m.id ? {
                  borderColor: m.color, background: `${m.color}14`,
                  boxShadow: `0 9px 0 rgba(0,0,0,0.4), 0 0 32px ${m.glow}`,
                  transform: "translateY(-4px)"
                } : {}}
                onClick={() => setMode(m.id)}>
                <div className="mode-icon">{m.icon}</div>
                <div className="mode-label">{m.label}</div>
                <div className="mode-desc">{m.desc}</div>
              </div>
            ))}
          </div>
          <button className="btn-cta" disabled={!canStart}
            onClick={() => canStart && onStart(trainingType === "chapter" ? chapter : null, mode)}>
            C'est parti ! →
          </button>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const goHome = () => { setScreen("home"); setSubject(null); setChapter(null); };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="bg-grid" />
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />

        <div className="container">
          {screen === "home" && (
            <>
              <div className="header">
                <div className="badge">
                  <span className="badge-dot" />
                  Révision Brevet 3ème
                </div>
                <h1>
                  <span className="plain">Prépare ton</span><br />
                  <span className="accent">Brevet</span>
                  <span> 📖</span>
                </h1>
                <p>Questions générées par IA · Programme officiel DNB</p>
              </div>

              <div className="section-title">Choisis une matière</div>
              <div className="subject-grid">
                {SUBJECTS.map(s => (
                  <div key={s.id} className="subject-card"
                    style={{ "--card-color": s.color }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = s.color;
                      e.currentTarget.style.boxShadow = `0 8px 0 rgba(0,0,0,0.4), 0 0 32px ${s.glow}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                    onClick={() => { setSubject(s); setScreen("setup"); }}>
                    <div className="subject-icon">{s.icon}</div>
                    <div className="subject-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {screen === "setup" && subject && (
            <SetupScreen subject={subject} onBack={goHome}
              onStart={(ch, mode) => { setChapter(ch); setScreen(mode); }} />
          )}
          {screen === "quiz" && subject && <QuizMode subject={subject} chapter={chapter} onBack={goHome} />}
          {screen === "long" && subject && <LongMode subject={subject} chapter={chapter} onBack={goHome} />}
        </div>
      </div>
    </>
  );
}