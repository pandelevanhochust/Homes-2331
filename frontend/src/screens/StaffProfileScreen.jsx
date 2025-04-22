import React, { useEffect, useState } from "react";
import { Button, Card, Col, Collapse, Container, Form, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAuditService } from "../actions/auditAction";
import { createService, deleteService, updateService } from "../actions/serviceAction";
import { getStaffDetail, updateStaff } from "../actions/staffAction";
import Loader from "../component/Loader";
import ServiceItem from "../component/ServiceItem";
import { equipmentDebtMap } from "../constants/EquipmentDebt";
import { GET_AUDIT_RESET, SERVICE_AUDIT_RESET, SERVICE_CREATE_RESET, SERVICE_DELETE_RESET, SERVICE_UPDATE_RESET, STAFF_DETAIL_RESET } from "../constants/staffConstant";

function StaffProfileScreen() {

  const dispatch = useDispatch();
  const { id } = useParams();

  // Fetching staff details from Redux state
  const { loading, success: staffDetailSuccess, error, staff_detail } = useSelector((state) => state.staffDetail);
  const { loading: createLoading, success: createSuccess} = useSelector((state) => state.serviceCreate);
  const { loading: updateLoading, success: updateSuccess} = useSelector((state) => state.serviceUpdate);
  const { loading: deleteLoading, success: deleteSuccess} = useSelector((state) => state.serviceDelete);
  const { loading: getAuditLoading, success: getAuditSuccess, auditData } = useSelector((state) => state.getServiceAudit);
  const { loading: auditLoading, success: auditSuccess } = useSelector((state) => state.serviceAudit);
  // const { loading: staffUpdateLoading, success:  

  const [editBasicInfo, setEditBasicInfo] = useState(false);
  const [addOrEdit, setAddOrEdit] = useState("edit");
  const [staffData, setStaffData] = useState({});
  const [services, setServices] = useState([]);
  const [services_name,setServicesName] = useState([]);
  const [showServices, setShowServices] = useState(true);

  //Percentage
  const [editPercentage, setEditPercentage] = useState(false);
  // const [percentage, setPercentage] = useState(staff_detail.percentage ?? 0);

  // Equipment
  const [equipment,setEquipment] = useState([]);
  const [addEquipment,setAddEquipment] = useState(false);
  const [selectedEquipment,setSelectedEquipment] = useState("");
  const [otherEquipmentPrice,setOtherEquipmentPrice] = useState("");
  const [equipmentDebt,setEquipmentDebt] = useState(0);
  const [totalEquipmentDebt, setTotalEquipmentDebt] = useState(0); 
  const [showEquipment, setShowEquipment] = useState(false);

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

  console.log("here the audit data",auditData);

  useEffect(() => {
    dispatch(getStaffDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    setWeekFrame(getCurrentWeekTimeframe(weekOffset));
    dispatch(getAuditService(id, weekOffset));
  }, [dispatch, id,weekOffset]);

  useEffect(() => {
    if (createSuccess || updateSuccess || deleteSuccess) {
      dispatch(getStaffDetail(id));
      dispatch({ type: SERVICE_CREATE_RESET });
      dispatch({ type: SERVICE_UPDATE_RESET });
      dispatch({ type: SERVICE_DELETE_RESET });
      dispatch({ type: STAFF_DETAIL_RESET });
    }

    if (auditSuccess) {
      dispatch(getAuditService(id, weekOffset));
      dispatch(getStaffDetail(id));
      dispatch({ type: GET_AUDIT_RESET });
      dispatch({ type: SERVICE_AUDIT_RESET });
    }
  }, [createSuccess, updateSuccess, deleteSuccess, auditSuccess, dispatch, id, weekOffset]);

  useEffect(() => {
    if (staff_detail) {
      setStaffData({ ...staff_detail });
  
      const services = staff_detail.service.map((service) => ({
        ...service,
        editMode: false,
      }));
      setServices(services);
  
      const serviceNames = services.map((srv) => srv.service);
      setServicesName(serviceNames);
      setEquipmentDebt(Number(staff_detail.equipmentDebt) ?? 0);

      if (staff_detail.equipment) {
        const parsedEquip = staff_detail.equipment.split(",").map(item => item.trim());
        setEquipment(parsedEquip);
  
        const calculatedTotal = parsedEquip.reduce((acc, item) => acc + (equipmentDebtMap.get(item) || 0), 0);
        setTotalEquipmentDebt(calculatedTotal);
      } else {
        setEquipment([]);
        setTotalEquipmentDebt(0); // reset
      }
    }
  }, [staff_detail]);
  
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

  // Handle Basic Info Changes
  const handleChange = (e) => {
    setStaffData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Save Basic Info
  const updateStaffHandler = () => {
    dispatch(updateStaff(staffData));
    setEditBasicInfo(false);
    setEditPercentage(false);
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
      // 1. Calculate the new total equipment debt
      const currentDebt = equipmentDebt + parseInt(equipmentDebtMap.get(selectedEquipment) ?? 0);
      setTotalEquipmentDebt(totalEquipmentDebt + parseInt(equipmentDebtMap.get(selectedEquipment) ?? 0))
  
      // 2. Update equipment array and convert to string for saving
      const updatedEquipment = [...equipment, selectedEquipment];
      const updatedEquipmentString = updatedEquipment.join(", ");
  
      // 3. Update local React states
      setEquipment(updatedEquipment);
      setEquipmentDebt(currentDebt);
      setSelectedEquipment("");
      setAddEquipment(false);
  
      // 4. Update staffData in local state
      setStaffData((prev) => ({
        ...prev,
        equipment: updatedEquipmentString,
        equipmentDebt: currentDebt,
      }));
  
      // 5. Dispatch updateStaff to backend
      dispatch(updateStaff({
        ...staffData,
        equipment: updatedEquipmentString,
        equipmentDebt: currentDebt,
      }));
    } else if (selectedEquipment === "Others") {
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

  if (loading || createLoading || deleteLoading || updateLoading){
    return <Loader/>
  }

  return (
    <div>
    {/* { && <Loader/>} */}
    {!staff_detail && <h2 className="text-center mt-5 text-danger">{error}</h2>}
    {!loading && staff_detail && (

    <Container fluid className="px-3 "> 
      <Row className="justify-content-center">
        <Col xs={12} md={12} lg={10} xl={8} className="profile-container">

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

          <hr/>

          {(getAuditLoading || auditLoading) && <Loader/>}

          <div className="mt-3 pt-3">
          <Row className="align-items-center mb-3">
          <Col xs={12} className="d-flex flex-wrap justify-content-between gap-2">              <h4>Audit</h4>
      
          <div className="d-flex flex-wrap gap-2 align-items-center">
          <strong>{weekFrame}</strong>
                <Button size="sm" onClick={() => setWeekOffset((prev) => prev - 1)}>
                  ⬅ Previous Week
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setWeekOffset(0)}>
                  🔁 Current
                </Button>
              </div>
              </Col>
              </Row>


            <div className="d-flex align-items-center gap-3 mb-3">
              <h6>📊 Percentage:</h6> 
              {editPercentage ? (
                <>
                  <Form.Control
                    type="number"
                    name="percentage"  
                    min="0"
                    max="100"
                    onChange={handleChange}
                    value = {staffData.percentage ?? 100}
                    className="w-25" />
                  <span>%</span>
                  <Button variant="success" size="sm" onClick={updateStaffHandler}> 
                    ✅
                  </Button>
                </>
              ) : (
                <>          
                {!getAuditLoading && !auditLoading && <p className="mb-0">{staffData.percentage || 100}%</p> }
                  <Button variant="outline-primary" size="sm" onClick={() => setEditPercentage(true)}>
                    ✏️ 
                  </Button>
                </>
              )}
            </div>


            <div className="mt-1 d-flex gap-4">
              <h6>💰 Weekly Total Income:</h6>
              {!getAuditLoading && !auditLoading && 
              <p>
                {auditData?.Total
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(Number(auditData.Total))
                  : "Failed to fetch"}
              </p>}
            </div>

            <hr/>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="ms-5 text-primary">🛠️ Original Debt Value:</h6>
              {!getAuditLoading && !auditLoading &&
              <p className="col-5 text-start text-primary">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalEquipmentDebt)}
              </p> }
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="ms-5 text-warning">💸 Deduction (10% of weekly income):</h6>
              {!getAuditLoading && !auditLoading &&
              <p className="col-5 text-start text-warning">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
                  .format(0.1 * ((auditData?.Total || 0) * 24500))}
              </p> }
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="ms-5 text-success">✅ Remaining Equipment Debt:</h6>
              {!getAuditLoading && !auditLoading &&
              <p className="col-5 text-start text-success">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(staffData.equipmentDebt)}
              </p>}
            </div>
          </div>

          <hr />
      
          {/* Services Section */}
          <Row className="align-items-center mb-3">
          <Col xs={12} className="d-flex flex-wrap justify-content-between gap-2">
            <h4>Services</h4>
    
            <div className="d-flex flex-wrap gap-2 align-items-center">
            <strong>{weekFrame}</strong>
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
            <h4 onClick={() => setShowServices(!showServices)} >
              {showServices ? "🔽 Services" : "▶️ Services"}
            </h4>
            </Col>
            </Row>
          
          <Collapse in={showServices}>
            <div>
              <ListGroup variant="flush" className="m-3">
                {createLoading && <Loader />}
                {!createLoading &&
                  services.map((service, index) => (
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
                      percentage={staffData.percentage}
                    />
                  ))}
              </ListGroup>
            </div>
          </Collapse>
          
          <hr />
          {/* Equipment Section */}
          <div className="d-flex justify-content-between align-items-center mb-2">
              <h4>🛠 Equipment</h4>
              <Button variant="light" onClick={() => setShowEquipment(!showEquipment)}>
                {showEquipment ? "Hide" : "Show"}
              </Button>
          </div>

          <Collapse in={showEquipment}>
            <div>
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
            </div>}
            </div>
          </Collapse>


          <div className="d-flex justify-content-between align-items-center">
            <h6 className="ms-5"> Total Equipment Debt: </h6> 
            <p className="col-5 text-start" >{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalEquipmentDebt)}</p>
          </div>
  
          <hr/>
        </Card.Body>
          </Col>
          </Row>
      </Container>
      )
    }
    </div>
  );
}

export default StaffProfileScreen;