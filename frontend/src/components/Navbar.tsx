import { Link } from "react-router-dom";
import { useAuth, useClerk, useUser } from "@clerk/react";
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
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { role, isLoading: isRoleLoading } = useUserRole();

  const links = getNavLinks(Boolean(isSignedIn), role);
  const isReady = isAuthLoaded && isUserLoaded;

  const username =
    user?.username ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";

  const formattedRole = role
    ? role
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

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
        {isReady && isSignedIn && (
          <>
            <div
              className="navbar-user-info"
              title={`Logged in as ${username} (${formattedRole})`}
            >
              <span className="navbar-username">
                {username}
              </span>
              {!isRoleLoading && (
                <span
                  className={`navbar-role-pill ${
                    role === "CUSTOMER" ? "navbar-role-pill--customer" : ""
                  }`}
                  title={`Role: ${formattedRole}`}
                >
                  {formattedRole}
                </span>
              )}
            </div>
            <button
              type="button"
              className="navbar-signout-btn"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              Sign out
            </button>
          </>
        )}
        {isReady && !isSignedIn && (
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
