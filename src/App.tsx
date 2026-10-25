import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/routing/RouteGuards';
import { Spinner } from './components/ui/Feedback';
import { useAppDispatch } from './store/hooks';
import { restoreSession } from './store/slices/authSlice';

// Route-level code splitting keeps the first load fast.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ListDetailPage = lazy(() => import('./pages/ListDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SharedListPage = lazy(() => import('./pages/SharedListPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Visible to everyone */}
          <Route path="/shared/:shareId" element={<SharedListPage />} />

          {/* Logged-out visitors only */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Logged-in users only */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/lists/:listId" element={<ListDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
