import { formatCurrency } from "../utils";

interface CartSummaryProps {
  cartQuantity: number;
  cartTotal: number;
}

function CartSummary({ cartQuantity, cartTotal }: CartSummaryProps) {
  return (
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
  );
}

export default CartSummary;
