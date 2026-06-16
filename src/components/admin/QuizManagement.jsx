import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Eye, X, BarChart3, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { getQuizzes, addQuiz, deleteQuiz, getQuizResults, getStudents } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../shared/ConfirmDialog';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [tab, setTab] = useState('list');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correct: 0 }]);
  const [viewQuiz, setViewQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, id: null, title: '' });
  const toast = useToast();

  const load = () => { setQuizzes(getQuizzes()); setResults(getQuizResults()); setStudents(getStudents()); };
  useEffect(load, []);

  const addQuestion = () => setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 0 }]);
  const removeQuestion = (idx) => { if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== idx)); };

  const updateQuestion = (idx, field, val) => {
    const q = [...questions]; q[idx] = { ...q[idx], [field]: val }; setQuestions(q);
  };
  const updateOption = (qi, oi, val) => {
    const q = [...questions]; const opts = [...q[qi].options]; opts[oi] = val; q[qi] = { ...q[qi], options: opts }; setQuestions(q);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title || !subject) return;
    for (const q of questions) {
      if (!q.question.trim()) { toast('All questions must have text.', 'error'); return; }
      if (q.options.some(o => !o.trim())) { toast('All options must be filled.', 'error'); return; }
    }
    addQuiz({ title, subject, questions });
    setTitle(''); setSubject('');
    setQuestions([{ question: '', options: ['', '', '', ''], correct: 0 }]);
    setTab('list'); load();
    toast('Quiz published successfully!', 'success');
  };

  const handleDelete = (id, t) => setConfirm({ open: true, id, title: t });

  const doDelete = () => {
    deleteQuiz(confirm.id);
    load();
    toast(`Quiz "${confirm.title}" deleted.`, 'success');
    setConfirm({ open: false, id: null, title: '' });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Quiz Management</h1>
        <p>Create and manage subject-wise quizzes for students.</p>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Quiz?"
        message={`Are you sure you want to delete "${confirm.title}"? All student results for this quiz will also be lost.`}
        confirmLabel="Yes, Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false, id: null, title: '' })}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('list')}>
          <ClipboardList size={15} strokeWidth={2} /> All Quizzes
        </button>
        <button className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('create')}>
          <Plus size={15} strokeWidth={2.5} /> Create Quiz
        </button>
        <button className={`btn ${tab === 'results' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('results')}>
          <BarChart3 size={15} strokeWidth={2} /> Results
        </button>
      </div>

      {tab === 'list' && (
        quizzes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <ClipboardList size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
              <p>No quizzes yet. Create one using the "Create Quiz" tab.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {quizzes.map(q => {
              const qResults = results.filter(r => r.quizId === q.id);
              return (
                <div className="card" key={q.id} style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--clr-primary-dark)' }}>{q.title}</div>
                      <span className="badge badge-info">{q.subject}</span>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id, q.title)}>
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  </div>
                  <hr />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--clr-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BookOpen size={13} strokeWidth={2} /> {q.questions?.length || 0} questions
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BarChart3 size={13} strokeWidth={2} /> {qResults.length} attempts
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                    Created: {new Date(q.createdAt).toLocaleDateString()}
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%' }}
                    onClick={() => setViewQuiz(q)}>
                    <Eye size={13} strokeWidth={2} /> View Questions
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'create' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Plus size={16} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Create New Quiz
            </span>
          </div>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quiz Title *</label>
                <input className="form-control" placeholder="e.g. Math Chapter 1 Test"
                  value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input className="form-control" placeholder="e.g. Mathematics"
                  value={subject} onChange={e => setSubject(e.target.value)} required />
              </div>
            </div>
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ color: 'var(--clr-primary-dark)' }}>Questions ({questions.length})</strong>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
                <Plus size={13} strokeWidth={2.5} /> Add Question
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} style={{ background: 'var(--clr-light)', borderRadius: 10, padding: 16, marginBottom: 14, border: '1px solid var(--clr-light-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <strong style={{ color: 'var(--clr-primary)', fontSize: 13 }}>Question {qi + 1}</strong>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)} disabled={questions.length === 1}>
                    <X size={12} strokeWidth={2.5} /> Remove
                  </button>
                </div>
                <div className="form-group">
                  <input className="form-control" placeholder="Enter your question..."
                    value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={() => updateQuestion(qi, 'correct', oi)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: q.correct === oi ? 'var(--clr-primary)' : '#cbd5e1' }}>
                        {q.correct === oi
                          ? <CheckCircle2 size={18} strokeWidth={2.5} />
                          : <Circle size={18} strokeWidth={2} />
                        }
                      </button>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: q.correct === oi ? 'var(--clr-primary)' : '#e2e8f0', color: q.correct === oi ? 'white' : '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {OPTION_LABELS[oi]}
                      </span>
                      <input className="form-control" placeholder={`Option ${OPTION_LABELS[oi]}`}
                        value={opt} onChange={e => updateOption(qi, oi, e.target.value)} required />
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--clr-primary)', marginTop: 8 }}>
                  Correct answer: Option {OPTION_LABELS[q.correct]}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setTab('list')}>
                <X size={14} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <ClipboardList size={15} strokeWidth={2} /> Publish Quiz
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'results' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BarChart3 size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              All Quiz Results
            </span>
          </div>
          {results.length === 0 ? (
            <div className="empty-state">
              <BarChart3 size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
              <p>No quiz results yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Student</th><th>Quiz</th><th>Score</th><th>Percentage</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {[...results].reverse().map((r, i) => {
                    const student = students.find(s => s.id === r.studentId);
                    const quiz = quizzes.find(q => q.id === r.quizId);
                    const pct = Math.round((r.score / r.total) * 100);
                    return (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td><strong>{student?.name || 'Unknown'}</strong></td>
                        <td>{quiz?.title || 'Unknown'}</td>
                        <td>{r.score}/{r.total}</td>
                        <td>
                          <span className={`badge ${pct >= 70 ? 'badge-success' : pct >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                            {pct}%
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

      {viewQuiz && (
        <div className="modal-overlay" onClick={() => setViewQuiz(null)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <BookOpen size={18} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                {viewQuiz.title}
              </span>
              <button className="modal-close" onClick={() => setViewQuiz(null)}><X size={15} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <span className="badge badge-info">{viewQuiz.subject}</span>
              <span style={{ marginLeft: 10, color: 'var(--clr-text-muted)', fontSize: 12 }}>
                {viewQuiz.questions?.length} questions
              </span>
            </div>
            {viewQuiz.questions?.map((q, qi) => (
              <div key={qi} className="quiz-question">
                <div className="q-num">Question {qi + 1}</div>
                <div className="q-text">{q.question}</div>
                <div className="quiz-options">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`quiz-option ${oi === q.correct ? 'correct' : ''}`}>
                      <span className="option-label">{OPTION_LABELS[oi]}</span>
                      <span>{opt}</span>
                      {oi === q.correct && (
                        <span style={{ marginLeft: 'auto', color: '#059669', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircle2 size={13} strokeWidth={2.5} /> Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}