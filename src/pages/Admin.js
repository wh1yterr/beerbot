import React, { useState, useEffect } from "react";
import { Container, Tabs, Tab, Table, Form, Pagination, Button, Row, Col } from "react-bootstrap";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import '../Admin.css'

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    image: '',
    price: ''
  });
  const [tempQuantities, setTempQuantities] = useState({}); // Временное состояние для хранения значений

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Требуется авторизация');

        const decodedToken = jwtDecode(token);
        if (decodedToken.role !== 'admin') {
          toast.error('Доступ только для администраторов');
          return;
        }

        const ordersResponse = await axios.get('https://beerbot-cfhp.onrender.com/api/orders/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersResponse.data);

        const productsResponse = await axios.get('https://beerbot-cfhp.onrender.com/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(productsResponse.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Ошибка загрузки данных');
        console.error('Ошибка:', err.response || err);
      }
    };
    fetchData();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://beerbot-cfhp.onrender.com/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders.map(order =>
        order.id === parseInt(orderId) ? { ...order, status } : order
      ));
      toast.success('Статус обновлён');
    } catch (err) {
      toast.error('Ошибка обновления статуса');
      console.error('Ошибка:', err.response || err);
    }
  };

  const updateProductQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const parsedQuantity = parseInt(quantity) || 0;
      if (parsedQuantity < 0) {
        toast.error('Количество не может быть отрицательным');
        return;
      }

      await axios.put(
        `https://beerbot-cfhp.onrender.com/api/products/${productId}/quantity`,
        { quantity: parsedQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.map(product =>
        product.id === parseInt(productId) ? { ...product, quantity: parsedQuantity } : product
      ));
      toast.success('Количество обновлено');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка обновления количества');
      console.error('Ошибка:', err.response || err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price) || 0,
      };

      const response = await axios.post(
        'https://beerbot-cfhp.onrender.com/api/products',
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts([...products, response.data]);
      setNewProduct({ name: '', description: '', image: '', price: '' });
      toast.success('Продукт успешно добавлен');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка добавления продукта');
      console.error('Ошибка:', err.response || err);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `https://beerbot-cfhp.onrender.com/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(products.filter(product => product.id !== parseInt(productId)));
      toast.success(response.data.message || 'Продукт помечен как удалённый');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка удаления продукта');
      console.error('Ошибка:', err.response || err);
    }
  };

  // Логика пагинации
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

return (
    <Container className="admin-container">
      <h2 className="mb-3 text-center">Админ-панель</h2>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="admin-tabs mb-2"
      >
        <Tab eventKey="orders" title="Управление заказами">
          {orders.length === 0 ? (
            <p>Нет заказов для отображения</p>
          ) : (
            <>
              <Table
                striped
                bordered
                hover
                className="admin-table"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Организация</th>
                    <th>Общая сумма</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.organization_name || "Не указано"}</td>
                      <td>{order.total_price} ₽</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{order.status}</td>
                      <td>
                        <Form.Select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="admin-select"
                        >
                          <option value="pending">Ожидает</option>
                          <option value="shipped">Отправлен</option>
                          <option value="delivered">Доставлен</option>
                          <option value="canceled">Отменён</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                className="justify-content-center mt-2 admin-pagination"
              >
                <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={nextPage} disabled={currentPage === totalPages} />
              </Pagination>
            </>
          )}
        </Tab>
        <Tab eventKey="products" title="Управление остатками">
          {products.length === 0 ? (
            <p>Нет продуктов для отображения</p>
          ) : (
            <Table
              striped
              bordered
              hover
              className="admin-table"
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.price} ₽</td>
                    <td>{tempQuantities[product.id] ?? product.quantity}</td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={tempQuantities[product.id] ?? product.quantity}
                        onChange={(e) => setTempQuantities({ ...tempQuantities, [product.id]: e.target.value })}
                        onBlur={(e) => updateProductQuantity(product.id, e.target.value)}
                        className="admin-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="deleteProducts" title="Удаление продуктов">
          {products.length === 0 ? (
            <p>Нет продуктов для удаления</p>
          ) : (
            <Table
              striped
              bordered
              hover
              className="admin-table"
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.price} ₽</td>
                    <td>{product.quantity}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="admin-button"
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="addProduct" title="Добавление продукта">
          <Form onSubmit={handleAddProduct} className="admin-form">
            <Row>
              <Col xs={12} sm={6} className="mb-2">
                <Form.Group>
                  <Form.Label>Название</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} className="mb-2">
                <Form.Group>
                  <Form.Label>Цена (₽)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} className="mb-2">
                <Form.Group>
                  <Form.Label>Изображение (URL)</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} className="mb-2">
                <Form.Group>
                  <Form.Label>Описание</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} className="text-center">
                <Button
                  variant="success"
                  type="submit"
                  className="admin-button"
                >
                  Добавить продукт
                </Button>
              </Col>
            </Row>
          </Form>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Admin;