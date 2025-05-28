import React, { useState } from "react";
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contactFace, setContactFace] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [inn, setInn] = useState('');
  const [egaisNumber, setEgaisNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      const registerData = {
        email,
        password,
        contactFace,
        organizationName,
        inn,
        egaisNumber,
        phone
      };
      console.log('Register data:', registerData);

      // Тут должна быть логика отправки данных на backend
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="text-center mb-4">Регистрация</h2>
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

        <Form.Group className="mb-3">
          <Form.Label>Подтвердите пароль</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Контактное лицо (Имя)</Form.Label>
          <Form.Control
            type="text"
            value={contactFace}
            onChange={(e) => setContactFace(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Название организации</Form.Label>
          <Form.Control
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>ИНН организации</Form.Label>
          <Form.Control
            type="text"
            value={inn}
            onChange={(e) => setInn(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Номер ЕГАИС</Form.Label>
          <Form.Control
            type="text"
            value={egaisNumber}
            onChange={(e) => setEgaisNumber(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Телефон</Form.Label>
          <Form.Control
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
