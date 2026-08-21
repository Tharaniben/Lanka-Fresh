import { Link } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/react";

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
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();

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
      <div className="navbar-auth">
        {isLoaded && isSignedIn && (
          <button type="button" onClick={() => signOut({ redirectUrl: "/" })}>
            Sign out
          </button>
        )}
        {isLoaded && !isSignedIn && (
          <>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
