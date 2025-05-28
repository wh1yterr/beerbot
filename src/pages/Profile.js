import React, { useState } from "react";
import { Container, Form, Button, Table, Badge } from "react-bootstrap";

const Profile = () => {
  const [address, setAddress] = useState("");

  // Временные данные заказов
  const orders = [
    { id: 1, date: "2025-05-25", product: "IPA", status: "В обработке" },
    { id: 2, date: "2025-05-20", product: "Стаут", status: "Доставлен" },
    { id: 3, date: "2025-05-15", product: "Пилснер", status: "Отменён" },
  ];

  // Цвет для статуса
  const getStatusVariant = (status) => {
    switch (status) {
      case "Доставлен":
        return "success";
      case "В обработке":
        return "warning";
      case "Отменён":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "700px" }}>
      <h2 className="mb-4 text-center">Профиль пользователя</h2>

      <Form className="mb-5">
        <Form.Group controlId="formAddress">
          <Form.Label>Адрес доставки</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введите ваш адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" className="mt-3">
          Сохранить адрес
        </Button>
      </Form>

      <h4 className="mb-3">История заказов</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Дата</th>
            <th>Продукт</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.date}</td>
              <td>{order.product}</td>
              <td>
                <Badge bg={getStatusVariant(order.status)}>{order.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Profile;
