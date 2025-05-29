import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert } from "react-bootstrap";
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data);
      } catch (err) {
        setError('Ошибка загрузки корзины');
        console.error('Cart fetch error:', err);
      }
    };
    fetchCartItems();
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(cartItems.filter(item => item.id !== itemId));
      setSuccess('Товар удален из корзины');
      setError('');
    } catch (err) {
      setError('Ошибка удаления товара');
      setSuccess('');
      console.error('Remove from cart error:', err);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "700px" }}>
      <h2 className="mb-4 text-center">Корзина</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {cartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Алкоголь</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.alcohol}%</td>
                <td>
                  <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Cart;