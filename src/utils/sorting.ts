import { DEFAULT_SORT, SORT_OPTIONS } from '../constants';
import type { SortOption } from '../types';

interface Sortable {
  name: string;
  category: string;
  createdAt: string;
}

/** Return the matching sort option, or the default if the URL value is invalid. */
export const resolveSort = (value: string | null): SortOption => {
  const found = SORT_OPTIONS.find((option) => option.value === value);
  return found ?? (SORT_OPTIONS.find((o) => o.value === DEFAULT_SORT) as SortOption);
};

export const isValidSort = (value: string | null): boolean =>
  SORT_OPTIONS.some((option) => option.value === value);

const compareText = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

export const sortRecords = <T extends Sortable>(records: T[], sort: SortOption): T[] => {
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...records].sort((a, b) => {
    let result = 0;
    if (sort.key === 'name') {
      result = compareText(a.name, b.name);
    } else if (sort.key === 'category') {
      result = compareText(a.category, b.category) || compareText(a.name, b.name);
    } else {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return result * factor;
  });
};

export const filterByName = <T extends { name: string }>(records: T[], term: string): T[] => {
  const needle = term.trim().toLowerCase();
  if (!needle) return records;
  return records.filter((record) => record.name.toLowerCase().includes(needle));
};
