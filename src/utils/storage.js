import { config } from '../config/env';

const P = config.storagePrefix;

const KEYS = {
  USERS:        `${P}users`,
  FEES:         `${P}fees`,
  ATTENDANCE:   `${P}attendance`,
  QUIZZES:      `${P}quizzes`,
  QUIZ_RESULTS: `${P}quiz_results`,
  CURRENT_USER: `${P}current_user`,
  NOTIFICATIONS:`${P}notifications`,
  HOMEWORK:     `${P}homework`,
};

export const initializeData = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([
      { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' }
    ]));
  }
  ['FEES','ATTENDANCE','QUIZZES','QUIZ_RESULTS','NOTIFICATIONS','HOMEWORK'].forEach(key => {
    if (!localStorage.getItem(KEYS[key]))
      localStorage.setItem(KEYS[key], JSON.stringify([]));
  });
};

// ─── Users / Auth ────────────────────────────────────────────────────────────
export const getUsers          = () => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
const saveUsers                = (u) => localStorage.setItem(KEYS.USERS, JSON.stringify(u));
export const getStudents       = () => getUsers().filter(u => u.role === 'student');
export const getUserById       = (id) => getUsers().find(u => u.id === id);
export const getUserByUsername = (username) => getUsers().find(u => u.username === username) || null;
export const login             = (username, password) =>
  getUsers().find(u => u.username === username && u.password === password) || null;
export const getCurrentUser    = () => JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');
export const setCurrentUser    = (user) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
export const logout            = () => localStorage.removeItem(KEYS.CURRENT_USER);

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
export const resetUserPassword = (username, newPassword) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);
  return true;
};

// ─── Fees ────────────────────────────────────────────────────────────────────
export const getFees        = () => JSON.parse(localStorage.getItem(KEYS.FEES) || '[]');
const saveFees              = (f) => localStorage.setItem(KEYS.FEES, JSON.stringify(f));
export const getStudentFees = (studentId) => getFees().filter(f => f.studentId === studentId);
export const addOrUpdateFee = (feeData) => {
  const fees = getFees();
  const idx  = fees.findIndex(f => f.studentId === feeData.studentId && f.month === feeData.month && f.year === feeData.year);
  if (idx !== -1) fees[idx] = { ...fees[idx], ...feeData };
  else fees.push({ ...feeData, id: Date.now() });
  saveFees(fees);
};
export const deleteFee = (id) => saveFees(getFees().filter(f => f.id !== id));

// ─── Attendance ──────────────────────────────────────────────────────────────
export const getAttendance        = () => JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]');
const saveAttendance              = (d) => localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(d));
export const getStudentAttendance = (studentId) => getAttendance().filter(a => a.studentId === studentId);
export const markAttendance       = (records) => {
  const attendance = getAttendance();
  records.forEach(record => {
    const idx = attendance.findIndex(a => a.studentId === record.studentId && a.date === record.date);
    if (idx !== -1) attendance[idx] = { ...attendance[idx], ...record };
    else attendance.push({ ...record, id: Date.now() + Math.random() });
  });
  saveAttendance(attendance);
};

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export const getQuizzes = () => JSON.parse(localStorage.getItem(KEYS.QUIZZES) || '[]');
const saveQuizzes       = (q) => localStorage.setItem(KEYS.QUIZZES, JSON.stringify(q));
export const addQuiz    = (quiz) => {
  const quizzes = getQuizzes();
  const newQuiz = { ...quiz, id: Date.now(), createdAt: new Date().toISOString() };
  quizzes.push(newQuiz);
  saveQuizzes(quizzes);
  return newQuiz;
};
export const deleteQuiz = (id) => saveQuizzes(getQuizzes().filter(q => q.id !== id));

// ─── Quiz Results ─────────────────────────────────────────────────────────────
export const getQuizResults    = () => JSON.parse(localStorage.getItem(KEYS.QUIZ_RESULTS) || '[]');
export const getStudentResults = (studentId) => getQuizResults().filter(r => r.studentId === studentId);
export const addQuizResult     = (result) => {
  const results = getQuizResults();
  results.push({ ...result, id: Date.now(), completedAt: new Date().toISOString() });
  localStorage.setItem(KEYS.QUIZ_RESULTS, JSON.stringify(results));
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications  = () => JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
const saveNotifications        = (d) => localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(d));

export const addNotification = (notif) => {
  const list = getNotifications();
  list.unshift({ ...notif, id: Date.now(), createdAt: new Date().toISOString() });
  saveNotifications(list);
};
export const deleteNotification = (id) =>
  saveNotifications(getNotifications().filter(n => n.id !== id));

// Per-student "last seen" so unread badge works without readBy arrays
export const getNotifLastSeen  = (userId) =>
  Number(localStorage.getItem(`${P}notif_seen_${userId}`) || 0);
export const setNotifLastSeen  = (userId) =>
  localStorage.setItem(`${P}notif_seen_${userId}`, Date.now().toString());
export const getUnreadNotifCount = (userId) => {
  const lastSeen = getNotifLastSeen(userId);
  return getNotifications().filter(n => new Date(n.createdAt).getTime() > lastSeen).length;
};

// ─── Homework ─────────────────────────────────────────────────────────────────
export const getHomework  = () => JSON.parse(localStorage.getItem(KEYS.HOMEWORK) || '[]');
const saveHomework        = (d) => localStorage.setItem(KEYS.HOMEWORK, JSON.stringify(d));

export const addHomework = (hw) => {
  const list = getHomework();
  list.unshift({ ...hw, id: Date.now(), createdAt: new Date().toISOString(), completedBy: [] });
  saveHomework(list);
};
export const deleteHomework = (id) =>
  saveHomework(getHomework().filter(h => h.id !== id));

export const toggleHomeworkDone = (hwId, studentId) => {
  const list = getHomework();
  const idx  = list.findIndex(h => h.id === hwId);
  if (idx === -1) return;
  const done = list[idx].completedBy || [];
  list[idx].completedBy = done.includes(studentId)
    ? done.filter(id => id !== studentId)
    : [...done, studentId];
  saveHomework(list);
};
