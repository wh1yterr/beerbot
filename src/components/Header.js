import React, { Component } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import logo from "./logo192.png";

export default class Header extends Component {
    render() {
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
                            <Nav.Link href="/register">Регистрация</Nav.Link>
                            <Nav.Link href="/products">Продукты</Nav.Link>
                            <Nav.Link href="/profile">Профиль</Nav.Link>
                            <Nav.Link href="/terms">Пользовательское соглашение</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
}
