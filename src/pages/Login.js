import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
      console.log("Отправка запроса на вход...");
      
      const response = await api.post("/auth/login", loginData);
      console.log("Ответ сервера:", response.data);
      
      if (!response.data.token) {
        console.error("Токен отсутствует в ответе");
        throw new Error("Токен не получен от сервера");
      }

      const token = response.data.token;
      console.log("Токен получен, сохраняем в localStorage");
      localStorage.setItem("token", token);

      // Отправка токена в Telegram
      console.log("Отправка токена в Telegram...");
      const telegramResult = await authService.sendTokenToTelegram(token);
      console.log("Результат отправки в Telegram:", telegramResult);

      if (!telegramResult) {
        console.warn("Не удалось отправить токен в Telegram");
        toast("Не удалось отправить данные в Telegram. Пожалуйста, убедитесь, что вы открыли приложение через Telegram.", {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } else {
        console.log("Токен успешно отправлен в Telegram");
        toast.success("Вход выполнен успешно");
      }

      // Обновляем состояние авторизации
      console.log("Обновляем состояние авторизации");
      setIsAuthenticated(true);

      // Очищаем форму
      setEmail("");
      setPassword("");

      // Перенаправляем на профиль
      console.log("Перенаправляем на страницу профиля");
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Ошибка при входе:", err);
      console.error("Детали ошибки:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = "Ошибка сервера. Попробуйте позже.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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