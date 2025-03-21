import React from 'react';
import { Button, Container, Nav, Navbar, NavItem } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import getCurrentWeekTimeframe from '../../../backend/db/dateConfig';
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
        <Nav className="ms-auto d-flex flex-row gap-3 align-items-center">
          {userInfo ? (
            <>
              <NavItem>{getCurrentWeekTimeframe()}</NavItem>
              <Nav.Link as={Link} to="/addstaff">Add Staff</Nav.Link>
              <Nav.Link as={Link} to="/addmin/${userInfo._id}"> {userInfo.name || "User"}</Nav.Link>
              <Nav.Link onClick={handleLogout} style={{ cursor: "pointer", color: "white" }}>
                Logout
              </Nav.Link>
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
