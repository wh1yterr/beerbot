import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaUtensils, FaCoffee, FaBeer, FaFlask } from "react-icons/fa"; // Иконки
import "./Home.css"; // Подключение CSS

const Home = () => {
  return (
    <Container className="home-container">
      <div className="home-header">
        <h1 className="display-4">Добро пожаловать в ООО "Пивовар"</h1>
        <p className="lead">Искусство пивоварения в каждой капле</p>
      </div>

      {/* Преимущества */}
      <Row className="home-advantages mb-5 text-center">
        <Col md={4} sm={6} className="mb-4">
          <div className="card">
            <h3>🏭 Собственное производство</h3>
            <p>
              Пиво ООО "Пивовар" по достоинству оценено Союзом производителей ячменя,
              солода и хмеля в рамках Российского конкурса пивоваренной продукции
            </p>
          </div>
        </Col>
        <Col md={4} sm={6} className="mb-4">
          <div className="card">
            <h3>🌾 Натуральные ингредиенты</h3>
            <p>Только лучший солод, хмель и чистейшая вода</p>
          </div>
        </Col>
        <Col md={4} sm={6} className="mb-4">
          <div className="card">
            <h3>🚚 Простое сотрудничество</h3>
            <p>Свежее пиво в ваше заведение</p>
          </div>
        </Col>
      </Row>

      {/* С кем сотрудничаем */}
      <div className="home-partners text-center">
        <h2 className="mb-4">МЫ ОСУЩЕСТВЛЯЕМ СОТРУДНИЧЕСТВО</h2>
        <Row>
          <Col md={3} sm={6} className="partner-item">
            <FaUtensils size={40} color="#f0a500" />
            <p className="mt-2">С РЕСТОРАНАМИ</p>
          </Col>
          <Col md={3} sm={6} className="partner-item">
            <FaCoffee size={40} color="#f0a500" />
            <p className="mt-2">С КАФЕ</p>
          </Col>
          <Col md={3} sm={6} className="partner-item">
            <FaBeer size={40} color="#f0a500" />
            <p className="mt-2">С БАРАМИ</p>
          </Col>
          <Col md={3} sm={6} className="partner-item">
            <FaFlask size={40} color="#f0a500" />
            <p className="mt-2">С МАГАЗИНАМИ РАЗЛИВНОГО ПИВА</p>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Home;