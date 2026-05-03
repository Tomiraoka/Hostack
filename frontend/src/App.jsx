import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminDishesPage from "./pages/AdminDishesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <AdminRoute>
              <AdminInventoryPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dishes"
          element={
            <AdminRoute>
              <AdminDishesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;
