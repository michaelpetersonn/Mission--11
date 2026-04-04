import { useEffect, useMemo, useState } from "react";
import type { Book, BooksResponse, CartItem } from "./types";
import { readCartFromStorage, CART_STORAGE_KEY } from "./utils";
import Navbar from "./components/Navbar";
import BookFilters from "./components/BookFilters";
import BookTable from "./components/BookTable";
import Pagination from "./components/Pagination";
import CartSummary from "./components/CartSummary";
import CartPage from "./components/CartPage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5074";
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

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
      <Navbar route={route} cartQuantity={cartQuantity} />

      <div className="container py-4 py-lg-5">
        {route === "home" ? (
          <section className="row g-4">
            <div className="col-12 col-xl-9">
              <div className="hero-card mb-4">
                <p className="eyebrow mb-2">IS 413 Mission 12</p>
                <h1 className="h2 mb-0">Online Bookstore Catalog</h1>
              </div>

              <BookFilters
                categories={categories}
                selectedCategory={selectedCategory}
                pageSize={pageSize}
                sort={sort}
                totalCount={totalCount}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onCategoryChange={handleCategoryChange}
                onPageSizeChange={handlePageSizeChange}
                onToggleSort={toggleSort}
              />

              <BookTable
                books={books}
                isLoading={isLoading}
                error={error}
                onAddToCart={addToCart}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={setPage}
              />
            </div>

            <aside className="col-12 col-xl-3">
              <CartSummary cartQuantity={cartQuantity} cartTotal={cartTotal} />
            </aside>
          </section>
        ) : (
          <CartPage cartItems={cartItems} cartTotal={cartTotal} />
        )}
      </div>
    </main>
  );
}

export default App;
