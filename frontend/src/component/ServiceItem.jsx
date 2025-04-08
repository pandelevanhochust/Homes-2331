import React, { useEffect, useState } from 'react';
import { Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { auditService } from '../actions/auditAction';

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
}) => {
  const dispatch = useDispatch();
  const [toggleAudit, setToggleAudit] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [localAudit, setLocalAudit] = useState(auditValue);

  const { loading: auditLoading } = useSelector((state) => state.serviceAudit);
  const { loading: getAuditLoading } = useSelector((state) => state.getServiceAudit || {});
  

  useEffect(() => {
    setLocalAudit(auditValue);
  }, [auditValue, weekOffset]);
  

  const AuditServiceHandler = () => {
    if (!revenue || revenue === 0 || revenue === '') {
      setToggleAudit(false);
    } else {
      dispatch(auditService(service, revenue));
      setLocalAudit(revenue);
      updateAuditValue(service.service, revenue);
      setToggleAudit(false);
    }
  };

  const renderAuditedRevenue = () => {
    if (getAuditLoading || auditLoading) return <Spinner animation="border" size="sm" />;
    if (!localAudit) return <i>None</i>;
    return `$${Number(localAudit).toLocaleString()}`;
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`
}


  return (
    <ListGroup.Item className="text-start m-2">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-1">
      {/* Left: Service Info */}
      <div className="flex-fill" style={{ minWidth: '260px', flex: 1 }}>
        <strong>Service:</strong>{' '}
        {service.editMode ? (
          <Form.Select
            value={service.service}
            required
            onChange={(e) => handleChange(index, 'service', e.target.value)}
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
      </div>

      {/* Middle: Revenue and Audit Controls */}
      <div className="flex-fill d-flex flex-column justify-content-between" style={{ minWidth: '200px', flex: 1 }}>
        <div>
          <strong>{weekFrame}</strong>
          <br />
          <strong>Week's Revenue:</strong>
          <div>{renderAuditedRevenue()}</div>
          {/* <div>Audited in: {getCurrentDate()}</div> */}
        </div>

        {toggleAudit && (
          <Form.Control
            className="mt-2"
            type="number"
            placeholder="Enter revenue"
            onChange={(e) => setRevenue(e.target.value)}
          />
        )}
      </div>

      {/* Right: Buttons */}
      <div className="d-flex flex-column align-items-start gap-2" style={{ minWidth: '150px', flex: 0.5 }}>
        {service.editMode ? (
          <>
            <Button variant="success" size="sm" onClick={() => handleSave(index)}>
              Add
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleRemove(index)}>
              Remove
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toggleEdit(index)}>
              Cancel
            </Button>
          </>
        ) : toggleAudit ? (
          <>
            <Button variant="primary" size="sm" onClick={AuditServiceHandler}>
              Save Audit
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setToggleAudit(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="warning" size="sm" onClick={() => setToggleAudit(true)}>
              Audit
            </Button>
            <Button variant="info" size="sm" onClick={() => toggleEdit(index)}>
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
    </ListGroup.Item>
  );
};

export default ServiceItem;
