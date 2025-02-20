import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const StaffItem = ({ staff }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <Card.Img
          variant="top"
          src={staff.image}
          alt={staff.name}
          className="rounded-circle me-3"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
        <div>
          <Card.Title className="mb-1">
            <Link to={`/staffprofile/${staff.id}`} className="text-decoration-none">
              {staff.name}
            </Link>
          </Card.Title>
          <Card.Text className="text-muted">{staff.service}</Card.Text>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StaffItem;
