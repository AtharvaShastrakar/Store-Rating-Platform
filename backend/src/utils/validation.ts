export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email?: string): string | null => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Must follow standard email validation rules (e.g. user@example.com).';
  }
  return null;
};

export const validateName = (name?: string): string | null => {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
};

export const validateStoreName = (name?: string): string | null => {
  if (!name || typeof name !== 'string') return 'Store name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 60) {
    return 'Store name must be between 3 and 60 characters.';
  }
  return null;
};

export const validateAddress = (address?: string): string | null => {
  if (!address || typeof address !== 'string') return 'Address is required.';
  const trimmed = address.trim();
  if (trimmed.length === 0) return 'Address cannot be empty.';
  if (trimmed.length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
};

export const validatePassword = (password?: string): string | null => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be 8-16 characters long.';
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return 'Password must include at least one uppercase letter.';
  }
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecial) {
    return 'Password must include at least one special character.';
  }
  return null;
};

export const validateUserPayload = (data: {
  name?: string;
  email?: string;
  password?: string;
  address?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  const nameErr = validateName(data.name);
  if (nameErr) errors.push({ field: 'name', message: nameErr });

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.push({ field: 'email', message: emailErr });

  if (data.password !== undefined) {
    const pwdErr = validatePassword(data.password);
    if (pwdErr) errors.push({ field: 'password', message: pwdErr });
  }

  const addrErr = validateAddress(data.address);
  if (addrErr) errors.push({ field: 'address', message: addrErr });

  return errors;
};
