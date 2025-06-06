import React, { useState, useEffect } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Требуется авторизация");

        const response = await axios.get(
          "https://beerbot-cfhp.onrender.com/api/cart",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Данные корзины:", response.data);
        setCartItems(response.data);
      } catch (err) {
        toast.error("Ошибка загрузки корзины");
        console.error("Ошибка загрузки корзины:", err.response || err);
      }
    };
    fetchCartItems();
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://beerbot-cfhp.onrender.com/api/cart/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      toast.success("Товар удалён из корзины");
    } catch (err) {
      toast.error("Ошибка удаления товара");
      console.error("Ошибка удаления:", err);
    }
  };

  const updateCartQuantity = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://beerbot-cfhp.onrender.com/api/cart/${itemId}/quantity`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success("Количество обновлено");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Ошибка обновления количества"
      );
      console.error("Ошибка обновления количества:", err.response || err);
    }
  };

  const increaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item.quantity < item.available_quantity) {
      updateCartQuantity(itemId, item.quantity + 1);
    } else {
      toast.error("Достигнут лимит доступного количества");
    }
  };

  const decreaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item.quantity > 1) {
      updateCartQuantity(itemId, item.quantity - 1);
    }
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Требуется авторизация");

      console.log("Отправка заказа:", { items: cartItems });
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/orders",
        { items: cartItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems([]);
      toast.success("Заказ успешно оформлен!");
      console.log("Ответ сервера:", response.data);

      // Показываем код заказа пользователю
      const { order_code } = response.data;
      alert(`Ваш заказ успешно создан! Код заказа: ${order_code}. Используйте его в боте с командой /addorder <код>.`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Ошибка при оформлении заказа"
      );
      console.error("Ошибка оформления заказа:", err.response || err);
    }
  };

  const calculateTotalPrice = () => {
    return cartItems
      .reduce((total, item) => {
        const price =
          typeof item.price === "string"
            ? parseFloat(item.price.split("₽")[0])
            : parseFloat(item.price);
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const isOrderPossible = cartItems.every(
    (item) => item.quantity <= item.available_quantity
  );

  return (
    <Container className="mt-5" style={{ maxWidth: "900px" }}>
      <h2 className="mb-4 text-center">Корзина</h2>

      {cartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => increaseQuantity(item.id)}
                        disabled={item.quantity >= item.available_quantity}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => removeFromCart(item.id)}
                    >
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
          <Button
            variant="success"
            onClick={placeOrder}
            disabled={cartItems.length === 0 || !isOrderPossible}
          >
            Оформить заказ
          </Button>
          {!isOrderPossible && (
            <div className="text-danger mt-3">
              Нельзя оформить заказ: недостаточно товара в наличии.
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Cart;