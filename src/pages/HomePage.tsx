import { useCallback, useEffect, useMemo, useState } from 'react';
import SearchSortBar from '../components/controls/SearchSortBar';
import ListCard from '../components/lists/ListCard';
import ListForm from '../components/lists/ListForm';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, Spinner } from '../components/ui/Feedback';
import Modal from '../components/ui/Modal';
import { useListControls } from '../hooks/useListControls';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadUserItems } from '../store/slices/itemsSlice';
import { addList, editList, loadLists, removeList } from '../store/slices/listsSlice';
import type { ShoppingList } from '../types';
import { filterByName, sortRecords } from '../utils/sorting';

type DialogState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; list: ShoppingList }
  | { kind: 'delete'; list: ShoppingList };

const HomePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { entries: lists, status, error } = useAppSelector((state) => state.lists);
  const items = useAppSelector((state) => state.items.entries);
  const controls = useListControls();
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });

  const userId = user?.id;

  const reload = useCallback(() => {
    if (userId === undefined) return;
    dispatch(loadLists(userId));
    dispatch(loadUserItems(userId));
  }, [dispatch, userId]);

  useEffect(reload, [reload]);

  const visibleLists = useMemo(
    () => sortRecords(filterByName(lists, controls.searchTerm), controls.sort),
    [lists, controls.searchTerm, controls.sort],
  );

  const countsByList = useMemo(() => {
    const counts = new Map<number, { total: number; bought: number }>();
    items.forEach((item) => {
      const entry = counts.get(item.listId) ?? { total: 0, bought: 0 };
      entry.total += 1;
      if (item.purchased) entry.bought += 1;
      counts.set(item.listId, entry);
    });
    return counts;
  }, [items]);

  const closeDialog = useCallback(() => setDialog({ kind: 'none' }), []);

  if (!user) return null;

  const isLoading = status === 'loading' && lists.length === 0;

  const renderBody = () => {
    if (isLoading) return <Spinner label="Loading your lists…" />;
    if (status === 'failed') return <ErrorState message={error ?? ''} onRetry={reload} />;
    if (lists.length === 0) {
      return (
        <EmptyState
          title="No shopping lists yet"
          message="Create your first list to start adding items."
          action={<Button onClick={() => setDialog({ kind: 'create' })}>Create a list</Button>}
        />
      );
    }
    if (visibleLists.length === 0) {
      return (
        <EmptyState
          title="No matching lists"
          message={`Nothing matches "${controls.searchTerm}". Try a different name.`}
          action={
            <Button variant="secondary" onClick={controls.clearSearch}>
              Clear search
            </Button>
          }
        />
      );
    }
    return (
      <div className="grid">
        {visibleLists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            itemCount={countsByList.get(list.id)?.total ?? 0}
            purchasedCount={countsByList.get(list.id)?.bought ?? 0}
            onEdit={(target) => setDialog({ kind: 'edit', list: target })}
            onDelete={(target) => setDialog({ kind: 'delete', list: target })}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">My shopping lists</h1>
          <p className="page-subtitle">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'}
          </p>
        </div>
        <Button onClick={() => setDialog({ kind: 'create' })}>+ New list</Button>
      </div>

      <SearchSortBar
        searchInput={controls.searchInput}
        sortValue={controls.sort.value}
        placeholder="Search lists by name…"
        onSearchChange={controls.setSearchInput}
        onSortChange={controls.setSort}
        onClear={controls.clearSearch}
      />

      {renderBody()}

      {dialog.kind === 'create' && (
        <Modal title="New shopping list" onClose={closeDialog}>
          <ListForm
            submitLabel="Create list"
            onCancel={closeDialog}
            onSubmit={async (input) => {
              const result = await dispatch(addList({ userId: user.id, input }));
              if (addList.fulfilled.match(result)) closeDialog();
            }}
          />
        </Modal>
      )}

      {dialog.kind === 'edit' && (
        <Modal title="Edit list" onClose={closeDialog}>
          <ListForm
            initial={dialog.list}
            submitLabel="Save changes"
            onCancel={closeDialog}
            onSubmit={async (input) => {
              const result = await dispatch(
                editList({
                  id: dialog.list.id,
                  changes: { ...input, name: input.name.trim(), notes: input.notes.trim() },
                }),
              );
              if (editList.fulfilled.match(result)) closeDialog();
            }}
          />
        </Modal>
      )}

      {dialog.kind === 'delete' && (
        <ConfirmDialog
          title="Delete list?"
          message={`"${dialog.list.name}" and all of its items will be permanently deleted.`}
          onCancel={closeDialog}
          onConfirm={async () => {
            const result = await dispatch(removeList(dialog.list));
            if (removeList.fulfilled.match(result)) closeDialog();
          }}
        />
      )}
    </>
  );
};

export default HomePage;
