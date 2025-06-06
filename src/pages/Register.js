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
    console.log("=== Начало отправки токена в Telegram (Register) ===");
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("=== Начало процесса регистрации ===");
    console.log("Form data:", { ...formData, password: "***" });

    try {
      console.log("Sending registration request");
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/register",
        formData
      );
      console.log("Registration response:", response.data);

      // Если регистрация успешна, выполняем вход
      console.log("Sending login request");
      const loginResponse = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );
      console.log("Login response:", loginResponse.data);

      // Сохраняем токен
      const token = loginResponse.data.token;
      console.log("Token received:", token);
      localStorage.setItem("token", token);

      // Отправляем токен в Telegram
      console.log("Sending token to Telegram");
      sendTokenToTelegram(token);

      // Обновляем состояние авторизации
      console.log("Setting isAuthenticated to true");
      setIsAuthenticated(true);

      // Перенаправляем на профиль
      console.log("Navigating to /profile");
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
      
      if (err.response && err.response.data) {
        console.error("Error response data:", err.response.data);
        setError(err.response.data.message || "Ошибка регистрации");
      } else {
        setError("Ошибка сервера");
      }
    } finally {
      console.log("=== Конец процесса регистрации ===");
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