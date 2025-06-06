import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./Products.css"; // Подключение CSS

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Требуется авторизация");
        }

        const response = await axios.get(
          "https://beerbot-cfhp.onrender.com/api/products",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        toast.error("Ошибка при загрузке продуктов");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value > 0 ? value : 1,
    }));
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Требуется авторизация");
        return;
      }

      const quantity = quantities[productId] || 1;
      const response = await axios.post(
        "https://beerbot-cfhp.onrender.com/api/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Ошибка при добавлении в корзину"
      );
      console.error("Ошибка добавления в корзину:", err);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <Container className="products-container">
      <h2 className="products-title">Наши продукты</h2>
      <Row>
        {products.map((product) => (
          <Col key={product.id} xs={12} sm={6} md={4} className="mb-4">
            <Card className="product-card h-100">
              <div style={{ height: "200px", overflow: "hidden", borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}>
                <Card.Img
                  variant="top"
                  src={product.image}
                  style={{ height: "100%", width: "100%", objectFit: "cover" }}
                />
              </div>
              <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                  <Card.Title className="card-title">{product.name}</Card.Title>
                  <Card.Text className="card-text">{product.description}</Card.Text>
                  <Card.Text className="price">{product.price} ₽</Card.Text>
                </div>
                <div>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Количество</Form.Label>
                    <div className="quantity-controls">
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleQuantityChange(
                            product.id,
                            (quantities[product.id] || 1) - 1
                          )
                        }
                        disabled={(quantities[product.id] || 1) <= 1}
                      >
                        −
                      </Button>
                      <Form.Control
                        type="number"
                        value={quantities[product.id] || 1}
                        onChange={(e) =>
                          handleQuantityChange(
                            product.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                        className="text-center"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleQuantityChange(
                            product.id,
                            (quantities[product.id] || 1) + 1
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </Form.Group>
                  <Button
                    variant="success"
                    onClick={() => addToCart(product.id)}
                    className="add-to-cart w-100"
                  >
                    Добавить в корзину
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Products;