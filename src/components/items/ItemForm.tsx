import { useState, type FormEvent } from 'react';
import type { ItemInput } from '../../api/lists';
import { CATEGORIES, DEFAULT_CATEGORY } from '../../constants';
import Button from '../ui/Button';
import { SelectField, TextAreaField, TextField } from '../ui/FormField';
import ImagePicker from './ImagePicker';

interface ItemFormProps {
  initial?: ItemInput;
  submitLabel: string;
  onSubmit: (input: ItemInput) => Promise<unknown>;
  onCancel: () => void;
}

const ItemForm = ({ initial, submitLabel, onSubmit, onCancel }: ItemFormProps) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [category, setCategory] = useState(initial?.category ?? DEFAULT_CATEGORY);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [errors, setErrors] = useState<{ name?: string; quantity?: string }>({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const next: { name?: string; quantity?: string } = {};
    if (!name.trim()) next.name = 'Item name is required.';
    const parsed = Number(quantity);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 999) {
      next.quantity = 'Enter a whole number from 1 to 999.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await onSubmit({ name, quantity: Number(quantity), category, notes, images });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <TextField
        label="Item name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        placeholder="e.g. Full cream milk"
        maxLength={80}
        autoFocus
      />
      <div className="form-row">
        <TextField
          label="Quantity"
          type="number"
          inputMode="numeric"
          min={1}
          max={999}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          error={errors.quantity}
        />
        <SelectField
          label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={CATEGORIES}
        />
      </div>
      <TextAreaField
        label="Notes (optional)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Brand, size, where to find it…"
        maxLength={200}
      />
      <ImagePicker images={images} onChange={setImages} />
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;
