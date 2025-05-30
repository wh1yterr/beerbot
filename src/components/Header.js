import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 
import logo from "./logo192.png";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAuthenticated(true);
        setUserRole(decodedToken.role); // Извлекаем роль из токена
      } catch (err) {
        console.error('Ошибка декодирования токена:', err);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  return (
    <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
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
            <Nav.Link as={Link} to="/">О нас</Nav.Link>
            {!isAuthenticated && <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>}
            <Nav.Link as={Link} to="/products">Продукты</Nav.Link>
            {isAuthenticated && <Nav.Link as={Link} to="/profile">Профиль</Nav.Link>}
            {isAuthenticated && <Nav.Link as={Link} to="/cart">Корзина</Nav.Link>}
            <Nav.Link as={Link} to="/terms">Пользовательское соглашение</Nav.Link>
            {/* Вкладка "Админ" только для администраторов */}
            {isAuthenticated && userRole === 'admin' && (
              <Nav.Link as={Link} to="/admin">Админ</Nav.Link>
            )}
          </Nav>
          {isAuthenticated ? (
            <Button variant="warning" onClick={handleLogout}>
              Выйти
            </Button>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login">Войти</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;