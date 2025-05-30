import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Table } from "react-bootstrap";
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Требуется авторизация');

        // Запрос данных пользователя
        const userResponse = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data.user);
        setAddress(userResponse.data.user.address || "");

        // Запрос заказов
        const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersResponse.data);
      } catch (err) {
        setError('Ошибка загрузки данных профиля или заказов');
        console.error('Ошибка:', err.response || err);
      }
    };
    fetchProfileData();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      await axios.put('http://localhost:5000/api/auth/profile/address', { address }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Адрес успешно сохранён');
      setError('');
    } catch (err) {
      setError('Ошибка сохранения адреса');
      setSuccess('');
      console.error('Ошибка:', err.response || err);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "900px" }}>
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
          <p><strong>Адрес:</strong> {user.address || 'Не указан'}</p>
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

      <div className="mb-5">
        <h4>Мои заказы</h4>
        {orders.length === 0 ? (
          <p>У вас нет заказов</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Номер заказа</th>
                <th>Дата</th>
                <th>Общая сумма</th>
                <th>Товары</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.total_price} ₽</td>
                  <td>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.product_id}>
                          {item.name} - {item.quantity} шт. (по {item.price_at_order} ₽)
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default Profile;