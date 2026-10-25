import type { ShoppingItem } from '../../types';
import { formatDate } from '../../utils/format';
import Button from '../ui/Button';
import { Badge } from '../ui/Feedback';

interface ItemCardProps {
  item: ShoppingItem;
  /** Read-only mode hides every control (used on the public shared page). */
  readOnly?: boolean;
  onToggle?: (item: ShoppingItem) => void;
  onEdit?: (item: ShoppingItem) => void;
  onDelete?: (item: ShoppingItem) => void;
}

const ItemCard = ({ item, readOnly = false, onToggle, onEdit, onDelete }: ItemCardProps) => (
  <li className={`card item ${item.purchased ? 'item--done' : ''}`}>
    {!readOnly && (
      <input
        type="checkbox"
        className="item__check"
        checked={item.purchased}
        onChange={() => onToggle?.(item)}
        aria-label={`Mark ${item.name} as ${item.purchased ? 'not bought' : 'bought'}`}
      />
    )}
    <div className="item__body">
      <div className="item__head">
        <h3 className="item__name">{item.name}</h3>
        <span className="item__qty">× {item.quantity}</span>
      </div>
      <div className="item__tags">
        <Badge>{item.category}</Badge>
        <span className="item__date">Added {formatDate(item.createdAt)}</span>
      </div>
      {item.notes && <p className="item__notes">{item.notes}</p>}
      {item.images.length > 0 && (
        <div className="item__images">
          {item.images.map((src, index) => (
            <img key={index} src={src} alt={`${item.name} ${index + 1}`} loading="lazy" />
          ))}
        </div>
      )}
      {!readOnly && (
        <div className="item__actions">
          <Button size="sm" variant="secondary" onClick={() => onEdit?.(item)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="btn--danger-text" onClick={() => onDelete?.(item)}>
            Delete
          </Button>
        </div>
      )}
    </div>
  </li>
);

export default ItemCard;
