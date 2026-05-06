import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const CartPage = lazy(() => import("./pages/CartPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const ManagerOrdersPage = lazy(() => import("./pages/ManagerOrdersPage"));

const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminInventoryPage = lazy(() => import("./pages/AdminInventoryPage"));
const AdminDishesPage = lazy(() => import("./pages/AdminDishesPage"));
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));

function PageLoader() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      color: "#9a9a96",
      fontSize: "14px"
    }}>
      Загрузка...
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Suspense fallback={<PageLoader />}>
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
              <RoleRoute roles={["USER"]}>
                <CartPage />
              </RoleRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <RoleRoute roles={["USER"]}>
                <OrderHistoryPage />
              </RoleRoute>
            }
          />

          <Route
            path="/manager/orders"
            element={
              <RoleRoute roles={["MANAGER", "ADMIN"]}>
                <ManagerOrdersPage />
              </RoleRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <RoleRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <RoleRoute roles={["ADMIN"]}>
                <AdminInventoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/dishes"
            element={
              <RoleRoute roles={["ADMIN"]}>
                <AdminDishesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleRoute roles={["ADMIN"]}>
                <UserManagementPage />
              </RoleRoute>
            }
          />

          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
