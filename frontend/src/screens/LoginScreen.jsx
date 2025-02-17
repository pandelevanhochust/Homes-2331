import React from 'react';
import { Button, Container } from 'react-bootstrap';

function LoginScreen() {
  return (
    <Container className="mt-4">
      <h2>Login</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" placeholder="Enter email" />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" placeholder="Enter password" />
        </div>
        <Button variant="primary" type="submit">Login</Button>
      </form>
    </Container>
  );
}

export default LoginScreen
