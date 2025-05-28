import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaUtensils, FaCoffee, FaBeer, FaFlask } from "react-icons/fa"; // иконки

const Home = () => {

  return (
    <Container className="mt-5">
      <div className="text-center mb-5 p-5 bg-warning text-white rounded">
        <h1 className="display-4">Добро пожаловать в ООО "Пивовар"</h1>
        <p className="lead">Искусство пивоварения в каждой капле</p>
      </div>

      {/* Преимущества */}
      <Row className="mb-5 text-center">
        <Col md={4} className="mb-4">
          <div className="p-4 border rounded h-100">
            <h3>🏭 Собственное производство</h3>
            <p>Пиво ООО "Пивовар" по достоинству оценено Союзом производителей ячменя, солода и хмеля в рамках Российского конкурса пивоваренной продукции</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="p-4 border rounded h-100">
            <h3>🌾 Натуральные ингредиенты</h3>
            <p>Только лучший солод, хмель и чистейшая вода</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="p-4 border rounded h-100">
            <h3>🚚 Простое сотрудничество</h3>
            <p>Свежее пиво в ваше заведение</p>
          </div>
        </Col>
      </Row>

      {/* С кем сотрудничаем */}
      <div className="text-center my-5">
        <h2 className="mb-4 border-top pt-4">МЫ ОСУЩЕСТВЛЯЕМ СОТРУДНИЧЕСТВО</h2>
        <Row className="text-center">
          <Col md={3} sm={6} className="mb-4">
            <FaUtensils size={40} color="#f0a500" />
            <p className="mt-2 fw-bold">С РЕСТОРАНАМИ</p>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <FaCoffee size={40} color="#f0a500" />
            <p className="mt-2 fw-bold">С КАФЕ</p>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <FaBeer size={40} color="#f0a500" />
            <p className="mt-2 fw-bold">С БАРАМИ</p>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <FaFlask size={40} color="#f0a500" />
            <p className="mt-2 fw-bold">С МАГАЗИНАМИ РАЗЛИВНОГО ПИВА</p>
          </Col>
        </Row>
      </div>
    </Container>
  );
  
};

export default Home;
