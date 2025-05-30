import React, { useState, useEffect } from "react";
import { Container, Form, Button, Table, Card, Row, Col } from "react-bootstrap";
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Требуется авторизация');

        const userResponse = await axios.get('https://beerbot-cfhp.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data.user);
        setAddress(userResponse.data.user.address || "");

        const ordersResponse = await axios.get('https://beerbot-cfhp.onrender.com/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersResponse.data);
      } catch (err) {
        toast.error('Ошибка загрузки данных профиля или заказов');
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

      await axios.put('https://beerbot-cfhp.onrender.com/api/auth/profile/address', { address }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Адрес успешно сохранён');
    } catch (err) {
      toast.error('Ошибка сохранения адреса');
      console.error('Ошибка:', err.response || err);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "960px" }}>
      <h2 className="mb-4 text-center">Профиль пользователя</h2>

      {user && (
        <Card className="mb-5 shadow-sm">
          <Card.Header><strong>Информация о пользователе</strong></Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}><p><strong>Email:</strong> {user.email}</p></Col>
              <Col md={6}><p><strong>Контактное лицо:</strong> {user.contact_face}</p></Col>
              <Col md={6}><p><strong>Организация:</strong> {user.organization_name}</p></Col>
              <Col md={6}><p><strong>ИНН:</strong> {user.inn}</p></Col>
              <Col md={6}><p><strong>ЕГАИС:</strong> {user.egais_number}</p></Col>
              <Col md={6}><p><strong>Телефон:</strong> {user.phone}</p></Col>
              <Col md={12}><p><strong>Адрес:</strong> {user.address || 'Не указан'}</p></Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card className="mb-5 shadow-sm">
        <Card.Header><strong>Адрес доставки</strong></Card.Header>
        <Card.Body>
          <Form onSubmit={handleSaveAddress}>
            <Form.Group controlId="formAddress">
              <Form.Label>Введите новый адрес</Form.Label>
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
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-sm">
        <Card.Header><strong>Мои заказы</strong></Card.Header>
        <Card.Body>
          {orders.length === 0 ? (
            <p>У вас нет заказов</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Общая сумма</th>
                  <th>Статус</th>
                  <th>Товары</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.total_price} ₽</td>
                    <td>{order.status}</td>
                    <td>
                      <ul className="mb-0 ps-3">
                        {order.items.map((item) => (
                          <li key={item.product_id}>
                            {item.name} — {item.quantity} шт. по {item.price_at_order} ₽
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;