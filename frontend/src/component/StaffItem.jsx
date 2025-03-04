import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const StaffItem = ({ staff }) => {
  const staff_service = staff.service;

  return (
    <Link to={`/staff/${staff.id}`} className="text-decoration-none" style={{ textDecoration: "none", color: "inherit" }}>
      <Card className="mb-1 shadow-sm">
        <Card.Body className="d-flex align-items-center">
          <Card.Img
            variant="top"
            src={staff.image !== "none" ? staff.image : "/default-avatar.png"} 
            alt={staff.name}
            className="rounded-circle me-3"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
          {/* Staff Info */}
          <div className="flex-grow-1">
            <Card.Title className="mb-1">{staff.name}</Card.Title>
            
            {/* Type & Service (Hiển thị trên cùng 1 dòng) */}
            <div className="d-flex align-items-center gap-5">
            <span style={{ fontWeight: "light", color: "blue" }}>
                {staff.type.toLowerCase()}
              </span>
              <span className="text-muted">
                {staff_service.length > 0
                  ? staff_service.map((s, index) => (
                      <strong key={index} className="me-2">{s.service}</strong>
                    ))
                  : <strong>No Service</strong>}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default StaffItem;
