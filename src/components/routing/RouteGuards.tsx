import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { Spinner } from '../ui/Feedback';

/** Only logged-in users may pass; everyone else is sent to /login. */
export const ProtectedRoute = () => {
  const { user, initialising } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (initialising) return <Spinner label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

/** Login and register are for logged-out visitors only. */
export const PublicOnlyRoute = () => {
  const { user, initialising } = useAppSelector((state) => state.auth);

  if (initialising) return <Spinner label="Checking your session…" />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
};
