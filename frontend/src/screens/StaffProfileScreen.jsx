import React, { useEffect, useState } from "react";
import { Button, Card, Form, ListGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createService, deleteService, getStaffDetail, updateService, updateStaff } from "../actions/staffAction";
import Loader from "../component/Loader";
import ServiceItem from "../component/ServiceItem";

function StaffProfileScreen() {
  const dispatch = useDispatch();
  const { id } = useParams();

  // Fetching staff details from Redux state
  const { loading, success, error, staff_detail } = useSelector((state) => state.staffDetail);

  const [editBasicInfo, setEditBasicInfo] = useState(false);
  const [addOrEdit, setAddOrEdit] = useState("edit");
  const [staffData, setStaffData] = useState({});
  const [services, setServices] = useState([]);

  // Fetch staff details
  useEffect(() => {
    dispatch(getStaffDetail(id));
  }, [dispatch, id]);

  // Sync state when new staff data is available
  useEffect(() => {
    if (staff_detail) {
      setStaffData({ ...staff_detail });
      setServices(staff_detail.service.map((service) => ({ ...service, editMode: false })));
    }
  }, [staff_detail]);

  // Handle Basic Info Changes
  const handleChange = (e) => {
    setStaffData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Save Basic Info
  const updateStaffHandler = () => {
    dispatch(updateStaff(staffData));
    setEditBasicInfo(false);
  };

  // Handle Service Changes
  const handleServiceChange = (index, field, value) => {
    setServices((prev) =>
      prev.map((service, i) => (i === index ? { ...service, [field]: value } : service))
    );
  };

  // Save or Add a Service
  const updateServiceHandler = (index) => {
    if (addOrEdit === "add") {
      dispatch(createService(id,services[services.length - 1]));
      setAddOrEdit("edit");
    } else {
      dispatch(updateService(services[index]));
    }
    setServices((prev) => prev.map((service, i) => (i === index ? { ...service, editMode: false } : service)));
  };

  // Toggle Edit Mode for a Service
  const toggleEditService = (index) => {
    setServices((prev) =>
      prev.map((service, i) => (i === index ? { ...service, editMode: !service.editMode } : service))
    );
  };

  // Remove a Service
  const removeServiceHandler = (index) => {
    dispatch(deleteService(services[index]));
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Add a New Service
  const addServiceToggler = () => {
    setServices((prev) => [...prev, { service: "", username: "", password: "", income: "", editMode: true }]);
    setAddOrEdit("add");
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

  if (!staff_detail) {
    return <h2 className="text-center mt-5 text-danger">{error}</h2>;
  }

  return (
    <Card
    className="shadow-lg p-4 d-flex flex-column justify-content-center align-items-center w-100 h-100"
    style={{ minHeight: "100vh", maxWidth: "100vw" }}
  >
    {/* Profile Image */}
    <Card.Img
      variant="top"
      src={staffData.image || "https://via.placeholder.com/150"}
      alt={staffData.name}
      className="rounded-circle mx-auto d-block shadow-sm"
      style={{ width: "150px", height: "150px", objectFit: "cover" }}
    />
  
    <Card.Body className="w-100">
      {/* Staff Profile Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h4>Staff Profile</h4>
        <div className="d-flex gap-2">
          {editBasicInfo && (
            <Button variant="success" size="sm" onClick={updateStaffHandler}>
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
        <ListGroup.Item className="d-flex gap-3">
          {/* Name Field */}
          <div className="flex-grow-1">
            <strong>Name:</strong>{" "}
            {editBasicInfo ? (
              <Form.Control type="text" name="name" value={staffData.name} onChange={handleChange} />
            ) : (
              staffData.name || "N/A"
            )}
          </div>
  
          {/* Type Field */}
          <div className="flex-grow-1">
            <strong>Type:</strong>{" "}
            {editBasicInfo ? (
              <Form.Select name="type" value={staffData.type} required onChange={handleChange}>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </Form.Select>
            ) : (
              staffData.type || "N/A"
            )}
          </div>
        </ListGroup.Item>
  
        <ListGroup.Item>
          <strong>Equipment:</strong>{" "}
          {editBasicInfo ? (
            <Form.Control type="text" name="equipment" value={staffData.equipment} onChange={handleChange} />
          ) : (
            staffData.equipment || "N/A"
          )}
        </ListGroup.Item>
  
        <ListGroup.Item>
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
        <Button style={{ background: "none", border: "none", color: "gray" }} onClick={addServiceToggler}>
          ➕ Add
        </Button>
      </div>
  
      <ListGroup variant="flush">
        {services.map((service, index) => (
          <ServiceItem
            key={index}
            service={service}
            index={index}
            toggleEdit={toggleEditService}
            handleSave={updateServiceHandler}
            handleChange={handleServiceChange}
            handleRemove={removeServiceHandler}
          />
        ))}
      </ListGroup>
    </Card.Body>
  </Card>
  
  );
}

export default StaffProfileScreen;