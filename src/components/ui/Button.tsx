import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
    disabled={disabled || loading}
    aria-busy={loading}
    {...rest}
  >
    {loading && <span className="btn__spinner" aria-hidden="true" />}
    {children}
  </button>
);

export default Button;
