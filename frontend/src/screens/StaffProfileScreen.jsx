import React, { useEffect, useState } from "react";
import { Button, Card, Form, ListGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { equipmentDebtMap } from "../../../backend/db/EquipmentDebt";
import { createService, deleteService, updateService } from "../actions/serviceAction";
import { getStaffDetail, updateStaff } from "../actions/staffAction";
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
  // Equipment
  const [equipment,setEquipment] = useState([]);
  const [addEquipment,setAddEquipment] = useState(false);
  const [selectedEquipment,setSelectedEquipment] = useState("");
  const [otherEquipmentPrice,setOtherEquipmentPrice] = useState("");
  const [equipmentDebt,setEquipmentDebt] = useState(0);

  // Fetch staff details - Initial services - Calculate total debt
  useEffect(() => {
    dispatch(getStaffDetail(id));
  }, [dispatch, id])

  useEffect(() => {

    if (staff_detail) {
      setStaffData({ ...staff_detail });
      setServices(staff_detail.service.map((service) => ({ ...service, editMode: false })));

      if(staff_detail.equipment){
        setEquipment(staff_detail.equipment.split(",").map(item => item.trim()));
      };
      
      setEquipmentDebt(parseInt(staff_detail.equipmentDebt));
      // const totalDebt = equipment.reduce((init,equip) => {
      //   return init + (equipmentDebtMap.get(equip) ?? 0)
      // })
      // setEquipmentDebt(totalDebt + staff_detail.equipmentDebt);
    }
  },[staff_detail]);

  console.log(staff_detail);
  console.log(services);

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
      try{
        dispatch(createService(id,services[services.length - 1]));
        setAddOrEdit("edit");  
      }catch(err){
        dispatch(deleteService(services[index]));
      }
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

  const addEquipmentHandler = () => {
    if (selectedEquipment !== "Select equipment" && selectedEquipment !== "Others") {
      const currentDebt = equipmentDebt + parseInt(equipmentDebtMap.get(selectedEquipment) ?? 0)
      console.log("reach here",currentDebt);      
      setEquipmentDebt(currentDebt);
      console.log("reach here",equipmentDebt);

      const updatedEquipment = [...equipment, selectedEquipment];
      setEquipment(updatedEquipment);
      const updatedEquipmentString = updatedEquipment.join(", ");

      setStaffData((prev) => ({
        ...prev,
        equipment: updatedEquipmentString, 
        equipmentDebt: equipmentDebt, 
      }));
  
      dispatch(updateStaff({
        ...staffData,
        equipment: updatedEquipmentString,
        equipmentDebt: equipmentDebt,
      }));
      setAddEquipment(false);
      setSelectedEquipment("");
    } else if(selectedEquipment === "Others"){
      setAddEquipment(!addEquipment);
      setSelectedEquipment("");
    }
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
    className="shadow-lg p-4 d-flex flex-column justify-content-center align-items-center w-100 h-100 mb-5"
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
        <h4>Services</h4>
        <Button style={{ background: "none", border: "none", color: "gray" }} onClick={addServiceToggler}>
          ➕ Add
        </Button>
      </div>
  
      <ListGroup variant="flush" className="m-3">
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
      
      <hr />
      <h4>Audit</h4>
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="ms-3 mt-3"> Equipment: </h5>

      </div>

      {(equipment.length > 0) && equipment.map((equip,index) => (
        <ListGroup.Item key={index} className="ms-5 mb-2 d-flex gap-3"> 
          <div className="col-6">
            <strong>{equip}</strong>
          </div>

          <div className="col-6 text-start">
            Debt: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(equipmentDebtMap.get(equip) ?? 0)}
          </div>     
        </ListGroup.Item>
      ))}

      {!addEquipment &&
      <Button className="ms-4" style={{ background: "none", border: "none", color: "gray" }} onClick={() => setAddEquipment(!addEquipment)}>
          ➕ Add
      </Button> }

      {addEquipment && 
        <div className="d-flex align-items-center gap-2 ms-5 w-100 mt-3">
          <Form.Select className="w-25" onChange={(e) => setSelectedEquipment(e.target.value)}>
            <option value="">Select Equipment</option>
            <option value="Camera">Camera</option>
            <option value="Laptop">Laptop</option>
            <option value="Mic">Mic</option>
            <option value="Lighting">Lighting</option>
            <option value="Others">Others</option>
          </Form.Select>

        {selectedEquipment === "Others" && (
          <div className="d-flex align-items-center gap-2 w-50">
            <Form.Control
              type="text"
              className="w-40"
              onChange={(e) => setSelectedEquipment(e.target.value)}
              placeholder="Enter custom equipment"
            />
            <Form.Control
              type="text"
              className="w-35"
              // value = {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(parseInt(`${otherEquipmentPrice}000`))}
              onChange={(e) => setOtherEquipmentPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>
        )}

        <Button variant="info" className="w-10" size="sm" onClick={addEquipmentHandler}>
          Save
        </Button>
        <Button variant="light" className="w-10" size="sm" onClick={() => setAddEquipment(!addEquipment)}>
          ✖️
        </Button>
      </div>
      }

      <hr/>
      <div className="mt-3">
        <div className="d-flex gap-4" >
          <h5>Equipment Debt:</h5> 
          <p>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(equipmentDebt)}</p>
        </div>

        <div className="d-flex gap-4" >
          <h5>Location:</h5> 
          <p>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(equipmentDebt)}</p>
        </div>

        <div className="d-flex gap-4" >
         <h5>Total Debt:</h5> 
         {/* <p>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(equipmentDebt + (parseInt(otherEquipmentPrice) || 0))}</p> */}
        </div>
      </div>


    </Card.Body>
  </Card>
  
  );
}

export default StaffProfileScreen;