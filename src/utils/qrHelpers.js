/* ============================================
   QR Code Helper Utilities
   Generate, parse, and validate QR attendance data
   ============================================ */

/**
 * Generate a random 8-character hex token
 * @returns {string} Random hex string
 */
export const generateToken = () => {
  return Math.random().toString(16).substring(2, 10);
};

/**
 * Generate QR data payload for attendance verification
 * @param {string} studentId - Student's unique ID
 * @param {string} eventId - Event's unique ID
 * @returns {string} JSON string with studentId, eventId, timestamp, and token
 */
export const generateQRData = (studentId, eventId) => {
  const payload = {
    studentId,
    eventId,
    timestamp: new Date().toISOString(),
    token: generateToken(),
  };
  return JSON.stringify(payload);
};

/**
 * Parse and validate QR data string
 * @param {string} dataString - Raw QR data string (JSON)
 * @returns {object|null} Parsed QR data object or null if invalid
 */
export const parseQRData = (dataString) => {
  try {
    const parsed = JSON.parse(dataString);

    /* Validate required fields */
    if (!parsed.studentId || !parsed.eventId || !parsed.timestamp || !parsed.token) {
      return null;
    }

    /* Validate timestamp is a valid date */
    if (isNaN(new Date(parsed.timestamp).getTime())) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Check if a QR token is still valid (generated within the last 60 seconds)
 * @param {string} timestamp - ISO timestamp string from QR data
 * @returns {boolean} Whether the QR code is still valid
 */
export const isTokenValid = (timestamp) => {
  const generatedAt = new Date(timestamp).getTime();
  const now = Date.now();
  const sixtySeconds = 60 * 1000;

  return now - generatedAt <= sixtySeconds;
};
