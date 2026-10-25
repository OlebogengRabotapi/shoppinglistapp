const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// South African cell numbers: 0XXXXXXXXX or +27XXXXXXXXX (spaces and dashes allowed)
const CELL_PATTERN = /^(\+27|0)[1-9]\d{8}$/;

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export const isValidEmail = (email: string): boolean => EMAIL_PATTERN.test(email.trim());

export const normaliseCell = (cell: string): string => cell.replace(/[\s-]/g, '');

export const isValidCell = (cell: string): boolean => CELL_PATTERN.test(normaliseCell(cell));

export const validatePassword = (password: string): string | undefined => {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain at least one letter and one number.';
  }
  return undefined;
};

export type RegisterField =
  | 'name'
  | 'surname'
  | 'email'
  | 'cellNumber'
  | 'password'
  | 'confirmPassword';

export interface RegisterValues {
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  password: string;
  confirmPassword: string;
}

export const validateRegistration = (values: RegisterValues): FieldErrors<RegisterField> => {
  const errors: FieldErrors<RegisterField> = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.surname.trim()) errors.surname = 'Surname is required.';
  if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!isValidCell(values.cellNumber)) {
    errors.cellNumber = 'Enter a valid SA cell number, e.g. 0821234567.';
  }
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
};

export type ProfileField = 'name' | 'surname' | 'cellNumber';

export const validateProfile = (values: {
  name: string;
  surname: string;
  cellNumber: string;
}): FieldErrors<ProfileField> => {
  const errors: FieldErrors<ProfileField> = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.surname.trim()) errors.surname = 'Surname is required.';
  if (!isValidCell(values.cellNumber)) errors.cellNumber = 'Enter a valid SA cell number.';
  return errors;
};
