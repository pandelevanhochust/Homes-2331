import React from 'react';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../actions/adminAction';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminLogin = useSelector((state) => state.adminLogin);
  const { userInfo } = adminLogin;

  // Handle Logout
  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">2331 Homes</Navbar.Brand>
        <Nav className="ms-auto d-flex flex-row gap-3">
          {userInfo ? (
            <>
              <Nav.Link as={Link} to="/addstaff">Add Staff</Nav.Link>
              <NavDropdown title={userInfo.name || "User"} id="basic-nav-dropdown">
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </>
          ) : (
            <Button as={Link} to="/login" variant="outline-light">Login</Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;
