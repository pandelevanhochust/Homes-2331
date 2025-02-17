import React from 'react';
import { Button, Container } from 'react-bootstrap';

function AddStaffScreen() {
  return (
    <Container className="mt-4">
      <h2>Add Staff / Admin</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" placeholder="Enter name" />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select className="form-select">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button variant="primary" type="submit">Submit</Button>
      </form>
    </Container>
  );
}

export default AddStaffScreen
