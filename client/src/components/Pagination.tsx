interface PaginationProps {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, isLoading, onPageChange }: PaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination-card">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <p className="mb-0 text-muted">
          Page {page} of {totalPages}
        </p>

        <div className="d-flex flex-wrap gap-2 justify-content-md-end">
          <button
            className="btn btn-outline-dark"
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              className={`btn ${pageNumber === page ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => onPageChange(pageNumber)}
              disabled={isLoading}
            >
              {pageNumber}
            </button>
          ))}

          <button
            className="btn btn-outline-dark"
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
