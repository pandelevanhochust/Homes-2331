import React, { useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import getCurrentWeekTimeframe from '../../../backend/db/dateConfig';
import { auditService } from '../actions/auditAction';

const ServiceItem = ({ service, index, toggleEdit, handleSave, handleChange, handleRemove }) => {
  const dispatch = useDispatch();

  const [toggleAudit, setToggleAudit] = useState(false);
  const [revenue,setRevenue] = useState(0);
  const AuditServiceHandler = () => {
    if(revenue === 0 || revenue ==="" || !revenue){
      setToggleAudit(false);
    }else{
      dispatch(auditService(service,revenue));
      setToggleAudit(false);  
    }
  };

  return (
    <ListGroup.Item className="text-start m-2">
      <div className="d-flex justify-content-between align-items-start mb-4">
        {/* Left Side (Service Details) */}
        <div className="w-50">
          <strong>Service:</strong>{" "}
          {service.editMode ? (
            <Form.Select
              value={service.service}
              required
              onChange={(e) => handleChange(index, "service", e.target.value)}
            >
              <option value="">Select a service</option>
              <option value=""></option>
              <option value=""></option>
              <option value=""></option>
              <option value=""></option>
              <option value=""></option>
            </Form.Select>
          ) : (
            service.service
          )}
          <br />

          <div className="text-start">
            <div>
              <strong>Username:</strong>{" "}
              {service.editMode ? (
                <Form.Control
                  type="text"
                  value={service.username}
                  onChange={(e) => handleChange(index, "username", e.target.value)}
                />
              ) : (
                service.username
              )}
            </div>
            <div>
              <strong>Password:</strong>{" "}
              {service.editMode ? (
                <Form.Control
                  type="text"
                  value={service.password}
                  onChange={(e) => handleChange(index, "password", e.target.value)}
                />
              ) : (
                service.password
              )}
            </div>
          </div>
        </div>

        <div className="ms-4 w-90 text-start d-flex align-items-center gap-2">
          <strong>Revenue:</strong>{" "}
          {toggleAudit && (
            <Form.Control
              className="w-20"
              type="number"
              onChange={(e) => setRevenue(e.target.value)}
            />
          )}
        </div>

        <div>
        <strong> {getCurrentWeekTimeframe()} </strong>
        </div>

        <div className="d-flex flex-column align-items-center gap-2">
          {service.editMode ? (
            <div className="d-flex flex-column gap-2">
              <Button variant="success" size="sm" className="w-auto px-2" onClick={() => handleSave(index)}>
                Add
              </Button>
              <Button variant="danger" size="sm" className="w-auto px-2" onClick={() => handleRemove(index)}>
                Remove
              </Button>
              <Button variant="secondary" size="sm" className="w-auto px-2" onClick={() => toggleEdit(index)}>
                Cancel
              </Button>
            </div>
          ) : toggleAudit ? (
            <div className="d-flex flex-column gap-2">
              <Button variant="primary" size="sm" className="w-auto px-2" onClick={() => AuditServiceHandler(service,revenue)} >
                Account
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-auto px-2"
                onClick={() => setToggleAudit(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              <Button
                variant="warning"
                size="sm"
                className="w-auto px-2"
                onClick={() => {
                  setToggleAudit(true);
                }}
              >
                Audit
              </Button>
              <Button
                variant="info"
                size="sm"
                className="w-auto px-2"
                onClick={() => toggleEdit(index)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </ListGroup.Item>
  );
};

export default ServiceItem;