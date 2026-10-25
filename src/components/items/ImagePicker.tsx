import { useId, useState, type ChangeEvent } from 'react';
import { MAX_IMAGES_PER_ITEM } from '../../constants';
import { compressImage } from '../../utils/image';
import { getErrorMessage } from '../../utils/format';

interface ImagePickerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

const ImagePicker = ({ images, onChange }: ImagePickerProps) => {
  const inputId = useId();
  const [error, setError] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const remaining = MAX_IMAGES_PER_ITEM - images.length;

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, remaining);
    event.target.value = '';
    if (files.length === 0) return;
    setError(undefined);
    setProcessing(true);
    try {
      const added = await Promise.all(files.map(compressImage));
      onChange([...images, ...added]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="field">
      <span className="field__label">Images (up to {MAX_IMAGES_PER_ITEM})</span>
      <div className="image-picker">
        {images.map((src, index) => (
          <div className="image-picker__thumb" key={`${index}-${src.length}`}>
            <img src={src} alt={`Item preview ${index + 1}`} />
            <button
              type="button"
              className="image-picker__remove"
              aria-label={`Remove image ${index + 1}`}
              onClick={() => onChange(images.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <label htmlFor={inputId} className="image-picker__add">
            {processing ? '…' : '+'}
            <span className="sr-only">Add image</span>
          </label>
        )}
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFiles}
        disabled={remaining <= 0 || processing}
      />
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImagePicker;
