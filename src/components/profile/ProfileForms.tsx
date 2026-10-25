import { useState, type FormEvent } from 'react';
import Button from '../ui/Button';
import { TextField } from '../ui/FormField';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveCredentials, saveProfile } from '../../store/slices/authSlice';
import { isValidEmail, validatePassword, validateProfile } from '../../utils/validation';

export const ProfileDetailsForm = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [name, setName] = useState(user?.name ?? '');
  const [surname, setSurname] = useState(user?.surname ?? '');
  const [cellNumber, setCellNumber] = useState(user?.cellNumber ?? '');
  const [errors, setErrors] = useState<{ name?: string; surname?: string; cellNumber?: string }>({});
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateProfile({ name, surname, cellNumber });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    await dispatch(saveProfile({ id: user.id, name, surname, cellNumber }));
    setBusy(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <TextField
          label="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          error={errors.surname}
        />
      </div>
      <TextField
        label="Cell number"
        type="tel"
        value={cellNumber}
        onChange={(e) => setCellNumber(e.target.value)}
        error={errors.cellNumber}
      />
      <div className="form-actions">
        <Button type="submit" loading={busy}>
          Save profile
        </Button>
      </div>
    </form>
  );
};

export const CredentialsForm = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!isValidEmail(email)) found.email = 'Enter a valid email address.';
    if (!currentPassword) found.currentPassword = 'Enter your current password to confirm.';
    if (newPassword) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) found.newPassword = passwordError;
      if (newPassword !== confirm) found.confirm = 'Passwords do not match.';
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    const result = await dispatch(
      saveCredentials({
        id: user.id,
        currentPassword,
        email,
        newPassword: newPassword || undefined,
      }),
    );
    setBusy(false);
    if (saveCredentials.fulfilled.match(result)) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <TextField
        label="Email address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <TextField
        label="New password (optional)"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={errors.newPassword}
        hint="Leave blank to keep your current password."
      />
      {newPassword && (
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
      )}
      <TextField
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={errors.currentPassword}
      />
      <div className="form-actions">
        <Button type="submit" loading={busy}>
          Update login details
        </Button>
      </div>
    </form>
  );
};
