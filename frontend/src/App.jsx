import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductInventoryPage from "./features/product-inventory/ProductInventoryPage";
import CartOrderPage from "./features/cart-order/CartOrderPage";
import SupplierPurchasePage from "./features/supplier-purchase/SupplierPurchasePage";
import DeliveryManagementPage from "./features/delivery-management/DeliveryManagementPage";
import ComplaintRelationsPage from "./features/complaint-relations/ComplaintRelationsPage";
import SalesReportingPage from "./features/sales-reporting/SalesReportingPage";
import "./index.css";

function App() {
  return (
    <>
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductInventoryPage />} />
          <Route path="/cart" element={<CartOrderPage />} />
          <Route path="/suppliers" element={<SupplierPurchasePage />} />
          <Route path="/delivery" element={<DeliveryManagementPage />} />
          <Route path="/complaints" element={<ComplaintRelationsPage />} />
          <Route path="/reports" element={<SalesReportingPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
