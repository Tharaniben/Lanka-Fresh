import { Link } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/react";
import { useUserRole } from "../auth/useUserRole";

interface NavLink {
  to: string;
  label: string;
}

function getNavLinks(isSignedIn: boolean, role: string): NavLink[] {
  if (!isSignedIn) {
    return [
      { to: "/", label: "Home" },
      { to: "/products", label: "Products (Browse)" },
    ];
  }

  switch (role) {
    case "CUSTOMER":
      return [
        { to: "/", label: "Home" },
        { to: "/products", label: "Products" },
        { to: "/cart", label: "My Cart & Orders" },
        { to: "/delivery", label: "Track Delivery" },
        { to: "/complaints", label: "Complaints" },
      ];
    case "SALES_STAFF":
      return [
        { to: "/", label: "Home" },
        { to: "/cart", label: "Orders & Payments" },
      ];
    case "INVENTORY_STAFF":
      return [
        { to: "/", label: "Home" },
        { to: "/products", label: "Products & Inventory" },
        { to: "/suppliers", label: "Suppliers & Purchases" },
      ];
    case "DELIVERY_STAFF":
      return [
        { to: "/", label: "Home" },
        { to: "/delivery", label: "My Deliveries" },
      ];
    case "CRO":
      return [
        { to: "/", label: "Home" },
        { to: "/complaints", label: "Complaints & Feedback" },
      ];
    case "BRANCH_MANAGER":
      return [
        { to: "/", label: "Home" },
        { to: "/reports", label: "Reports & Dashboard" },
        { to: "/products", label: "Products & Inventory" },
        { to: "/cart", label: "Orders" },
        { to: "/suppliers", label: "Suppliers" },
        { to: "/delivery", label: "Delivery" },
        { to: "/complaints", label: "Complaints" },
      ];
    case "ADMIN":
    default:
      return [
        { to: "/", label: "Home" },
        { to: "/products", label: "Products & Inventory" },
        { to: "/cart", label: "Cart & Orders" },
        { to: "/suppliers", label: "Suppliers & Purchases" },
        { to: "/delivery", label: "Delivery" },
        { to: "/complaints", label: "Complaints" },
        { to: "/reports", label: "Reports" },
      ];
  }
}

function Navbar() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { role, isLoading } = useUserRole();

  const links = getNavLinks(Boolean(isSignedIn), role);

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
          <>
            {!isLoading && (
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  padding: "2px 8px",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                }}
              >
                {role}
              </span>
            )}
            <button type="button" onClick={() => signOut({ redirectUrl: "/" })}>
              Sign out
            </button>
          </>
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
