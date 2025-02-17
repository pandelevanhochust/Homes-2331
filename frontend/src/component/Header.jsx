import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">2331 Homes</Navbar.Brand>
        <Nav className="ml-auto d-flex flex-row gap-3">
          <Nav.Link as={Link} to="/addstaff">Add Staff</Nav.Link>
          <NavDropdown title="User" id="basic-nav-dropdown">
            <NavDropdown.Item href="login">Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
export default Header
