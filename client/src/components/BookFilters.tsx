interface BookFiltersProps {
  categories: string[];
  selectedCategory: string;
  pageSize: number;
  sort: string;
  totalCount: number;
  pageSizeOptions: number[];
  onCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onPageSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onToggleSort: () => void;
}

function BookFilters({
  categories,
  selectedCategory,
  pageSize,
  sort,
  totalCount,
  pageSizeOptions,
  onCategoryChange,
  onPageSizeChange,
  onToggleSort,
}: BookFiltersProps) {
  return (
    <div className="controls-card mb-4">
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={onCategoryChange}
          >
            <option value="All">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Results per page</label>
          <select
            className="form-select"
            value={pageSize}
            onChange={onPageSizeChange}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-lg-3">
          <button className="btn btn-dark w-100" onClick={onToggleSort}>
            Sort: {sort === "title" ? "Title A-Z" : "Title Z-A"}
          </button>
        </div>

        <div className="col-12 col-lg-3">
          <div className="text-muted small">
            <strong>{totalCount}</strong> books found
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFilters;
