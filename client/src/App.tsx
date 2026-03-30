import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5074";
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const CART_STORAGE_KEY = "mission12-cart";

interface Book {
  bookId: number;
  title: string;
  author: string;
  category: string;
  price: number;
}

interface CartItem {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
}

interface BooksResponse {
  books: Book[];
  totalPages: number;
  totalCount: number;
}

function readCartFromStorage(): CartItem[] {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
}

function formatCurrency(value: number): string {
  return Number(value).toFixed(2);
}

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState("title");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>(readCartFromStorage);
  const [route, setRoute] = useState(window.location.hash === "#/cart" ? "cart" : "home");

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash === "#/cart" ? "cart" : "home");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/categories`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load categories.");
        }

        const data: string[] = await response.json();
        setCategories(data);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError((loadError as Error).message);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

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

        if (selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }

        const response = await fetch(`${API_BASE_URL}/api/books?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load books from the API.");
        }

        const data: BooksResponse = await response.json();
        setBooks(data.books);
        setTotalPages(Math.max(data.totalPages, 1));
        setTotalCount(data.totalCount);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError((loadError as Error).message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBooks();

    return () => controller.abort();
  }, [page, pageSize, sort, selectedCategory]);

  const cartQuantity = useMemo(
    () => cartItems.reduce((runningTotal, item) => runningTotal + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((runningTotal, item) => runningTotal + item.quantity * item.price, 0),
    [cartItems]
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const toggleSort = () => {
    setPage(1);
    setSort((currentSort) => (currentSort === "title" ? "title_desc" : "title"));
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  const addToCart = (book: Book) => {
    setCartItems((currentCartItems) => {
      const existingItem = currentCartItems.find((item) => item.bookId === book.bookId);

      if (existingItem) {
        return currentCartItems.map((item) =>
          item.bookId === book.bookId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...currentCartItems,
        {
          bookId: book.bookId,
          title: book.title,
          price: Number(book.price),
          quantity: 1,
        },
      ];
    });
  };

  return (
    <main className="app-shell">

      {/* Note to the TA. These are the special bootstrap attributes that I used in this project. - Michael Peterson

          1) Grid layout: container, row, col-12, col-xl-9, col-xl-3, col-lg-10

          2) Additional Bootstrap features:
             - Navbar: navbar, navbar-expand-lg, navbar-dark, bg-dark
             - Badge: badge, rounded-pill, text-bg-warning (cart count)
             - Card: card, card-body (cart summary panel)
             - Alert: alert, alert-danger, alert-info
             - Buttons/Table utilities: btn, btn-outline-dark, table, table-responsive
      */}


      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-semibold" href="#/">
            Mission 12 Bookstore
          </a>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <a
              className={`nav-link px-0 ${route === "home" ? "text-white" : "text-white-50"}`}
              href="#/"
            >
              Catalog
            </a>
            <a
              className={`nav-link px-0 ${route === "cart" ? "text-white" : "text-white-50"}`}
              href="#/cart"
            >
              Cart <span className="badge rounded-pill text-bg-warning">{cartQuantity}</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="container py-4 py-lg-5">
        {route === "home" ? (
          <section className="row g-4">
            <div className="col-12 col-xl-9">
              <div className="hero-card mb-4">
                <p className="eyebrow mb-2">IS 413 Mission 12</p>
                <h1 className="h2 mb-0">Online Bookstore Catalog</h1>
              </div>

              <div className="controls-card mb-4">
                <div className="row g-3 align-items-end">
                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={handleCategoryChange}
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
                      onChange={handlePageSizeChange}
                    >
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-lg-3">
                    <button className="btn btn-dark w-100" onClick={toggleSort}>
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

              {error ? <div className="alert alert-danger">{error}</div> : null}

              <div className="table-card mb-4">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-5">
                            Loading books...
                          </td>
                        </tr>
                      ) : books.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-5">
                            No books match this category.
                          </td>
                        </tr>
                      ) : (
                        books.map((book) => (
                          <tr key={book.bookId}>
                            <td className="fw-semibold">{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.category}</td>
                            <td>${formatCurrency(book.price)}</td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-dark" onClick={() => addToCart(book)}>
                                Add to Cart
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pagination-card">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
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
                      onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
                      disabled={page === totalPages || isLoading}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="col-12 col-xl-3">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h2 className="h5 card-title">Cart Summary</h2>
                  <p className="mb-2">Items: {cartQuantity}</p>
                  <p className="mb-3">Total: ${formatCurrency(cartTotal)}</p>
                  <a href="#/cart" className="btn btn-warning w-100 fw-semibold">
                    View Cart
                  </a>
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <section className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="hero-card mb-4">
                <h1 className="h2 mb-1">Your Cart</h1>
                <p className="mb-0 text-muted">Review your line items, quantities, and totals.</p>
              </div>

              {cartItems.length === 0 ? (
                <div className="alert alert-info">
                  Your cart is empty. <a href="#/">Go add some books.</a>
                </div>
              ) : (
                <div className="table-card">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.bookId}>
                            <td className="fw-semibold">{item.title}</td>
                            <td>{item.quantity}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.quantity * item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 border-top d-flex justify-content-end">
                    <h2 className="h5 mb-0">Cart Total: ${formatCurrency(cartTotal)}</h2>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
