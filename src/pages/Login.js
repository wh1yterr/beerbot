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
        toast.error(`Ошибка отправки данных: ${error.message}`);
        return false;
      }
    } else {
      toast.error("Telegram Web App недоступен");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    toast.info("Начинаем процесс входа...");

    try {
      const loginData = { email, password };
      toast.info("Отправляем запрос на сервер...");
      
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/login",
        loginData
      );

      // Сохранение токена в localStorage
      const token = response.data.token;
      localStorage.setItem("token", token);
      toast.success("Вход выполнен успешно");

      // Отправка токена в Telegram
      toast.info("Отправляем данные в Telegram...");
      sendTokenToTelegram(token);

      // Обновляем состояние авторизации
      setIsAuthenticated(true);

      // Очищаем форму
      setEmail("");
      setPassword("");

      // Перенаправляем на профиль
      navigate("/profile", { replace: true });
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.message || "Ошибка авторизации";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError("Ошибка сервера");
        toast.error("Ошибка сервера");
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