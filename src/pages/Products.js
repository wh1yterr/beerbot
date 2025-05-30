import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quantities, setQuantities] = useState({}); // Для хранения количества для каждого продукта

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Требуется авторизация');
        }

        const response = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке продуктов');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value > 0 ? value : 1, // Минимальное количество 1
    }));
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Требуется авторизация');
        setSuccess('');
        return;
      }

      const quantity = quantities[productId] || 1; // По умолчанию 1
      const response = await axios.post(
        'http://localhost:5000/api/cart',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setError('');
      setQuantities((prev) => ({ ...prev, [productId]: 1 })); // Сброс количества после добавления
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при добавлении в корзину');
      setSuccess('');
      console.error('Ошибка добавления в корзину:', err);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error && !success) return <div>Ошибка: {error}</div>;

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Наши продукты</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Row>
        {products.map((product) => (
          <Col key={product.id} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Img variant="top" src={product.image} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text className="text-muted">{product.price}</Card.Text>
                <Form.Group className="mb-3">
                  <Form.Label>Количество</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                    style={{ width: '100px' }}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={() => addToCart(product.id)}
                >
                  Добавить в корзину
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Products;