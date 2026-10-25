import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import SearchSortBar from '../components/controls/SearchSortBar';
import ItemCard from '../components/items/ItemCard';
import { Badge, EmptyState, ErrorState, Spinner } from '../components/ui/Feedback';
import { useListControls } from '../hooks/useListControls';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadSharedList } from '../store/slices/sharedSlice';
import { filterByName, sortRecords } from '../utils/sorting';

/** Public, read-only view of a list that its owner chose to share. */
const SharedListPage = () => {
  const { shareId = '' } = useParams();
  const dispatch = useAppDispatch();
  const { list, items, status, error } = useAppSelector((state) => state.shared);
  const controls = useListControls();

  useEffect(() => {
    dispatch(loadSharedList(shareId));
  }, [dispatch, shareId]);

  const visibleItems = useMemo(
    () => sortRecords(filterByName(items, controls.searchTerm), controls.sort),
    [items, controls.searchTerm, controls.sort],
  );

  if (status === 'loading' || status === 'idle') return <Spinner label="Loading shared list…" />;
  if (status === 'failed' || !list) {
    return <ErrorState message={error ?? 'This list is unavailable.'} />;
  }

  return (
    <>
      <div className="alert alert--info">You are viewing a shared list (read-only).</div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{list.name}</h1>
          <p className="page-subtitle">
            <Badge>{list.category}</Badge> {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
          {list.notes && <p className="page-notes">{list.notes}</p>}
        </div>
        <Link to="/register" className="btn btn--secondary btn--md">
          Make your own lists
        </Link>
      </div>

      <SearchSortBar
        searchInput={controls.searchInput}
        sortValue={controls.sort.value}
        placeholder="Search items by name…"
        onSearchChange={controls.setSearchInput}
        onSortChange={controls.setSort}
        onClear={controls.clearSearch}
      />

      {items.length === 0 ? (
        <EmptyState title="This list is empty" message="The owner has not added any items yet." />
      ) : visibleItems.length === 0 ? (
        <EmptyState title="No matching items" message={`Nothing matches "${controls.searchTerm}".`} />
      ) : (
        <ul className="item-list">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} readOnly />
          ))}
        </ul>
      )}
    </>
  );
};

export default SharedListPage;
