import React, { useState } from "react";
import { Button, Card, Container, Form, ListGroup } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteService, updateService, updateStaff } from "../actions/staffAction";

function StaffProfileScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { staff } = location.state || {};

  console.log(staff);

  if (!staff) {
    return <h2 className="text-center mt-5 text-danger">Staff Not Found</h2>;
  }

  // Separate states for editing basic info and services
  const [editBasicInfo, setEditBasicInfo] = useState(false);
  const [staffData, setStaffData] = useState({ ...staff });
  // Manage services separately with editMode for each
  const [services, setServices] = useState(
    staff.service.map((service) => ({ ...service, editMode: false }))
  );

  // Calculate total income
  const totalIncome = services.reduce((sum, s) => sum + (parseFloat(s.income) || 0), 0);

  // Handle form input changes (Basic Info)
  const handleChange = (e) => {
    setStaffData({ ...staffData, [e.target.name]: e.target.value });
  };

  // Call API to update staff basic info
  const updateStaffHandler = async () => {
    console.log("Updated Basic Info:", staffData);
    dispatch(updateStaff(staffData));
    setEditBasicInfo(false);
  };

  // Handle updating service fields
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  // Save a Single Service Update
  const updateServiceHandler = (index) => {
    const updatedServices = services.map((service, i) =>
      i === index ? { ...service, editMode: false } : service
    );
    setServices(updatedServices);
    console.log("Service update:",services[index]);
    dispatch(updateService(services[index]))
  };
  
  // Toggle Buttons
  const toggleEditService = (index) => {
    const updatedServices = services.map((service, i) =>
      i === index ? { ...service, editMode: !service.editMode } : service
    );
    setServices(updatedServices);
  };

  // Remove a Single Service
  const handleRemoveService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    dispatch(deleteService(services[index]));
  };

  // Handle adding a new service
  const handleAddService = () => {
    setServices([...services, { service: "", username: "", password: "", income: "", editMode: true }]);
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "600px" }}>
        {/* Profile Image */}
        <Card.Img
          variant="top"
          src={staff.image || "https://via.placeholder.com/150"}
          alt={staff.name}
          className="rounded-circle mx-auto d-block shadow-sm"
          style={{ width: "150px", height: "150px", objectFit: "cover" }}
        />

        <Card.Body>
          {/* Staff Profile Title with Edit & Save Button */}
          <div className="d-flex justify-content-between align-items-center">
            <h4>Staff Profile</h4>
            <div className="d-flex gap-2">
              {editBasicInfo && (
                <Button variant="info" size="sm" onClick={updateStaffHandler}>
                  Save
                </Button>
              )}
              <Button variant="info" size="sm" onClick={() => setEditBasicInfo(!editBasicInfo)}>
                {editBasicInfo ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>
          <hr />

          {/* Basic Info Section */}
          <ListGroup variant="flush" className="mb-3 text-start">
            <ListGroup.Item>
              <strong>Name:</strong>{" "}
              {editBasicInfo ? (
                <Form.Control type="text" name="name" value={staffData.name} onChange={handleChange} />
              ) : (
                staffData.name || "N/A"
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Type:</strong>{" "}
              {editBasicInfo ? (
                <Form.Select name="type" value={staffData.type} onChange={handleChange}>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="N/A">N/A</option>
                </Form.Select>
              ) : (
                staffData.type || "N/A"
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Equipment:</strong>{" "}
              {editBasicInfo ? (
                <Form.Control type="text" name="equipment" value={staffData.equipment} onChange={handleChange} />
              ) : (
                staffData.equipment || "N/A"
              )}
              {" | "}
              <strong>Equipment Debt:</strong>{" "}
              {editBasicInfo ? (
                <Form.Control type="text" name="equipmentDebt" value={staffData.equipmentDebt} onChange={handleChange} />
              ) : (
                staffData.equipmentDebt || "N/A"
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Note:</strong>{" "}
              {editBasicInfo ? (
                <Form.Control type="text" name="note" value={staffData.note} onChange={handleChange} />
              ) : (
                staffData.note || "No additional notes"
              )}
            </ListGroup.Item>
          </ListGroup>

          <hr />

          {/* Services Section */}
          <div className="d-flex justify-content-between align-items-center">
            <h5>Services</h5>
            <Button style={{ background: "none", border: "none", color: "gray" }} className="mt-2 w-10" onClick={handleAddService}> ➕ Add</Button>
          </div>

          <ListGroup variant="flush">
            {services.map((service, index) => (
              <ListGroup.Item key={index} className="text-start m-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="mb-2">
                    <strong>Service:</strong>{" "}
                      {service.service}
                    <br />
                  </div>
      
                  <strong>Username:</strong>{" "}                  
                    {service.editMode ? (
                      <Form.Control type="text" value={service.username} onChange={(e) => handleServiceChange(index, "username", e.target.value)} />
                    ) : (
                      service.username
                    )}
                  | <strong>Password:</strong>
                    {service.editMode ? (
                      <Form.Control type="text" value={service.password} onChange={(e) => handleServiceChange(index, "password", e.target.value)} />
                    ) : (
                      service.password
                    )}
                  <br />

                  <strong>Income:</strong>{" "}
                  {service.editMode ? (
                    <Form.Control type="number" value={service.income} onChange={(e) => handleServiceChange(index, "income", e.target.value)} />
                  ) : (
                    `$${service.income}`
                  )}

                  {service.editMode ? (
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="success" size="sm" onClick={() => updateServiceHandler(index)}>Save</Button>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveService(index)}>🗑 Remove</Button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="info" size="sm" onClick={() => toggleEditService(index)}>Edit</Button>
                    </div>
                  )}
                </div>

              </ListGroup.Item>
            ))}
          </ListGroup>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default StaffProfileScreen;
