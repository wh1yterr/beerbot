import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendTokenToTelegram = (token) => {
    console.log("Attempting to send token to Telegram...");
    console.log("Token:", token);
    console.log("Telegram WebApp available:", !!window.Telegram?.WebApp);
    
    if (window.Telegram?.WebApp) {
      try {
        const data = {
          action: "auth",
          token: token
        };
        console.log("Sending data to Telegram:", data);
        window.Telegram.WebApp.sendData(JSON.stringify(data));
        console.log("Data sent successfully");
        toast.success("Данные успешно отправлены в Telegram");
        return true;
      } catch (error) {
        console.error("Error sending data to Telegram:", error);
        console.error("Error stack:", error.stack);
        toast.error(`Ошибка отправки данных: ${error.message}`);
        return false;
      }
    } else {
      console.log("Telegram WebApp is not available");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Starting login process...");

    try {
      const loginData = { email, password };
      console.log("Sending login request...");
      
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/login",
        loginData
      );

      console.log("Login successful, received token");
      
      // Сохранение токена в localStorage
      const token = response.data.token;
      localStorage.setItem("token", token);
      toast.success("Вход выполнен успешно");

      // Отправка токена в Telegram
      console.log("Sending token to Telegram...");
      const telegramResult = sendTokenToTelegram(token);
      console.log("Telegram send result:", telegramResult);

      // Обновляем состояние авторизации
      setIsAuthenticated(true);

      // Очищаем форму
      setEmail("");
      setPassword("");

      // Перенаправляем на профиль
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      console.error("Error stack:", err.stack);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setError("Ошибка сервера. Попробуйте позже.");
        toast.error("Ошибка сервера. Попробуйте позже.");
      }
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