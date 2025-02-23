import React from "react";
import { Card, Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";

function StaffProfileScreen() {
  const location = useLocation();
  const {staff} = location.state || {};

  if (!staff){
    return <h2 className="text-center mt-5">Staff Not Found</h2>;
  }
  return (
    <Container fluid className=" bg-light">
      <Card className="shadow-lg p-4 w-200 h-500 d-flex justify-content-center align-items-center">
        <Card.Img
          variant="top"
          src={staff.image}
          alt={staff.name}
          className="rounded-circle mx-auto d-block"
          style={{ width: "150px", height: "150px", objectFit: "cover" }}
        />
        <Card.Body className="text-center">
          <h3>{staff.name}</h3>
          <p><strong>Service:</strong> {staff.service}</p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default StaffProfileScreen;
