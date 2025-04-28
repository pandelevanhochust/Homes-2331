import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Collapse, Form, Row, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { auditService } from '../actions/auditAction';

const SERVICES = import.meta.env.VITE_SERVICES?.split(",") || [];
console.log("Services",SERVICES);

const ServiceItem = ({
  service,
  index,
  toggleEdit,
  handleSave,
  handleChange,
  handleRemove,
  auditValue,
  weekOffset,
  setWeekOffset,
  weekFrame,
  auditData,
  updateAuditValue,
  percentage,
}) => {
  const dispatch = useDispatch();
  const [toggleAudit, setToggleAudit] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [localAudit, setLocalAudit] = useState(auditValue);

  const { loading: auditLoading } = useSelector((state) => state.serviceAudit);
  const { loading: getAuditLoading } = useSelector((state) => state.getServiceAudit || {});
  const { loading: createLoading, success: createSuccess} = useSelector((state) => state.serviceCreate);
  
  const [showAlert, setShowAlert] = useState(false); 
  const [toggleService,setToggleService] = useState(false);


  useEffect(() => {
    setLocalAudit(auditValue);
  }, [auditValue, weekOffset]);
  

  const AuditServiceHandler = () => {
    if (!percentage){
      setShowAlert(true);
      return;
    } 
    if (!revenue || revenue === 0 || revenue === '') {
      setToggleAudit(false);
    } else {
      dispatch(auditService(service, revenue,percentage));
      setLocalAudit(revenue);
      updateAuditValue(service.service, revenue);
      setToggleAudit(false);
    }
  };

  const renderAuditedRevenue = () => {
    if (!toggleAudit && !service.editMode){
      if (getAuditLoading || auditLoading) return <Spinner animation="border" size="sm" />;
      if (!localAudit) return <i>Haven't been audited yet</i>;
      return `$${parseInt(localAudit)}`;
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`
}

  return (
    <Row className="align-items-center">
    <Col xs={12}>
    {/* <ListGroup.Item className="text-start m-2"> */}
     {showAlert && (
        <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible>
          Percentage hasn't been activated
        </Alert>
      )}

      <Row className="g-3 d-flex justify-content-between align-items-start">
      {/* Left Column: Service Info */}
      <Col xs={12} md={4}>
      <div>
        <strong onClick={() => setToggleService(!toggleService)}> {toggleService ? "🔽 Services" : "▶️ Services"} </strong>{' '}
        {service.editMode ? (
          <Form.Select
          size="sm"
          style={{ width: "100%", maxWidth: "250px" }}
            value={service.service}
            required
            onChange={(e) => handleChange(index, 'service', e.target.value)}
          >
            <option value="">Select a service</option>
            {SERVICES.map((ser) => <option key={ser} value = {ser}> {ser} </option>)}

          </Form.Select>
        ) : (
          service.service
        )}
      </div>
      
      <Collapse in={toggleService}>
      <div className="mt-2">
          <div>
            <strong>Username:</strong>{' '}
            {service.editMode ? (
              <Form.Control
                type="text"
                value={service.username}
                onChange={(e) => handleChange(index, 'username', e.target.value)}
              />
            ) : (
              service.username
            )}
          </div>

          <div>
            <strong>Password:</strong>{' '}
            {service.editMode ? (
              <Form.Control
                type="text"
                value={service.password}
                onChange={(e) => handleChange(index, 'password', e.target.value)}
              />
            ) : (
              service.password
            )}
          </div>
        </div>
      </Collapse>

      </Col>

      {/* Middle Column: Revenue Audit */}
      <Col xs={12} md={4}>
        <div>
          <strong>Week's Revenue:</strong>
          <div>{renderAuditedRevenue()}</div>

        {toggleAudit && (
          <Form.Control
            className="mt-2"
            type="number"
            placeholder="Enter revenue"
            onChange={(e) => setRevenue(e.target.value)}
          />
        )}
        </div>
      </Col>

      {/* Right Column: Action Buttons */}
      <Col xs={12} md={4} className="d-flex flex-wrap gap-2">
      {/* <div className="d-flex flex-column align-items-start gap-2" style={{ minWidth: '150px', flex: 0.5 }}> */}
        {service.editMode ? (
          <>
            <Button className='button_service' variant="success" size="sm" onClick={() => handleSave(index)}>
              Add
            </Button>
            <Button className='button_service' variant="danger" size="sm" onClick={() => handleRemove(index)}>
              Remove
            </Button>
            <Button className='button_service' variant="secondary" size="sm" onClick={() => toggleEdit(index)}>
              Cancel
            </Button>
          </>
        ) : toggleAudit ? (
          <>
            <Button className='button_service' variant="primary" size="sm" onClick={AuditServiceHandler}>
              Save Audit
            </Button>
            <Button className='button_service' variant="secondary" size="sm" onClick={() => setToggleAudit(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            {weekOffset === 0 && (
              <>
                <Button className='button_service' variant="warning" size="sm" onClick={() => setToggleAudit(true)}>
                  Audit
                </Button>
                <Button className='button_service' variant="info" size="sm" onClick={() => toggleEdit(index)}>
                  Edit
                </Button>
              </>
            )}
          </>
        )}
      </Col>
    </Row>
    </Col>
    </Row>
  );
};

export default ServiceItem;
