import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductInventoryPage from "./features/product-inventory/ProductInventoryPage";
import CartOrderPage from "./features/cart-order/CartOrderPage";
import SupplierPurchasePage from "./features/supplier-purchase/SupplierPurchasePage";
import DeliveryManagementPage from "./features/delivery-management/DeliveryManagementPage";
import ComplaintRelationsPage from "./features/complaint-relations/ComplaintRelationsPage";
import SalesReportingPage from "./features/sales-reporting/SalesReportingPage";
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

          {/* Public auth routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Module routes require a signed-in user */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <SupplierPurchasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <DeliveryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <ComplaintRelationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <SalesReportingPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
