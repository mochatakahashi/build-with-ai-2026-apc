const ALLOWED_DOMAINS = ['student.apc.edu.ph', 'apc.edu.ph'];

export const getEmailDomain = (email) => {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1]?.toLowerCase() || '';
};

export const isApcEmail = (email) => {
  const domain = getEmailDomain(email);
  return ALLOWED_DOMAINS.includes(domain);
};

export const getUserTypeFromEmail = (email) => {
  const domain = getEmailDomain(email);
  if (domain === 'student.apc.edu.ph') return 'student';
  if (domain === 'apc.edu.ph') return 'faculty';
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required', domain: '', userType: null };
  }

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address', domain: '', userType: null };
  }

  const domain = getEmailDomain(email);
  const userType = getUserTypeFromEmail(email);

  if (!ALLOWED_DOMAINS.includes(domain)) {
    return {
      valid: false,
      error: 'Only APC emails are allowed (@student.apc.edu.ph or @apc.edu.ph)',
      domain,
      userType: null,
    };
  }

  return { valid: true, error: '', domain, userType };
};

export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required', strength: 'weak' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters', strength: 'weak' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 2) strength = 'medium';

  return { valid: true, error: '', strength };
};

export const validateRequired = (value, fieldName) => {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true, error: '' };
};
