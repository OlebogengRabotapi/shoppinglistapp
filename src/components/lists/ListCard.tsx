import { Link } from 'react-router-dom';
import type { ShoppingList } from '../../types';
import { formatDate } from '../../utils/format';
import Button from '../ui/Button';
import { Badge } from '../ui/Feedback';

interface ListCardProps {
  list: ShoppingList;
  itemCount: number;
  purchasedCount: number;
  onEdit: (list: ShoppingList) => void;
  onDelete: (list: ShoppingList) => void;
}

const ListCard = ({ list, itemCount, purchasedCount, onEdit, onDelete }: ListCardProps) => {
  const progress = itemCount === 0 ? 0 : Math.round((purchasedCount / itemCount) * 100);

  return (
    <article className="card list-card">
      <div className="list-card__top">
        <Badge>{list.category}</Badge>
        {list.isShared && <span className="list-card__shared">Shared</span>}
      </div>
      <h3 className="list-card__title">
        <Link to={`/lists/${list.id}`} className="list-card__link">
          {list.name}
        </Link>
      </h3>
      {list.notes && <p className="list-card__notes">{list.notes}</p>}
      <div className="progress" aria-label={`${purchasedCount} of ${itemCount} items bought`}>
        <div className="progress__bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="list-card__meta">
        {purchasedCount}/{itemCount} bought · Added {formatDate(list.createdAt)}
      </p>
      <div className="list-card__actions">
        <Link to={`/lists/${list.id}`} className="btn btn--primary btn--sm">
          Open
        </Link>
        <Button size="sm" variant="secondary" onClick={() => onEdit(list)}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" className="btn--danger-text" onClick={() => onDelete(list)}>
          Delete
        </Button>
      </div>
    </article>
  );
};

export default ListCard;
