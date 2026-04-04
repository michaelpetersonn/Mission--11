import type { Book } from "../types";
import { formatCurrency } from "../utils";

interface BookTableProps {
  books: Book[];
  isLoading: boolean;
  error: string;
  onAddToCart: (book: Book) => void;
}

function BookTable({ books, isLoading, error, onAddToCart }: BookTableProps) {
  return (
    <>
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
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => onAddToCart(book)}
                      >
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
    </>
  );
}

export default BookTable;
