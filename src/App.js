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
import { Toaster, ToastContainer } from "react-hot-toast";
import axios from "axios";
import { authService } from "./services/authService";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Функция для добавления параметра debug в URL
  const addDebugParam = () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('debug')) {
      url.searchParams.set('debug', '1');
      window.history.replaceState({}, '', url);
    }
  };

  // Функция для открытия консоли разработчика
  const openDevTools = () => {
    if (window.Telegram?.WebApp) {
      const currentUrl = window.location.href;
      const debugUrl = currentUrl.includes('?') 
        ? `${currentUrl}&debug=1` 
        : `${currentUrl}?debug=1`;
      window.Telegram.WebApp.openLink(debugUrl);
    }
  };

  useEffect(() => {
    // Добавляем параметр debug при загрузке
    addDebugParam();

    const token = localStorage.getItem("token");
    if (token) {
      authService.verifyToken(token)
        .then((isValid) => {
          setIsAuthenticated(isValid);
          if (isValid) {
            return authService.checkAdminStatus(token);
          }
          return false;
        })
        .then((isAdminUser) => {
          setIsAdmin(isAdminUser);
          setIsLoading(false);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Инициализация Telegram Web App
  useEffect(() => {
    console.log("=== Инициализация Telegram Web App ===");
    console.log("Telegram object available:", !!window.Telegram);
    console.log("Telegram WebApp available:", !!window.Telegram?.WebApp);
    
    if (window.Telegram?.WebApp) {
      try {
        console.log("Initializing Telegram WebApp...");
        window.Telegram.WebApp.ready();
        console.log("WebApp ready");
        
        window.Telegram.WebApp.expand();
        console.log("WebApp expanded");
        
        window.Telegram.WebApp.MainButton
          .setText("Закрыть")
          .onClick(() => {
            console.log("MainButton clicked, closing WebApp");
            window.Telegram.WebApp.close();
          })
          .show();
        console.log("MainButton configured and shown");
      } catch (error) {
        console.error("Error initializing Telegram WebApp:", error);
        console.error("Error stack:", error.stack);
      }
    } else {
      console.log("Telegram WebApp is not available");
    }
  }, []);

  // Функция выхода из системы
  const handleLogout = async () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    
    if (window.Telegram?.WebApp) {
      try {
        await window.Telegram.WebApp.sendData(
          JSON.stringify({ action: "logout" })
        );
        window.Telegram.WebApp.close();
      } catch (error) {
        console.error("Error sending logout data:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        {/* Кнопка отладки - видна только в режиме разработки */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={openDevTools}
            style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              zIndex: 9999,
              padding: '5px 10px',
              background: '#0088cc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Открыть DevTools
          </button>
        )}
        
        <Toaster position="top-center" />
        <AgeVerificationModal />
        <Header
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
        />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/profile" replace />
                )
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated ? (
                  <Register setIsAuthenticated={setIsAuthenticated} />
                ) : (
                  <Navigate to="/profile" replace />
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
            <Route
              path="/terms"
              element={<TermsPage />}
            />
            <Route
              path="/admin"
              element={
                isAuthenticated && isAdmin ? (
                  <Admin />
                ) : (
                  <Navigate to="/profile" />
                )
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;