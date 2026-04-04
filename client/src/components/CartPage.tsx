import type { CartItem } from "../types";
import { formatCurrency } from "../utils";

interface CartPageProps {
  cartItems: CartItem[];
  cartTotal: number;
}

function CartPage({ cartItems, cartTotal }: CartPageProps) {
  return (
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
  );
}

export default CartPage;
