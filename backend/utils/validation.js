const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
};

const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

const getNameError = (name) => {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Name must be at least 2 characters long.";
  }

  if (name.trim().length > 80) {
    return "Name must be 80 characters or fewer.";
  }

  return null;
};

const getPasswordError = (password) => {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (password.length > 72) {
    return "Password must be 72 characters or fewer.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }

  return null;
};

module.exports = {
  EMAIL_REGEX,
  normalizeEmail,
  isValidEmail,
  getNameError,
  getPasswordError,
};
