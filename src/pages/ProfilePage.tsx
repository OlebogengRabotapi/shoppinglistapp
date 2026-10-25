import { ProfileDetailsForm, CredentialsForm } from '../components/profile/ProfileForms';
import { useAppSelector } from '../store/hooks';
import { formatDate } from '../utils/format';

const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">My profile</h1>
          <p className="page-subtitle">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <section className="card profile-summary" aria-label="Profile summary">
        <div className="avatar" aria-hidden="true">
          {user.name.charAt(0).toUpperCase()}
          {user.surname.charAt(0).toUpperCase()}
        </div>
        <dl className="profile-summary__details">
          <div>
            <dt>Full name</dt>
            <dd>
              {user.name} {user.surname}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Cell number</dt>
            <dd>{user.cellNumber}</dd>
          </div>
        </dl>
      </section>

      <div className="two-col">
        <section className="card">
          <h2 className="card__title">Personal details</h2>
          <ProfileDetailsForm />
        </section>
        <section className="card">
          <h2 className="card__title">Login details</h2>
          <CredentialsForm />
        </section>
      </div>
    </>
  );
};

export default ProfilePage;
