import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    contactFace: "",
    organizationName: "",
    inn: "",
    egaisNumber: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendTokenToTelegram = (token) => {
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.sendData(
          JSON.stringify({ token, action: "auth" })
        );
        console.log("Token sent to Telegram successfully");
      } catch (error) {
        console.error("Error sending token to Telegram:", error);
      }
    } else {
      console.warn("Telegram Web App not available");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/register",
        formData
      );
      console.log("Registration response:", response.data);

      // Если регистрация успешна, выполняем вход
      const loginResponse = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Сохраняем токен
      const token = loginResponse.data.token;
      localStorage.setItem("token", token);

      // Отправляем токен в Telegram
      sendTokenToTelegram(token);

      // Обновляем состояние авторизации
      setIsAuthenticated(true);

      // Перенаправляем на профиль
      navigate("/profile", { replace: true });
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Ошибка регистрации");
      } else {
        setError("Ошибка сервера");
      }
      console.error("Registration error:", err);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">Регистрация</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Контактное лицо</Form.Label>
          <Form.Control
            type="text"
            name="contactFace"
            value={formData.contactFace}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Название организации</Form.Label>
          <Form.Control
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>ИНН</Form.Label>
          <Form.Control
            type="text"
            name="inn"
            value={formData.inn}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Номер ЕГАИС</Form.Label>
          <Form.Control
            type="text"
            name="egaisNumber"
            value={formData.egaisNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Телефон</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 mb-3">
          Зарегистрироваться
        </Button>

        <div className="text-center">
          <Link to="/login">Уже есть аккаунт? Войдите</Link>
        </div>
      </Form>
    </Container>
  );
};

export default Register;