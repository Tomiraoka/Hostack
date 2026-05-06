import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

import "./style.css";

try {
  const raw = localStorage.getItem("hostack_auth");
  if (raw) {
    const data = JSON.parse(raw);

    if (data && data.token && !data.accessToken) {
      localStorage.removeItem("hostack_auth");
      console.log("Старый формат токена обнаружен и очищен. Войдите снова.");
    }
  }
} catch (e) {
  localStorage.removeItem("hostack_auth");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);
