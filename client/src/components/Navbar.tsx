interface NavbarProps {
  route: string;
  cartQuantity: number;
}

function Navbar({ route, cartQuantity }: NavbarProps) {
  return (
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
  );
}

export default Navbar;
