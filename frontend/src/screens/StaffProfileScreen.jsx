import React, { useEffect, useState } from "react";
import { Button, Card, Form, ListGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { equipmentDebtMap } from "../../../backend/db/EquipmentDebt";
import { getAuditService } from "../actions/auditAction";
import { createService, deleteService, updateService } from "../actions/serviceAction";
import { getStaffDetail, updateStaff } from "../actions/staffAction";
import Loader from "../component/Loader";
import ServiceItem from "../component/ServiceItem";
import { SERVICE_CREATE_RESET, SERVICE_DELETE_RESET, SERVICE_UPDATE_RESET, STAFF_DETAIL_RESET } from "../constants/staffConstant";

function StaffProfileScreen() {

  const dispatch = useDispatch();
  const { id } = useParams();

  // Fetching staff details from Redux state
  const { loading, success: staffDetailSuccess, error, staff_detail } = useSelector((state) => state.staffDetail);
  const { loading: createLoading, success: createSuccess} = useSelector((state) => state.serviceCreate);
  const { loading: updateLoading, success: updateSuccess} = useSelector((state) => state.serviceUpdate);
  const { loading: deleteLoading, success: deleteSuccess} = useSelector((state) => state.serviceDelete);
  const { auditData } = useSelector((state) => state.getServiceAudit);

  const [editBasicInfo, setEditBasicInfo] = useState(false);
  const [addOrEdit, setAddOrEdit] = useState("edit");
  const [staffData, setStaffData] = useState({});
  const [services, setServices] = useState([]);
  const [services_name,setServicesName] = useState([]);
  // Equipment
  const [equipment,setEquipment] = useState([]);
  const [addEquipment,setAddEquipment] = useState(false);
  const [selectedEquipment,setSelectedEquipment] = useState("");
  const [otherEquipmentPrice,setOtherEquipmentPrice] = useState("");
  const [equipmentDebt,setEquipmentDebt] = useState(0);

  //Audit
  const getCurrentWeekTimeframe = (offset = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7); // move to target week

    const dayOfWeek = today.getDay(); // 0 = Sunday, ..., 6 = Saturday
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6); // Sunday

    const formatDate = (date) =>
        `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return `${formatDate(firstDay)}-${formatDate(lastDay)}`; };

  const [weekOffset, setWeekOffset] = useState(0);
  const [weekFrame, setWeekFrame] = useState(getCurrentWeekTimeframe(weekOffset));
  const [auditMap, setAuditMap] = useState({});

  // Fetch staff details - Initial services - Calculate total debt
  useEffect(() => {
    dispatch(getStaffDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (createSuccess || updateSuccess || deleteSuccess) {
      dispatch(getStaffDetail(id));
      if(staffDetailSuccess){
        dispatch({ type: SERVICE_CREATE_RESET });
        dispatch({ type: SERVICE_UPDATE_RESET });
        dispatch({ type: SERVICE_DELETE_RESET });
        dispatch({ type: STAFF_DETAIL_RESET});
      }
    }
  }, [createSuccess, updateSuccess, deleteSuccess, staffDetailSuccess, dispatch, id]);
  

  useEffect(() => {
    if (staff_detail) {
      setStaffData({ ...staff_detail });
  
      const services = staff_detail.service.map((service) => ({
        ...service,
        editMode: false,
      }));
      setServices(services);

      console.log("Services here",services);
  
      const serviceNames = services.map((srv) => srv.service);
      setServicesName(serviceNames);
  
      if (staff_detail.equipment) {
        setEquipment(staff_detail.equipment.split(",").map((item) => item.trim()));
      }
  
      setEquipmentDebt(parseInt(staff_detail.equipmentDebt));
    }
    setWeekFrame(getCurrentWeekTimeframe(weekOffset));
    if(services.length > 0 || !createLoading) {    dispatch(getAuditService(id, weekOffset));    }
  }, [dispatch, id, staff_detail, weekOffset]);


  useEffect(() => {
    if (auditData && services_name.length > 0) {
      const newAuditMap = {};
  
      services_name.forEach((svc) => {
        const revenue = auditData[svc] || ""; // fallback to empty if not found
        newAuditMap[svc] = revenue;
      });
  
      setAuditMap(newAuditMap);
    }
  }, [auditData, services_name]);
  
  
  console.log(staff_detail);
  console.log(services);

  //Handle Calculation
    const computeTotalIncome = (auditMap) => {
      return Object.values(auditMap).reduce((acc, val) => {
        const num = parseInt(val);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
    };

    const totalIncome = computeTotalIncome(auditMap);
    const totalDebt = equipmentDebt;
    const percentDebt = totalIncome > 0 ? ((totalDebt / totalIncome) * 100).toFixed(2) : "N/A";


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
    setServices((prevServices) => {
      const service = prevServices[index];
      const isEmpty =
        !service.service && !service.username && !service.password;
  
      if (service.editMode && isEmpty && addOrEdit === "add") {
        setAddOrEdit("edit");        
        return prevServices.filter((_, i) => i !== index);
      }
  
      return prevServices.map((srv, i) =>
        i === index ? { ...srv, editMode: !srv.editMode } : srv
      );
    });
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

  const updateAuditValue = (serviceName, revenue) => {
    setAuditMap(prev => ({
      ...prev,
      [serviceName]: revenue
    }));
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

        <div className="d-flex gap-2 mt-2">
          <Button size="sm" onClick={() => setWeekOffset((prev) => prev - 1)}>
            ⬅ Previous Week
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setWeekOffset(0)}>
            🔁 Current
          </Button>
        </div>

        <Button style={{ background: "none", border: "none", color: "gray" }} onClick={addServiceToggler}>
          ➕ Add
        </Button>
      </div>

      <ListGroup variant="flush" className="m-3">
        {createLoading && <Loader/>}
        {!createLoading && services.map((service, index) => (
          <ServiceItem
            key={index}
            service={service}
            index={index}
            toggleEdit={toggleEditService}
            handleSave={updateServiceHandler}
            handleChange={handleServiceChange}
            handleRemove={removeServiceHandler}
            auditValue={auditMap[service.service] || ""}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
            weekFrame={weekFrame}
            auditData={auditData}
            updateAuditValue={updateAuditValue}
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

        <div className="d-flex gap-4">
          <h5>Percentage:</h5> 
          <p>{percentDebt !== "N/A" ? `${percentDebt}%` : "N/A"}</p>
        </div>

        <div className="d-flex gap-4">
          <h5>Total Income:</h5> 
          <p>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalIncome)}</p>
        </div>

        <div className="d-flex gap-4">
          <h5>Total Debt:</h5> 
          <p>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalDebt)}</p>
        </div>
      </div>
    </Card.Body>
  </Card>
  
  );
}

export default StaffProfileScreen;