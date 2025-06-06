import React from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 
import logo from "./logo192.png";

const Header = ({ isAuthenticated, handleLogout }) => {
  const [userRole, setUserRole] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (err) {
        console.error('Ошибка декодирования токена:', err);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [isAuthenticated]); // Добавляем зависимость от isAuthenticated

  const onLogout = () => {
    handleLogout();
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
            <Button variant="warning" onClick={onLogout}>
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