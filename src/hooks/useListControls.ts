import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_SORT, SEARCH_DEBOUNCE_MS } from '../constants';
import type { SortOption } from '../types';
import { isValidSort, resolveSort } from '../utils/sorting';

interface ListControls {
  /** Live text in the search box (updates on every keystroke). */
  searchInput: string;
  /** The committed keyword that lives in the URL (?q=...). */
  searchTerm: string;
  sort: SortOption;
  setSearchInput: (value: string) => void;
  setSort: (value: string) => void;
  clearSearch: () => void;
}

/**
 * Keeps the search keyword and sort order in the URL query string
 * (e.g. ?q=milk&sort=name-asc) so they can be shared, bookmarked, and
 * edited by hand. The page always renders from the URL, so changing the URL
 * (typing it, back/forward buttons) updates the view automatically.
 */
export const useListControls = (): ListControls => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') ?? '';
  const rawSort = searchParams.get('sort');
  const sort = useMemo(() => resolveSort(rawSort), [rawSort]);

  const [searchInput, setSearchInput] = useState(searchTerm);

  // URL -> input: when the URL changes from outside, mirror it into the box.
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // input -> URL (debounced so we do not rewrite the URL on every keystroke).
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchTerm) return;
    const timer = window.setTimeout(() => updateParam('q', trimmed || null), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchTerm, updateParam]);

  const setSort = useCallback(
    (value: string) => {
      updateParam('sort', isValidSort(value) && value !== DEFAULT_SORT ? value : null);
    },
    [updateParam],
  );

  const clearSearch = useCallback(() => {
    setSearchInput('');
    updateParam('q', null);
  }, [updateParam]);

  return { searchInput, searchTerm, sort, setSearchInput, setSort, clearSearch };
};
