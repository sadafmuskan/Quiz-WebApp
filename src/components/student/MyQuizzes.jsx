import { useState, useEffect } from 'react';
import { BookOpen, Play, RotateCcw, Send, Trophy, BarChart3, CheckCircle2, XCircle, ArrowLeft, X, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes, addQuizResult, getStudentResults } from '../../utils/storage';

const LABELS = ['A', 'B', 'C', 'D'];

export default function MyQuizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [tab, setTab] = useState('available');

  const load = () => { setQuizzes(getQuizzes()); setResults(getStudentResults(user.id)); };
  useEffect(load, [user.id]);

  const startQuiz = (quiz) => { setActiveQuiz(quiz); setAnswers({}); setSubmitted(false); setScore(0); };
  const selectAnswer = (qi, oi) => { if (!submitted) setAnswers(p => ({ ...p, [qi]: oi })); };

  const submitQuiz = () => {
    if (Object.keys(answers).length < activeQuiz.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    setScore(correct);
    setSubmitted(true);
    addQuizResult({ studentId: user.id, quizId: activeQuiz.id, score: correct, total: activeQuiz.questions.length });
    load();
  };

  const closeQuiz = () => { setActiveQuiz(null); setAnswers({}); setSubmitted(false); };

  const takenIds = new Set(results.map(r => r.quizId));
  const pct = activeQuiz ? Math.round((score / activeQuiz.questions.length) * 100) : 0;

  // ── Active Quiz View ─────────────────────────────────────
  if (activeQuiz) {
    return (
      <div>
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1>{activeQuiz.title}</h1>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-info">{activeQuiz.subject}</span>
                <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{activeQuiz.questions.length} questions</span>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={closeQuiz}>
              <X size={14} /> Exit Quiz
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="card">
            <div className="result-card">
              <div className="result-score">{pct}%</div>
              <div className="result-label">
                {pct >= 70 ? 'Excellent! 🎉' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}
              </div>
              <div className="result-detail">
                You got <strong>{score}</strong> out of <strong>{activeQuiz.questions.length}</strong> questions correct.
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={closeQuiz}>
                  <ArrowLeft size={15} strokeWidth={2} /> Back to Quizzes
                </button>
              </div>
            </div>
            <hr />
            <div style={{ marginTop: 14 }}>
              <strong style={{ color: 'var(--clr-primary-dark)' }}>Review Answers</strong>
              {activeQuiz.questions.map((q, qi) => (
                <div key={qi} className="quiz-question" style={{ marginTop: 12 }}>
                  <div className="q-num">Question {qi + 1}</div>
                  <div className="q-text">{q.question}</div>
                  <div className="quiz-options">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === oi;
                      const isCorrect  = q.correct === oi;
                      return (
                        <div key={oi} className={`quiz-option ${isCorrect ? 'correct' : isSelected ? 'wrong' : ''}`}>
                          <span className="option-label">{LABELS[oi]}</span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span style={{ marginLeft: 'auto', color: '#059669', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <CheckCircle2 size={13} strokeWidth={2.5} /> Correct
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span style={{ marginLeft: 'auto', color: '#dc2626', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <XCircle size={13} strokeWidth={2.5} /> Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="info-box" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={15} strokeWidth={2} />
              Answer all {activeQuiz.questions.length} questions, then click Submit.
              &nbsp; Answered: {Object.keys(answers).length}/{activeQuiz.questions.length}
            </div>
            <div className="progress-bar" style={{ marginBottom: 20 }}>
              <div className="progress-fill" style={{ width: `${(Object.keys(answers).length / activeQuiz.questions.length) * 100}%` }} />
            </div>

            {activeQuiz.questions.map((q, qi) => (
              <div key={qi} className="quiz-question">
                <div className="q-num">Question {qi + 1} of {activeQuiz.questions.length}</div>
                <div className="q-text">{q.question}</div>
                <div className="quiz-options">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`quiz-option ${answers[qi] === oi ? 'selected' : ''}`}
                      onClick={() => selectAnswer(qi, oi)}>
                      <span className="option-label">{LABELS[oi]}</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={closeQuiz}><X size={14} /> Cancel</button>
              <button className="btn btn-primary" onClick={submitQuiz}>
                <Send size={15} strokeWidth={2} /> Submit Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Quiz List View ───────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1>My Quizzes</h1>
        <p>Take subject-wise quizzes and track your performance.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'available' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('available')}>
          <BookOpen size={15} strokeWidth={2} /> Available Quizzes
        </button>
        <button className={`btn ${tab === 'results' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('results')}>
          <Trophy size={15} strokeWidth={2} /> My Results ({results.length})
        </button>
      </div>

      {tab === 'available' && (
        quizzes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <BookOpen size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
              <p>No quizzes available yet. Your admin will add quizzes soon.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
            {quizzes.map(q => {
              const taken    = takenIds.has(q.id);
              const myResult = results.find(r => r.quizId === q.id);
              const myPct    = myResult ? Math.round((myResult.score / myResult.total) * 100) : null;
              return (
                <div className="card" key={q.id} style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span className="badge badge-info">{q.subject}</span>
                    {taken && (
                      <span className={`badge ${myPct >= 70 ? 'badge-success' : myPct >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                        {myPct}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--clr-primary-dark)' }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ClipboardList size={13} strokeWidth={2} /> {q.questions?.length} questions
                  </div>

                  {taken ? (
                    <div>
                      <div className="progress-bar" style={{ marginBottom: 6 }}>
                        <div className={`progress-fill ${myPct >= 70 ? 'green' : myPct >= 40 ? 'yellow' : 'red'}`}
                          style={{ width: `${myPct}%` }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', textAlign: 'center', marginBottom: 10 }}>
                        Score: {myResult.score}/{myResult.total} · {new Date(myResult.completedAt).toLocaleDateString()}
                      </div>
                      <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => startQuiz(q)}>
                        <RotateCcw size={13} strokeWidth={2} /> Retake Quiz
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => startQuiz(q)}>
                      <Play size={14} strokeWidth={2} /> Start Quiz
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'results' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BarChart3 size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              My Quiz Results
            </span>
          </div>
          {results.length === 0 ? (
            <div className="empty-state">
              <Trophy size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
              <p>No quiz results yet. Start a quiz to see your results here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Quiz</th><th>Subject</th><th>Score</th><th>Percentage</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {[...results].reverse().map((r, i) => {
                    const quiz = quizzes.find(q => q.id === r.quizId);
                    const p    = Math.round((r.score / r.total) * 100);
                    return (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td><strong>{quiz?.title || 'Unknown'}</strong></td>
                        <td><span className="badge badge-info">{quiz?.subject || '—'}</span></td>
                        <td>{r.score}/{r.total}</td>
                        <td>
                          <span className={`badge ${p >= 70 ? 'badge-success' : p >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                            {p}%
                          </span>
                        </td>
                        <td>{new Date(r.completedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}