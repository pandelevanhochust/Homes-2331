import React, { useEffect, useState } from 'react';
import { Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { auditService, getAuditService } from '../actions/auditAction';

const ServiceItem = ({ service, index, toggleEdit, handleSave, handleChange, handleRemove }) => {
  // console.log("Service recieved:", service);
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
  
  const dispatch = useDispatch();
  const [toggleAudit, setToggleAudit] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekFrame, setWeekFrame] = useState(getCurrentWeekTimeframe(weekOffset));

  const { auditData, loading } = useSelector((state) => state.getServiceAudit);

  console.log(weekFrame);

  useEffect(() => {
    setWeekFrame(getCurrentWeekTimeframe(weekOffset));
    if (!service.editMode) {
      dispatch(getAuditService(service, weekOffset));
    }
    console.log("auditData",auditData);
  }, [dispatch, service, weekOffset,auditData,loading]);
  

  const AuditServiceHandler = () => {
    if (revenue === 0 || revenue === "" || !revenue) {
      setToggleAudit(false);
    } else {
      dispatch(auditService(service, revenue));
      setToggleAudit(false);
    }
  };

  const renderAuditedRevenue = () => {
    if (loading) {
      return <Spinner animation="border" size="sm" />;
    }
    if (!auditData || auditData.Name !== service.name) return null;
    if (!auditData || !auditData.Total) return <i></i>;
    console.log(auditData);
    return `Total: $${Number(auditData.revenue).toLocaleString()}`;
  };

  return (
    <ListGroup.Item className="text-start m-2">
     <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-1">
      {/* Left: Service Info */}
      <div className="flex-fill" style={{ minWidth: "260px", flex: 1 }}>
        <strong>Service:</strong>{" "}
        {service.editMode ? (
          <Form.Select
            value={service.service}
            required
            onChange={(e) => handleChange(index, "service", e.target.value)}
          >
            <option value="">Select a service</option>
            <option value="SM">SM</option>
            <option value="Chat">Chat</option>
            <option value="Sakura">Sakura</option>
            <option value="Imlive">Imlive</option>
          </Form.Select>
        ) : (
          service.service
        )}

        <div className="mt-2">
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

      {/* Middle: Revenue and Audit Controls */}
      <div className="flex-fill d-flex flex-column justify-content-between" style={{ minWidth: "200px", flex: 1 }}>
        <div>
          <strong>{weekFrame}</strong>
          <br />
          <strong>Week's Revenue:</strong>
          <div>{renderAuditedRevenue()}</div>
        </div>

        {toggleAudit && (
          <Form.Control
            className="mt-2"
            type="number"
            placeholder="Enter revenue"
            onChange={(e) => setRevenue(e.target.value)}
          />
        )}

        <div className="d-flex gap-2 mt-2">
          <Button size="sm" onClick={() => setWeekOffset(weekOffset - 1)}>⬅ Previous Week</Button>
          <Button size="sm" variant="secondary" onClick={() => setWeekOffset(0)}>🔁 Current</Button>
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="d-flex flex-column align-items-start gap-2" style={{ minWidth: "150px", flex: 0.5 }}>
        {service.editMode ? (
          <>
            <Button variant="success" size="sm" onClick={() => handleSave(index)}>Add</Button>
            <Button variant="danger" size="sm" onClick={() => handleRemove(index)}>Remove</Button>
            <Button variant="secondary" size="sm" onClick={() => toggleEdit(index)}>Cancel</Button>
          </>
        ) : toggleAudit ? (
          <>
            <Button variant="primary" size="sm" onClick={() => AuditServiceHandler()}>Save Audit</Button>
            <Button variant="secondary" size="sm" onClick={() => setToggleAudit(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <Button variant="warning" size="sm" onClick={() => setToggleAudit(true)}>Audit</Button>
            <Button variant="info" size="sm" onClick={() => toggleEdit(index)}>Edit</Button>
          </>
        )}
      </div>
      </div>
    </ListGroup.Item>
  );
};


export default ServiceItem;