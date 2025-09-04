import React from "react";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
function NotFoundPage() {
  return (
    <>
      <Container className="mt-4">
        404 NotFoundPage
        <Link to="/"> Return to Home Page</Link>
      </Container>
    </>
  );
}

export default NotFoundPage;
