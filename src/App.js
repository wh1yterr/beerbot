import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AgeVerificationModal from "./components/AgeVerificationModal";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import TermsPage from "./pages/TermsPage";
import Admin from "./pages/Admin";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Компонент защищённого маршрута для админа
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.role !== "admin") {
      return <Navigate to="/profile" />;
    }
    return children;
  } catch (err) {
    console.error("Ошибка декодирования токена:", err);
    return <Navigate to="/login" />;
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  // Синхронизация состояния isAuthenticated с localStorage
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const authStatus = !!token;
      if (authStatus !== isAuthenticated) {
        console.log("Auth status changed:", authStatus);
        setIsAuthenticated(authStatus);
      }
    };

    // Проверяем состояние при монтировании
    checkAuth();

    // Добавляем слушатель событий для изменений в localStorage
    window.addEventListener("storage", checkAuth);

        // Проверяем, что Web App инициализирован
    useEffect(() => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
      }
    }, []);

    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log("Telegram Web App initialized");

      // Настройка кнопки "Закрыть"
      window.Telegram.WebApp.MainButton.setText("Закрыть")
        .onClick(() => window.Telegram.WebApp.close())
        .show();
    } else {
      console.warn("Telegram Web App not available");
    }

    // Очистка слушателя при размонтировании
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [isAuthenticated]); // Зависимость от isAuthenticated для обновления

  // Функция выхода из системы
  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({ action: "logout" })
      );
      console.log("Logout data sent to Telegram");
      window.Telegram.WebApp.close();
    }
  };

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <AgeVerificationModal />
        <Header
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
        />

        {/* Основной контент */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/products" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated ? (
                  <Register setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/products" replace />
                )
              }
            />
            <Route
              path="/products"
              element={
                isAuthenticated ? (
                  <Products />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/cart"
              element={
                isAuthenticated ? (
                  <Cart />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/terms" element={<TermsPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Admin />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </main>

        {/* Футер */}
        <Footer />
        {/* Контейнер для тостов */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;