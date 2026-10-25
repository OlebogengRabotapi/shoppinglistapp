import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, login } from '../store/slices/authSlice';
import { isValidEmail } from '../utils/validation';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const errors: { email?: string; password?: string } = {};
    if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Enter your password.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    dispatch(login({ email, password }));
  };

  return (
    <section className="auth card">
      <h1 className="auth__title">Welcome back</h1>
      <p className="auth__subtitle">Log in to see your shopping lists.</p>
      <form onSubmit={handleSubmit} noValidate className="form">
        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
        />
        <Button type="submit" fullWidth loading={status === 'loading'}>
          Log in
        </Button>
      </form>
      <p className="auth__switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
};

export default LoginPage;
