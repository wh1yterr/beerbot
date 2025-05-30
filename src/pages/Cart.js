import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Image } from "react-bootstrap";
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Требуется авторизация');

        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Данные корзины:', response.data);
        setCartItems(response.data);
      } catch (err) {
        setError('Ошибка загрузки корзины');
        console.error('Ошибка загрузки корзины:', err.response || err);
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
      setSuccess('Товар удалён из корзины');
      setError('');
    } catch (err) {
      setError('Ошибка удаления товара');
      setSuccess('');
      console.error('Ошибка удаления:', err);
    }
  };

const placeOrder = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Требуется авторизация');

    console.log('Отправка заказа:', { items: cartItems }); // Логирование
    const response = await axios.post(
      'http://localhost:5000/api/orders',
      { items: cartItems },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccess('Заказ успешно оформлен!');
    setError('');
    setCartItems([]);
    console.log('Ответ сервера:', response.data); // Логирование
  } catch (err) {
    setError(err.response?.data?.message || 'Ошибка при оформлении заказа');
    setSuccess('');
    console.error('Ошибка оформления заказа:', err.response || err);
  }
};
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.split('₽')[0]) : parseFloat(item.price);
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "900px" }}>
      <h2 className="mb-4 text-center">Корзина</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {cartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Image src={item.image} alt={item.name} style={{ width: '50px', height: 'auto' }} />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="text-end mb-3">
            <h4>Итого: {calculateTotalPrice()} ₽</h4>
          </div>
          <Button variant="success" onClick={placeOrder} disabled={cartItems.length === 0}>
            Оформить заказ
          </Button>
        </>
      )}
    </Container>
  );
};

export default Cart;