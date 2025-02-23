import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const StaffItem = ({ staff }) => {
  return (
    <Link
      to={`/staff/${staff.id}`}
      state={{ staff }}
      className="text-decoration-none"
      style={{ textDecoration: "none", color: "inherit" }}
    >
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
            <Card.Title className="mb-1">{staff.name}</Card.Title>
            <Card.Text className="text-muted">
              {staff.service?.service || "Unknown Service"}
            </Card.Text>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default StaffItem;
