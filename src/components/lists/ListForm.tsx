import { useState, type FormEvent } from 'react';
import type { ListInput } from '../../api/lists';
import { CATEGORIES, DEFAULT_CATEGORY } from '../../constants';
import Button from '../ui/Button';
import { SelectField, TextAreaField, TextField } from '../ui/FormField';

interface ListFormProps {
  initial?: ListInput;
  submitLabel: string;
  onSubmit: (input: ListInput) => Promise<unknown>;
  onCancel: () => void;
}

const ListForm = ({ initial, submitLabel, onSubmit, onCancel }: ListFormProps) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? DEFAULT_CATEGORY);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Give your list a name.');
      return;
    }
    setBusy(true);
    try {
      await onSubmit({ name, category, notes });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <TextField
        label="List name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError(undefined);
        }}
        error={error}
        placeholder="e.g. Weekly groceries"
        maxLength={60}
        autoFocus
      />
      <SelectField
        label="Category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        options={CATEGORIES}
      />
      <TextAreaField
        label="Notes (optional)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Anything to remember about this list"
        maxLength={300}
      />
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

export default ListForm;
