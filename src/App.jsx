import { useState, useEffect } from "react";

const SUBJECTS = [
  { id: "maths",    label: "Mathématiques",  icon: "📐", color: "#3B82F6" },
  { id: "francais", label: "Français",        icon: "📚", color: "#8B5CF6" },
  { id: "histoire", label: "Histoire-Géo",    icon: "🌍", color: "#10B981" },
  { id: "svt",      label: "SVT",             icon: "🔬", color: "#F59E0B" },
  { id: "physique", label: "Physique-Chimie", icon: "⚗️",  color: "#EF4444" },
  { id: "anglais",  label: "Anglais",         icon: "🗣️",  color: "#EC4899" },
  { id: "emc",      label: "EMC",             icon: "⚖️",  color: "#06B6D4" },
  { id: "techno",   label: "Technologie",     icon: "🖥️",  color: "#F97316" },
];

const MODES = [
  { id: "quiz", label: "Quiz Rapide",      desc: "5 questions QCM · ~3 min", icon: "⚡", color: "#F59E0B" },
  { id: "long", label: "Question Longue",  desc: "Rédige comme au brevet",   icon: "✍️", color: "#8B5CF6" },
];

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "Tu es un professeur qui aide des élèves de 3ème à réviser le brevet (DNB). Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

const buildQuizPrompt = (subject) =>
  `Génère 5 questions QCM sur "${subject}" pour le brevet (3ème, programme officiel). JSON uniquement:
{"questions":[{"question":"...","choices":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}]}`;

const buildLongPrompt = (subject) =>
  `Génère 1 question ouverte de type brevet sur "${subject}" (3ème). JSON uniquement:
{"question":"...","context":"...","correction":"...","points_cles":["...","...","..."]}`;

// ── CSS ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: #0F0E17; color: #FFFFFE; min-height: 100vh; }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    overflow: hidden;
  }

  /* Blobs décoratifs */
  .blob { position: fixed; border-radius: 50%; filter: blur(90px); opacity: 0.12; pointer-events: none; z-index: 0; }
  .blob-1 { width: 600px; height: 600px; background: #7C3AED; top: -200px; left: -200px; }
  .blob-2 { width: 500px; height: 500px; background: #F59E0B; bottom: -150px; right: -150px; }

  /* Page générique centrée */
  .screen {
    position: relative; z-index: 1;
    width: 100%;
    max-width: 900px;
    padding: 40px 20px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Titre de section */
  .screen-eyebrow {
    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
    color: rgba(255,255,255,0.35); margin-bottom: 12px; text-align: center;
  }
  .screen-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(26px, 5vw, 44px);
    font-weight: 800; text-align: center; margin-bottom: 8px; line-height: 1.1;
  }
  .screen-title span { color: #F59E0B; }
  .screen-sub {
    color: rgba(255,255,255,0.4); font-size: 14px;
    text-align: center; margin-bottom: 40px;
  }

  /* Grille matières — responsive */
  .subject-grid {
    display: grid;
    width: 100%;
    gap: 14px;
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 540px)  { .subject-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
  @media (min-width: 900px)  { .subject-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

  .subject-card {
    aspect-ratio: 1;
    border-radius: 20px;
    border: 1.5px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
    cursor: pointer;
    box-shadow: 0 5px 0 rgba(0,0,0,0.35);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease, border-color 0.15s ease;
    user-select: none;
  }
  .subject-card:hover  { transform: translateY(-4px); box-shadow: 0 9px 0 rgba(0,0,0,0.35); background: rgba(255,255,255,0.08); }
  .subject-card:active { transform: translateY(5px);  box-shadow: 0 0px 0 rgba(0,0,0,0.35); }
  .subject-card.selected { border-width: 2px; }

  .subject-icon  { font-size: clamp(28px, 5vw, 42px); line-height: 1; }
  .subject-label { font-size: clamp(11px, 2vw, 14px); font-weight: 600; color: rgba(255,255,255,0.85); text-align: center; padding: 0 6px; }

  /* Grille modes */
  .mode-grid {
    display: grid; width: 100%; gap: 14px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 540px) { .mode-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }

  .mode-card {
    border-radius: 20px;
    border: 1.5px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    padding: 28px 24px;
    display: flex; align-items: center; gap: 20px;
    cursor: pointer;
    box-shadow: 0 5px 0 rgba(0,0,0,0.35);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease, border-color 0.15s ease;
    user-select: none;
  }
  .mode-card:hover  { transform: translateY(-4px); box-shadow: 0 9px 0 rgba(0,0,0,0.35); background: rgba(255,255,255,0.08); }
  .mode-card:active { transform: translateY(5px);  box-shadow: 0 0px 0 rgba(0,0,0,0.35); }
  .mode-card.selected { border-width: 2px; }
  .mode-icon  { font-size: 36px; flex-shrink: 0; }
  .mode-name  { font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 700; }
  .mode-desc  { font-size: 13px; color: rgba(255,255,255,0.45); margin-top: 4px; }

  /* Bouton principal */
  .btn-cta {
    margin-top: 28px;
    width: 100%; max-width: 400px;
    padding: 17px 24px;
    border-radius: 14px; border: none;
    background: #F59E0B; color: #0F0E17;
    font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.3px;
    box-shadow: 0 5px 0 rgba(180,120,0,0.5);
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s;
  }
  .btn-cta:hover   { background: #FBBF24; transform: translateY(-2px); box-shadow: 0 7px 0 rgba(180,120,0,0.5); }
  .btn-cta:active  { transform: translateY(5px); box-shadow: 0 0px 0 rgba(180,120,0,0.5); }
  .btn-cta:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  /* Bouton retour */
  .btn-back {
    align-self: flex-start;
    background: none; border: none;
    color: rgba(255,255,255,0.4); font-size: 13px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    margin-bottom: 28px; padding: 0;
    transition: color 0.2s;
  }
  .btn-back:hover { color: rgba(255,255,255,0.8); }

  /* Chip matière sélectionnée */
  .subject-chip {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 999px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    font-size: 13px; font-weight: 600; margin-bottom: 32px;
  }

  /* Zone de contenu quiz/long */
  .content { width: 100%; max-width: 660px; }

  /* Loader */
  .loader { text-align: center; padding: 80px 0; width: 100%; }
  .spinner { width: 46px; height: 46px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #F59E0B; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 18px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loader p { color: rgba(255,255,255,0.4); font-size: 14px; }

  /* Progress */
  .progress-wrap { margin-bottom: 22px; }
  .progress-info { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
  .progress-bar  { height: 5px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; background: #F59E0B; border-radius: 999px; transition: width 0.4s ease; }

  /* Question card */
  .q-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 26px; margin-bottom: 14px; }
  .q-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 10px; }
  .q-text  { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; line-height: 1.4; }
  .q-ctx   { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 12px; line-height: 1.6; padding: 12px 14px; background: rgba(255,255,255,0.04); border-radius: 10px; border-left: 3px solid #F59E0B; }

  /* Choix */
  .choices { display: grid; gap: 10px; margin-bottom: 14px; }
  .choice {
    width: 100%; padding: 13px 16px; border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
    color: #FFFFFE; font-family: 'DM Sans', sans-serif; font-size: 14px; text-align: left;
    cursor: pointer; box-shadow: 0 4px 0 rgba(0,0,0,0.3); user-select: none;
    transition: transform 0.1s, box-shadow 0.1s, background 0.12s, border-color 0.12s;
  }
  .choice:hover:not(:disabled) { background: rgba(255,255,255,0.09); transform: translateY(-2px); box-shadow: 0 6px 0 rgba(0,0,0,0.3); }
  .choice:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 0px 0 rgba(0,0,0,0.3); }
  .choice.correct { background: rgba(16,185,129,0.18); border-color: #10B981; color: #6EE7B7; box-shadow: 0 4px 0 rgba(16,185,129,0.3); animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  .choice.wrong   { background: rgba(239,68,68,0.15);  border-color: #EF4444; color: #FCA5A5; animation: shake 0.45s ease; }
  @keyframes pop   { 0%{transform:scale(1)} 45%{transform:scale(1.04) translateY(-4px)} 100%{transform:scale(1)} }
  @keyframes shake { 0%{transform:translateX(0)} 15%{transform:translateX(-7px)} 35%{transform:translateX(6px)} 55%{transform:translateX(-4px)} 75%{transform:translateX(3px)} 100%{transform:translateX(0)} }

  /* Explication */
  .expl { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 14px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.8); }
  .expl strong { color: #6EE7B7; display: block; margin-bottom: 5px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }

  /* Correction */
  .corr { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.22); border-radius: 16px; padding: 20px; margin-bottom: 14px; }
  .corr h3 { font-family: 'Syne', sans-serif; font-size: 14px; color: #C4B5FD; margin-bottom: 10px; }
  .corr p  { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.8); }
  .points  { margin-top: 14px; display: flex; flex-direction: column; gap: 7px; }
  .point   { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; color: rgba(255,255,255,0.7); }
  .point::before { content: '✓'; color: #10B981; font-weight: 700; flex-shrink: 0; }

  /* Textarea */
  .textarea {
    width: 100%; min-height: 130px; background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1); border-radius: 14px;
    padding: 14px 16px; color: #FFFFFE; font-family: 'DM Sans', sans-serif;
    font-size: 14px; line-height: 1.6; resize: vertical; outline: none;
    margin-bottom: 12px; transition: border-color 0.2s;
  }
  .textarea:focus { border-color: #8B5CF6; }

  /* Score */
  .score-ring { width: 110px; height: 110px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; font-family: 'Syne', sans-serif; font-size: 34px; font-weight: 800; border: 4px solid; }
  .score-msg  { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 6px; }
  .score-sub  { text-align: center; font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 24px; }

  /* Btn next */
  .btn-next {
    width: 100%; padding: 15px; border-radius: 13px; border: none;
    background: #F59E0B; color: #0F0E17;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
    cursor: pointer; box-shadow: 0 4px 0 rgba(180,120,0,0.5);
    transition: transform 0.12s, box-shadow 0.12s, background 0.15s;
  }
  .btn-next:hover  { background: #FBBF24; transform: translateY(-2px); box-shadow: 0 6px 0 rgba(180,120,0,0.5); }
  .btn-next:active { transform: translateY(4px); box-shadow: 0 0px 0 rgba(180,120,0,0.5); }
`;

// ── Composants ─────────────────────────────────────────────────────────────

function Loader({ text = "Génération en cours…" }) {
  return <div className="loader"><div className="spinner" /><p>{text}</p></div>;
}

function QuizMode({ subject, onBack }) {
  const [state, setState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    callClaude(buildQuizPrompt(subject.label))
      .then(d => { setQuestions(d.questions || []); setState("q"); })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") return <Loader />;
  if (state === "error") return <p style={{color:"#FCA5A5",textAlign:"center"}}>Erreur, réessaie !</p>;

  const q = questions[idx];
  const isLast = idx === questions.length - 1;
  const sc = score >= 4 ? "#10B981" : score >= 2 ? "#F59E0B" : "#EF4444";

  if (state === "done") return (
    <div className="content" style={{textAlign:"center"}}>
      <div className="score-ring" style={{borderColor:sc,color:sc}}>{score}/{questions.length}</div>
      <div className="score-msg" style={{color:sc}}>{score >= 4 ? "🎉 Excellent !" : score >= 2 ? "👍 Pas mal !" : "💪 Continue !"}</div>
      <div className="score-sub">{subject.icon} {subject.label}</div>
      <button className="btn-next" onClick={onBack}>Recommencer</button>
    </div>
  );

  return (
    <div className="content">
      <div className="progress-wrap">
        <div className="progress-info"><span>Question {idx+1}/{questions.length}</span><span>Score : {score}</span></div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${(idx/questions.length)*100}%`}} /></div>
      </div>
      <div className="q-card">
        <div className="q-label">{subject.icon} {subject.label}</div>
        <div className="q-text">{q.question}</div>
      </div>
      <div className="choices">
        {q.choices.map(c => {
          let cls = "choice";
          if (selected) { if (c.startsWith(q.answer)) cls += " correct"; else if (c === selected) cls += " wrong"; }
          return <button key={c} className={cls} disabled={!!selected} onClick={() => { setSelected(c); if (c.startsWith(q.answer)) setScore(s=>s+1); }}>{c}</button>;
        })}
      </div>
      {selected && <>
        <div className="expl"><strong>💡 Explication</strong>{q.explanation}</div>
        <button className="btn-next" onClick={() => { if (isLast) setState("done"); else { setIdx(i=>i+1); setSelected(null); } }}>
          {isLast ? "Voir mon score" : "Question suivante →"}
        </button>
      </>}
    </div>
  );
}

function LongMode({ subject, onBack }) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    callClaude(buildLongPrompt(subject.label))
      .then(d => { setData(d); setState("q"); })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") return <Loader text="Génération de la question…" />;
  if (state === "error") return <p style={{color:"#FCA5A5",textAlign:"center"}}>Erreur, réessaie !</p>;

  return (
    <div className="content">
      <div className="q-card">
        <div className="q-label">{subject.icon} {subject.label} — Question longue</div>
        <div className="q-text">{data.question}</div>
        {data.context && <div className="q-ctx">{data.context}</div>}
      </div>

      {state === "q" && <>
        <textarea className="textarea" placeholder="Rédige ta réponse ici…" value={answer} onChange={e => setAnswer(e.target.value)} />
        {answer.trim().length > 0 && answer.trim().length < 15 && <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",marginBottom:10}}>Développe un peu plus ta réponse…</p>}
        <button className="btn-next" disabled={answer.trim().length < 15} onClick={() => setState("corr")}>Voir la correction</button>
      </>}

      {state === "corr" && <>
        <div className="corr">
          <h3>📝 Correction type</h3>
          <p>{data.correction}</p>
          {data.points_cles?.length > 0 && <>
            <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:"#C4B5FD",marginTop:14,marginBottom:8}}>Points clés attendus</div>
            <div className="points">{data.points_cles.map((p,i) => <div key={i} className="point">{p}</div>)}</div>
          </>}
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,letterSpacing:1,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:8}}>Ta réponse</div>
          <div style={{fontSize:14,lineHeight:1.7,color:"rgba(255,255,255,0.7)",whiteSpace:"pre-wrap"}}>{answer}</div>
        </div>
        <button className="btn-next" onClick={onBack}>Nouvelle question</button>
      </>}
    </div>
  );
}

// ── App principal ──────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("home");     // home | mode | quiz | long
  const [subject, setSubject] = useState(null);
  const [mode, setMode] = useState(null);

  const reset = () => { setStep("home"); setSubject(null); setMode(null); };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* ── ÉCRAN 1 : Accueil ── */}
        {step === "home" && (
          <div className="screen">
            <div className="screen-eyebrow">Révision Brevet 3ème</div>
            <h1 className="screen-title">Prépare ton <span>Brevet</span> 📖</h1>
            <p className="screen-sub">Questions générées par IA · Programme officiel DNB</p>

            <div className="subject-grid">
              {SUBJECTS.map(s => (
                <div key={s.id} className="subject-card"
                  style={{borderColor:`${s.color}30`, background:`${s.color}10`}}
                  onClick={() => { setSubject(s); setStep("mode"); }}>
                  <div className="subject-icon">{s.icon}</div>
                  <div className="subject-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ÉCRAN 2 : Choix du mode ── */}
        {step === "mode" && (
          <div className="screen">
            <button className="btn-back" onClick={reset}>← Retour</button>

            <div className="screen-eyebrow">Tu as choisi</div>
            <h1 className="screen-title">{subject.icon} <span>{subject.label}</span></h1>
            <p className="screen-sub">Comment veux-tu réviser ?</p>

            <div className="mode-grid">
              {MODES.map(m => (
                <div key={m.id} className={`mode-card${mode?.id === m.id ? " selected" : ""}`}
                  style={mode?.id === m.id ? {borderColor: m.color, background:`${m.color}15`} : {}}
                  onClick={() => setMode(m)}>
                  <div className="mode-icon">{m.icon}</div>
                  <div>
                    <div className="mode-name">{m.label}</div>
                    <div className="mode-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-cta" disabled={!mode} onClick={() => setStep(mode.id)}>
              C'est parti ! →
            </button>
          </div>
        )}

        {/* ── ÉCRAN 3a : Quiz ── */}
        {step === "quiz" && (
          <div className="screen">
            <button className="btn-back" onClick={() => setStep("mode")}>← Retour</button>
            <QuizMode subject={subject} onBack={reset} />
          </div>
        )}

        {/* ── ÉCRAN 3b : Question longue ── */}
        {step === "long" && (
          <div className="screen">
            <button className="btn-back" onClick={() => setStep("mode")}>← Retour</button>
            <LongMode subject={subject} onBack={reset} />
          </div>
        )}
      </div>
    </>
  );
}