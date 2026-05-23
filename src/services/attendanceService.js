/* ============================================
   Attendance Service
   Mock attendance tracking with localStorage
   ============================================ */

const STORAGE_KEY = 'cc_attendance';

/* Student name lookup map */
const studentNames = {
  'user-1': 'Maria Santos',
  'user-2': 'Juan Cruz',
  'user-3': 'Ana Reyes',
  'user-4': 'Carlos Mendoza',
  'user-5': 'Isabella Garcia',
  'user-6': 'Miguel Torres',
  'user-7': 'Sofia Ramirez',
  'user-8': 'Diego Villanueva',
  'user-9': 'Camille Tan',
  'user-10': 'Rafael Aquino',
};

/* ===== Internal Helpers ===== */

const getAttendance = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setAttendance = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ===== Exported Functions ===== */

/**
 * Record a student's attendance at an event
 * @param {string} studentId - The student's user ID
 * @param {string} eventId - The event ID
 * @param {string} verifiedBy - Who verified the attendance
 * @returns {Promise<object>} The attendance record
 */
export const recordAttendance = async (studentId, eventId, verifiedBy) => {
  await delay(300);

  const record = {
    id: Date.now(),
    studentId,
    studentName: studentNames[studentId] || `Student ${studentId}`,
    eventId,
    timestamp: new Date().toISOString(),
    verifiedBy,
  };

  const records = getAttendance();
  records.push(record);
  setAttendance(records);

  return record;
};

/**
 * Get all attendance records for a specific event
 * @param {string} eventId - The event ID
 * @returns {Promise<array>} Attendance records for the event
 */
export const getEventAttendance = async (eventId) => {
  await delay(200);

  const records = getAttendance();
  return records.filter((r) => r.eventId === eventId);
};

/**
 * Check if a student has already been marked present at an event
 * @param {string} studentId - The student's user ID
 * @param {string} eventId - The event ID
 * @returns {boolean} Whether attendance has been recorded
 */
export const checkAttendance = (studentId, eventId) => {
  const records = getAttendance();
  return records.some((r) => r.studentId === studentId && r.eventId === eventId);
};

/**
 * Get a student's complete attendance history
 * @param {string} studentId - The student's user ID
 * @returns {Promise<array>} All attendance records for the student
 */
export const getStudentAttendanceHistory = async (studentId) => {
  await delay(200);

  const records = getAttendance();
  return records.filter((r) => r.studentId === studentId);
};
