import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProductInventoryPage from "./features/product-inventory/ProductInventoryPage";
import CartOrderPage from "./features/cart-order/CartOrderPage";
import SupplierPurchasePage from "./features/supplier-purchase/SupplierPurchasePage";
import DeliveryManagementPage from "./features/delivery-management/DeliveryManagementPage";
import ComplaintRelationsPage from "./features/complaint-relations/ComplaintRelationsPage";
import SalesReportingPage from "./features/sales-reporting/SalesReportingPage";
import UserManagementPage from "./features/product-inventory/UserManagementPage";
import AuthSync from "./auth/AuthSync";
import ProtectedRoute from "./auth/ProtectedRoute";
import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import "./index.css";

function App() {
  return (
    <>
      {/* No visual output — keeps the shared axios client supplied with a
          fresh Clerk session token on every request. */}
      <AuthSync />

      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Public auth & status routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Products can be browsed publicly or managed by staff */}
          <Route path="/products" element={<ProductInventoryPage />} />

          {/* Cart & Orders */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute
                allowedRoles={["CUSTOMER", "SALES_STAFF", "BRANCH_MANAGER"]}
              >
                <CartOrderPage />
              </ProtectedRoute>
            }
          />

          {/* Suppliers & Purchases */}
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute
                allowedRoles={["INVENTORY_STAFF", "BRANCH_MANAGER"]}
              >
                <SupplierPurchasePage />
              </ProtectedRoute>
            }
          />

          {/* Delivery Management & Tracking */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute
                allowedRoles={["CUSTOMER", "DELIVERY_STAFF", "BRANCH_MANAGER"]}
              >
                <DeliveryManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Complaint & Relations */}
          <Route
            path="/complaints"
            element={
              <ProtectedRoute
                allowedRoles={["CUSTOMER", "CRO", "BRANCH_MANAGER"]}
              >
                <ComplaintRelationsPage />
              </ProtectedRoute>
            }
          />

          {/* Sales Reporting */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={["BRANCH_MANAGER"]}
              >
                <SalesReportingPage />
              </ProtectedRoute>
            }
          />

          {/* User Management (Branch Manager only) */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["BRANCH_MANAGER"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
