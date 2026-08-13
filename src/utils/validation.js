export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Name cannot be empty.';
  }
  if (trimmed.length < 20) {
    return `Name must be at least 20 characters (current: ${trimmed.length}).`;
  }
  if (trimmed.length > 60) {
    return `Name must not exceed 60 characters (current: ${trimmed.length}).`;
  }
  return null;
}

export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return 'Address is required.';
  }
  const trimmed = address.trim();
  if (!trimmed) {
    return 'Address cannot be empty.';
  }
  if (trimmed.length > 400) {
    return `Address must not exceed 400 characters (current: ${trimmed.length}).`;
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be 8-16 characters long (current: ${password.length}).`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter (A-Z).';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email address is required.';
  }
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validateUserForm(data) {
  const errors = {};

  const nameErr = validateName(data.name || '');
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(data.email || '');
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(data.address || '');
  if (addressErr) errors.address = addressErr;

  if (data.password !== undefined) {
    const passwordErr = validatePassword(data.password || '');
    if (passwordErr) errors.password = passwordErr;
  }

  return errors;
}

export function validateStoreForm(data) {
  const errors = {};

  const nameErr = validateName(data.name || '');
  if (nameErr) errors.storeName = nameErr;

  const emailErr = validateEmail(data.email || '');
  if (emailErr) errors.storeEmail = emailErr;

  const addressErr = validateAddress(data.address || '');
  if (addressErr) errors.storeAddress = addressErr;

  return errors;
}
