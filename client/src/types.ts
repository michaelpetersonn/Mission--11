export interface Book {
  bookId: number;
  title: string;
  author: string;
  category: string;
  price: number;
}

export interface CartItem {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
}

export interface BooksResponse {
  books: Book[];
  totalPages: number;
  totalCount: number;
}
