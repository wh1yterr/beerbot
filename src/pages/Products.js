import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const products = [
  {
    id: 1,
    name: 'Hell/Хелль',
    description: 'Светлое, фильтрованное пиво. Типичное баварское пиво, гармоничное, ароматное для любителей беззаботного наслаждения мягким вкусом пива.4,5% алк.  ',
    price: '9500₽ за кегу объемом 20 литров',
    image: '../hell.png',
  },
  {
    id: 2,
    name: 'Pils/Пилс',
    description: 'Светлое, нефильтрованное пиво. Богатый и натуральный аромат хмеля из местечка Халлертау придаёт этому пиву особую нотку.4,5% алк. ',
    price: '10000₽ за кегу объемом 20 литров',
    image: '../pils.png',
  },
  {
    id: 3,
    name: 'Waizen/Вайцен',
    description: 'Светлое, нефильтрованное пиво. Баварские пивные дрожжи и высокое содержание пшеничного солода делают это пиво настоящим произведением.4.5% алк.',
    price: '11000₽ за кегу объемом 20 литров',
    image: '../waizen.png',
  },
  {
    id: 4,
    name: 'Dunkel/Дункель',
    description: 'Тёмное, нефильтрованное пиво. Подчёркнутый аромат солода и гармоничный характер этого пива придает ему особый своеобразный вкус. 4,1% алк.  ',
    price: '9000₽ за кегу объемом 20 литров',
    image: '../dunkel.png',
  },
  {
    id: 5,
    name: 'Kraft/Крафт',
    description: 'Темное нефильтрованное неосветленное. Пиво верхового брожения из специально подобранных солодов. Имеет аромат грейпфруто-цитрусовых оттенков.4,7% алк. ',
    price: '12000₽ за кегу объемом 20 литров',
    image: '../kraft.png',
  },


];

const Products = () => {
  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Наши продукты</h2>
      <Row>
        {products.map((product) => (
          <Col key={product.id} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Img variant="top" src={product.image} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text className="text-muted">{product.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Products;
