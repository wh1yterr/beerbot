import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/axiosConfig";
import { authService } from "../services/authService";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("=== Начало процесса входа ===");

    try {
      const loginData = { email, password };
      console.log("Sending login request...");
      
      const response = await api.post("/auth/login", loginData);
      console.log("Login successful, received token");
      
      const token = response.data.token;
      localStorage.setItem("token", token);
      toast.success("Вход выполнен успешно");

      // Отправка токена в Telegram
      console.log("Sending token to Telegram...");
      const telegramResult = await authService.sendTokenToTelegram(token);
      console.log("Telegram send result:", telegramResult);

      if (!telegramResult) {
        toast.warning("Не удалось отправить данные в Telegram. Пожалуйста, убедитесь, что вы открыли приложение через Telegram.");
      }

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