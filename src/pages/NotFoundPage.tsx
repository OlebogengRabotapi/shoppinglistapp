import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/Feedback';

const NotFoundPage = () => (
  <EmptyState
    title="Page not found"
    message="The page you are looking for does not exist."
    action={
      <Link to="/" className="btn btn--primary btn--md">
        Go home
      </Link>
    }
  />
);

export default NotFoundPage;
