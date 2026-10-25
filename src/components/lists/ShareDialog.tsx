import { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { editList } from '../../store/slices/listsSlice';
import { pushToast } from '../../store/slices/toastSlice';
import type { ShoppingList } from '../../types';
import { buildShareUrl } from '../../utils/format';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface ShareDialogProps {
  list: ShoppingList;
  onClose: () => void;
}

const ShareDialog = ({ list, onClose }: ShareDialogProps) => {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(false);
  const url = buildShareUrl(list.shareId);

  const setShared = async (isShared: boolean) => {
    setBusy(true);
    const result = await dispatch(editList({ id: list.id, changes: { isShared }, silent: true }));
    setBusy(false);
    if (editList.fulfilled.match(result)) {
      dispatch(pushToast('success', isShared ? 'Sharing turned on.' : 'Sharing turned off.'));
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      dispatch(pushToast('success', 'Link copied to clipboard.'));
    } catch {
      dispatch(pushToast('error', 'Could not copy automatically. Select the link and copy it.'));
    }
  };

  return (
    <Modal title="Share this list" onClose={onClose}>
      {list.isShared ? (
        <>
          <p className="confirm__message">
            Anyone with this link can <strong>view</strong> the list (they cannot edit it).
          </p>
          <input className="field__control share__url" readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Share link" />
          <div className="form-actions">
            <Button variant="danger" onClick={() => setShared(false)} loading={busy}>
              Stop sharing
            </Button>
            <Button onClick={copyLink}>Copy link</Button>
          </div>
        </>
      ) : (
        <>
          <p className="confirm__message">
            Sharing creates a view-only link. You can turn it off at any time.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => setShared(true)} loading={busy}>
              Create share link
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default ShareDialog;
