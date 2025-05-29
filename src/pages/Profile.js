import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        // Запрос данных пользователя
        const userResponse = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data.user);
        setAddress(userResponse.data.user.address || ""); // Если адрес хранится в базе
      } catch (err) {
        setError('Ошибка загрузки профиля');
        console.error('Profile fetch error:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
        }
      }
    };
    fetchProfileData();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await axios.put('http://localhost:5000/api/auth/profile/address', { address }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Адрес успешно сохранен');
      setError('');
    } catch (err) {
      setError('Ошибка сохранения адреса');
      setSuccess('');
      console.error('Save address error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
      }
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "700px" }}>
      <h2 className="mb-4 text-center">Профиль пользователя</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {user && (
        <div className="mb-5">
          <h4>Информация о пользователе</h4>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Контактное лицо:</strong> {user.contact_face}</p>
          <p><strong>Организация:</strong> {user.organization_name}</p>
          <p><strong>ИНН:</strong> {user.inn}</p>
          <p><strong>ЕГАИС:</strong> {user.egais_number}</p>
          <p><strong>Телефон:</strong> {user.phone}</p>
        </div>
      )}

      <Form className="mb-5" onSubmit={handleSaveAddress}>
        <Form.Group controlId="formAddress">
          <Form.Label>Адрес доставки</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите ваш адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Сохранить адрес
        </Button>
      </Form>
    </Container>
  );
};

export default Profile;