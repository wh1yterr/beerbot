import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logo from "./logo192.png";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Устанавливаем состояние авторизации
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Удаляем токен
    setIsAuthenticated(false); // Обновляем состояние
    navigate('/login'); // Перенаправляем на страницу логина
  };

  return (
    <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">
          <img
            src={logo}
            height="30"
            width="30"
            className="d-inline-block align-top"
            alt="Logo"
          /> Пивовар
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">О нас</Nav.Link>
            {!isAuthenticated && <Nav.Link href="/register">Регистрация</Nav.Link>}
            <Nav.Link href="/products">Продукты</Nav.Link>
            {isAuthenticated && <Nav.Link href="/profile">Профиль</Nav.Link>}
            {isAuthenticated && <Nav.Link href="/cart">Корзина</Nav.Link>}
            <Nav.Link href="/terms">Пользовательское соглашение</Nav.Link>
          </Nav>
          {isAuthenticated && (
            <Button variant="warning" onClick={handleLogout}>
              Выйти
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;