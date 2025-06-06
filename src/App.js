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
import { Toaster } from "react-hot-toast";
import axios from "axios";

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

  // Функция для обновления токена
  const refreshToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await axios.post(
        'https://beerbot-cfhp.onrender.com/api/auth/refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      return false;
    }
  };

  // Функция для отправки токена в Telegram
  const sendAuthToTelegram = (token) => {
    if (window.Telegram?.WebApp) {
      try {
        const data = {
          action: "auth",
          token: token
        };
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        toast.success("Данные успешно отправлены в Telegram");
        return true;
      } catch (error) {
        console.error("Error sending data to Telegram:", error);
        return false;
      }
    }
    return true; // Если не в Telegram, просто возвращаем true
  };

  // Синхронизация состояния isAuthenticated с localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const authStatus = !!token;
      
      if (authStatus !== isAuthenticated) {
        setIsAuthenticated(authStatus);
        
        if (authStatus && token) {
          sendAuthToTelegram(token);
        }
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [isAuthenticated]);

  // Инициализация Telegram Web App
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      window.Telegram.WebApp.MainButton
        .setText("Закрыть")
        .onClick(() => {
          window.Telegram.WebApp.close();
        })
        .show();

      const token = localStorage.getItem('token');
      if (token) {
        sendAuthToTelegram(token);
      }
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

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Toaster position="top-center" />
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
      </div>
    </Router>
  );
}

export default App;