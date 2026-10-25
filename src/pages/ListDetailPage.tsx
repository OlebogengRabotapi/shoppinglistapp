import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SearchSortBar from '../components/controls/SearchSortBar';
import ItemCard from '../components/items/ItemCard';
import ItemForm from '../components/items/ItemForm';
import ShareDialog from '../components/lists/ShareDialog';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Badge, EmptyState, ErrorState, Spinner } from '../components/ui/Feedback';
import Modal from '../components/ui/Modal';
import { useListControls } from '../hooks/useListControls';
import { fetchListById } from '../api/lists';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addItem, editItem, loadItems, removeItem } from '../store/slices/itemsSlice';
import type { ShoppingItem, ShoppingList } from '../types';
import { getErrorMessage } from '../utils/format';
import { filterByName, sortRecords } from '../utils/sorting';

type DialogState =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'edit'; item: ShoppingItem }
  | { kind: 'delete'; item: ShoppingItem }
  | { kind: 'share' };

const ListDetailPage = () => {
  const { listId } = useParams();
  const numericId = Number(listId);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const storedList = useAppSelector((state) =>
    state.lists.entries.find((entry) => entry.id === numericId),
  );
  const { entries: items, status, error } = useAppSelector((state) => state.items);
  const controls = useListControls();
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const [fetchedList, setFetchedList] = useState<ShoppingList | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  // The list may already be in Redux; otherwise (page refresh) fetch it.
  const list = storedList ?? fetchedList;

  useEffect(() => {
    if (storedList || !Number.isInteger(numericId)) return;
    let cancelled = false;
    fetchListById(numericId)
      .then((found) => !cancelled && setFetchedList(found))
      .catch((err) => !cancelled && setListError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [storedList, numericId]);

  const reload = useCallback(() => {
    if (Number.isInteger(numericId)) dispatch(loadItems(numericId));
  }, [dispatch, numericId]);

  useEffect(reload, [reload]);

  const visibleItems = useMemo(
    () =>
      sortRecords(
        filterByName(
          items.filter((item) => item.listId === numericId),
          controls.searchTerm,
        ),
        controls.sort,
      ),
    [items, numericId, controls.searchTerm, controls.sort],
  );

  const closeDialog = useCallback(() => setDialog({ kind: 'none' }), []);

  if (!user) return null;

  // A list that belongs to someone else (or does not exist) is treated as not found.
  if (listError || (list && list.userId !== user.id)) {
    return (
      <EmptyState
        title="List not found"
        message="This list does not exist or you do not have access to it."
        action={
          <Link to="/" className="btn btn--primary btn--md">
            Back to my lists
          </Link>
        }
      />
    );
  }
  if (!list) return <Spinner label="Loading list…" />;

  const allForList = items.filter((item) => item.listId === numericId);
  const boughtCount = allForList.filter((item) => item.purchased).length;

  const renderItems = () => {
    if (status === 'loading' && allForList.length === 0) return <Spinner label="Loading items…" />;
    if (status === 'failed') return <ErrorState message={error ?? ''} onRetry={reload} />;
    if (allForList.length === 0) {
      return (
        <EmptyState
          title="This list is empty"
          message="Add your first item to get started."
          action={<Button onClick={() => setDialog({ kind: 'add' })}>Add an item</Button>}
        />
      );
    }
    if (visibleItems.length === 0) {
      return (
        <EmptyState
          title="No matching items"
          message={`Nothing matches "${controls.searchTerm}".`}
          action={
            <Button variant="secondary" onClick={controls.clearSearch}>
              Clear search
            </Button>
          }
        />
      );
    }
    return (
      <ul className="item-list">
        {visibleItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onToggle={(target) =>
              dispatch(editItem({ id: target.id, changes: { purchased: !target.purchased }, silent: true }))
            }
            onEdit={(target) => setDialog({ kind: 'edit', item: target })}
            onDelete={(target) => setDialog({ kind: 'delete', item: target })}
          />
        ))}
      </ul>
    );
  };

  return (
    <>
      <Link to="/" className="back-link">
        ← All lists
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">{list.name}</h1>
          <p className="page-subtitle">
            <Badge>{list.category}</Badge> {boughtCount}/{allForList.length} bought
          </p>
          {list.notes && <p className="page-notes">{list.notes}</p>}
        </div>
        <div className="page-head__actions">
          <Button variant="secondary" onClick={() => setDialog({ kind: 'share' })}>
            {list.isShared ? 'Sharing on' : 'Share'}
          </Button>
          <Button onClick={() => setDialog({ kind: 'add' })}>+ Add item</Button>
        </div>
      </div>

      <SearchSortBar
        searchInput={controls.searchInput}
        sortValue={controls.sort.value}
        placeholder="Search items by name…"
        onSearchChange={controls.setSearchInput}
        onSortChange={controls.setSort}
        onClear={controls.clearSearch}
      />

      {renderItems()}

      {dialog.kind === 'add' && (
        <Modal title="Add item" onClose={closeDialog}>
          <ItemForm
            submitLabel="Add item"
            onCancel={closeDialog}
            onSubmit={async (input) => {
              const result = await dispatch(addItem({ userId: user.id, listId: list.id, input }));
              if (addItem.fulfilled.match(result)) closeDialog();
            }}
          />
        </Modal>
      )}

      {dialog.kind === 'edit' && (
        <Modal title="Edit item" onClose={closeDialog}>
          <ItemForm
            initial={dialog.item}
            submitLabel="Save changes"
            onCancel={closeDialog}
            onSubmit={async (input) => {
              const result = await dispatch(
                editItem({
                  id: dialog.item.id,
                  changes: { ...input, name: input.name.trim(), notes: input.notes.trim() },
                }),
              );
              if (editItem.fulfilled.match(result)) closeDialog();
            }}
          />
        </Modal>
      )}

      {dialog.kind === 'delete' && (
        <ConfirmDialog
          title="Delete item?"
          message={`"${dialog.item.name}" will be removed from this list.`}
          onCancel={closeDialog}
          onConfirm={async () => {
            const result = await dispatch(removeItem(dialog.item));
            if (removeItem.fulfilled.match(result)) closeDialog();
          }}
        />
      )}

      {dialog.kind === 'share' && <ShareDialog list={list} onClose={closeDialog} />}
    </>
  );
};

export default ListDetailPage;
