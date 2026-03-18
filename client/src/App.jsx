import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5074";
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

function App() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState("title");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        setIsLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          sort,
        });

        const response = await fetch(`${API_BASE_URL}/api/books?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load books from the API.");
        }

        const data = await response.json();
        setBooks(data.books);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBooks();

    return () => controller.abort();
  }, [page, pageSize, sort]);

  const toggleSort = () => {
    setPage(1);
    setSort((currentSort) => (currentSort === "title" ? "title_desc" : "title"));
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <main className="app-shell">
      <div className="container py-5">
        <section className="hero-card mb-4">
          <p className="eyebrow">IS 413 Mission 11</p>
          <h1 className="display-5 fw-semibold">Online Bookstore Catalog</h1>
        </section>

        <section className="controls-card mb-4">
          <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center">
            <div>
              <h2 className="h5 mb-1">Book Results</h2>
              <p className="text-muted mb-0">{totalCount} total books</p>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
              <label className="form-label mb-0">
                <span className="me-2">Results per page</span>
                <select
                  className="form-select"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <button className="btn btn-dark sort-button" onClick={toggleSort}>
                Sort: {sort === "title" ? "Title A-Z" : "Title Z-A"}
              </button>
            </div>
          </div>
        </section>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <section className="table-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Publisher</th>
                  <th>ISBN</th>
                  <th>Classification</th>
                  <th>Category</th>
                  <th>Pages</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      Loading books...
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.bookId}>
                      <td className="fw-semibold">{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.publisher}</td>
                      <td>{book.isbn}</td>
                      <td>{book.classification}</td>
                      <td>{book.category}</td>
                      <td>{book.pageCount}</td>
                      <td>${Number(book.price).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pagination-card mt-4">
          <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
            <p className="mb-0 text-muted">
              Page {page} of {totalPages}
            </p>

            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <button
                className="btn btn-outline-dark"
                onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`btn ${pageNumber === page ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() => setPage(pageNumber)}
                  disabled={isLoading}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                className="btn btn-outline-dark"
                onClick={() =>
                  setPage((currentPage) => Math.min(currentPage + 1, totalPages))
                }
                disabled={page === totalPages || isLoading}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
