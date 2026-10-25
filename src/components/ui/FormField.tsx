import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
}

const FieldShell = ({
  id,
  label,
  error,
  hint,
  children,
}: BaseProps & { id: string; children: React.ReactNode }) => (
  <div className={`field ${error ? 'field--error' : ''}`}>
    <label htmlFor={id} className="field__label">
      {label}
    </label>
    {children}
    {hint && !error && <p className="field__hint">{hint}</p>}
    {error && (
      <p className="field__error" id={`${id}-error`} role="alert">
        {error}
      </p>
    )}
  </div>
);

export const TextField = ({
  label,
  error,
  hint,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) => {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        className="field__control"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FieldShell>
  );
};

export const TextAreaField = ({
  label,
  error,
  hint,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        className="field__control field__control--area"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        rows={3}
        {...rest}
      />
    </FieldShell>
  );
};

export const SelectField = ({
  label,
  error,
  hint,
  options,
  ...rest
}: BaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) => {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <select id={id} className="field__control" {...rest}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};
