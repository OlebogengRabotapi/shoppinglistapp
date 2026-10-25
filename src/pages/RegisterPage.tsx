import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, register } from '../store/slices/authSlice';
import {
  validateRegistration,
  type FieldErrors,
  type RegisterField,
  type RegisterValues,
} from '../utils/validation';

const emptyValues: RegisterValues = {
  name: '',
  surname: '',
  email: '',
  cellNumber: '',
  password: '',
  confirmPassword: '',
};

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [values, setValues] = useState<RegisterValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const bind = (field: RegisterField) => ({
    value: values[field],
    error: errors[field],
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setValues((previous) => ({ ...previous, [field]: event.target.value })),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateRegistration(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const { confirmPassword: _confirm, ...payload } = values;
    dispatch(register(payload));
  };

  return (
    <section className="auth card">
      <h1 className="auth__title">Create your account</h1>
      <p className="auth__subtitle">It takes less than a minute.</p>
      <form onSubmit={handleSubmit} noValidate className="form">
        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}
        <div className="form-row">
          <TextField label="Name" autoComplete="given-name" {...bind('name')} />
          <TextField label="Surname" autoComplete="family-name" {...bind('surname')} />
        </div>
        <TextField label="Email address" type="email" autoComplete="email" {...bind('email')} />
        <TextField
          label="Cell number"
          type="tel"
          autoComplete="tel"
          placeholder="0821234567"
          {...bind('cellNumber')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          {...bind('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...bind('confirmPassword')}
        />
        <Button type="submit" fullWidth loading={status === 'loading'}>
          Create account
        </Button>
      </form>
      <p className="auth__switch">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
