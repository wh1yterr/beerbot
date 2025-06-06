import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendTokenToTelegram = (token) => {
    console.log("=== Начало отправки токена в Telegram (Login) ===");
    console.log("Token:", token);
    console.log("Telegram WebApp available:", !!window.Telegram?.WebApp);
    console.log("Telegram WebApp object:", window.Telegram?.WebApp);
    
    if (window.Telegram?.WebApp) {
      try {
        const data = {
          action: "auth",
          token: token
        };
        console.log("Preparing to send data:", data);
        const jsonData = JSON.stringify(data);
        console.log("JSON data to send:", jsonData);
        
        window.Telegram.WebApp.sendData(jsonData);
        console.log("Data sent successfully");
        return true;
      } catch (error) {
        console.error("Error sending token to Telegram:", error);
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
        return false;
      }
    } else {
      console.warn("Telegram Web App not available");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Очистка предыдущих ошибок
    console.log("=== Начало процесса входа ===");

    try {
      const loginData = { email, password };
      console.log("Sending login request with data:", { ...loginData, password: "***" });
      
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/login",
        loginData
      );
      console.log("Login response:", response.data);

      // Сохранение токена в localStorage
      const token = response.data.token;
      console.log("Token received:", token);
      localStorage.setItem("token", token);

      // Отправка токена в Telegram
      console.log("Sending token to Telegram");
      sendTokenToTelegram(token);

      // Обновляем состояние авторизации
      console.log("Setting isAuthenticated to true");
      setIsAuthenticated(true);

      // Очищаем форму
      setEmail("");
      setPassword("");

      // Перенаправляем на профиль
      console.log("Navigating to /profile");
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
      
      if (err.response && err.response.data) {
        console.error("Error response data:", err.response.data);
        setError(err.response.data.message || "Ошибка авторизации");
      } else {
        setError("Ошибка сервера");
      }
    } finally {
      console.log("=== Конец процесса входа ===");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Вход</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 mb-3">
          Войти
        </Button>

        <div className="text-center">
          <Link to="/register">Нет аккаунта? Зарегистрируйтесь</Link>
        </div>
      </Form>
    </Container>
  );
};

export default Login;