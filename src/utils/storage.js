const KEYS = {
  USERS: 'edu_users',
  FEES: 'edu_fees',
  ATTENDANCE: 'edu_attendance',
  QUIZZES: 'edu_quizzes',
  QUIZ_RESULTS: 'edu_quiz_results',
  CURRENT_USER: 'edu_current_user',
};

export const initializeData = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([
      { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' }
    ]));
  }
  ['FEES', 'ATTENDANCE', 'QUIZZES', 'QUIZ_RESULTS'].forEach(key => {
    if (!localStorage.getItem(KEYS[key])) {
      localStorage.setItem(KEYS[key], JSON.stringify([]));
    }
  });
};

// ─── Users / Auth ───────────────────────────────────────────────────────────
export const getUsers = () => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
const saveUsers = (users) => localStorage.setItem(KEYS.USERS, JSON.stringify(users));

export const getStudents = () => getUsers().filter(u => u.role === 'student');
export const getUserById = (id) => getUsers().find(u => u.id === id);

export const login = (username, password) =>
  getUsers().find(u => u.username === username && u.password === password) || null;

export const getCurrentUser = () =>
  JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');

export const setCurrentUser = (user) =>
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));

export const logout = () => localStorage.removeItem(KEYS.CURRENT_USER);

export const addStudent = (student) => {
  const users = getUsers();
  const newUser = { ...student, id: Date.now(), role: 'student' };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const deleteStudent = (id) => {
  saveUsers(getUsers().filter(u => u.id !== id));
  saveFees(getFees().filter(f => f.studentId !== id));
  saveAttendance(getAttendance().filter(a => a.studentId !== id));
};

// ─── Fees ───────────────────────────────────────────────────────────────────
export const getFees = () => JSON.parse(localStorage.getItem(KEYS.FEES) || '[]');
const saveFees = (fees) => localStorage.setItem(KEYS.FEES, JSON.stringify(fees));

export const getStudentFees = (studentId) =>
  getFees().filter(f => f.studentId === studentId);

export const addOrUpdateFee = (feeData) => {
  const fees = getFees();
  const idx = fees.findIndex(
    f => f.studentId === feeData.studentId && f.month === feeData.month && f.year === feeData.year
  );
  if (idx !== -1) {
    fees[idx] = { ...fees[idx], ...feeData };
  } else {
    fees.push({ ...feeData, id: Date.now() });
  }
  saveFees(fees);
};

export const deleteFee = (id) => saveFees(getFees().filter(f => f.id !== id));

// ─── Attendance ─────────────────────────────────────────────────────────────
export const getAttendance = () => JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]');
const saveAttendance = (data) => localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(data));

export const getStudentAttendance = (studentId) =>
  getAttendance().filter(a => a.studentId === studentId);

export const markAttendance = (records) => {
  const attendance = getAttendance();
  records.forEach(record => {
    const idx = attendance.findIndex(
      a => a.studentId === record.studentId && a.date === record.date
    );
    if (idx !== -1) {
      attendance[idx] = { ...attendance[idx], ...record };
    } else {
      attendance.push({ ...record, id: Date.now() + Math.random() });
    }
  });
  saveAttendance(attendance);
};

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export const getQuizzes = () => JSON.parse(localStorage.getItem(KEYS.QUIZZES) || '[]');
const saveQuizzes = (q) => localStorage.setItem(KEYS.QUIZZES, JSON.stringify(q));

export const addQuiz = (quiz) => {
  const quizzes = getQuizzes();
  const newQuiz = { ...quiz, id: Date.now(), createdAt: new Date().toISOString() };
  quizzes.push(newQuiz);
  saveQuizzes(quizzes);
  return newQuiz;
};

export const deleteQuiz = (id) => saveQuizzes(getQuizzes().filter(q => q.id !== id));

// ─── Quiz Results ─────────────────────────────────────────────────────────
export const getQuizResults = () =>
  JSON.parse(localStorage.getItem(KEYS.QUIZ_RESULTS) || '[]');

export const getStudentResults = (studentId) =>
  getQuizResults().filter(r => r.studentId === studentId);

export const addQuizResult = (result) => {
  const results = getQuizResults();
  results.push({ ...result, id: Date.now(), completedAt: new Date().toISOString() });
  localStorage.setItem(KEYS.QUIZ_RESULTS, JSON.stringify(results));
};
