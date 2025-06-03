import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Очистка предыдущих ошибок

    try {
      const loginData = { email, password };
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/login",
        loginData
      );
      console.log("Login response:", response.data);

      // Сохранение токена в localStorage
      const token = response.data.token;
      localStorage.setItem("token", token);

      // Отправка токена в Telegram
      if (window.Telegram && window.Telegram.WebApp) {
        try {
          window.Telegram.WebApp.sendData(
            JSON.stringify({ token: token, action: "auth" })
          );
          alert("Token sent to Telegram from Login: " + token); // Добавляем alert для отладки
        } catch (sendError) {
          alert("Error sending token to Telegram: " + sendError.message); // Добавляем alert для ошибок
        }
      } else {
        alert("Telegram Web App not available during login."); // Добавляем alert
      }

      // Обновляем состояние авторизации
      setIsAuthenticated(true);

      // Очищаем форму
      setEmail("");
      setPassword("");

      // Перенаправляем на профиль
      navigate("/profile", { replace: true });
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Ошибка авторизации");
      } else {
        setError("Ошибка сервера");
      }
      console.error("Login error:", err);
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