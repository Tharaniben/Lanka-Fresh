import { Link } from "react-router-dom";

interface NavLink {
  to: string;
  label: string;
}

const links: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products & Inventory" },
  { to: "/cart", label: "Cart & Orders" },
  { to: "/suppliers", label: "Suppliers & Purchases" },
  { to: "/delivery", label: "Delivery" },
  { to: "/complaints", label: "Complaints" },
  { to: "/reports", label: "Reports" },
];

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">LankaFresh</span>
      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
