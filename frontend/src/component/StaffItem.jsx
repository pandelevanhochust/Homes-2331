import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const StaffItem = ({ staff }) => {
  const staff_service = staff.service;

  return (
    <Link
      to={`/staff/${staff.id}?admin_id=${staff.admin_id}`}
      className="text-decoration-none"
      style={{ color: "inherit" }}
    >
      <Card.Body className="d-flex align-items-center p-4 border rounded shadow-sm">
        {/* Avatar */}
        <Card.Img
          variant="top"
          src={staff.image !== "none" ? staff.image : "/woman-svgrepo-com.svg"}
          alt="Staff"
          className="rounded-circle me-4"
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />

        {/* Staff Info */}
        <div className="flex-grow-1">
          <Card.Title className="mb-1" style={{ fontSize: "18px" }}>
            {staff.name}
          </Card.Title>

          {/* Type & Service */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {staff_service.length > 0 ? (
              staff_service.map((s, index) => (
                <span
                  key={index}
                  className="badge bg-secondary"
                  style={{ fontSize: "12px" }}
                >
                  {s.service}
                </span>
              ))
            ) : (
              <span className="badge bg-light text-muted" style={{ fontSize: "12px" }}>
                No Service
              </span>
            )}
          </div>
        </div>

        {/* Week Income */}
        <div className="text-center me-4" style={{ minWidth: "70px" }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {staff.week_income || <span className="text-muted"> Not audit </span>}
          </div>
          <div className="text-muted" style={{ fontSize: "12px" }}>
            /this week
          </div>
        </div>
      </Card.Body>
    </Link>
  );
};

export default StaffItem;
