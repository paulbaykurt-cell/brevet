import { useState, useEffect, useCallback } from "react";

const SUBJECTS = [
  { id: "maths", label: "Mathématiques", icon: "📐", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "francais", label: "Français", icon: "📚", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "histoire", label: "Histoire-Géo", icon: "🌍", color: "#10B981", bg: "#ECFDF5" },
  { id: "svt", label: "SVT", icon: "🔬", color: "#F59E0B", bg: "#FFFBEB" },
  { id: "physique", label: "Physique-Chimie", icon: "⚗️", color: "#EF4444", bg: "#FEF2F2" },
  { id: "anglais", label: "Anglais", icon: "🗣️", color: "#EC4899", bg: "#FDF2F8" },
  { id: "emc", label: "EMC", icon: "⚖️", color: "#06B6D4", bg: "#ECFEFF" },
  { id: "techno", label: "Technologie", icon: "🖥️", color: "#F97316", bg: "#FFF7ED" },
];

const MODES = [
  {
    id: "quiz",
    label: "Quiz Rapide",
    desc: "5 questions à choix multiples — environ 3 min",
    icon: "⚡",
    color: "#F59E0B",
  },
  {
    id: "long",
    label: "Question Longue",
    desc: "1 question ouverte façon brevet — prends ton temps",
    icon: "✍️",
    color: "#8B5CF6",
  },
];

const SYSTEM_PROMPT = `Tu es un professeur bienveillant qui aide des élèves de 3ème à réviser le brevet des collèges (DNB) en France.
Réponds UNIQUEMENT en JSON valide, sans balises markdown ni backticks.`;

const buildQuizPrompt = (subject) => `Génère exactement 5 questions de quiz à choix multiples sur "${subject}" pour le brevet.
Niveau 3ème, programme officiel français.
Réponds UNIQUEMENT en JSON avec ce format exact (sans markdown):
{
  "questions": [
    {
      "question": "...",
      "choices": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A",
      "explanation": "..."
    }
  ]
}`;

const buildLongPrompt = (subject) => `Génère 1 question ouverte de type brevet sur "${subject}" pour un élève de 3ème.
Réponds UNIQUEMENT en JSON avec ce format exact (sans markdown):
{
  "question": "...",
  "context": "...",
  "correction": "...",
  "points_cles": ["...", "...", "..."]
}`;

async function callClaude(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const text = data.content?.map((b) => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Styles ──────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0F0E17;
    min-height: 100vh;
    color: #FFFFFE;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px 48px;
    position: relative;
    overflow: hidden;
  }

  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 { width: 500px; height: 500px; background: #7C3AED; top: -100px; left: -100px; }
  .blob-2 { width: 400px; height: 400px; background: #F59E0B; bottom: 0; right: -100px; }
  .blob-3 { width: 300px; height: 300px; background: #10B981; top: 50%; left: 50%; transform: translate(-50%, -50%); }

  .container { position: relative; z-index: 1; width: 100%; max-width: 680px; }

  /* Header */
  .header { text-align: center; margin-bottom: 40px; }
  .header-badge {
    display: inline-block;
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.4);
    color: #F59E0B;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 999px;
    margin-bottom: 16px;
  }
  .header h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 7vw, 52px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -1px;
  }
  .header h1 span { color: #F59E0B; }
  .header p { color: rgba(255,255,255,0.5); margin-top: 10px; font-size: 15px; }

  /* Cards */
  .card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .card:hover {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }

  /* Subject grid */
  .subject-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px; }
  @media (min-width: 520px) { .subject-grid { grid-template-columns: repeat(4, 1fr); } }

  .subject-card {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 20px 16px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
  }
  .subject-card:hover { transform: translateY(-3px); }
  .subject-card.selected { border-width: 2px; }
  .subject-icon { font-size: 32px; margin-bottom: 8px; }
  .subject-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }

  /* Mode cards */
  .mode-grid { display: grid; gap: 12px; margin-bottom: 24px; }
  .mode-card {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
  }
  .mode-card:hover { transform: translateY(-2px); }
  .mode-card.selected { border-width: 2px; }
  .mode-icon { font-size: 28px; }
  .mode-label { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .mode-desc { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 2px; }

  /* Button */
  .btn {
    display: block;
    width: 100%;
    padding: 16px 24px;
    border-radius: 14px;
    border: none;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.3px;
  }
  .btn-primary {
    background: #F59E0B;
    color: #0F0E17;
  }
  .btn-primary:hover { background: #FBBF24; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-ghost {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.12);
    margin-top: 10px;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.12); }

  /* Loading */
  .loading {
    text-align: center;
    padding: 60px 0;
  }
  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #F59E0B;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading p { color: rgba(255,255,255,0.5); font-size: 14px; }

  /* Progress bar */
  .progress-wrap { margin-bottom: 24px; }
  .progress-info { display: flex; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
  .progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; background: #F59E0B; border-radius: 999px; transition: width 0.4s ease; }

  /* Question card */
  .question-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 28px;
    margin-bottom: 16px;
  }
  .q-label { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 12px; }
  .q-text { font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 700; line-height: 1.4; }
  .q-context { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 12px; line-height: 1.6; padding: 14px; background: rgba(255,255,255,0.04); border-radius: 10px; border-left: 3px solid #F59E0B; }

  /* Choices */
  .choices { display: grid; gap: 10px; margin-bottom: 16px; }
  .choice-btn {
    width: 100%;
    padding: 14px 18px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #FFFFFE;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.1s ease;
    box-shadow: 0 4px 0 rgba(0,0,0,0.35);
    position: relative;
    user-select: none;
  }
  .choice-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 0 rgba(0,0,0,0.35);
  }
  .choice-btn:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 0px 0 rgba(0,0,0,0.35);
  }
  .choice-btn.correct {
    background: rgba(16,185,129,0.18);
    border-color: #10B981;
    color: #6EE7B7;
    box-shadow: 0 4px 0 rgba(16,185,129,0.35);
    animation: popCorrect 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .choice-btn.wrong {
    background: rgba(239,68,68,0.15);
    border-color: #EF4444;
    color: #FCA5A5;
    box-shadow: 0 4px 0 rgba(239,68,68,0.25);
    animation: shakeWrong 0.45s ease forwards;
  }
  @keyframes popCorrect {
    0%   { transform: scale(1) translateY(0); }
    45%  { transform: scale(1.04) translateY(-4px); box-shadow: 0 9px 0 rgba(16,185,129,0.3); }
    100% { transform: scale(1) translateY(0); box-shadow: 0 4px 0 rgba(16,185,129,0.35); }
  }
  @keyframes shakeWrong {
    0%   { transform: translateX(0) translateY(4px); box-shadow: 0 0px 0 rgba(239,68,68,0.25); }
    15%  { transform: translateX(-7px); }
    35%  { transform: translateX(6px); }
    55%  { transform: translateX(-4px); }
    75%  { transform: translateX(3px); }
    100% { transform: translateX(0); box-shadow: 0 4px 0 rgba(239,68,68,0.25); }
  }

  /* Explanation */
  .explanation {
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255,255,255,0.8);
  }
  .explanation strong { color: #6EE7B7; display: block; margin-bottom: 6px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }

  /* Long question correction */
  .correction-card {
    background: rgba(139,92,246,0.08);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .correction-card h3 { font-family: 'Syne', sans-serif; font-size: 15px; color: #C4B5FD; margin-bottom: 12px; letter-spacing: 0.5px; }
  .correction-text { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.8); }
  .points-cles { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
  .point { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.7); }
  .point::before { content: '✓'; color: #10B981; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  /* Textarea */
  .answer-area {
    width: 100%;
    min-height: 140px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 16px;
    color: #FFFFFE;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .answer-area:focus { border-color: #8B5CF6; }

  /* Score */
  .score-ring {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-family: 'Syne', sans-serif;
    font-size: 36px;
    font-weight: 800;
    border: 4px solid;
  }
  .score-label { text-align: center; font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 24px; }
  .score-message { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 8px; }

  /* Back link */
  .back-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.4);
    font-size: 13px;
    cursor: pointer;
    padding: 4px 0;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.2s;
  }
  .back-btn:hover { color: rgba(255,255,255,0.8); }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 14px;
  }
`;

// ── Components ────────────────────────────────────────────────────────────

function Spinner({ text = "Génération des questions…" }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

function QuizMode({ subject, onBack }) {
  const [state, setState] = useState("loading"); // loading | question | done
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await callClaude(buildQuizPrompt(subject.label));
        setQuestions(data.questions || []);
        setState("question");
      } catch {
        setState("error");
      }
    })();
  }, [subject]);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const handleChoice = (choice) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice.startsWith(q.answer)) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) { setState("done"); return; }
    setIdx((i) => i + 1);
    setSelected(null);
  };

  const scoreColor = score >= 4 ? "#10B981" : score >= 2 ? "#F59E0B" : "#EF4444";
  const scoreMsg = score >= 4 ? "🎉 Excellent !" : score >= 2 ? "👍 Pas mal !" : "💪 Continue à réviser !";

  if (state === "loading") return <Spinner />;
  if (state === "error") return <p style={{ color: "#FCA5A5", textAlign: "center" }}>Une erreur est survenue. Réessaie !</p>;

  if (state === "done") return (
    <div>
      <div className="score-ring" style={{ borderColor: scoreColor, color: scoreColor }}>
        {score}/{questions.length}
      </div>
      <div className="score-message" style={{ color: scoreColor }}>{scoreMsg}</div>
      <div className="score-label">{subject.icon} {subject.label}</div>
      <button className="btn btn-primary" onClick={onBack}>Recommencer</button>
    </div>
  );

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Retour</button>
      <div className="progress-wrap">
        <div className="progress-info">
          <span>Question {idx + 1}/{questions.length}</span>
          <span>Score : {score}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((idx) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="question-card">
        <div className="q-label">{subject.icon} {subject.label}</div>
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
            <button key={c} className={cls} onClick={() => handleChoice(c)} disabled={selected !== null}>
              {c}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <>
          <div className="explanation">
            <strong>💡 Explication</strong>
            {q.explanation}
          </div>
          <button className="btn btn-primary" onClick={next}>
            {isLast ? "Voir mon score" : "Question suivante →"}
          </button>
        </>
      )}
    </div>
  );
}

function LongMode({ subject, onBack }) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await callClaude(buildLongPrompt(subject.label));
        setData(d);
        setState("question");
      } catch {
        setState("error");
      }
    })();
  }, [subject]);

  if (state === "loading") return <Spinner text="Génération de la question…" />;
  if (state === "error") return <p style={{ color: "#FCA5A5", textAlign: "center" }}>Une erreur est survenue. Réessaie !</p>;

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Retour</button>

      <div className="question-card">
        <div className="q-label">{subject.icon} {subject.label} — Question longue</div>
        <div className="q-text">{data.question}</div>
        {data.context && <div className="q-context">{data.context}</div>}
      </div>

      {!revealed ? (
        <>
          <textarea
            className="answer-area"
            placeholder="Écris ta réponse ici… prends le temps de réfléchir !"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => setRevealed(true)}
            disabled={answer.trim().length < 10}
          >
            Voir la correction
          </button>
          {answer.trim().length < 10 && answer.length > 0 && (
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
              Rédige une réponse un peu plus longue d'abord !
            </p>
          )}
        </>
      ) : (
        <>
          <div className="correction-card">
            <h3>📝 Correction type</h3>
            <div className="correction-text">{data.correction}</div>
            {data.points_cles?.length > 0 && (
              <>
                <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#C4B5FD", marginTop: 16, marginBottom: 8 }}>Points clés attendus</div>
                <div className="points-cles">
                  {data.points_cles.map((p, i) => (
                    <div key={i} className="point">{p}</div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div style={{ marginBottom: 16, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Ta réponse</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", whiteSpace: "pre-wrap" }}>{answer}</div>
          </div>
          <button className="btn btn-primary" onClick={onBack}>Nouvelle question</button>
        </>
      )}
    </div>
  );
}


// ── Device Picker ─────────────────────────────────────────────────────────

const DEVICES = [
  { id: "mobile", label: "Téléphone", icon: "📱", desc: "Petit écran" },
  { id: "tablet", label: "Tablette", icon: "📟", desc: "Écran moyen" },
  { id: "desktop", label: "Ordinateur", icon: "🖥️", desc: "Grand écran" },
];

const deviceCss = `
  .device-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    position: relative;
    z-index: 1;
  }
  .device-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(26px, 5vw, 40px);
    font-weight: 800;
    text-align: center;
    margin-bottom: 10px;
  }
  .device-subtitle {
    color: rgba(255,255,255,0.45);
    text-align: center;
    font-size: 15px;
    margin-bottom: 40px;
  }
  .device-grid {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 600px;
  }
  .device-card {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 32px 28px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    min-width: 140px;
    flex: 1;
    box-shadow: 0 4px 0 rgba(0,0,0,0.3);
  }
  .device-card:hover {
    background: rgba(255,255,255,0.1);
    border-color: #F59E0B;
    transform: translateY(-4px);
    box-shadow: 0 8px 0 rgba(0,0,0,0.3);
  }
  .device-card:active {
    transform: translateY(4px);
    box-shadow: 0 0px 0 rgba(0,0,0,0.3);
  }
  .device-card-icon { font-size: 40px; margin-bottom: 12px; }
  .device-card-label { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
  .device-card-desc { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }

  /* Desktop layout */
  .desktop-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 28px;
    width: 100%;
    max-width: 1100px;
    min-height: 100vh;
    padding: 32px 28px;
    position: relative;
    z-index: 1;
    align-items: start;
  }
  .desktop-sidebar { position: sticky; top: 32px; }
  .desktop-sidebar .header { text-align: left; margin-bottom: 20px; }
  .desktop-sidebar .header h1 { font-size: 30px; }
  .desktop-main { min-width: 0; }
  .desktop-subject-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }
  .desktop-subject-card {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 10px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.15s ease;
    box-shadow: 0 3px 0 rgba(0,0,0,0.3);
  }
  .desktop-subject-card:hover { background: rgba(255,255,255,0.09); transform: translateY(-2px); box-shadow: 0 5px 0 rgba(0,0,0,0.3); }
  .desktop-subject-card:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,0.3); }
  .desktop-subject-card.selected { border-width: 2px; }
  .desktop-subject-icon { font-size: 20px; }
  .desktop-subject-label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.85); }

  /* Tablet layout */
  .tablet-layout {
    width: 100%;
    max-width: 800px;
    padding: 24px 20px 48px;
    position: relative;
    z-index: 1;
  }
  .tablet-subject-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  /* Desktop empty state */
  .desktop-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 65vh;
    flex-direction: column;
    gap: 14px;
    opacity: 0.35;
  }

  .change-device-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.3);
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin-top: 20px;
    display: block;
    transition: color 0.2s;
    padding: 4px 0;
  }
  .change-device-btn:hover { color: rgba(255,255,255,0.6); }
`;

function DevicePicker({ onSelect }) {
  return (
    <div className="device-screen">
      <div className="device-title">Tu es sur quel appareil ? 👋</div>
      <div className="device-subtitle">L'affichage s'adaptera pour toi</div>
      <div className="device-grid">
        {DEVICES.map((d) => (
          <div key={d.id} className="device-card" onClick={() => onSelect(d.id)}>
            <div className="device-card-icon">{d.icon}</div>
            <div className="device-card-label">{d.label}</div>
            <div className="device-card-desc">{d.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [device, setDevice] = useState(null);
  const [screen, setScreen] = useState("home");
  const [subject, setSubject] = useState(null);
  const [mode, setMode] = useState(null);

  const goHome = () => { setScreen("home"); setSubject(null); setMode(null); };

  const ModeSection = () => subject ? (
    <>
      <div className="section-title" style={{ marginTop: 24 }}>Choisis un mode</div>
      <div className="mode-grid">
        {MODES.map((m) => (
          <div
            key={m.id}
            className={`mode-card${mode?.id === m.id ? " selected" : ""}`}
            style={mode?.id === m.id ? { borderColor: m.color, background: `${m.color}15` } : {}}
            onClick={() => setMode(m)}
          >
            <div className="mode-icon">{m.icon}</div>
            <div>
              <div className="mode-label">{m.label}</div>
              <div className="mode-desc">{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" disabled={!mode} onClick={() => setScreen(mode.id)}>
        C'est parti ! →
      </button>
    </>
  ) : null;

  return (
    <>
      <style>{css}</style>
      <style>{deviceCss}</style>
      <div className="app">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Écran de sélection d'appareil */}
        {!device && <DevicePicker onSelect={setDevice} />}

        {/* MOBILE */}
        {device === "mobile" && (
          <div className="container">
            {screen === "home" && (
              <>
                <div className="header">
                  <div className="header-badge">Révision Brevet 3ème</div>
                  <h1>Prépare ton<br /><span>Brevet</span> 📖</h1>
                  <p>Questions générées par IA • Programme officiel</p>
                </div>
                <div className="section-title">Choisis une matière</div>
                <div className="subject-grid">
                  {SUBJECTS.map((s) => (
                    <div key={s.id} className={`subject-card${subject?.id === s.id ? " selected" : ""}`}
                      style={subject?.id === s.id ? { borderColor: s.color, background: `${s.color}18` } : {}}
                      onClick={() => { setSubject(s); setMode(null); }}>
                      <div className="subject-icon">{s.icon}</div>
                      <div className="subject-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <ModeSection />
                <button className="change-device-btn" onClick={() => setDevice(null)}>Changer d'appareil</button>
              </>
            )}
            {screen === "quiz" && <QuizMode subject={subject} onBack={goHome} />}
            {screen === "long" && <LongMode subject={subject} onBack={goHome} />}
          </div>
        )}

        {/* TABLETTE */}
        {device === "tablet" && (
          <div className="tablet-layout">
            {screen === "home" && (
              <>
                <div className="header">
                  <div className="header-badge">Révision Brevet 3ème</div>
                  <h1>Prépare ton<br /><span>Brevet</span> 📖</h1>
                  <p>Questions générées par IA • Programme officiel</p>
                </div>
                <div className="section-title">Choisis une matière</div>
                <div className="tablet-subject-grid">
                  {SUBJECTS.map((s) => (
                    <div key={s.id} className={`subject-card${subject?.id === s.id ? " selected" : ""}`}
                      style={subject?.id === s.id ? { borderColor: s.color, background: `${s.color}18` } : {}}
                      onClick={() => { setSubject(s); setMode(null); }}>
                      <div className="subject-icon">{s.icon}</div>
                      <div className="subject-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <ModeSection />
                <button className="change-device-btn" onClick={() => setDevice(null)}>Changer d'appareil</button>
              </>
            )}
            {screen === "quiz" && <QuizMode subject={subject} onBack={goHome} />}
            {screen === "long" && <LongMode subject={subject} onBack={goHome} />}
          </div>
        )}

        {/* ORDINATEUR */}
        {device === "desktop" && (
          <div className="desktop-layout">
            {/* Sidebar gauche */}
            <div className="desktop-sidebar">
              <div className="header">
                <div className="header-badge">Brevet 3ème</div>
                <h1>Prépare<br />ton <span>Brevet</span> 📖</h1>
                <p style={{ fontSize: 13 }}>IA • Programme DNB officiel</p>
              </div>
              {screen === "home" && (
                <>
                  <div className="section-title">Matière</div>
                  <div className="desktop-subject-grid">
                    {SUBJECTS.map((s) => (
                      <div key={s.id} className={`desktop-subject-card${subject?.id === s.id ? " selected" : ""}`}
                        style={subject?.id === s.id ? { borderColor: s.color, background: `${s.color}18` } : {}}
                        onClick={() => { setSubject(s); setMode(null); }}>
                        <div className="desktop-subject-icon">{s.icon}</div>
                        <div className="desktop-subject-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {screen !== "home" && (
                <button className="btn btn-ghost" onClick={goHome}>← Retour à l'accueil</button>
              )}
              <button className="change-device-btn" onClick={() => setDevice(null)}>Changer d'appareil</button>
            </div>

            {/* Zone principale */}
            <div className="desktop-main">
              {screen === "home" && !subject && (
                <div className="desktop-empty">
                  <div style={{ fontSize: 56 }}>👈</div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700 }}>Choisis une matière</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>dans le menu à gauche</div>
                </div>
              )}
              {screen === "home" && subject && (
                <>
                  <div style={{ marginBottom: 20, padding: "24px", background: `${subject.color}15`, borderRadius: 18, border: `1.5px solid ${subject.color}40` }}>
                    <div style={{ fontSize: 36 }}>{subject.icon}</div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, marginTop: 10 }}>{subject.label}</div>
                  </div>
                  <div className="section-title">Mode de révision</div>
                  <ModeSection />
                </>
              )}
              {screen === "quiz" && <QuizMode subject={subject} onBack={goHome} />}
              {screen === "long" && <LongMode subject={subject} onBack={goHome} />}
            </div>
          </div>
        )}
      </div>
    </>
  );
}