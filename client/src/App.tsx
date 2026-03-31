import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5074";
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];
const CART_STORAGE_KEY = "mission12-cart";

interface Book {
  bookId: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
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

// Empty form state used when adding a new book
const emptyForm = {
  title: "",
  author: "",
  publisher: "",
  isbn: "",
  classification: "",
  category: "",
  pageCount: 0,
  price: 0,
};

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

function getRoute(hash: string): string {
  if (hash === "#/cart") return "cart";
  if (hash === "#/adminbooks") return "adminbooks";
  return "home";
}

function App() {
  // ── Catalog state ──────────────────────────────────────────────────────────
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
  const [route, setRoute] = useState(getRoute(window.location.hash));

  // ── Admin state ────────────────────────────────────────────────────────────
  const [adminBooks, setAdminBooks] = useState<Book[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  // ── Routing ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute(window.location.hash));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ── Cart persistence ───────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Load categories ────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/categories`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load categories.");
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

  // ── Load catalog books ─────────────────────────────────────────────────────
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

        if (!response.ok) throw new Error("Failed to load books from the API.");

        const data: BooksResponse = await response.json();
        setBooks(data.books);
        setTotalPages(Math.max(data.totalPages, 1));
        setTotalCount(data.totalCount);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError((loadError as Error).message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadBooks();
    return () => controller.abort();
  }, [page, pageSize, sort, selectedCategory]);

  // ── Load admin books ───────────────────────────────────────────────────────
  useEffect(() => {
    if (route === "adminbooks") loadAdminBooks();
  }, [route]);

  async function loadAdminBooks() {
    setAdminLoading(true);
    setAdminError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/books?pageSize=200`);
      if (!response.ok) throw new Error("Failed to load books.");
      const data: BooksResponse = await response.json();
      setAdminBooks(data.books);
    } catch (err) {
      setAdminError((err as Error).message);
    } finally {
      setAdminLoading(false);
    }
  }

  // ── Admin CRUD handlers ────────────────────────────────────────────────────

  // Open the form pre-filled to edit an existing book
  function handleEditClick(book: Book) {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    });
    setShowForm(true);
  }

  // Open a blank form to add a new book
  function handleAddClick() {
    setEditingBook(null);
    setFormData(emptyForm);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingBook(null);
    setFormData(emptyForm);
  }

  // Submit form for both add (POST) and edit (PUT)
  async function handleFormSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setAdminError("");
    try {
      if (editingBook) {
        // PUT — update existing book
        const response = await fetch(`${API_BASE_URL}/api/books/${editingBook.bookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, bookId: editingBook.bookId }),
        });
        if (!response.ok) throw new Error("Failed to update book.");
      } else {
        // POST — create new book
        const response = await fetch(`${API_BASE_URL}/api/books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, bookId: 0 }),
        });
        if (!response.ok) throw new Error("Failed to add book.");
      }

      setShowForm(false);
      setEditingBook(null);
      setFormData(emptyForm);
      await loadAdminBooks();
    } catch (err) {
      setAdminError((err as Error).message);
    }
  }

  // DELETE a book after confirmation
  async function handleDelete(bookId: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setAdminError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete book.");
      await loadAdminBooks();
    } catch (err) {
      setAdminError((err as Error).message);
    }
  }

  // ── Catalog derived values ─────────────────────────────────────────────────
  const cartQuantity = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity * item.price, 0),
    [cartItems]
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const toggleSort = () => {
    setPage(1);
    setSort((current) => (current === "title" ? "title_desc" : "title"));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const addToCart = (book: Book) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.bookId === book.bookId);
      if (existing) {
        return current.map((item) =>
          item.bookId === book.bookId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { bookId: book.bookId, title: book.title, price: Number(book.price), quantity: 1 }];
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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
            Mission 13 Bookstore
          </a>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <a className={`nav-link px-0 ${route === "home" ? "text-white" : "text-white-50"}`} href="#/">
              Catalog
            </a>
            <a className={`nav-link px-0 ${route === "cart" ? "text-white" : "text-white-50"}`} href="#/cart">
              Cart <span className="badge rounded-pill text-bg-warning">{cartQuantity}</span>
            </a>
            <a className={`nav-link px-0 ${route === "adminbooks" ? "text-white" : "text-white-50"}`} href="#/adminbooks">
              Admin
            </a>
          </div>
        </div>
      </nav>

      <div className="container py-4 py-lg-5">

        {/* ── Catalog page ──────────────────────────────────────────────── */}
        {route === "home" && (
          <section className="row g-4">
            <div className="col-12 col-xl-9">
              <div className="hero-card mb-4">
                <p className="eyebrow mb-2">IS 413 Mission 13</p>
                <h1 className="h2 mb-0">Online Bookstore Catalog</h1>
              </div>

              <div className="controls-card mb-4">
                <div className="row g-3 align-items-end">
                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={selectedCategory} onChange={handleCategoryChange}>
                      <option value="All">All</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Results per page</label>
                    <select className="form-select" value={pageSize} onChange={handlePageSizeChange}>
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
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

              {error && <div className="alert alert-danger">{error}</div>}

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
                        <tr><td colSpan={5} className="text-center py-5">Loading books...</td></tr>
                      ) : books.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-5">No books match this category.</td></tr>
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
                  <p className="mb-0 text-muted">Page {page} of {totalPages}</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1 || isLoading}
                    >
                      Previous
                    </button>
                    {pageNumbers.map((n) => (
                      <button
                        key={n}
                        className={`btn ${n === page ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => setPage(n)}
                        disabled={isLoading}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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
                  <a href="#/cart" className="btn btn-warning w-100 fw-semibold">View Cart</a>
                </div>
              </div>
            </aside>
          </section>
        )}

        {/* ── Cart page ─────────────────────────────────────────────────── */}
        {route === "cart" && (
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

        {/* ── Admin page ────────────────────────────────────────────────── */}
        {route === "adminbooks" && (
          <section className="row justify-content-center">
            <div className="col-12">
              <div className="hero-card mb-4 d-flex justify-content-between align-items-center">
                <div>
                  <p className="eyebrow mb-2">IS 413 Mission 13</p>
                  <h1 className="h2 mb-0">Admin — Manage Books</h1>
                </div>
                {!showForm && (
                  <button className="btn btn-dark" onClick={handleAddClick}>
                    + Add New Book
                  </button>
                )}
              </div>

              {adminError && <div className="alert alert-danger">{adminError}</div>}

              {/* Add / Edit form */}
              {showForm && (
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body">
                    <h2 className="h5 card-title mb-3">
                      {editingBook ? "Edit Book" : "Add New Book"}
                    </h2>
                    <form onSubmit={handleFormSubmit}>
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label">Title</label>
                          <input
                            className="form-control"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Author</label>
                          <input
                            className="form-control"
                            required
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Publisher</label>
                          <input
                            className="form-control"
                            value={formData.publisher}
                            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">ISBN</label>
                          <input
                            className="form-control"
                            value={formData.isbn}
                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label">Category</label>
                          <input
                            className="form-control"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label">Classification</label>
                          <input
                            className="form-control"
                            value={formData.classification}
                            onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                          />
                        </div>
                        <div className="col-6 col-md-2">
                          <label className="form-label">Page Count</label>
                          <input
                            type="number"
                            className="form-control"
                            min={1}
                            value={formData.pageCount}
                            onChange={(e) => setFormData({ ...formData, pageCount: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-6 col-md-2">
                          <label className="form-label">Price ($)</label>
                          <input
                            type="number"
                            className="form-control"
                            min={0}
                            step={0.01}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-dark">
                          {editingBook ? "Save Changes" : "Add Book"}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={handleCancelForm}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Books table */}
              <div className="table-card">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminLoading ? (
                        <tr><td colSpan={5} className="text-center py-5">Loading books...</td></tr>
                      ) : adminBooks.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-5">No books found.</td></tr>
                      ) : (
                        adminBooks.map((book) => (
                          <tr key={book.bookId}>
                            <td className="fw-semibold">{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.category}</td>
                            <td>${formatCurrency(book.price)}</td>
                            <td className="text-end">
                              <div className="d-flex gap-2 justify-content-end">
                                <button
                                  className="btn btn-sm btn-outline-dark"
                                  onClick={() => handleEditClick(book)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(book.bookId, book.title)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default App;
