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
import { Spinner } from "react-bootstrap";

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

  // Функция для проверки инициализации Telegram WebApp
  const checkTelegramWebApp = () => {
    console.log('=== Проверка Telegram WebApp ===');
    
    // Проверяем наличие объекта Telegram
    if (!window.Telegram) {
      console.error('Объект Telegram не найден');
      return false;
    }

    // Проверяем наличие WebApp
    if (!window.Telegram.WebApp) {
      console.error('WebApp не найден');
      return false;
    }

    const webApp = window.Telegram.WebApp;
    
    // Проверяем, что мы в Telegram
    if (!webApp.initData) {
      console.error('initData отсутствует');
      return false;
    }

    console.log('WebApp успешно инициализирован');
    console.log('Platform:', webApp.platform);
    console.log('Version:', webApp.version);
    
    return true;
  };

  useEffect(() => {
    // Проверяем инициализацию Telegram WebApp
    const isInitialized = checkTelegramWebApp();
    console.log('WebApp инициализирован:', isInitialized);

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
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner animation="border" role="status" variant="warning" style={{ width: 60, height: 60 }}>
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
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