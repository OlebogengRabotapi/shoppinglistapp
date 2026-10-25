import { useId } from 'react';
import { SORT_OPTIONS } from '../../constants';

interface SearchSortBarProps {
  searchInput: string;
  sortValue: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

const SearchSortBar = ({
  searchInput,
  sortValue,
  placeholder,
  onSearchChange,
  onSortChange,
  onClear,
}: SearchSortBarProps) => {
  const searchId = useId();
  const sortId = useId();

  return (
    <div className="toolbar" role="search">
      <div className="toolbar__search">
        <label htmlFor={searchId} className="sr-only">
          Search by name
        </label>
        <input
          id={searchId}
          type="search"
          className="field__control"
          placeholder={placeholder}
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {searchInput && (
          <button type="button" className="toolbar__clear" onClick={onClear} aria-label="Clear search">
            ×
          </button>
        )}
      </div>
      <div className="toolbar__sort">
        <label htmlFor={sortId} className="toolbar__sort-label">
          Sort by
        </label>
        <select
          id={sortId}
          className="field__control"
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchSortBar;
