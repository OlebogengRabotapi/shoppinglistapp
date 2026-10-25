import { Outlet } from 'react-router-dom';
import ToastContainer from '../ui/ToastContainer';
import Navbar from './Navbar';

const AppLayout = () => (
  <div className="app-shell">
    <Navbar />
    <main className="page">
      <Outlet />
    </main>
    <footer className="footer">CartCraft · Shopping lists made simple</footer>
    <ToastContainer />
  </div>
);

export default AppLayout;
